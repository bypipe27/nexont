const router = require('express').Router();
const { authMiddleware } = require('../../shared/middleware/auth.middleware');
const reviewsController = require('./reviews.controller');

router.get('/sellers/:sellerId', reviewsController.getSellerReviews);
router.post('/sellers/:sellerId/orders/:orderId', authMiddleware, reviewsController.createSellerReview);

module.exports = router;
