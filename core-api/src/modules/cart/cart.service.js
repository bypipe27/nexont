const prisma = require('../../config/database');

const formatCart = (items) => {
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.product.price);
    return acc + (price * item.quantity);
  }, 0);

  return {
    items,
    totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: Number(subtotal.toFixed(2)),
  };
};

const getCartByUser = async (userId) => {
  const items = await prisma.cartItem.findMany({
    where: {
      userId,
      product: {
        isActive: true,
      },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          imageUrl: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return formatCart(items);
};

const addItemToCart = async ({ userId, productId, quantity }) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true, stock: true },
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
    select: { quantity: true },
  });

  const currentQuantity = existing ? existing.quantity : 0;
  const finalQuantity = currentQuantity + quantity;

  if (finalQuantity > product.stock) {
    throw new Error('No puedes agregar más cantidad que el stock disponible');
  }

  await prisma.cartItem.upsert({
    where: {
      userId_productId: { userId, productId },
    },
    update: {
      quantity: finalQuantity,
    },
    create: {
      userId,
      productId,
      quantity,
    },
  });

  return getCartByUser(userId);
};

const updateCartItemQuantity = async ({ userId, productId, quantity }) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: { userId, productId },
    },
  });

  if (!cartItem) {
    throw new Error('El producto no está en tu carrito');
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return getCartByUser(userId);
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true, stock: true },
  });

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  if (quantity > product.stock) {
    throw new Error('No puedes guardar más cantidad que el stock disponible');
  }

  await prisma.cartItem.update({
    where: {
      userId_productId: { userId, productId },
    },
    data: {
      quantity,
    },
  });

  return getCartByUser(userId);
};

const removeCartItem = async ({ userId, productId }) => {
  await prisma.cartItem.deleteMany({
    where: { userId, productId },
  });

  return getCartByUser(userId);
};

const clearCart = async (userId) => {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return getCartByUser(userId);
};

module.exports = {
  getCartByUser,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
