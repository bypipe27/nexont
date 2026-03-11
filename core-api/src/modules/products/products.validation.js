const Joi = require('joi');
const { validate } = require('../../shared/validation/auth.validation');

// ─── Crear producto ───────────────────────────────────────────────────────────
const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar 100 caracteres',
    'any.required': 'El nombre es requerido',
  }),
  description: Joi.string().trim().max(1000).optional().allow('').messages({
    'string.max': 'La descripción no puede superar 1000 caracteres',
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'El precio debe ser mayor a 0',
    'any.required': 'El precio es requerido',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'La cantidad disponible no puede ser negativa',
    'number.integer': 'La cantidad debe ser un número entero',
    'any.required': 'La cantidad disponible es requerida',
  }),
});

// ─── Actualizar producto ──────────────────────────────────────────────────────
const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  price: Joi.number().positive().precision(2).optional().messages({
    'number.positive': 'El precio debe ser mayor a 0',
  }),
  stock: Joi.number().integer().min(0).optional().messages({
    'number.min': 'La cantidad disponible no puede ser negativa',
  }),
}).min(1);

module.exports = {
  validateCreateProduct: validate(createProductSchema),
  validateUpdateProduct: validate(updateProductSchema),
};
