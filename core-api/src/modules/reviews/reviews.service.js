const prisma = require('../../config/database');

const normalizeReviewComment = (comment) => {
  if (comment === undefined || comment === null) return null;
  const value = String(comment).trim();
  return value.length ? value.slice(0, 300) : null;
};

const getSellerReviewSummary = async (sellerId) => {
  const id = parseInt(sellerId, 10);
  if (Number.isNaN(id)) throw new Error('ID de vendedor inválido');

  const [aggregate, recentReviews] = await Promise.all([
    prisma.resenaVendedor.aggregate({
      where: { vendedorId: id },
      _avg: { calificacion: true },
      _count: { _all: true },
    }),
    prisma.resenaVendedor.findMany({
      where: { vendedorId: id },
      orderBy: { creadoEn: 'desc' },
      take: 5,
      select: {
        id: true,
        calificacion: true,
        comentario: true,
        creadoEn: true,
        pedidoId: true,
        usuario: {
          select: {
            nombres: true,
            apellidos: true,
          },
        },
      },
    }),
  ]);

  return {
    averageRating: Number(aggregate._avg.calificacion || 0),
    totalReviews: aggregate._count._all || 0,
    recentReviews: recentReviews.map((review) => ({
      id: review.id,
      rating: review.calificacion,
      comment: review.comentario,
      orderId: review.pedidoId,
      createdAt: review.creadoEn,
      reviewerName: `${review.usuario?.nombres || ''} ${review.usuario?.apellidos || ''}`.trim() || 'Comprador',
    })),
  };
};

const recalculateSellerRatings = async (sellerId) => {
  const id = parseInt(sellerId, 10);
  if (Number.isNaN(id)) throw new Error('ID de vendedor inválido');

  const aggregate = await prisma.resenaVendedor.aggregate({
    where: { vendedorId: id },
    _avg: { calificacion: true },
    _count: { _all: true },
  });

  const averageRating = Number(aggregate._avg.calificacion || 0);
  const totalReviews = aggregate._count._all || 0;

  await prisma.producto.updateMany({
    where: { vendedorId: id },
    data: {
      promedioCalificacion: averageRating,
      totalResenas: totalReviews,
    },
  });

  return { averageRating, totalReviews };
};

const createSellerReview = async ({ userId, sellerId, orderId, calificacion, comentario }) => {
  const buyerId = parseInt(userId, 10);
  const sellerIdInt = parseInt(sellerId, 10);
  const orderIdInt = parseInt(orderId, 10);
  const rating = parseInt(calificacion, 10);

  if (Number.isNaN(buyerId)) throw new Error('Usuario inválido');
  if (Number.isNaN(sellerIdInt)) throw new Error('Vendedor inválido');
  if (Number.isNaN(orderIdInt)) throw new Error('Pedido inválido');
  if (Number.isNaN(rating) || rating < 1 || rating > 5) throw new Error('La calificación debe estar entre 1 y 5');

  const cleanComment = normalizeReviewComment(comentario);

  const order = await prisma.pedido.findFirst({
    where: { id: orderIdInt, usuarioId: buyerId },
    select: {
      id: true,
      estado: true,
      detalles: {
        select: {
          producto: {
            select: {
              vendedorId: true,
            },
          },
        },
      },
    },
  });

  if (!order) throw new Error('Orden no encontrada');
  if (!['CONFIRMADO', 'ENTREGADO'].includes(order.estado)) {
    throw new Error('Solo puedes reseñar pedidos confirmados o entregados');
  }

  const sellerIds = [...new Set(order.detalles.map((detail) => detail.producto?.vendedorId).filter(Boolean))];
  if (sellerIds.length === 0 || !sellerIds.includes(sellerIdInt)) {
    throw new Error('El vendedor no pertenece a este pedido');
  }

  const existing = await prisma.resenaVendedor.findUnique({
    where: {
      usuarioId_vendedorId_pedidoId: {
        usuarioId: buyerId,
        vendedorId: sellerIdInt,
        pedidoId: orderIdInt,
      },
    },
  });

  if (existing) {
    throw new Error('Ya dejaste una reseña para este vendedor en este pedido');
  }

  const review = await prisma.resenaVendedor.create({
    data: {
      usuarioId: buyerId,
      vendedorId: sellerIdInt,
      pedidoId: orderIdInt,
      calificacion: rating,
      comentario: cleanComment,
    },
  });

  const summary = await recalculateSellerRatings(sellerIdInt);

  return {
    review: {
      id: review.id,
      sellerId: review.vendedorId,
      orderId: review.pedidoId,
      rating: review.calificacion,
      comment: review.comentario,
      createdAt: review.creadoEn,
    },
    summary,
  };
};

module.exports = {
  getSellerReviewSummary,
  createSellerReview,
  recalculateSellerRatings,
};
