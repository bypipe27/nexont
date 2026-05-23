const PROFILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  .pf-root {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(124, 58, 237, 0.14), transparent 28%),
      radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.08), transparent 26%),
      var(--ar-bg);
    color: var(--ar-on-surface);
    font-family: 'Inter', sans-serif;
  }

  .pf-nav {
    height: 64px;
    background: var(--ar-surface);
    border-bottom: 1px solid var(--ar-outline-variant);
    display: flex;
    align-items: center;
    padding: 0 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .pf-nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 900;
    color: var(--ar-on-surface);
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .pf-nav-brand img {
    width: 28px;
    height: 28px;
  }

  .pf-nav-wordmark {
    font-size: 18px;
    font-weight: 900;
    color: var(--ar-on-surface);
  }

  .pf-layout {
    max-width: 1160px;
    margin: 0 auto;
    padding: 3rem 2rem 5rem;
  }

  .pf-eyebrow {
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ar-secondary);
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-bottom: 0.85rem;
  }

  .pf-eyebrow::before {
    content: '';
    display: block;
    width: 22px;
    height: 1px;
    background: currentColor;
  }

  .pf-title {
    font-family: 'Inter', sans-serif;
    font-size: clamp(2.4rem, 4vw, 4rem);
    font-weight: 900;
    line-height: 0.98;
    letter-spacing: -0.04em;
    margin-bottom: 2rem;
    color: var(--ar-on-surface);
  }

  .pf-panel {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .pf-card {
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    backdrop-filter: blur(16px);
    box-shadow: 0 12px 32px var(--ar-shadow);
  }

  .pf-card.profile {
    padding: 1.5rem;
  }

  .pf-card.form {
    padding: 1.5rem;
  }

  .pf-card.profile,
  .pf-card.form {
    width: 100%;
  }

  .pf-avatar-section {
    display: flex;
    gap: 1.25rem;
    align-items: center;
    padding-bottom: 1.25rem;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid var(--ar-outline-variant);
  }

  .pf-avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .pf-avatar {
    width: 92px;
    height: 92px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--ar-outline-variant);
    font-family: 'Inter', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  .pf-avatar:hover {
    transform: translateY(-1px);
  }

  .pf-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pf-avatar-spinner {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(17, 17, 20, 0.28);
  }

  .pf-spinner {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    animation: pf-spin 0.7s linear infinite;
  }

  @keyframes pf-spin {
    to { transform: rotate(360deg); }
  }

  .pf-avatar-info {
    flex: 1;
    min-width: 0;
  }

  .pf-avatar-label {
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--ar-on-surface);
    margin-bottom: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .pf-avatar-hint {
    font-size: 0.76rem;
    color: var(--ar-on-surface-variant);
    line-height: 1.6;
    margin-bottom: 0.85rem;
  }

  .pf-avatar-btn,
  .pf-save,
  .pf-cancel {
    font-family: 'Inter', sans-serif;
  }

  .pf-avatar-btn {
    height: 36px;
    padding: 0 1rem;
    background: transparent;
    border: 1px solid var(--ar-outline-variant);
    color: var(--ar-on-surface);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
  }

  .pf-avatar-btn:hover {
    background: var(--ar-surface-low);
    border-color: var(--ar-on-surface);
  }

  .pf-avatar-err {
    font-size: 0.76rem;
    color: #dc2626;
    margin-top: 0.6rem;
    border: 1px solid rgba(220, 38, 38, 0.25);
    background: rgba(220, 38, 38, 0.08);
    padding: 0.55rem 0.75rem;
  }

  .pf-label {
    font-size: 0.6rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ar-secondary);
  }

  .pf-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .pf-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .pf-field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .pf-field.full {
    grid-column: 1 / -1;
  }

  .pf-input {
    height: 42px;
    padding: 0 0.95rem;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid var(--ar-outline-variant);
    color: var(--ar-on-surface);
    font-size: 0.88rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .pf-input:focus {
    border-color: var(--ar-accent);
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
  }

  .pf-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--ar-surface-low);
  }

  .pf-hint {
    font-size: 0.72rem;
    color: var(--ar-on-surface-variant);
    line-height: 1.5;
  }

  .pf-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid var(--ar-outline-variant);
    margin-top: 0.2rem;
  }

  .pf-save {
    height: 42px;
    padding: 0 1.35rem;
    background: linear-gradient(135deg, #111827, #7c3aed);
    color: #fff;
    border: none;
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.18s;
  }

  .pf-save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(124, 58, 237, 0.18);
  }

  .pf-save:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .pf-cancel {
    height: 42px;
    padding: 0 1.15rem;
    background: transparent;
    border: 1px solid var(--ar-outline-variant);
    color: var(--ar-on-surface-variant);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .pf-cancel:hover {
    background: var(--ar-surface-low);
    border-color: var(--ar-on-surface);
    color: var(--ar-on-surface);
  }

  .pf-toast {
    position: fixed;
    bottom: 1.75rem;
    left: 50%;
    transform: translateX(-50%);
    background: #16a34a;
    color: #fff;
    padding: 0.85rem 1.4rem;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
    z-index: 9999;
    white-space: nowrap;
    animation: pf-fadein 0.25s ease;
  }

  @keyframes pf-fadein {
    from { opacity: 0; transform: translateX(-50%) translateY(12px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .pf-divider {
    border: none;
    border-top: 1px solid var(--ar-outline-variant);
    margin: 0.25rem 0;
  }

  @media (max-width: 900px) {
    .pf-row {
      grid-template-columns: 1fr;
    }

    .pf-avatar-section {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 640px) {
    .pf-layout {
      padding: 2rem 1.25rem 4rem;
    }

    .pf-title {
      font-size: 2.1rem;
    }

    .pf-actions {
      flex-direction: column;
      align-items: stretch;
    }

    .pf-save,
    .pf-cancel {
      width: 100%;
      justify-content: center;
    }
  }
`;

export const ensureProfileStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pf-styles')) return;

  const el = document.createElement('style');
  el.id = 'pf-styles';
  el.textContent = PROFILE_STYLES;
  document.head.appendChild(el);
};