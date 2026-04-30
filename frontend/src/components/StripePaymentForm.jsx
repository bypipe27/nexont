import { useState, useEffect } from 'react';
import api from '../api/api';

const detectCardType = (number) => {
  const digits = number.replace(/\D/g, '');

  if (/^4\d{0,18}$/.test(digits)) return 'visa';
  if (/^(5[1-5]\d{0,14}|2(2[2-9]\d{0,12}|[3-6]\d{0,13}|7[01]\d{0,12}|720\d{0,12}))$/.test(digits)) return 'mastercard';
  if (/^3[47]\d{0,13}$/.test(digits)) return 'amex';
  if (/^6(?:011|5\d{2})\d{0,12}$/.test(digits)) return 'discover';

  return 'unknown';
};

const getCardRules = (type) => {
  switch (type) {
    case 'visa':
      return { lengths: [13, 16, 19], cvcLength: 3, label: 'Visa' };
    case 'mastercard':
      return { lengths: [16], cvcLength: 3, label: 'Mastercard' };
    case 'amex':
      return { lengths: [15], cvcLength: 4, label: 'American Express' };
    case 'discover':
      return { lengths: [16, 19], cvcLength: 3, label: 'Discover' };
    default:
      return { lengths: [13, 14, 15, 16, 19], cvcLength: 3, label: 'Desconocida' };
  }
};

const luhnCheck = (number) => {
  const digits = number.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return digits.length > 0 && sum % 10 === 0;
};

function StripePaymentForm({ amount, orderId, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing }) {
  const [error, setError] = useState('');
  const [isMockMode, setIsMockMode] = useState(true);
  const [cardData, setCardData] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '07/28',
    cvc: '123',
  });

  useEffect(() => {
    setIsMockMode(true);
  }, []);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '').substring(0, 19);
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setCardData({ ...cardData, cardNumber: formatted });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCardData({ ...cardData, expiry: value.substring(0, 5) });
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardData({ ...cardData, cvc: value });
  };

  const handlePayment = async () => {
    // Validar campos
    const cardDigits = cardData.cardNumber.replace(/\s/g, '');
    const expiryDigits = cardData.expiry.replace(/\D/g, '');
    const cardType = detectCardType(cardDigits);
    const rules = getCardRules(cardType);

    if (!cardDigits || !rules.lengths.includes(cardDigits.length)) {
      setError(`Número de tarjeta inválido para ${rules.label}`);
      return;
    }
    if (!luhnCheck(cardDigits)) {
      setError(`El número de tarjeta no es válido para ${rules.label}`);
      return;
    }
    if (!cardData.expiry || expiryDigits.length < 4) {
      setError('Fecha de vencimiento inválida');
      return;
    }
    if (!cardData.cvc || cardData.cvc.length !== rules.cvcLength) {
      setError(`CVC inválido para ${rules.label}`);
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      // 1. Crear Payment Intent en el backend
      const { data: intentData } = await api.post('/payments/intent', {
        amount,
        description: `Compra Nexont - Orden #${orderId}`
      });

      console.log('📋 Intent creado:', intentData.clientSecret);

      // 2. Simular confirmación de pago en el frontend
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 3. Confirmar en el backend que el pago se procesó
      await api.post('/payments/confirm', {
        paymentIntentId: intentData.id
      });

      console.log('✓ Pago exitoso');
      onPaymentSuccess();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Error al procesar pago';
      setError(errMsg);
      onPaymentError(errMsg);
      console.error('❌ Error en pago:', errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      {isMockMode && (
        <div style={{
          background: '#E3F2FD',
          border: '1px solid #90CAF9',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#1565C0'
        }}>
          🎭 <strong>Modo educativo:</strong> Usando simulador de pago. Puedes usar cualquier número de tarjeta.
        </div>
      )}

      <div style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#9CA3AF' }}>
        Tipo detectado: <strong>{getCardRules(detectCardType(cardData.cardNumber)).label}</strong>
      </div>

      <div style={{
        background: 'var(--cream)',
        border: '1px solid var(--border)',
        padding: '1rem',
        marginBottom: '1rem',
        borderRadius: '4px'
      }}>
        {/* Número de tarjeta */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
            NÚMERO DE TARJETA
          </label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardData.cardNumber}
            onChange={handleCardNumberChange}
            autoComplete="cc-number"
            maxLength="23"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#000000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontFamily: '"DM Sans", monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Fecha y CVC */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              VENCIMIENTO
            </label>
            <input
              type="text"
              placeholder="MM/AA"
              value={cardData.expiry}
              onChange={handleExpiryChange}
              autoComplete="cc-exp"
              maxLength="5"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#000000',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: '"DM Sans", monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              value={cardData.cvc}
              onChange={handleCvcChange}
              autoComplete="cc-csc"
              maxLength="4"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#000000',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontFamily: '"DM Sans", monospace',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '1rem' }}>
          ⚠ {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        style={{
          width: '100%',
          height: '44px',
          background: isProcessing ? 'var(--ink-soft)' : 'var(--ink)',
          color: 'var(--cream)',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.78rem',
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          border: 'none',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          opacity: isProcessing ? 0.6 : 1
        }}
      >
        {isProcessing ? 'Procesando pago...' : '✓ Pagar ahora'}
      </button>
    </div>
  );
}

export default StripePaymentForm;
