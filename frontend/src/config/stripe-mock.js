/**
 * Mock de Stripe.js para el frontend
 * Simula loadStripe y confirmCardPayment
 */

// Simulador de elementos de tarjeta
class MockCardElement {
  constructor() {
    this.cardData = {
      number: '4242424242424242',
      exp_month: '12',
      exp_year: '2025',
      cvc: '123'
    };
  }
}

// Mock de Elements
class MockElements {
  getElement(type) {
    if (type === 'card') {
      return new MockCardElement();
    }
    return null;
  }
}

// Mock de Stripe
class MockStripeInstance {
  constructor() {
    this.elements = new MockElements();
    this.paymentIntents = new Map(); // Almacenar intents
  }

  async confirmCardPayment(clientSecret, options) {
    console.log('🎭 [STRIPE MOCK JS] Confirmando pago...', clientSecret);
    
    // Extraer el intent ID del client_secret (formato: pi_xxx_secret_yyy)
    const intentId = clientSecret.split('_secret_')[0];
    
    // Simular delay de procesamiento (como lo haría Stripe real)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 95% de éxito, 5% de rechazo
    const isSuccessful = Math.random() > 0.05;
    
    if (isSuccessful) {
      console.log('✓ [STRIPE MOCK JS] Pago exitoso');
      return {
        paymentIntent: {
          id: intentId,
          client_secret: clientSecret,
          status: 'succeeded',
          amount: 9999, // dummy amount
          charges: {
            data: [{
              id: `ch_${Date.now()}`,
              receipt_url: null
            }]
          }
        }
      };
    } else {
      console.log('✗ [STRIPE MOCK JS] Pago rechazado');
      return {
        error: {
          message: 'Tu tarjeta fue rechazada',
          code: 'card_declined',
          payment_intent: {
            id: intentId,
            client_secret: clientSecret,
            status: 'requires_payment_method'
          }
        }
      };
    }
  }

  // Para compatibilidad, si se llama a otro método
  async __request(method, path, options) {
    return { success: true };
  }
}

/**
 * Mock de loadStripe
 * Retorna una promesa que resuelve a Stripe simulado
 */
export async function loadStripe(publicKey) {
  console.log('🎭 [STRIPE MOCK] Cargando Stripe Mock (educativo)...');
  
  // Simular delay de carga
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return new MockStripeInstance();
}

// Para usar como: import { loadStripe } from '@stripe/stripe-js'
export default { loadStripe };
