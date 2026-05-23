const prisma = require('../../config/database');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });

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
    // First, attempt immediate verification if user already provided required data
    const already = await checkAndSetVerified(userId);
    if (already) {
      return res.json({ message: 'Usuario verificado correctamente', status: 'verificado' });
    }

    // Not yet complete: set to pendiente and simulate async verification (keeps previous behaviour)
    verificationMap.set(userId, 'pendiente');
    setTimeout(async () => {
      const result = Math.random() < 0.75 ? 'verificado' : 'rechazado';
      if (result === 'verificado') {
        // only set verified if criteria are satisfied at that time
        const completedLater = await checkAndSetVerified(userId);
        if (completedLater) verificationMap.set(userId, 'verificado');
        else verificationMap.set(userId, 'pendiente');
      } else {
        verificationMap.set(userId, 'rechazado');
      }
    }, 4000);

    res.json({ message: 'Solicitud recibida. Estado: pendiente', status: 'pendiente' });
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
      // don't allow caching of verification status
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      return res.json({ status: 'verificado' });
    }

    // ensure clients always receive current status (avoid 304 responses)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    const status = verificationMap.get(userId) || 'rechazado';
    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/v1/users/me/dashboard
const getSellerDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const seller = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        correo: true,
        nombres: true,
        apellidos: true,
        fotoPerfil: true,
        esVendedorVerificado: true,
        esCorreoVerificado: true,
        creadoEn: true,
        perfil: {
          select: {
            ciudad: true,
            pais: true,
          },
        },
      },
    });

    if (!seller) return res.status(404).json({ error: 'Usuario no encontrado' });

    const [products, productStats, soldSummary, recentSales, salesAggregate, soldProducts] = await Promise.all([
      prisma.producto.findMany({
        where: { vendedorId: userId },
        select: {
          id: true,
          titulo: true,
          precio: true,
          stock: true,
          estaActivo: true,
          condicion: true,
          categoria: true,
          promedioCalificacion: true,
          totalResenas: true,
          creadoEn: true,
          imagenes: {
            where: { esPrincipal: true },
            select: { url: true },
            take: 1,
          },
        },
        orderBy: { creadoEn: 'desc' },
      }),
      prisma.producto.aggregate({
        where: { vendedorId: userId },
        _count: { _all: true },
        _avg: { promedioCalificacion: true },
        _sum: { totalResenas: true },
      }),
      prisma.pedido.groupBy({
        by: ['estado'],
        where: {
          estado: { in: ['PENDIENTE', 'CONFIRMADO', 'ENTREGADO'] },
          detalles: { some: { producto: { vendedorId: userId } } },
        },
        _count: { _all: true },
      }),
      prisma.detallePedido.findMany({
        where: {
          pedido: { estado: { not: 'CANCELADO' } },
          producto: { vendedorId: userId },
        },
        select: {
          id: true,
          cantidad: true,
          subtotal: true,
          pedido: {
            select: {
              id: true,
              estado: true,
              creadoEn: true,
              usuario: {
                select: {
                  nombres: true,
                  apellidos: true,
                },
              },
            },
          },
          producto: {
            select: {
              id: true,
              titulo: true,
              imagenes: {
                where: { esPrincipal: true },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { id: 'desc' },
        take: 6,
      }),
      prisma.detallePedido.aggregate({
        where: {
          pedido: { estado: { not: 'CANCELADO' } },
          producto: { vendedorId: userId },
        },
        _sum: { subtotal: true, cantidad: true },
        _count: { _all: true },
      }),
      prisma.detallePedido.findMany({
        where: {
          pedido: { estado: { not: 'CANCELADO' } },
          producto: { vendedorId: userId },
        },
        select: { productoId: true },
        distinct: ['productoId'],
      }),
    ]);

    const orderCounts = soldSummary;
    const pendingOrders = orderCounts.find((c) => c.estado === 'PENDIENTE')?._count._all || 0;
    const confirmedOrders = orderCounts.find((c) => c.estado === 'CONFIRMADO')?._count._all || 0;
    const deliveredOrders = orderCounts.find((c) => c.estado === 'ENTREGADO')?._count._all || 0;
    const totalOrders = pendingOrders + confirmedOrders + deliveredOrders;
    const activeProducts = products.filter((product) => product.estaActivo);
    const outOfStockProducts = activeProducts.filter((product) => product.stock === 0).length;
    const lowStockProducts = activeProducts.filter((product) => product.stock > 0 && product.stock <= 3).length;

    const recentProducts = products.slice(0, 6).map((product) => ({
      id: product.id,
      titulo: product.titulo,
      precio: Number(product.precio),
      stock: product.stock,
      condicion: product.condicion,
      categoria: product.categoria,
      promedioCalificacion: product.promedioCalificacion || 0,
      totalResenas: product.totalResenas || 0,
      creadoEn: product.creadoEn,
      imagenPrincipal: product.imagenes[0]?.url || null,
    }));

    const recentSalesMapped = recentSales.map((sale) => ({
      id: sale.id,
      orderId: sale.pedido.id,
      orderStatus: sale.pedido.estado,
      quantity: sale.cantidad,
      subtotal: Number(sale.subtotal),
      createdAt: sale.pedido.creadoEn,
      buyerName: `${sale.pedido.usuario.nombres || ''} ${sale.pedido.usuario.apellidos || ''}`.trim(),
      product: {
        id: sale.producto.id,
        titulo: sale.producto.titulo,
        imagenPrincipal: sale.producto.imagenes[0]?.url || null,
      },
    }));

    res.json({
      seller,
      summary: {
        totalProducts: productStats._count._all || 0,
        activeProducts: activeProducts.length,
        outOfStockProducts,
        lowStockProducts,
        averageRating: Number(productStats._avg.promedioCalificacion || 0),
        totalReviews: productStats._sum.totalResenas || 0,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        soldProducts: soldProducts.length,
        totalSales: Number(salesAggregate._sum.subtotal || 0),
        totalUnitsSold: salesAggregate._sum.cantidad || 0,
      },
      recentProducts,
      recentSales: recentSalesMapped,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getMe, updateMe, submitVerification, getVerification };

// Helper: check verification criteria and set esVendedorVerificado when satisfied
const checkAndSetVerified = async (userId) => {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        esVendedorVerificado: true,
        fotoPerfil: true,
        perfil: { select: { documentoIdentidad: true, preferencias: true } },
      },
    });

    if (!user) return false;
    if (user.esVendedorVerificado) return true;

    const docNumber = user.perfil?.documentoIdentidad || '';
    const prefs = user.perfil?.preferencias || {};
    const docImage = prefs?.verificationFiles?.docImage;
    const hasPhoto = !!user.fotoPerfil;

    const docValid = typeof docNumber === 'string' && /^\d{4,}$/.test(docNumber);

    // Debug info for verification flow (non-sensitive): presence flags
    try {
      console.debug(`[verification] user=${userId} docPresent=${Boolean(docNumber)} docValid=${docValid} hasDocImage=${Boolean(docImage)} hasPhoto=${hasPhoto}`);
    } catch (_) { /* ignore logging errors */ }

    // Require a valid document number and at least one image: either document image or personal photo
    if (docValid && (docImage || hasPhoto)) {
      await prisma.usuario.update({ where: { id: userId }, data: { esVendedorVerificado: true } });
      verificationMap.set(userId, 'verificado');
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
};

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

    // documentoIdentidad (file) -> store file URL in perfil.preferencias.verificationFiles.docImage
    if (req.files && req.files.documentoIdentidad && req.files.documentoIdentidad[0]) {
      const file = req.files.documentoIdentidad[0];
      const result = await uploadToCloudinary(file.buffer, 'nexont/documents');
      const url = result.secure_url;

      // merge into preferencias JSON
      const perfil = await prisma.perfilUsuario.findUnique({ where: { usuarioId: userId } });
      const prefs = perfil?.preferencias || {};
      prefs.verificationFiles = prefs.verificationFiles || {};
      prefs.verificationFiles.docImage = url;
      await prisma.perfilUsuario.upsert({
        where: { usuarioId: userId },
        update: { preferencias: prefs },
        create: { usuarioId: userId, preferencias: prefs },
      });
      try { console.info(`[verification] uploaded document image for user=${userId}`); } catch (_) {}
    }

    // fotoPersonal -> Usuario.fotoPerfil
    if (req.files && req.files.fotoPersonal && req.files.fotoPersonal[0]) {
      const file = req.files.fotoPersonal[0];
      const result = await uploadToCloudinary(file.buffer, 'nexont/profiles');
      const url = result.secure_url;
      await prisma.usuario.update({ where: { id: userId }, data: { fotoPerfil: url } });
      try { console.info(`[verification] uploaded personal photo for user=${userId}`); } catch (_) {}
    }

    // After storing files, check if verification can be completed
    await checkAndSetVerified(userId);

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
    try { console.info(`[verification] submitVerificationForm called for user=${userId} payload=${JSON.stringify({ fullName: Boolean(req.body.fullName), documentNumber: req.body.documentNumber ? 'present' : 'missing', ciudad: Boolean(req.body.ciudad) })}`); } catch (_) {}
    const { fullName, documentNumber, ciudad } = req.body;

    if (!fullName || !documentNumber || !ciudad) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validate document number: at least 4 digits
    if (!/^\d{4,}$/.test(documentNumber)) {
      return res.status(400).json({ error: 'El número de documento debe tener al menos 4 dígitos' });
    }
    // Save fullName into Usuario.nombres (minimal change)
    await prisma.usuario.update({ where: { id: userId }, data: { nombres: fullName } });

    // Upsert perfil with documentoIdentidad and ciudad (use find -> update/create to get clearer errors)
    try {
      const existing = await prisma.perfilUsuario.findUnique({ where: { usuarioId: userId } });
      if (existing) {
        await prisma.perfilUsuario.update({ where: { id: existing.id }, data: { documentoIdentidad: documentNumber, ciudad } });
      } else {
        await prisma.perfilUsuario.create({ data: { usuarioId: userId, documentoIdentidad: documentNumber, ciudad } });
      }
      try { console.info(`[verification] saved verification form for user=${userId}`); } catch (_) {}
    } catch (dbErr) {
      try { console.error('[verification][error] saving perfilUsuario', dbErr && (dbErr.stack || dbErr.message || dbErr)); } catch (_) {}

      const msg = (dbErr && (dbErr.message || '')).toString();
      // Workaround for Postgres 'cached plan must not change result type' - attempt raw SQL fallback
      if (msg.includes('cached plan must not change result type')) {
        try {
          const uid = Number(userId);
          const safeDoc = String(documentNumber).replace(/'/g, "''");
          const safeCiudad = String(ciudad).replace(/'/g, "''");
          const existingRows = await prisma.$queryRawUnsafe(`SELECT id FROM perfiles_usuarios WHERE "usuarioId" = ${uid} LIMIT 1;`);
          if (existingRows && existingRows.length && existingRows[0].id) {
            const id = existingRows[0].id;
            await prisma.$executeRawUnsafe(`UPDATE perfiles_usuarios SET "documentoIdentidad" = '${safeDoc}', ciudad = '${safeCiudad}', "actualizadoEn" = now() WHERE id = ${id};`);
          } else {
            await prisma.$executeRawUnsafe(`INSERT INTO perfiles_usuarios ("usuarioId","documentoIdentidad","ciudad","creadoEn","actualizadoEn") VALUES (${uid}, '${safeDoc}', '${safeCiudad}', now(), now());`);
          }
          try { console.info(`[verification] fallback saved perfilUsuario for user=${uid}`); } catch (_) {}
        } catch (fallbackErr) {
          try { console.error('[verification][error] fallback saving perfilUsuario', fallbackErr && (fallbackErr.stack || fallbackErr.message || fallbackErr)); } catch (_) {}
          return res.status(500).json({ error: 'Error guardando el perfil de verificación (fallback)', detail: fallbackErr.message });
        }
      } else {
        return res.status(500).json({ error: 'Error guardando el perfil de verificación', detail: dbErr.message, stack: dbErr.stack });
      }
    }

    // mark as pending and evaluate if verification can be completed
    verificationMap.set(userId, 'pendiente');
    const completed = await checkAndSetVerified(userId);

    if (completed) return res.json({ message: 'Usuario verificado correctamente' });

    res.json({ message: 'Formulario de verificación guardado correctamente. Estado: pendiente' });
  } catch (err) {
    try { console.error('[verification][error] submitVerificationForm', err && (err.stack || err.message || err)); } catch (_) {}
    res.status(500).json({ error: err.message });
  }
};

module.exports.submitVerificationForm = submitVerificationForm;
module.exports.getSellerDashboard = getSellerDashboard;