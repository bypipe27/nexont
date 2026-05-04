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
      Promise.all([
        prisma.pedido.count({
          where: {
            estado: 'PENDIENTE',
            detalles: { some: { producto: { vendedorId: userId } } },
          },
        }),
        prisma.pedido.count({
          where: {
            estado: 'CONFIRMADO',
            detalles: { some: { producto: { vendedorId: userId } } },
          },
        }),
        prisma.pedido.count({
          where: {
            estado: 'ENTREGADO',
            detalles: { some: { producto: { vendedorId: userId } } },
          },
        }),
        prisma.pedido.count({
          where: {
            estado: { in: ['PENDIENTE', 'CONFIRMADO', 'ENTREGADO'] },
            detalles: { some: { producto: { vendedorId: userId } } },
          },
        }),
      ]),
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

    const [pendingOrders, confirmedOrders, deliveredOrders, totalOrders] = soldSummary;
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
module.exports.getSellerDashboard = getSellerDashboard;