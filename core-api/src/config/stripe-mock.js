/**
 * Mock de Stripe para desarrollo/educativo
 * Simula completamente el comportamiento de Stripe sin necesidad de claves reales
 */

class MockStripe {
  constructor() {
    this.paymentIntents = {
      intentStore: new Map(),
      
      create: async (options) => {
        const intentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const secretPart = Math.random().toString(36).substr(2, 32);
        const intent = {
          id: intentId,
          client_secret: `${intentId}_secret_${secretPart}`,
          amount: options.amount,
          currency: options.currency || 'usd',
          description: options.description,
          status: 'requires_payment_method',
          metadata: options.metadata || {},
          created: Date.now(),
        };
        
        this.paymentIntents.intentStore.set(intent.id, intent);
        console.log('✓ [STRIPE MOCK] Payment Intent creado:', intent.id);
        return intent;
      },
      
      retrieve: async (intentId) => {
        const intent = this.paymentIntents.intentStore.get(intentId);
        if (!intent) {
          throw new Error(`Payment Intent ${intentId} no encontrado`);
        }
        return intent;
      },
      
      confirm: async (intentId, options) => {
        const intent = this.paymentIntents.intentStore.get(intentId);
        if (!intent) {
          throw new Error(`Payment Intent ${intentId} no encontrado`);
        }

        // En modo educativo, siempre aprobamos el pago
        intent.status = 'succeeded';
        intent.charges = {
          data: [{
            id: `ch_${Date.now()}`,
            amount: intent.amount,
            currency: intent.currency,
            status: 'succeeded'
          }]
        };
        console.log('✓ [STRIPE MOCK] Pago procesado exitosamente:', intentId);
        
        return intent;
      }
    };
  }
}

// Exportar instancia singleton
module.exports = new MockStripe();
