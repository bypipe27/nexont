const Joi = require('joi');
const { validate } = require('../../shared/validation/auth.validation');

const addToCartSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del producto debe ser numérico',
    'number.integer': 'El ID del producto debe ser un número entero',
    'number.positive': 'El ID del producto debe ser mayor a 0',
    'any.required': 'El ID del producto es requerido',
  }),
  quantity: Joi.number().integer().min(1).default(1).messages({
    'number.integer': 'La cantidad debe ser un número entero',
    'number.min': 'La cantidad mínima es 1',
  }),
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required().messages({
    'number.integer': 'La cantidad debe ser un número entero',
    'number.min': 'La cantidad no puede ser negativa',
    'any.required': 'La cantidad es requerida',
  }),
});

module.exports = {
  validateAddToCart: validate(addToCartSchema),
  validateUpdateCartItem: validate(updateCartItemSchema),
};
