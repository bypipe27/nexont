const reviewsService = require('./reviews.service');

const getSellerReviews = async (req, res) => {
  try {
    const sellerId = parseInt(req.params.sellerId, 10);
    if (Number.isNaN(sellerId)) {
      return res.status(400).json({ error: 'ID de vendedor inválido' });
    }

    const data = await reviewsService.getSellerReviewSummary(sellerId);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createSellerReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const sellerId = parseInt(req.params.sellerId, 10);
    const orderId = parseInt(req.params.orderId, 10);
    const { calificacion, comentario } = req.body;

    if (Number.isNaN(sellerId)) return res.status(400).json({ error: 'ID de vendedor inválido' });
    if (Number.isNaN(orderId)) return res.status(400).json({ error: 'ID de pedido inválido' });

    const result = await reviewsService.createSellerReview({
      userId,
      sellerId,
      orderId,
      calificacion,
      comentario,
    });

    return res.status(201).json({
      message: 'Reseña creada correctamente',
      ...result,
    });
  } catch (err) {
    const status = /válido|Pedido inválido|vendedor no pertenece|calificación|reseña/i.test(err.message) ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

module.exports = {
  getSellerReviews,
  createSellerReview,
};
