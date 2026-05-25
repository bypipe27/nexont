const SELLER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@200..700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600&display=swap');

  :root {
    --ar-bg: #f7f9fd;
    --ar-bg-alt: #eceef2;
    --ar-surface: rgba(255, 255, 255, 0.82);
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
    --ar-accent: #7c3aed;
    --ar-accent-soft: #c4b5fd;
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
    --ar-accent: #c4b5fd;
    --ar-accent-soft: #7c3aed;
  }

  .sd-root, .nxmp-root {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(124, 58, 237, 0.14), transparent 30%),
      radial-gradient(circle at bottom right, rgba(37, 99, 235, 0.1), transparent 28%),
      var(--ar-bg);
    color: var(--ar-on-surface);
    font-family: 'Inter', sans-serif;
  }

  .sd-page, .nxmp-page {
    max-width: 1240px;
    margin: 0 auto;
    padding: 3.5rem 3rem 5rem;
  }

  .sd-hero {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    align-items: flex-start;
    margin-bottom: 2.5rem;
  }

  .sd-eyebrow, .nxmp-eyebrow {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ar-secondary);
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.7rem;
  }

  .sd-eyebrow::before, .nxmp-eyebrow::before {
    content: '';
    display: block;
    width: 22px;
    height: 1px;
    background: currentColor;
  }

  .sd-title, .nxmp-page-title {
    font-family: 'Inter', sans-serif;
    font-size: clamp(2.8rem, 5vw, 4.5rem);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.03em;
    margin-bottom: 0.75rem;
    color: var(--ar-on-surface);
  }

  .sd-sub, .nxmp-page-sub {
    font-size: 0.9rem;
    line-height: 1.7;
    color: var(--ar-on-surface-variant);
    max-width: 720px;
    margin-bottom: 0;
  }

  .sd-status {
    padding: 0.95rem 1rem;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    min-width: 230px;
    backdrop-filter: blur(16px);
  }

  .sd-status-label {
    font-size: 0.58rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ar-on-surface-variant);
    margin-bottom: 0.35rem;
  }

  .sd-status-value {
    font-size: 0.9rem;
    color: var(--ar-on-surface);
    font-weight: 700;
  }

  .sd-status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.55rem;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #22c55e;
  }

  .sd-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #22c55e;
  }

  .sd-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-top: 1.25rem;
  }

  .sd-btn, .sd-btn-outline {
    height: 40px;
    padding: 0 1.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    text-decoration: none;
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: all 0.18s;
  }

  .sd-btn {
    background: linear-gradient(135deg, #111827, #7c3aed);
    color: #fff;
  }

  .sd-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(124, 58, 237, 0.2);
  }

  .sd-btn-outline {
    background: transparent;
    border: 1px solid var(--ar-outline-variant);
    color: var(--ar-on-surface);
  }

  .sd-btn-outline:hover {
    background: var(--ar-surface-low);
    border-color: var(--ar-on-surface);
  }

  .sd-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .sd-card, .sd-chart, .sd-product, .sd-sale, .nxmp-card, .nxmp-sidebar, .nxpm-modal, .nxmp-stat, .nxmp-ai, .sd-status, .nxmp-empty {
    background: var(--ar-surface);
    border: 1px solid var(--ar-outline-variant);
    backdrop-filter: blur(16px);
    box-shadow: 0 12px 32px var(--ar-shadow);
  }

  .sd-card, .nxmp-stat {
    padding: 1.25rem 1.35rem;
  }

  .sd-card-lbl, .nxmp-stat-lbl {
    font-size: 0.58rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--ar-on-surface-variant);
    margin-bottom: 0.6rem;
  }

  .sd-card-val, .nxmp-stat-val {
    font-family: 'Inter', sans-serif;
    font-size: 2.1rem;
    font-weight: 800;
    line-height: 1;
    color: var(--ar-on-surface);
    margin-bottom: 0.3rem;
  }

  .sd-card-note {
    font-size: 0.76rem;
    color: var(--ar-on-surface-variant);
    line-height: 1.5;
  }

  .sd-chart-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .sd-chart {
    padding: 1.2rem 1.25rem 1.35rem;
  }

  .sd-chart-head, .sd-section-head, .nxmp-toolbar, .nxmp-card-foot, .sd-sale, .sd-detail, .sd-modal-head, .nxpm-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .sd-chart-title, .sd-section-title, .nxmp-ai-title, .sd-product-name, .sd-sale-title, .nxmp-card-name, .nxpm-head-title, .sd-modal-title, .sd-empty-title {
    font-family: 'Inter', sans-serif;
    color: var(--ar-on-surface);
  }

  .sd-chart-title, .nxmp-ai-title {
    font-size: 1.45rem;
    font-weight: 800;
    line-height: 1.1;
  }

  .sd-chart-sub, .nxmp-ai-text, .sd-chart-empty, .nxmp-page-sub, .sd-empty-text, .sd-detail-desc, .sd-detail-seller-meta, .sd-product-meta, .sd-sale-sub {
    color: var(--ar-on-surface-variant);
    line-height: 1.6;
  }

  .sd-chart-bars, .sd-sales-list {
    display: grid;
    gap: 0.75rem;
  }

  .sd-chart-row {
    display: grid;
    grid-template-columns: 98px 1fr 42px;
    gap: 0.75rem;
    align-items: center;
  }

  .sd-chart-label {
    font-size: 0.72rem;
    color: var(--ar-on-surface-variant);
    line-height: 1.25;
  }

  .sd-chart-track {
    height: 10px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--ar-outline-variant);
    overflow: hidden;
  }

  .sd-chart-fill {
    height: 100%;
    background: linear-gradient(90deg, #111827, #7c3aed);
    min-width: 0;
  }

  .sd-chart-value, .sd-sale-amt, .sd-detail-stat-val, .sd-product-price {
    text-align: right;
    font-family: 'Inter', sans-serif;
    font-size: 1.1rem;
    color: var(--ar-on-surface);
  }

  .sd-chart-empty, .sd-loading, .nxmp-err, .nxpm-modal-err, .nxpm-modal-ok, .sd-error {
    font-size: 0.84rem;
  }

  .sd-section { margin-top: 2rem; }
  .sd-section-head, .sd-section-link { align-items: flex-end; }
  .sd-section-head { padding-bottom: 1rem; border-bottom: 1px solid var(--ar-outline-variant); margin-bottom: 1.25rem; }
  .sd-section-title { font-size: 2rem; font-weight: 700; }
  .sd-section-link { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ar-on-surface-variant); text-decoration: none; }
  .sd-section-link:hover { color: var(--ar-on-surface); }
  .sd-product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0; border-top: 1px solid var(--ar-outline-variant); border-left: 1px solid var(--ar-outline-variant); }
  .sd-product, .nxmp-card { border-right: 1px solid var(--ar-outline-variant); border-bottom: 1px solid var(--ar-outline-variant); }
  .sd-product, .nxmp-card { display: flex; flex-direction: column; }
  .sd-product, .sd-sale, .nxmp-card, .nxmp-ai, .nxmp-sidebar, .nxpm-modal, .sd-status, .nxmp-empty { border-radius: 0; }
  .sd-product { padding: 1rem; }
  .sd-product-thumb, .sd-sale-thumb, .sd-detail-media, .nxmp-card-img, .nxpm-img-zone, .sd-img-zone { background: rgba(255,255,255,0.03); }
  .sd-product-thumb, .sd-sale-thumb, .nxmp-card-img, .sd-detail-media { overflow: hidden; }
  .sd-product-thumb { aspect-ratio: 1; border: 1px solid var(--ar-outline-variant); margin-bottom: 0.85rem; display: flex; align-items: center; justify-content: center; color: var(--ar-secondary); font-size: 0.75rem; }
  .sd-product-thumb img, .sd-sale-thumb img, .nxmp-card-img img, .sd-detail-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sd-product-name { font-size: 1.15rem; font-weight: 700; line-height: 1.15; margin-bottom: 0.3rem; }
  .sd-product-meta { font-size: 0.72rem; }
  .sd-product-price { margin-top: 0.55rem; font-size: 1.35rem; color: var(--ar-accent-soft); }
  .sd-product-actions, .sd-detail-actions, .nxmp-card-actions { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.8rem; }
  .sd-mini-btn, .nxmp-btn-edit, .nxmp-btn-del, .sd-modal-cancel, .sd-modal-submit, .nxpm-cancel, .nxpm-submit, .nxmp-sb-apply, .nxmp-sb-clear, .nxmp-sb-new, .nxmp-ai-btn { font-family: 'Inter', sans-serif; }
  .sd-mini-btn, .nxmp-btn-edit, .nxpm-cancel, .nxmp-sb-clear {
    height: 30px;
    padding: 0 0.7rem;
    border: 1px solid var(--ar-outline-variant);
    background: transparent;
    color: var(--ar-on-surface-variant);
    cursor: pointer;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.15s;
  }
  .sd-mini-btn:hover, .nxmp-btn-edit:hover, .nxpm-cancel:hover, .nxmp-sb-clear:hover {
    background: var(--ar-surface-low);
    color: var(--ar-on-surface);
    border-color: var(--ar-on-surface);
  }
  .sd-mini-btn.danger:hover, .nxmp-btn-del:hover {
    background: #DC2626;
    color: #fff;
    border-color: #DC2626;
  }
  .sd-sale { align-items: center; padding: 0.95rem 1rem; }
  .sd-sale-thumb { width: 54px; height: 54px; border: 1px solid var(--ar-outline-variant); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--ar-secondary); }
  .sd-sale-main { flex: 1; min-width: 0; }
  .sd-sale-title { font-size: 0.9rem; font-weight: 800; margin-bottom: 0.15rem; }
  .sd-sale-sub { font-size: 0.72rem; }
  .sd-sale-amt { font-size: 1.3rem; }
  .sd-empty, .nxmp-empty {
    padding: 3rem 1.5rem;
    text-align: center;
    border: 1px dashed var(--ar-outline-variant);
    background: var(--ar-surface);
  }
  .sd-empty-title, .nxmp-empty-title { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; }
  .sd-empty-text, .nxmp-empty-sub { font-size: 0.84rem; max-width: 560px; margin: 0 auto; }
  .sd-error, .nxmp-err { padding: 0.85rem 1rem; border: 1px solid rgba(186, 26, 26, 0.25); background: rgba(186, 26, 26, 0.08); color: #dc2626; margin-bottom: 1rem; }
  .sd-loading { padding: 4rem 2rem; text-align: center; color: var(--ar-on-surface-variant); }

  .sd-overlay, .nxpm-overlay { position: fixed; inset: 0; background: rgba(26,23,20,0.68); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 3000; padding: 1rem; }
  .sd-modal, .nxpm-modal { width: 100%; max-width: 780px; max-height: 92vh; overflow-y: auto; position: relative; background: var(--ar-surface-solid); border: 1px solid var(--ar-outline-variant); box-shadow: 0 24px 60px rgba(0,0,0,0.24); }
  .sd-modal.compact { max-width: 500px; }
  .sd-modal-head, .nxpm-head { padding: 1.75rem 2rem 1.5rem; border-bottom: 1px solid var(--ar-outline-variant); background: rgba(255,255,255,0.03); }
  .sd-modal-tag, .nxpm-head-tag { font-size: 0.6rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--ar-secondary); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem; }
  .sd-modal-tag::before, .nxpm-head-tag::before { content: ''; display: block; width: 16px; height: 1px; background: currentColor; }
  .sd-modal-title, .nxpm-head-title { font-size: 1.75rem; font-weight: 700; letter-spacing: -0.015em; }
  .sd-close, .nxpm-close { width: 30px; height: 30px; background: transparent; border: 1px solid var(--ar-outline-variant); color: var(--ar-on-surface-variant); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; margin-top: 2px; }
  .sd-close:hover, .nxpm-close:hover { background: var(--ar-surface-low); color: var(--ar-on-surface); border-color: var(--ar-on-surface); }
  .sd-modal-body, .nxpm-body { padding: 1.75rem 2rem 2rem; }
  .sd-detail { display: grid; grid-template-columns: 1fr 1.15fr; gap: 1.5rem; align-items: start; }
  .sd-detail-media { border: 1px solid var(--ar-outline-variant); }
  .sd-detail-media-empty { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; color: var(--ar-secondary); font-size: 0.8rem; }
  .sd-detail-name { font-size: 2rem; line-height: 1; font-weight: 700; margin-bottom: 0.55rem; }
  .sd-detail-desc { font-size: 0.88rem; line-height: 1.75; margin-bottom: 1.1rem; }
  .sd-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
  .sd-detail-stat { border: 1px solid var(--ar-outline-variant); background: rgba(255,255,255,0.03); padding: 0.8rem 0.9rem; }
  .sd-detail-stat-lbl { display: block; font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ar-secondary); margin-bottom: 0.25rem; }
  .sd-detail-stat-val { font-size: 0.86rem; }
  .sd-detail-seller { border: 1px solid var(--ar-outline-variant); background: rgba(255,255,255,0.03); padding: 0.9rem 1rem; margin-top: 1rem; }
  .sd-detail-seller-lbl { font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--ar-secondary); margin-bottom: 0.45rem; }
  .sd-detail-seller-name { font-size: 0.92rem; font-weight: 700; margin-bottom: 0.2rem; }
  .sd-detail-seller-meta { font-size: 0.76rem; }
  .sd-form { margin-top: 0.25rem; }
  .sd-form-row, .nxpm-f-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }
  .sd-field, .nxpm-f { margin-bottom: 1rem; }
  .sd-field label, .nxpm-f label, .nxmp-sb-sec-title {
    display: block;
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--ar-secondary);
    margin-bottom: 0.45rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .sd-field input:not([type=file]), .sd-field textarea, .sd-field select, .nxpm-f input:not([type=file]), .nxpm-f textarea, .nxpm-f select, .nxmp-sb-search, .nxmp-sortsel {
    width: 100%;
    padding: 0 0.95rem;
    background: rgba(255,255,255,0.92);
    border: 1px solid var(--ar-outline-variant);
    color: var(--ar-on-surface);
    font-size: 0.88rem;
    outline: none;
    box-sizing: border-box;
  }
  .sd-field input:not([type=file]), .sd-field select, .nxpm-f input:not([type=file]), .nxpm-f select, .nxmp-sb-search, .nxmp-sortsel { height: 40px; }
  .sd-field textarea, .nxpm-f textarea { padding: 0.75rem 0.95rem; height: 90px; resize: vertical; line-height: 1.6; }
  .sd-field input:not([type=file]):focus, .sd-field textarea:focus, .sd-field select:focus, .nxpm-f input:not([type=file]):focus, .nxpm-f textarea:focus, .nxpm-f select:focus, .nxmp-sb-search:focus, .nxmp-sortsel:focus { border-color: var(--ar-accent); box-shadow: 0 0 0 4px rgba(124,58,237,0.12); }
  .sd-field input::placeholder, .sd-field textarea::placeholder, .nxpm-f input::placeholder, .nxpm-f textarea::placeholder, .nxmp-sb-search::placeholder { color: rgba(25,28,31,0.38); }
  .sd-file-hidden, .nxpm-file-hidden { display: none; }
  .sd-img-zone, .nxpm-img-zone { border: 1px dashed rgba(26,23,20,0.18); background: rgba(255,255,255,0.72); padding: 1.3rem; text-align: center; cursor: pointer; transition: all 0.2s; }
  .sd-img-zone:hover, .nxpm-img-zone:hover { border-color: var(--ar-accent); background: rgba(255,255,255,0.9); }
  .sd-img-icon, .nxpm-img-icon { font-size: 1.4rem; opacity: 0.45; display: block; margin-bottom: 0.45rem; }
  .sd-img-txt, .nxpm-img-txt { font-size: 0.75rem; color: var(--ar-on-surface-variant); }
  .sd-img-txt b, .nxpm-img-txt b { color: var(--ar-on-surface); }
  .sd-img-preview, .nxpm-img-preview { margin-top: 0.85rem; position: relative; }
  .sd-img-preview img, .nxpm-img-preview img { width: 100%; max-height: 180px; object-fit: cover; display: block; border: 1px solid var(--ar-outline-variant); }
  .sd-img-remove, .nxpm-img-remove { position: absolute; top: 0.4rem; right: 0.4rem; background: var(--ar-surface-solid); border: 1px solid var(--ar-outline-variant); color: var(--ar-on-surface-variant); cursor: pointer; font-size: 0.7rem; padding: 0.2rem 0.5rem; transition: all 0.15s; }
  .sd-img-remove:hover, .nxpm-img-remove:hover { background: var(--ar-surface-low); color: var(--ar-on-surface); }
  .sd-modal-error, .nxpm-modal-err, .nxmp-err { background: rgba(186, 26, 26, 0.08); border: 1px solid rgba(186, 26, 26, 0.25); padding: 0.65rem 0.9rem; margin-bottom: 1rem; color: #dc2626; }
  .sd-modal-success, .nxpm-modal-ok { background: rgba(21, 127, 59, 0.08); border: 1px solid rgba(21, 127, 59, 0.25); padding: 0.65rem 0.9rem; margin-bottom: 1rem; color: #157f3b; }
  .sd-modal-foot, .nxpm-foot { display: flex; gap: 0.75rem; justify-content: flex-end; padding-top: 1.25rem; border-top: 1px solid var(--ar-outline-variant); margin-top: 1.5rem; }
  .sd-modal-cancel, .sd-modal-submit, .nxpm-cancel, .nxpm-submit, .nxmp-sb-apply, .nxmp-sb-clear, .nxmp-sb-new, .nxmp-ai-btn {
    height: 40px;
    padding: 0 1.4rem;
    border: 1px solid var(--ar-outline-variant);
    background: transparent;
    color: var(--ar-on-surface-variant);
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    transition: all 0.18s;
  }
  .sd-modal-cancel:hover, .nxpm-cancel:hover, .nxmp-sb-clear:hover { border-color: var(--ar-on-surface); color: var(--ar-on-surface); }
  .sd-modal-submit, .nxpm-submit, .nxmp-sb-apply, .nxmp-sb-new, .nxmp-ai-btn { background: linear-gradient(135deg, #111827, #7c3aed); color: #fff; border-color: transparent; }
  .sd-modal-submit:hover:not(:disabled), .nxpm-submit:hover:not(:disabled), .nxmp-sb-apply:hover, .nxmp-sb-new:hover, .nxmp-ai-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(124,58,237,0.18); }
  .sd-modal-submit:disabled, .nxpm-submit:disabled { opacity: 0.35; cursor: not-allowed; }
  .sd-modal-submit.danger, .nxpm-submit.danger, .nxmp-btn-del { background: linear-gradient(135deg, #dc2626, #991b1b); color: #fff; border-color: transparent; }
  .sd-modal-submit.danger:hover:not(:disabled), .nxpm-submit.danger:hover:not(:disabled), .nxmp-btn-del:hover { box-shadow: 0 10px 20px rgba(220,38,38,0.18); }
  .nxmp-layout { display:flex; gap:2rem; align-items:flex-start; }
  .nxmp-sidebar { width:220px; flex-shrink:0; padding:0; position:sticky; top:84px; }
  .nxmp-sb-head { padding:0.9rem 1.25rem; border-bottom:1px solid var(--ar-outline-variant); }
  .nxmp-sb-sec { padding:1.1rem 1.25rem; border-bottom:1px solid var(--ar-outline-variant); }
  .nxmp-sb-search { background: rgba(255,255,255,0.92); }
  .nxmp-radio { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; cursor:pointer; }
  .nxmp-radio input { accent-color: var(--ar-accent); cursor:pointer; }
  .nxmp-radio span { font-size:0.8rem; color: var(--ar-on-surface); }
  .nxmp-range { width:100%; accent-color: var(--ar-accent); cursor:pointer; margin-bottom:0.45rem; }
  .nxmp-range-row { display:flex; justify-content:space-between; font-size:0.68rem; color:var(--ar-on-surface-variant); }
  .nxmp-range-val { font-weight:600; color:var(--ar-on-surface); }
  .nxmp-sb-btns { padding:1rem 1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
  .nxmp-sb-new { width:100%; }
  .nxmp-main { flex:1; }
  .nxmp-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; padding-bottom:1.1rem; border-bottom:1px solid var(--ar-outline-variant); flex-wrap:wrap; gap:0.75rem; }
  .nxmp-count { font-size:0.78rem; color:var(--ar-on-surface-variant); }
  .nxmp-count b { color:var(--ar-on-surface); }
  .nxmp-sortsel { width:auto; min-width: 180px; }
  .nxmp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0; border-top:1px solid var(--ar-outline-variant); border-left:1px solid var(--ar-outline-variant); }
  .nxmp-card { transition:transform 0.15s, background 0.15s; display:flex; flex-direction:column; }
  .nxmp-card:hover { transform: translateY(-2px); }
  .nxmp-card-img { aspect-ratio:1; overflow:hidden; position:relative; }
  .nxmp-card-noimg { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--ar-secondary); font-size:0.8rem; }
  .nxmp-card-stock-badge { position:absolute; top:0.55rem; left:0.55rem; background: var(--ar-surface-solid); border:1px solid var(--ar-outline-variant); color:var(--ar-on-surface); font-size:0.56rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; padding:0.22rem 0.55rem; }
  .nxmp-card-body { padding:1.1rem; flex:1; display:flex; flex-direction:column; }
  .nxmp-card-cond { font-size:0.6rem; font-weight:700; color:var(--ar-secondary); text-transform:uppercase; letter-spacing:0.12em; margin-bottom:0.3rem; }
  .nxmp-card-cat { font-size:0.68rem; color:var(--ar-on-surface-variant); letter-spacing:0.06em; margin-bottom:0.35rem; }
  .nxmp-card-name { font-size:1.1rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.3rem; letter-spacing:-0.01em; }
  .nxmp-card-price { font-size:1.2rem; font-weight:700; margin-bottom:0.3rem; letter-spacing:-0.01em; color: var(--ar-accent-soft); }
  .nxmp-card-stars { color: var(--ar-accent-soft); font-size:0.65rem; margin-bottom:0.65rem; }
  .nxmp-card-foot { border-top:1px solid var(--ar-outline-variant); padding-top:0.65rem; margin-top:auto; align-items:center; }
  .nxmp-avail { font-size:0.65rem; font-weight:700; }
  .nxmp-avail.ok { color:#22c55e; }
  .nxmp-avail.out { color:#dc2626; }
  .nxmp-card-actions { margin-top: 0; }
  .nxmp-btn-edit, .nxmp-btn-del { height: 30px; padding: 0 0.6rem; }
  .nxmp-btn-del { border-color: transparent; }
  .nxmp-empty { padding:5rem 2rem; }
  .nxmp-ai { align-items:center; justify-content:space-between; gap:1.5rem; padding:1.8rem 2rem; margin-bottom:2.5rem; display:flex; }
  .nxmp-ai-text { max-width:520px; font-size:0.88rem; }
  .nxmp-ai-btn { white-space:nowrap; }

  .nxmp-summary {
    margin-bottom: 2.5rem;
  }
  .nxmp-summary-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
    background: var(--ar-surface);
    border: 1px solid var(--ar-outline-variant);
    padding: 2rem;
  }
  .nxmp-summary-card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .nxmp-summary-label {
    font-size: 0.62rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--ar-secondary);
    font-weight: 600;
  }
  .nxmp-summary-value {
    font-size: 2.6rem;
    font-weight: 300;
    color: var(--ar-primary);
    letter-spacing: -0.04em;
  }

  .nxmp-controls {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .nxmp-section-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--ar-on-surface);
    letter-spacing: -0.01em;
    margin-bottom: 0.25rem;
  }
  .nxmp-section-sub {
    font-size: 0.85rem;
    color: var(--ar-on-surface-variant);
  }
  .nxmp-controls-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .nxmp-search {
    position: relative;
  }
  .nxmp-search input {
    height: 40px;
    width: 260px;
    padding: 0 2.4rem 0 0.95rem;
    border-radius: 0.5rem;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface-low);
    color: var(--ar-on-surface);
    font-size: 0.84rem;
  }
  .nxmp-search-icon {
    position: absolute;
    right: 0.7rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ar-on-surface-variant);
    font-size: 0.9rem;
  }
  .nxmp-new-btn {
    height: 40px;
    padding: 0 1.4rem;
    border-radius: 0.5rem;
    background: var(--ar-primary);
    color: var(--ar-primary-contrast);
    border: none;
    font-weight: 600;
    font-size: 0.82rem;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }
  .nxmp-new-btn:hover { opacity: 0.9; }

  .nxmp-filterbar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.25rem;
    flex-wrap: wrap;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--ar-outline-variant);
    margin-bottom: 1.5rem;
  }
  .nxmp-filter {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 200px;
  }
  .nxmp-filter label {
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--ar-secondary);
  }
  .nxmp-filter select,
  .nxmp-filter input[type='range'] {
    width: 100%;
  }
  .nxmp-filter input[type='range'] {
    accent-color: var(--ar-accent);
  }
  .nxmp-filter select {
    height: 40px;
    padding: 0 0.75rem;
    border-radius: 0.5rem;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface-low);
    color: var(--ar-on-surface);
    font-size: 0.84rem;
  }
  html[data-theme='dark'] .nxmp-filter select,
  html[data-theme='dark'] .nxmp-sortsel {
    background: var(--ar-surface-solid);
    color: var(--ar-on-surface);
    color-scheme: dark;
  }
  html[data-theme='dark'] .nxmp-filter select option,
  html[data-theme='dark'] .nxmp-sortsel option {
    background: var(--ar-surface-solid);
    color: var(--ar-on-surface);
  }
  .nxmp-filter-val {
    font-size: 0.75rem;
    color: var(--ar-on-surface-variant);
  }
  .nxmp-filter-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .nxmp-filter-btn {
    height: 40px;
    padding: 0 1.1rem;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-primary);
    color: var(--ar-primary-contrast);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
  }
  .nxmp-filter-btn.ghost {
    background: transparent;
    color: var(--ar-on-surface-variant);
  }

  .nxmp-sortsel {
    background: var(--ar-surface-low);
    color: var(--ar-on-surface);
    border: 1px solid var(--ar-outline-variant);
  }

  .nxmp-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .nxmp-loading {
    text-align: center;
    padding: 3rem;
    color: var(--ar-on-surface-variant);
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .nxmp-rows {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .nxmp-row {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    padding: 1rem;
    border: 1px solid var(--ar-outline-variant);
    background: var(--ar-surface);
    transition: background 0.2s ease;
  }
  .nxmp-row:hover { background: var(--ar-surface-low); }
  .nxmp-row-media {
    width: 84px;
    height: 84px;
    border-radius: 0.5rem;
    overflow: hidden;
    background: var(--ar-bg-alt);
    flex-shrink: 0;
  }
  .nxmp-row-media img { width: 100%; height: 100%; object-fit: cover; }
  .nxmp-row-noimg {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    color: var(--ar-secondary); font-size: 0.75rem;
  }
  .nxmp-row-grid {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(180px, 1.2fr) minmax(160px, 1fr) minmax(140px, 1fr) auto;
    gap: 1rem;
    align-items: center;
  }
  .nxmp-row-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--ar-on-surface);
    margin-bottom: 0.25rem;
  }
  .nxmp-row-meta {
    font-size: 0.72rem;
    color: var(--ar-on-surface-variant);
    letter-spacing: 0.04em;
  }
  .nxmp-row-label {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--ar-secondary);
    margin-bottom: 0.35rem;
    display: block;
  }
  .nxmp-row-value {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }
  .nxmp-row-price {
    font-size: 1rem;
    font-weight: 600;
    color: var(--ar-primary);
  }
  .nxmp-row-stock {
    font-size: 0.78rem;
    color: var(--ar-on-surface-variant);
  }
  .nxmp-row-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--ar-on-surface);
  }
  .nxmp-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #22c55e;
  }
  .nxmp-row-status.low .nxmp-status-dot { background: #f59e0b; }
  .nxmp-row-status.out .nxmp-status-dot { background: #dc2626; }
  .nxmp-row-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
  }

  .nxmp-row-actions .nxmp-btn-edit,
  .nxmp-row-actions .nxmp-btn-del {
    text-decoration: underline;
    background: transparent;
    border: none;
    padding: 0;
    height: auto;
  }

  .nxmp-row-actions .nxmp-btn-del { color: var(--ar-error); }

  @media (max-width:900px) {
    .sd-grid { grid-template-columns:repeat(2, minmax(0, 1fr)); }
    .sd-hero { flex-direction:column; }
    .sd-status { width:100%; }
    .sd-detail { grid-template-columns:1fr; }
    .nxmp-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .nxmp-row-grid { grid-template-columns: 1fr; align-items: flex-start; }
    .nxmp-row-actions { justify-content: flex-start; }
    .sd-page, .nxmp-page { padding:2.5rem 1.5rem 4rem; }
    .nxmp-ai { flex-direction:column; align-items:flex-start; }
  }

  @media (max-width:640px) {
    .sd-nav, .sd-page, .nxmp-page { padding-left:1.25rem; padding-right:1.25rem; }
    .sd-grid { grid-template-columns:1fr; }
    .sd-form-row, .sd-detail-grid, .nxpm-f-row { grid-template-columns:1fr; }
    .nxmp-summary-grid { grid-template-columns: 1fr; }
    .nxmp-controls { flex-direction: column; align-items: flex-start; }
    .nxmp-controls-actions { width: 100%; }
    .nxmp-search input { width: 100%; }
    .nxmp-row { flex-direction: column; align-items: flex-start; }
    .nxmp-row-media { width: 100%; height: 180px; }
  }
`;

export const ensureSellerStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('seller-styles')) return;

  const el = document.createElement('style');
  el.id = 'seller-styles';
  el.textContent = SELLER_STYLES;
  document.head.appendChild(el);
};
