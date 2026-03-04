const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../../shared/email/email.service');

const prisma = new PrismaClient();

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (userData) => {
  const { email, password, firstName, lastName } = userData;

  // 1. Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado');
  }

  // 2. Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Generar token de verificación de email (expira en 24h)
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 4. Crear el usuario en la base de datos
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerifyToken,
      emailVerifyExpires,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  // 5. Enviar correo de verificación
  await sendVerificationEmail(email, firstName, emailVerifyToken);

  return { user };
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new Error('El enlace de verificación es inválido o ha expirado');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  });

  return { message: '¡Correo verificado correctamente! Ya puedes iniciar sesión.' };
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async ({ email, password }) => {
  // 1. Buscar el usuario
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Credenciales incorrectas');
  }

  // 2. Verificar contraseña
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Credenciales incorrectas');
  }

  // 3. Verificar que el email esté verificado
  if (!user.isEmailVerified) {
    throw new Error('Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
  }

  // 4. Verificar que la cuenta esté activa
  if (!user.isActive) {
    throw new Error('Tu cuenta ha sido desactivada. Contacta con soporte.');
  }

  // 5. Generar JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token,
  };
};

module.exports = { register, verifyEmail, login };
