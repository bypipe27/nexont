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
  // 1. Obtener carrito y última factura al mismo tiempo (1 viaje de red)
  const [cartItems, lastInvoice] = await Promise.all([
    prisma.itemCarrito.findMany({
      where: { usuarioId: userId, producto: { estaActivo: true } },
      include: {
        producto: { select: { id: true, titulo: true, precio: true, stock: true, estaActivo: true } },
      },
    }),
    prisma.factura.findFirst({
      orderBy: { id: 'desc' },
      select: { numeroFactura: true },
    }),
  ]);

  if (cartItems.length === 0) throw new Error('El carrito está vacío');

  // 2. Validar stock en memoria
  const stockErrors = [];
  for (const item of cartItems) {
    if (!item.producto.estaActivo) {
      stockErrors.push(`El producto "${item.producto.titulo}" ya no está disponible`);
    } else if (item.producto.stock < item.cantidad) {
      stockErrors.push(`"${item.producto.titulo}": stock disponible ${item.producto.stock}, solicitado ${item.cantidad}`);
    }
  }
  if (stockErrors.length > 0) throw new Error(`Stock insuficiente:\n${stockErrors.join('\n')}`);

  // 3. Preparar datos
  const total = cartItems.reduce((acc, item) => acc + Number(item.producto.precio) * item.cantidad, 0);
  const metodoPago = mapPaymentMethod(paymentMethod);
  let invoiceNumber = 'INV-0001';
  if (lastInvoice) {
    const lastNum = parseInt(lastInvoice.numeroFactura.replace('INV-', ''), 10);
    invoiceNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`;
  }

  // 4. Construir las consultas para una Transacción en Lote (Array Transaction)
  const queries = [];

  // 4a. Descontar stock
  for (const item of cartItems) {
    queries.push(
      prisma.producto.update({
        where: { id: item.productoId },
        data: { stock: { decrement: item.cantidad } },
      })
    );
  }

  // 4b. Crear pedido con detalles Y factura anidada (todo en 1 query interno)
  queries.push(
    prisma.pedido.create({
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
        factura: {
          create: {
            numeroFactura: invoiceNumber,
            usuarioId: userId,
            total: Number(total.toFixed(2)),
            metodoPago,
          },
        },
      },
      include: {
        detalles: {
          include: {
            producto: {
              select: {
                id: true, titulo: true,
                imagenes: { where: { esPrincipal: true }, select: { url: true } },
                vendedor: { select: { id: true, nombres: true, apellidos: true } },
              },
            },
          },
        },
        factura: true,
      },
    })
  );

  // 4c. Vaciar carrito
  queries.push(prisma.itemCarrito.deleteMany({ where: { usuarioId: userId } }));

  // 5. Ejecutar TODO en un solo viaje de red
  const results = await prisma.$transaction(queries);
  
  // El pedido es el penúltimo resultado en el array (antes del deleteMany)
  const resultOrder = results[results.length - 2];

  return {
    message: 'Compra confirmada exitosamente',
    order: {
      id: resultOrder.id,
      status: resultOrder.estado,
      paymentMethod: resultOrder.metodoPago,
      total: Number(resultOrder.total),
      notes: resultOrder.notas,
      createdAt: resultOrder.creadoEn,
      items: resultOrder.detalles.map((item) => ({
        productId: item.productoId,
        productName: item.producto?.titulo || 'Producto',
        imageUrl: item.producto?.imagenes?.[0]?.url || null,
        sellerId: item.producto?.vendedor?.id || null,
        sellerName: `${item.producto?.vendedor?.nombres || ''} ${item.producto?.vendedor?.apellidos || ''}`.trim() || null,
        quantity: item.cantidad,
        unitPrice: Number(item.precioUnitario),
        lineTotal: Number(item.subtotal),
      })),
    },
    invoice: {
      invoiceNumber: resultOrder.factura.numeroFactura,
      total: Number(resultOrder.factura.total),
      paymentMethod: resultOrder.factura.metodoPago,
      issuedAt: resultOrder.factura.emitidaEn,
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
              vendedor: { select: { id: true, nombres: true, apellidos: true } },
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
      sellerId: item.producto?.vendedor?.id || null,
      sellerName: `${item.producto?.vendedor?.nombres || ''} ${item.producto?.vendedor?.apellidos || ''}`.trim() || null,
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
              vendedor: { select: { id: true, nombres: true, apellidos: true } },
            },
          },
        },
      },
      factura: true,
    },
  });

  if (!order) throw new Error('Orden no encontrada');

  const reviews = await prisma.resenaVendedor.findMany({
    where: { pedidoId: order.id, usuarioId: userId },
    select: {
      vendedorId: true,
      calificacion: true,
      comentario: true,
      creadoEn: true,
    },
  });

  const reviewBySellerId = new Map(reviews.map((review) => [review.vendedorId, review]));
  const sellers = [];
  const seenSellerIds = new Set();
  order.detalles.forEach((item) => {
    const seller = item.producto?.vendedor;
    if (!seller || seenSellerIds.has(seller.id)) return;
    seenSellerIds.add(seller.id);
    sellers.push({
      id: seller.id,
      name: `${seller.nombres || ''} ${seller.apellidos || ''}`.trim() || 'Vendedor',
      review: reviewBySellerId.get(seller.id)
        ? {
            rating: reviewBySellerId.get(seller.id).calificacion,
            comment: reviewBySellerId.get(seller.id).comentario,
            createdAt: reviewBySellerId.get(seller.id).creadoEn,
          }
        : null,
    });
  });

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
      sellerId: item.producto?.vendedor?.id || null,
      sellerName: `${item.producto?.vendedor?.nombres || ''} ${item.producto?.vendedor?.apellidos || ''}`.trim() || null,
      quantity: item.cantidad,
      unitPrice: Number(item.precioUnitario),
      lineTotal: Number(item.subtotal),
    })),
    sellers,
  };
};

module.exports = { confirmOrder, getOrdersByUser, getOrderById };