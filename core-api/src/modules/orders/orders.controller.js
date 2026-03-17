const ordersService = require('./orders.service');

const confirm = async (req, res) => {
  try {
    const userId = req.user.userId; // <-- era req.user.id
    const { paymentMethod = 'efectivo', notes = '' } = req.body;

    const validMethods = ['efectivo'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ error: 'Método de pago no válido. Solo se acepta: efectivo' });
    }

    const result = await ordersService.confirmOrder({ userId, paymentMethod, notes });
    return res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes('Stock insuficiente') || err.message.includes('vacío') ? 400 : 500;
    return res.status(status).json({ error: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId; // <-- era req.user.id
    const orders = await ordersService.getOrdersByUser(userId);
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const userId = req.user.userId; // <-- era req.user.id
    const orderId = parseInt(req.params.id, 10);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'ID de orden inválido' });
    }

    const order = await ordersService.getOrderById(orderId, userId);
    return res.json(order);
  } catch (err) {
    const status = err.message === 'Orden no encontrada' ? 404 : 500;
    return res.status(status).json({ error: err.message });
  }
};

module.exports = { confirm, getMyOrders, getOrderDetail };  