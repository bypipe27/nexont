const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

const prisma = new PrismaClient();

// GET /api/v1/users/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        correo: true,
        nombres: true,
        apellidos: true,
        fotoPerfil: true,
        telefono: true,
        direccionPrincipal: true,
        esAdmin: true,
        esVendedorVerificado: true,
        esCorreoVerificado: true,
        creadoEn: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/v1/users/me
const updateMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nombres, apellidos, correo } = req.body;

    const updateData = {};

    if (nombres)   updateData.nombres   = nombres.trim();
    if (apellidos) updateData.apellidos = apellidos.trim();

    // Validar correo único
    if (correo) {
      const correoTrimmed = correo.trim().toLowerCase();
      const existing = await prisma.usuario.findFirst({
        where: { correo: correoTrimmed, NOT: { id: userId } },
      });
      if (existing) {
        return res.status(400).json({ error: 'Este correo ya está registrado por otro usuario' });
      }
      updateData.correo = correoTrimmed;
    }

    // Subir foto a Cloudinary si viene archivo
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'nexont/profiles', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      updateData.fotoPerfil = uploadResult.secure_url;
    }

    const updated = await prisma.usuario.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        correo: true,
        nombres: true,
        apellidos: true,
        fotoPerfil: true,
        esAdmin: true,
        esVendedorVerificado: true,
      },
    });

    res.json({ message: 'Perfil actualizado correctamente', user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMe, updateMe };