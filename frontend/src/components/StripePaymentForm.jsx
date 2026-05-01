import { useState } from 'react';

const normalizeDigits = (value) => value.replace(/\D/g, '');

const detectCardType = (number) => {
  const digits = normalizeDigits(number);

  if (!digits) return 'unknown';

  if (digits.startsWith('4')) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(6011|65|64[4-9]|622)/.test(digits)) return 'discover';

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

const getCardVisual = (type) => {
  switch (type) {
    case 'visa':
      return { label: 'VISA', bg: '#1A1F71', fg: '#FFFFFF' };
    case 'mastercard':
      return { label: 'Mastercard', bg: '#FFF4E5', fg: '#C2410C', accent: true };
    case 'amex':
      return { label: 'AMEX', bg: '#0F4C81', fg: '#FFFFFF' };
    case 'discover':
      return { label: 'Discover', bg: '#FFF7ED', fg: '#C2410C' };
    default:
      return { label: 'Card', bg: '#F3F4F6', fg: '#6B7280' };
  }
};

function CardBrandBadge({ type, compact = false }) {
  const visual = getCardVisual(type);
  return (
    <span
      aria-label={visual.label}
      title={visual.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: compact ? '84px' : '112px',
        height: compact ? '28px' : '32px',
        padding: compact ? '0 0.65rem' : '0 0.8rem',
        borderRadius: '999px',
        background: visual.bg,
        color: visual.fg,
        border: '1px solid rgba(0,0,0,0.08)',
        fontSize: compact ? '0.62rem' : '0.68rem',
        fontWeight: 700,
        letterSpacing: compact ? '0.12em' : '0.16em',
        textTransform: 'uppercase',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {type === 'mastercard' ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.22rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#EA001B', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: 999, background: '#FF5F00', display: 'inline-block', marginLeft: -4 }} />
          <span style={{ marginLeft: 2 }}>{visual.label}</span>
        </span>
      ) : (
        visual.label
      )}
    </span>
  );
}

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
  const [isMockMode] = useState(true);
  const [cardData, setCardData] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '07/28',
    cvc: '123',
  });

  const handleCardNumberChange = (e) => {
    let value = normalizeDigits(e.target.value).substring(0, 19);
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
    const value = normalizeDigits(e.target.value).substring(0, 4);
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
      // Simulación local del procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (typeof onPaymentSuccess === 'function') {
        await onPaymentSuccess({
          amount,
          orderId,
          cardBrand: getCardRules(cardType).label,
          last4: cardDigits.slice(-4),
          simulated: true,
        });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Error al procesar pago';
      setError(errMsg);
      if (typeof onPaymentError === 'function') onPaymentError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const detectedType = detectCardType(cardData.cardNumber);
  const cardVisual = getCardVisual(detectedType);

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

      {/* Top brand badge removed — only bottom badge shown near the card number */}

      <div style={{
        background: 'var(--cream)',
        border: '1px solid var(--border)',
        padding: '1rem',
        marginBottom: '1rem',
        borderRadius: '4px'
      }}>
        {/* Número de tarjeta */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#666', display: 'block' }}>
              NÚMERO DE TARJETA
            </label>
            <CardBrandBadge type={detectedType} compact={false} />
          </div>
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
              border: `1px solid ${detectedType === 'unknown' ? '#ddd' : '#D6D3D1'}`,
              borderRadius: '4px',
              fontFamily: '"DM Sans", monospace',
              boxSizing: 'border-box',
              boxShadow: detectedType === 'unknown' ? 'none' : `0 0 0 1px ${cardVisual.bg}12 inset`,
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
