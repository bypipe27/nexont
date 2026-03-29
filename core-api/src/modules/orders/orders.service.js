const prisma = require('../../config/database');

// ─── Generar número correlativo de factura ────────────────────────────────────
const generateInvoiceNumber = async () => {
  const last = await prisma.factura.findFirst({
    orderBy: { id: 'desc' },
    select: { numeroFactura: true },
  });
  if (!last) return 'INV-0001';
  const lastNum = parseInt(last.numeroFactura.replace('INV-', ''), 10);
  return `INV-${String(lastNum + 1).padStart(4, '0')}`;
};

// ─── Mapear método de pago al enum de Prisma ──────────────────────────────────
const mapPaymentMethod = (method) => {
  const map = {
    'efectivo': 'EFECTIVO', 'tarjeta': 'TARJETA',
    'transferencia': 'TRANSFERENCIA', 'paypal': 'PAYPAL',
    'EFECTIVO': 'EFECTIVO', 'TARJETA': 'TARJETA',
    'TRANSFERENCIA': 'TRANSFERENCIA', 'PAYPAL': 'PAYPAL',
  };
  return map[method] || 'EFECTIVO';
};

// ─── Confirmar compra ─────────────────────────────────────────────────────────
const confirmOrder = async ({ userId, paymentMethod = 'efectivo', notes = '' }) => {
  // 1. Obtener carrito
  const cartItems = await prisma.itemCarrito.findMany({
    where: { usuarioId: userId, producto: { estaActivo: true } },
    include: {
      producto: {
        select: { id: true, titulo: true, precio: true, stock: true, estaActivo: true },
      },
    },
  });

  if (cartItems.length === 0) throw new Error('El carrito está vacío');

  // 2. Validar stock antes de la transacción
  const stockErrors = [];
  for (const item of cartItems) {
    if (!item.producto.estaActivo) {
      stockErrors.push(`El producto "${item.producto.titulo}" ya no está disponible`);
    } else if (item.producto.stock < item.cantidad) {
      stockErrors.push(`"${item.producto.titulo}": stock disponible ${item.producto.stock}, solicitado ${item.cantidad}`);
    }
  }
  if (stockErrors.length > 0) throw new Error(`Stock insuficiente:\n${stockErrors.join('\n')}`);

  // 3. Calcular total y número de factura ANTES de la transacción
  //    (menos queries dentro = menos tiempo = no timeout)
  const total = cartItems.reduce((acc, item) => acc + Number(item.producto.precio) * item.cantidad, 0);
  const metodoPago = mapPaymentMethod(paymentMethod);
  const invoiceNumber = await generateInvoiceNumber();

  // 4. Transacción con timeout extendido (30s para Supabase remoto)
  const result = await prisma.$transaction(async (tx) => {

    // 4a. Descontar stock de todos los productos EN PARALELO
    const stockUpdates = await Promise.all(
      cartItems.map(item =>
        tx.producto.updateMany({
          where: { id: item.productoId, stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        })
      )
    );

    // Verificar que todos se actualizaron
    for (let i = 0; i < stockUpdates.length; i++) {
      if (stockUpdates[i].count === 0) {
        throw new Error(`Stock insuficiente para "${cartItems[i].producto.titulo}" al confirmar.`);
      }
    }

    // 4b. Crear pedido + detalles en una sola query
    const order = await tx.pedido.create({
      data: {
        usuarioId: userId,
        estado: 'CONFIRMADO',
        metodoPago,
        total: Number(total.toFixed(2)),
        notas: notes || null,
        detalles: {
          create: cartItems.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: Number(item.producto.precio),
            subtotal: Number(item.producto.precio) * item.cantidad,
          })),
        },
      },
      include: {
        detalles: {
          include: {
            producto: {
              select: {
                id: true, titulo: true,
                imagenes: { where: { esPrincipal: true }, select: { url: true } },
              },
            },
          },
        },
      },
    });

    // 4c. Crear factura y vaciar carrito EN PARALELO
    const [invoice] = await Promise.all([
      tx.factura.create({
        data: {
          numeroFactura: invoiceNumber,
          pedidoId: order.id,
          usuarioId: userId,
          total: Number(total.toFixed(2)),
          metodoPago,
        },
      }),
      tx.itemCarrito.deleteMany({ where: { usuarioId: userId } }),
    ]);

    return { order, invoice };
  }, {
    timeout: 30000, // 30 segundos para Supabase remoto
  });

  return {
    message: 'Compra confirmada exitosamente',
    order: {
      id: result.order.id,
      status: result.order.estado,
      paymentMethod: result.order.metodoPago,
      total: Number(result.order.total),
      notes: result.order.notas,
      createdAt: result.order.creadoEn,
      items: result.order.detalles.map((item) => ({
        productId: item.productoId,
        productName: item.producto?.titulo || 'Producto',
        imageUrl: item.producto?.imagenes?.[0]?.url || null,
        quantity: item.cantidad,
        unitPrice: Number(item.precioUnitario),
        lineTotal: Number(item.subtotal),
      })),
    },
    invoice: {
      invoiceNumber: result.invoice.numeroFactura,
      total: Number(result.invoice.total),
      paymentMethod: result.invoice.metodoPago,
      issuedAt: result.invoice.emitidaEn,
    },
  };
};

