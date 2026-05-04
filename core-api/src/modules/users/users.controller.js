const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

const prisma = new PrismaClient();

// In-memory map to hold verification status per userId.
// Values: 'pendiente', 'verificado', 'rechazado'
const verificationMap = new Map();

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

// POST /api/v1/users/me/verification
const submitVerification = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Set to pendiente
    verificationMap.set(userId, 'pendiente');

    // Simulate async verification process (random result after delay)
    setTimeout(async () => {
      const result = Math.random() < 0.75 ? 'verificado' : 'rechazado';
      verificationMap.set(userId, result);

      // If verified, update persistent flag so profile shows verified state
      if (result === 'verificado') {
        try {
          await prisma.usuario.update({ where: { id: userId }, data: { esVendedorVerificado: true } });
        } catch (_) { /* ignore DB errors silently */ }
      }
    }, 4000); // 4 seconds

    res.json({ message: 'Solicitud recibida. Estado: pendiente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/users/me/verification
const getVerification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.usuario.findUnique({ where: { id: userId }, select: { esVendedorVerificado: true } });

    if (user?.esVendedorVerificado) {
      return res.json({ status: 'verificado' });
    }

    const status = verificationMap.get(userId) || 'rechazado';
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMe, updateMe, submitVerification, getVerification };

// POST /api/v1/users/me/documents
const uploadToCloudinary = (buffer, folder) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
    if (error) reject(error);
    else resolve(result);
  });
  stream.end(buffer);
});

const uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.userId;

    // documentoIdentidad -> PerfilUsuario.documentoIdentidad
    if (req.files && req.files.documentoIdentidad && req.files.documentoIdentidad[0]) {
      const file = req.files.documentoIdentidad[0];
      const result = await uploadToCloudinary(file.buffer, 'nexont/documents');
      const url = result.secure_url;
      // upsert perfil
      await prisma.perfilUsuario.upsert({
        where: { usuarioId: userId },
        update: { documentoIdentidad: url },
        create: { usuarioId: userId, documentoIdentidad: url },
      });
    }

    // fotoPersonal -> Usuario.fotoPerfil
    if (req.files && req.files.fotoPersonal && req.files.fotoPersonal[0]) {
      const file = req.files.fotoPersonal[0];
      const result = await uploadToCloudinary(file.buffer, 'nexont/profiles');
      const url = result.secure_url;
      await prisma.usuario.update({ where: { id: userId }, data: { fotoPerfil: url } });
    }

    res.json({ message: 'Documentos subidos correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// append to module exports
module.exports.uploadDocuments = uploadDocuments;

// POST /api/v1/users/me/verification/form
const submitVerificationForm = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, documentNumber, ciudad } = req.body;

    if (!fullName || !documentNumber || !ciudad) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Save fullName into Usuario.nombres (minimal change)
    await prisma.usuario.update({ where: { id: userId }, data: { nombres: fullName } });

    // Upsert perfil with documentoIdentidad and ciudad
    await prisma.perfilUsuario.upsert({
      where: { usuarioId: userId },
      create: { usuarioId: userId, documentoIdentidad: documentNumber, ciudad },
      update: { documentoIdentidad: documentNumber, ciudad },
    });

    res.json({ message: 'Formulario de verificación guardado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports.submitVerificationForm = submitVerificationForm;