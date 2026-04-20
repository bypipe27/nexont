const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../../shared/email/email.service');

const prisma = new PrismaClient();

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.correo,
      esAdmin: user.esAdmin,
      esVendedorVerificado: user.esVendedorVerificado,
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

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (userData) => {
  const { correo, contrasena, nombres, apellidos } = userData;

  const existingUser = await prisma.usuario.findUnique({ where: { correo } });

  if (existingUser) {
    if (existingUser.esCorreoVerificado) {
      throw new Error('El correo electrónico ya está registrado');
    }

    const hashedContrasena = await bcrypt.hash(contrasena, 10);
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await prisma.usuario.update({
      where: { id: existingUser.id },
      data: {
        contrasena: hashedContrasena,
        nombres,
        apellidos,
        tokenVerificacion: emailVerifyToken,
        verificacionExpira: emailVerifyExpires,
      },
      select: { id: true, correo: true, nombres: true, apellidos: true, creadoEn: true },
    });

    // Fire and forget — no bloquea la respuesta
    sendVerificationEmail(correo, nombres, emailVerifyToken)
      .catch(err => console.error('Error al reenviar correo:', err.message));

    return { user };
  }

  const hashedContrasena = await bcrypt.hash(contrasena, 10);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');
  const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.usuario.create({
    data: {
      correo,
      contrasena: hashedContrasena,
      nombres,
      apellidos,
      tokenVerificacion: emailVerifyToken,
      verificacionExpira: emailVerifyExpires,
    },
    select: { id: true, correo: true, nombres: true, apellidos: true, creadoEn: true },
  });

  // Fire and forget — responde al cliente inmediatamente
  sendVerificationEmail(correo, nombres, emailVerifyToken)
    .catch(err => console.error('Error al enviar correo:', err.message));

  return { user };
};

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────
const verifyEmail = async (token) => {
  const user = await prisma.usuario.findFirst({
    where: {
      tokenVerificacion: token,
      verificacionExpira: { gt: new Date() },
    },
  });

  if (!user) {
    throw new Error('El enlace de verificación es inválido o ha expirado');
  }

  await prisma.usuario.update({
    where: { id: user.id },
    data: {
      esCorreoVerificado: true,
      tokenVerificacion: null,
      verificacionExpira: null,
    },
  });

  return { message: '¡Correo verificado correctamente! Ya puedes iniciar sesión.' };
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const login = async ({ correo, contrasena }) => {
  const user = await prisma.usuario.findUnique({ where: { correo } });
  if (!user) throw new Error('Credenciales incorrectas');

  const isPasswordValid = await bcrypt.compare(contrasena, user.contrasena);
  if (!isPasswordValid) throw new Error('Credenciales incorrectas');

  if (!user.esCorreoVerificado) {
    throw new Error('Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
  }

  if (!user.esActivo) {
    throw new Error('Tu cuenta ha sido desactivada. Contacta con soporte.');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      correo: user.correo,
      nombres: user.nombres,
      apellidos: user.apellidos,
      esAdmin: user.esAdmin,
      esVendedorVerificado: user.esVendedorVerificado,
    },
    token: accessToken,
    refreshToken,
  };
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new Error('Refresh token requerido');

  let payload;
  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch {
    throw new Error('Refresh token inválido o expirado');
  }

  if (payload.type !== 'refresh') throw new Error('Token de tipo incorrecto');

  const user = await prisma.usuario.findUnique({ where: { id: payload.userId } });
  if (!user || !user.esActivo || !user.esCorreoVerificado) {
    throw new Error('Usuario no disponible');
  }

  return {
    token: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

// ─── GET ME ───────────────────────────────────────────────────────────────────
const getMe = async (userId) => {
  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      id: true, correo: true, nombres: true, apellidos: true,
      telefono: true, direccionPrincipal: true, esAdmin: true,
      esVendedorVerificado: true, esCorreoVerificado: true,
      creadoEn: true, actualizadoEn: true,
    },
  });
  if (!user) throw new Error('Usuario no encontrado');
  return user;
};

module.exports = { register, verifyEmail, login, refreshAccessToken, getMe };