// ─── Obtener órdenes del usuario ──────────────────────────────────────────────
const getOrdersByUser = async (userId) => {
  const orders = await prisma.pedido.findMany({
    where: { usuarioId: userId },
    include: {
      detalles: {
        include: {
          producto: {
            select: {
              id: true, titulo: true,
              imagenes: { where: { esPrincipal: true }, select: { url: true } },
            },
          },
        },
      },
      factura: { select: { numeroFactura: true, emitidaEn: true } },
    },
    orderBy: { creadoEn: 'desc' },
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.estado,
    paymentMethod: order.metodoPago,
    total: Number(order.total),
    notes: order.notas,
    createdAt: order.creadoEn,
    invoiceNumber: order.factura?.numeroFactura || null,
    invoiceIssuedAt: order.factura?.emitidaEn || null,
    items: order.detalles.map((item) => ({
      productId: item.productoId,
      productName: item.producto?.titulo || 'Producto eliminado',
      imageUrl: item.producto?.imagenes?.[0]?.url || null,
      quantity: item.cantidad,
      unitPrice: Number(item.precioUnitario),
      lineTotal: Number(item.subtotal),
    })),
  }));
};

// ─── Obtener orden por ID ─────────────────────────────────────────────────────
const getOrderById = async (orderId, userId) => {
  const order = await prisma.pedido.findFirst({
    where: { id: orderId, usuarioId: userId },
    include: {
      detalles: {
        include: {
          producto: {
            select: {
              id: true, titulo: true,
              imagenes: { where: { esPrincipal: true }, select: { url: true } },
            },
          },
        },
      },
      factura: true,
    },
  });

  if (!order) throw new Error('Orden no encontrada');

  return {
    id: order.id,
    status: order.estado,
    paymentMethod: order.metodoPago,
    total: Number(order.total),
    notes: order.notas,
    createdAt: order.creadoEn,
    invoice: order.factura ? {
      invoiceNumber: order.factura.numeroFactura,
      total: Number(order.factura.total),
      paymentMethod: order.factura.metodoPago,
      issuedAt: order.factura.emitidaEn,
    } : null,
    items: order.detalles.map((item) => ({
      productId: item.productoId,
      productName: item.producto?.titulo || 'Producto eliminado',
      imageUrl: item.producto?.imagenes?.[0]?.url || null,
      quantity: item.cantidad,
      unitPrice: Number(item.precioUnitario),
      lineTotal: Number(item.subtotal),
    })),
  };
};

module.exports = { confirmOrder, getOrdersByUser, getOrderById };