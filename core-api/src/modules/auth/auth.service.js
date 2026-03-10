const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../../shared/email/email.service');

const prisma = new PrismaClient();

// ─── Helpers para tokens ─────────────────────────────────────────────────────
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerifiedSeller: user.isVerifiedSeller,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// ─── REGISTER ────────────────────────────────────────────────────────────────
const register = async (userData) => {
  const { email, password, firstName, lastName } = userData;

  // 1. Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    // Si ya verificó su email, no puede volver a registrarse
    if (existingUser.isEmailVerified) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Si existe pero NO ha verificado, actualizar datos y reenviar verificación
    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
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

    try {
      await sendVerificationEmail(email, firstName, emailVerifyToken);
    } catch (emailError) {
      console.error('Error al reenviar correo de verificación:', emailError.message);
    }

    return { user };
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

  // 5. Enviar correo de verificación (no bloquea el registro si falla)
  try {
    await sendVerificationEmail(email, firstName, emailVerifyToken);
  } catch (emailError) {
    console.error('Error al enviar correo de verificación:', emailError.message);
  }

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

  // 5. Generar tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      isVerifiedSeller: user.isVerifiedSeller,
    },
    token: accessToken,
    refreshToken,
  };
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Refresh token requerido');
  }

  let payload;
  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch {
    throw new Error('Refresh token inválido o expirado');
  }

  if (payload.type !== 'refresh') {
    throw new Error('Token de tipo incorrecto');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });

  if (!user || !user.isActive || !user.isEmailVerified) {
    throw new Error('Usuario no disponible');
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  return { token: newAccessToken, refreshToken: newRefreshToken };
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      isAdmin: true,
      isVerifiedSeller: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

module.exports = { register, verifyEmail, login, refreshAccessToken, getMe };
