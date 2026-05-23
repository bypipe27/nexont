const AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..700&display=swap');

  :root {
    --ar-bg: #f7f9fd;
    --ar-bg-alt: #eceef2;
    --ar-surface: rgba(255, 255, 255, 0.78);
    --ar-surface-solid: #ffffff;
    --ar-surface-low: rgba(17, 17, 20, 0.04);
    --ar-on-surface: #191c1f;
    --ar-on-surface-variant: #45464c;
    --ar-outline-variant: #c6c6cd;
    --ar-primary: #000000;
    --ar-primary-contrast: #ffffff;
    --ar-secondary: #5c5f60;
    --ar-error: #ba1a1a;
    --ar-success: #157f3b;
    --ar-shadow: rgba(0, 0, 0, 0.08);
  }

  html[data-theme='dark'] {
    --ar-bg: #09090b;
    --ar-bg-alt: #111114;
    --ar-surface: rgba(17, 17, 20, 0.86);
    --ar-surface-solid: #111114;
    --ar-surface-low: rgba(255, 255, 255, 0.04);
    --ar-on-surface: #f4f4f5;
    --ar-on-surface-variant: #b8b8bf;
    --ar-outline-variant: rgba(255, 255, 255, 0.12);
    --ar-primary: #ffffff;
    --ar-primary-contrast: #0b0b0d;
    --ar-secondary: #8b8b95;
    --ar-error: #ef4444;
    --ar-success: #22c55e;
    --ar-shadow: rgba(0, 0, 0, 0.35);
  }

  .nx-auth-root {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(109, 40, 217, 0.14), transparent 30%),
      radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.1), transparent 28%),
      var(--ar-bg);
    color: var(--ar-on-surface);
    font-family: 'Inter', sans-serif;
  }

  html[data-theme='dark'] .nx-auth-root {
    background:
      radial-gradient(circle at top left, rgba(124, 58, 237, 0.18), transparent 30%),
      radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.12), transparent 28%),
      var(--ar-bg);
  }

  .nx-auth-main {
    min-height: calc(100vh - 68px);
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    position: relative;
    overflow: hidden;
  }

  .nx-auth-visual {
    position: relative;
    padding: 3rem 4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 68px);
    border-right: 1px solid var(--ar-outline-variant);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.44));
  }

  html[data-theme='dark'] .nx-auth-visual {
    background: linear-gradient(180deg, rgba(9, 9, 11, 0.5), rgba(9, 9, 11, 0.9));
  }

  .nx-auth-visual-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    opacity: 0.95;
    pointer-events: none;
  }

  .nx-auth-visual-content {
    position: relative;
    z-index: 1;
    max-width: 900px;
    width: 100%;
  }

  .nx-auth-kicker {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.75rem;
    font-size: 0.62rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ar-secondary);
  }

  html[data-theme='dark'] .nx-auth-kicker {
    color: #8f90a0;
  }

  .nx-auth-kicker::before {
    content: '';
    width: 22px;
    height: 1px;
    background: currentColor;
    display: block;
  }

  .nx-auth-title {
    font-size: clamp(3rem, 6vw, 5.3rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.04em;
    margin-bottom: 1rem;
    color: var(--ar-on-surface);
  }

  .nx-auth-title em {
    font-style: normal;
    color: #7c3aed;
  }

  html[data-theme='dark'] .nx-auth-title em {
    color: #a78bfa;
  }

  .nx-auth-desc {
    font-size: 1rem;
    line-height: 1.7;
    color: var(--ar-on-surface-variant);
    max-width: 620px;
    margin-bottom: 1.5rem;
  }

  html[data-theme='dark'] .nx-auth-desc {
    color: #c7c9d1;
  }

  .nx-auth-points {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .nx-auth-point {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: flex-start;
    padding: 1.25rem;
    border: 1px solid var(--ar-outline-variant);
    background: rgba(255, 255, 255, 0.62);
    backdrop-filter: blur(12px);
    height: 100%;
  }

  html[data-theme='dark'] .nx-auth-point {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .nx-auth-point-bullet {
    width: 24px;
    height: 3px;
    border-radius: 4px;
    background: linear-gradient(90deg, #7c3aed, #60a5fa);
    margin-top: 0;
    margin-bottom: 0.25rem;
    flex-shrink: 0;
  }

  .nx-auth-point strong {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--ar-on-surface);
    margin-bottom: 0.15rem;
  }

  html[data-theme='dark'] .nx-auth-point strong {
    color: #f5f5f7;
  }

  .nx-auth-point span {
    font-size: 0.78rem;
    color: var(--ar-on-surface-variant);
    line-height: 1.5;
  }

  html[data-theme='dark'] .nx-auth-point span {
    color: #b8b8bf;
  }

  .nx-auth-card-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    padding-top: 1rem;
    margin-top: -15rem;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01));
  }

  .nx-auth-main.login .nx-auth-card-wrap {
    margin-top: -6rem;
  }

  .nx-auth-main.register .nx-auth-card-wrap {
    margin-top: -3.5rem;
  }

  html[data-theme='dark'] .nx-auth-card-wrap {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.01));
  }

  .nx-auth-card {
    width: 100%;
    max-width: 560px;
    padding: 3rem;
    border: 1px solid var(--ar-outline-variant);
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(18px);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.08);
  }

  html[data-theme='dark'] .nx-auth-card {
    background: rgba(17, 17, 20, 0.88);
    border-color: rgba(255, 255, 255, 0.14);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
  }

  .nx-auth-card-tag {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--ar-on-surface-variant);
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  html[data-theme='dark'] .nx-auth-card-tag {
    color: #a1a1aa;
  }

  .nx-auth-card-tag::before {
    content: '';
    display: block;
    width: 22px;
    height: 1px;
    background: currentColor;
  }

  .nx-auth-card-title {
    font-size: 2.5rem;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
    margin-bottom: 0.45rem;
  }

  html[data-theme='dark'] .nx-auth-card-title {
    color: #f4f4f5;
  }

  .nx-auth-card-sub {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--ar-on-surface-variant);
    margin-bottom: 1.25rem;
  }

  html[data-theme='dark'] .nx-auth-card-sub {
    color: #b8b8bf;
  }

  .nx-auth-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .nx-auth-field label {
    display: block;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--ar-on-surface-variant);
    margin-bottom: 0.45rem;
  }

  html[data-theme='dark'] .nx-auth-field label {
    color: #a1a1aa;
  }

  .nx-auth-input {
    width: 100%;
    height: 52px;
    padding: 0 1.25rem;
    border: 1px solid var(--ar-outline-variant);
    background: rgba(255, 255, 255, 0.92);
    color: var(--ar-on-surface);
    font-size: 1rem;
    outline: none;
    transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
  }

  html[data-theme='dark'] .nx-auth-input {
    background: rgba(255, 255, 255, 0.04);
    color: #f4f4f5;
    border-color: rgba(255, 255, 255, 0.14);
  }

  .nx-auth-input:focus {
    border-color: rgba(124, 58, 237, 0.65);
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  html[data-theme='dark'] .nx-auth-input:focus {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(196, 181, 253, 0.8);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.16);
  }

  .nx-auth-input::placeholder {
    color: rgba(25, 28, 31, 0.38);
  }

  html[data-theme='dark'] .nx-auth-input::placeholder {
    color: rgba(244, 244, 245, 0.38);
  }

  .nx-auth-input.err {
    border-color: rgba(239, 68, 68, 0.7);
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.12);
  }

  .nx-auth-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .nx-auth-alert {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    padding: 0.8rem 1rem;
    border: 1px solid rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.08);
    color: #b91c1c;
    font-size: 0.82rem;
    line-height: 1.5;
  }

  html[data-theme='dark'] .nx-auth-alert {
    background: rgba(239, 68, 68, 0.1);
    color: #fecaca;
  }

  .nx-auth-alert.success {
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.08);
    color: #166534;
  }

  html[data-theme='dark'] .nx-auth-alert.success {
    background: rgba(34, 197, 94, 0.1);
    color: #bbf7d0;
  }

  .nx-auth-alert-icon {
    font-size: 0.8rem;
    margin-top: 1px;
    flex-shrink: 0;
  }

  .nx-auth-submit {
    width: 100%;
    height: 48px;
    border: none;
    background: linear-gradient(135deg, #111827, #7c3aed);
    color: #ffffff;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;
  }

  html[data-theme='dark'] .nx-auth-submit {
    background: linear-gradient(135deg, #f8fafc, #c4b5fd);
    color: #0b0b0d;
  }

  .nx-auth-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(124, 58, 237, 0.22);
  }

  .nx-auth-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nx-auth-foot {
    margin-top: 1.25rem;
    font-size: 0.84rem;
    color: var(--ar-on-surface-variant);
    text-align: center;
    line-height: 1.6;
  }

  html[data-theme='dark'] .nx-auth-foot {
    color: #a1a1aa;
  }

  .nx-auth-foot a {
    color: var(--ar-on-surface);
    font-weight: 700;
    text-decoration: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 1px;
  }

  html[data-theme='dark'] .nx-auth-foot a {
    color: #f4f4f5;
    border-bottom-color: rgba(255, 255, 255, 0.28);
  }

  .nx-auth-foot a:hover {
    color: #7c3aed;
    border-bottom-color: #7c3aed;
  }

  html[data-theme='dark'] .nx-auth-foot a:hover {
    color: #c4b5fd;
    border-bottom-color: #c4b5fd;
  }

  .nx-auth-mini {
    margin-top: 1.5rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .nx-auth-mini-card {
    border: 1px solid var(--ar-outline-variant);
    padding: 0.9rem 1rem;
    background: rgba(255, 255, 255, 0.72);
  }

  html[data-theme='dark'] .nx-auth-mini-card {
    background: rgba(255, 255, 255, 0.03);
  }

  .nx-auth-mini-card strong {
    display: block;
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--ar-on-surface);
    margin-bottom: 0.2rem;
  }

  html[data-theme='dark'] .nx-auth-mini-card strong {
    color: #f4f4f5;
  }

  .nx-auth-mini-card span {
    font-size: 0.75rem;
    color: var(--ar-on-surface-variant);
    line-height: 1.5;
  }

  html[data-theme='dark'] .nx-auth-mini-card span {
    color: #b8b8bf;
  }

  .nx-auth-visual .darkveil-canvas {
    position: absolute;
    inset: 0;
    width: 100% !important;
    height: 100% !important;
    opacity: 0.9;
  }

  @media (max-width: 920px) {
    .nx-auth-main { grid-template-columns: 1fr; }
    .nx-auth-visual {
      min-height: 360px;
      border-right: none;
      border-bottom: 1px solid var(--ar-outline-variant);
      padding: 2.5rem 1.5rem;
    }
    .nx-auth-card-wrap { padding: 2rem 1rem 2.5rem; }
  }

  @media (max-width: 640px) {
    .nx-auth-row, .nx-auth-mini { grid-template-columns: 1fr; }
    .nx-auth-card { padding: 1.4rem; }
    .nx-auth-title { font-size: clamp(2.4rem, 12vw, 3.6rem); }
  }
`;

export const ensureAuthStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('nx-auth-styles')) return;

  const el = document.createElement('style');
  el.id = 'nx-auth-styles';
  el.textContent = AUTH_STYLES;
  document.head.appendChild(el);
};
