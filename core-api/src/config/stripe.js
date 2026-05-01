/**
 * Configuración de Stripe
 * En modo desarrollo o sin clave real, usa Mock
 * En producción, usa Stripe real
 */

const isProduction = process.env.NODE_ENV === 'production';
const hasValidKey = process.env.STRIPE_SECRET_KEY && 
                    process.env.STRIPE_SECRET_KEY.startsWith('sk_');

if (isProduction && !hasValidKey) {
  throw new Error('❌ STRIPE_SECRET_KEY es requerido en producción');
}

let stripe;

if (hasValidKey && isProduction) {
  // Usar Stripe real en producción con clave válida
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✓ Stripe real configurado');
} else {
  // Usar Mock en desarrollo o sin clave real
  stripe = require('./stripe-mock');
  console.log('✓ Stripe Mock activado (modo educativo/desarrollo)');
}

module.exports = stripe;
