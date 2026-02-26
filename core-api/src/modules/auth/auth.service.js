const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const register = async (userData) => {
  const { email, password, firstName, lastName } = userData;

  // 1. Verificar si el email ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El correo electrónico ya está registrado');
  }

  // 2. Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Crear el usuario en la base de datos
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
    },
    select: { // No devolver la contraseña
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  // 4. Generar token JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return { user, token };
};

module.exports = {
  register,
};
