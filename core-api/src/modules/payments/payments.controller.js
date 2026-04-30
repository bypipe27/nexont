const stripe = require('../../config/stripe');
const prisma = require('../../config/database');

const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, description = 'Compra en Nexont' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto inválido' });
    }

    // Crear Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'usd',
      description,
      metadata: { userId, description }
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
      status: paymentIntent.status
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const confirmPaymentIntent = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID requerido' });
    }

    // En modo educativo/mock, confirmamos el intent automáticamente
    let paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      if (typeof stripe.paymentIntents.confirm === 'function') {
        paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      }
    }

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'El pago no fue procesado exitosamente' });
    }

    return res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { createPaymentIntent, confirmPaymentIntent };
