const prisma = require('../../config/database');

// ─── Generar número correlativo de factura ─────────────────────────────────
const generateInvoiceNumber = async () => {
  const last = await prisma.invoice.findFirst({
    orderBy: { id: 'desc' },
    select: { invoiceNumber: true },
  });

  if (!last) return 'INV-0001';

  const lastNum = parseInt(last.invoiceNumber.replace('INV-', ''), 10);
  const next = lastNum + 1;
  return `INV-${String(next).padStart(4, '0')}`;
};

// ─── Confirmar compra ──────────────────────────────────────────────────────
const confirmOrder = async ({ userId, paymentMethod = 'efectivo', notes = '' }) => {
  // 1. Obtener carrito del usuario
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: { id: true, name: true, price: true, stock: true, isActive: true },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new Error('El carrito está vacío');
  }

  // 2. Validar stock de todos los productos antes de hacer cualquier cambio
  const stockErrors = [];
  for (const item of cartItems) {
    if (!item.product.isActive) {
      stockErrors.push(`El producto "${item.product.name}" ya no está disponible`);
      continue;
    }
    if (item.product.stock < item.quantity) {
      stockErrors.push(
        `"${item.product.name}": stock disponible ${item.product.stock}, solicitado ${item.quantity}`
      );
    }
  }

  if (stockErrors.length > 0) {
    throw new Error(`Stock insuficiente:\n${stockErrors.join('\n')}`);
  }

  // 3. Calcular total
  const total = cartItems.reduce((acc, item) => {
    return acc + Number(item.product.price) * item.quantity;
  }, 0);

  // 4. Ejecutar todo en una transacción atómica
  //    (descuento de stock + creación de orden + factura + limpieza del carrito)
  const result = await prisma.$transaction(async (tx) => {
    // 4a. Descontar stock de cada producto con verificación atómica
    for (const item of cartItems) {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.quantity }, // condición atómica: solo actualiza si hay stock
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      // Si no se actualizó ningún registro, el stock cambió entre la validación y la transacción
      if (updated.count === 0) {
        throw new Error(
          `Stock insuficiente para "${item.product.name}" al momento de confirmar. Por favor recarga el carrito.`
        );
      }
    }

    // 4b. Crear la orden
    const order = await tx.order.create({
      data: {
        userId,
        status: 'confirmada',
        paymentMethod,
        total: Number(total.toFixed(2)),
        notes: notes || null,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: Number(item.product.price),
            lineTotal: Number(item.product.price) * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    });

    // 4c. Generar factura con número correlativo
    const invoiceNumber = await generateInvoiceNumber();
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        userId,
        total: Number(total.toFixed(2)),
        paymentMethod,
      },
    });

    // 4d. Vaciar el carrito
    await tx.cartItem.deleteMany({ where: { userId } });

    return { order, invoice };
  });

  return {
    message: 'Compra confirmada exitosamente',
    order: {
      id: result.order.id,
      status: result.order.status,
      paymentMethod: result.order.paymentMethod,
      total: Number(result.order.total),
      notes: result.order.notes,
      createdAt: result.order.createdAt,
      items: result.order.items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        imageUrl: item.product.imageUrl,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    },
    invoice: {
      invoiceNumber: result.invoice.invoiceNumber,
      total: Number(result.invoice.total),
      paymentMethod: result.invoice.paymentMethod,
      issuedAt: result.invoice.issuedAt,
    },
  };
};

// ─── Obtener órdenes del usuario ───────────────────────────────────────────
const getOrdersByUser = async (userId) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      },
      invoice: {
        select: { invoiceNumber: true, issuedAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    total: Number(order.total),
    notes: order.notes,
    createdAt: order.createdAt,
    invoiceNumber: order.invoice?.invoiceNumber || null,
    invoiceIssuedAt: order.invoice?.issuedAt || null,
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.product?.name || 'Producto eliminado',
      imageUrl: item.product?.imageUrl || null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
  }));
};

// ─── Obtener orden por ID ──────────────────────────────────────────────────
const getOrderById = async (orderId, userId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, imageUrl: true },
          },
        },
      },
      invoice: true,
    },
  });

  if (!order) throw new Error('Orden no encontrada');

  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    total: Number(order.total),
    notes: order.notes,
    createdAt: order.createdAt,
    invoice: order.invoice
      ? {
          invoiceNumber: order.invoice.invoiceNumber,
          total: Number(order.invoice.total),
          paymentMethod: order.invoice.paymentMethod,
          issuedAt: order.invoice.issuedAt,
        }
      : null,
    items: order.items.map((item) => ({
      productId: item.productId,
      productName: item.product?.name || 'Producto eliminado',
      imageUrl: item.product?.imageUrl || null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
  };
};

module.exports = { confirmOrder, getOrdersByUser, getOrderById };