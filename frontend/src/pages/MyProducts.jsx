import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { useTheme } from '../context/ThemeContext';

// ─── Estilos nxmp ─────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300&family=DM+Sans:wght@300;400;500;600&display=swap');
  :root { --cream:#F5F0E8; --cream-dark:#EDE8DF; --ink:#1A1714; --ink-mid:#3D3830; --ink-soft:#7A7268; --ink-ghost:#B8B0A6; --amber:#C4973A; --white:#FDFBF8; --border:rgba(26,23,20,0.1); }
  [data-theme="dark"] {
    --cream: #0e0c0a;
    --cream-dark: #161410;
    --ink: #f0ece4;
    --ink-mid: #c8c0b4;
    --ink-soft: #8a8278;
    --ink-ghost: #4a4540;
    --amber: #d4a84a;
    --white: #111111;
    --border: rgba(240,236,228,0.08);
  }

  [data-theme="dark"] .nxmp-bar { background:rgba(14,12,10,0.97); }
  [data-theme="dark"] .nxpm-modal { background:#161410; }
  [data-theme="dark"] .nxpm-head { background:#0e0c0a; }
  [data-theme="dark"] .nxmp-sidebar, [data-theme="dark"] .nxmp-dd { background:#111111; }
  [data-theme="dark"] .nxmp-card { background:#111111; }
  [data-theme="dark"] .nxmp-card:hover { background:#161410; }
  [data-theme="dark"] .nxmp-stat { background:#111111; }


  .nxmp-root { min-height:100vh; background:var(--cream); font-family:'DM Sans',sans-serif; color:var(--ink); }

  .nxmp-bar { position:sticky; top:0; z-index:200; height:68px; background:rgba(245,240,232,0.96); backdrop-filter:blur(16px); border-bottom:1px solid var(--border); display:flex; align-items:center; padding:0 3rem; gap:1rem; }
  .nxmp-brand { display:flex; align-items:center; gap:0.75rem; text-decoration:none; cursor:pointer; }
  .nxmp-brand img { height:28px; }
  .nxmp-brand-name { font-family:'Cormorant Garamond',serif; font-size:1.65rem; font-weight:600; color:var(--ink); letter-spacing:0.06em; }
  .nxmp-sep { width:1px; height:20px; background:var(--border); }
  .nxmp-bar-title { font-size:0.62rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:var(--ink-soft); }
  .nxmp-gap { flex:1; }
  .nxmp-bar-right { display:flex; align-items:center; gap:0.6rem; }
  .nxmp-pub-btn { height:38px; padding:0 1.35rem; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; }
  .nxmp-pub-btn:hover { background:var(--ink-mid); }

  .nxmp-theme-btn { height:38px; width:38px; background:transparent; border:1px solid var(--border); color:var(--ink-soft); cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
  .nxmp-theme-btn:hover { background:var(--ink); color:var(--cream); border-color:var(--ink); }

  .nxmp-user-pill { display:flex; align-items:center; gap:0.5rem; height:38px; padding:0 0.85rem 0 0.45rem; background:transparent; border:1px solid var(--border); cursor:pointer; transition:all 0.18s; position:relative; }
  .nxmp-user-pill:hover { background:var(--ink); border-color:var(--ink); }
  .nxmp-user-pill:hover .nxmp-uname, .nxmp-user-pill:hover .nxmp-chev { color:var(--cream) !important; }
  .nxmp-user-pill:hover .nxmp-av { background:rgba(255,255,255,0.2); color:var(--cream); }
  .nxmp-av { width:26px; height:26px; border-radius:50%; background:var(--ink); color:var(--cream); display:flex; align-items:center; justify-content:center; font-size:0.62rem; font-weight:600; transition:all 0.18s; }
  .nxmp-uname { font-size:0.82rem; color:var(--ink); font-weight:500; transition:color 0.18s; }
  .nxmp-chev { font-size:0.6rem; color:var(--ink-ghost); transition:color 0.18s; }
  .nxmp-dd { position:absolute; top:calc(100% + 6px); right:0; background:var(--white); border:1px solid var(--border); min-width:210px; z-index:1000; box-shadow:0 12px 40px rgba(26,23,20,0.12); }
  .nxmp-dd-sec { border-bottom:1px solid rgba(26,23,20,0.06); }
  .nxmp-dd-lbl { padding:0.6rem 1rem 0.2rem; font-size:0.58rem; font-weight:600; letter-spacing:0.18em; text-transform:uppercase; color:var(--ink-ghost); }
  .nxmp-dd-item { display:flex; align-items:center; gap:0.55rem; padding:0.65rem 1rem; cursor:pointer; font-size:0.82rem; color:var(--ink-mid); transition:all 0.12s; }
  .nxmp-dd-item:hover { background:var(--cream-dark); color:var(--ink); }
  .nxmp-dd-item.danger:hover { background:#FEF2F2; color:#DC2626; }

  .nxmp-page { max-width:1200px; margin:0 auto; padding:4rem 3rem 6rem; }
  .nxmp-eyebrow { font-size:0.6rem; font-weight:600; letter-spacing:0.24em; text-transform:uppercase; color:var(--ink-soft); display:flex; align-items:center; gap:0.65rem; margin-bottom:0.65rem; }
  .nxmp-eyebrow::before { content:''; display:block; width:22px; height:1px; background:var(--ink-soft); }
  .nxmp-page-title { font-family:'Cormorant Garamond',serif; font-size:clamp(2.8rem,5vw,4.5rem); font-weight:200; color:var(--ink); letter-spacing:-0.025em; line-height:1; margin-bottom:0.4rem; }
  .nxmp-page-sub { font-size:0.85rem; color:var(--ink-soft); font-weight:300; margin-bottom:3rem; }

  .nxmp-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border:1px solid var(--border); background:var(--white); margin-bottom:3rem; }
  .nxmp-stat { padding:1.5rem 1.75rem; border-right:1px solid var(--border); }
  .nxmp-stat:last-child { border-right:none; }
  .nxmp-stat-val { font-family:'Cormorant Garamond',serif; font-size:2.8rem; font-weight:200; color:var(--ink); display:block; line-height:1; margin-bottom:0.35rem; letter-spacing:-0.02em; }
  .nxmp-stat-lbl { font-size:0.6rem; color:var(--ink-ghost); text-transform:uppercase; letter-spacing:0.14em; }
  .nxmp-stat-val.green { color:#16A34A; }
  .nxmp-stat-val.red { color:#DC2626; }
  .nxmp-stat-val.amber { color:var(--amber); }

  .nxmp-layout { display:flex; gap:2rem; align-items:flex-start; }
  .nxmp-sidebar { width:220px; flex-shrink:0; background:var(--white); border:1px solid var(--border); position:sticky; top:84px; }
  .nxmp-sb-head { padding:0.9rem 1.25rem; border-bottom:1px solid var(--border); }
  .nxmp-sb-title { font-size:0.6rem; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:var(--ink-soft); }
  .nxmp-sb-sec { padding:1.1rem 1.25rem; border-bottom:1px solid rgba(26,23,20,0.06); }
  .nxmp-sb-sec-title { font-size:0.58rem; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:var(--ink-ghost); margin-bottom:0.75rem; display:block; }
  .nxmp-sb-search { width:100%; height:34px; padding:0 0.75rem; background:var(--cream); border:1px solid var(--border); color:var(--ink); font-size:0.8rem; outline:none; font-family:'DM Sans',sans-serif; transition:border-color 0.2s; box-sizing:border-box; }
  .nxmp-sb-search:focus { border-color:var(--ink); }
  .nxmp-sb-search::placeholder { color:var(--ink-ghost); }
  .nxmp-radio { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem; cursor:pointer; }
  .nxmp-radio input { accent-color:var(--ink); cursor:pointer; }
  .nxmp-radio span { font-size:0.8rem; color:var(--ink-mid); }
  .nxmp-range { width:100%; accent-color:var(--ink); cursor:pointer; margin-bottom:0.45rem; }
  .nxmp-range-row { display:flex; justify-content:space-between; font-size:0.68rem; color:var(--ink-ghost); }
  .nxmp-range-val { font-weight:600; color:var(--ink); }
  .nxmp-sb-btns { padding:1rem 1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
  .nxmp-sb-apply { width:100%; height:34px; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-size:0.7rem; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.18s; }
  .nxmp-sb-apply:hover { background:var(--ink-mid); }
  .nxmp-sb-clear { width:100%; height:34px; background:transparent; color:var(--ink-soft); font-size:0.7rem; border:1px solid var(--border); cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.18s; }
  .nxmp-sb-clear:hover { border-color:var(--ink); color:var(--ink); }
  .nxmp-sb-new { width:100%; height:38px; background:transparent; color:var(--amber); border:1px solid rgba(196,151,58,0.3); font-size:0.7rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .nxmp-sb-new:hover { background:var(--amber); color:var(--white); border-color:var(--amber); }

  .nxmp-main { flex:1; }
  .nxmp-toolbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; padding-bottom:1.1rem; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:0.75rem; }
  .nxmp-count { font-size:0.78rem; color:var(--ink-soft); }
  .nxmp-count b { color:var(--ink); }
  .nxmp-sortsel { height:32px; padding:0 0.75rem; background:var(--white); border:1px solid var(--border); color:var(--ink-mid); font-size:0.75rem; cursor:pointer; font-family:'DM Sans',sans-serif; outline:none; }

  .nxmp-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:0; border-top:1px solid var(--border); border-left:1px solid var(--border); }
  .nxmp-card { border-right:1px solid var(--border); border-bottom:1px solid var(--border); background:var(--white); transition:background 0.15s; display:flex; flex-direction:column; }
  .nxmp-card:hover { background:var(--cream); }
  .nxmp-card-img { aspect-ratio:1; overflow:hidden; background:var(--cream-dark); position:relative; }
  .nxmp-card-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; }
  .nxmp-card:hover .nxmp-card-img img { transform:scale(1.05); }
  .nxmp-card-noimg { width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:var(--ink-ghost); font-size:0.8rem; }
  .nxmp-card-stock-badge { position:absolute; top:0.55rem; left:0.55rem; background:var(--white); border:1px solid var(--border); color:var(--ink); font-size:0.56rem; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; padding:0.22rem 0.55rem; }
  .nxmp-card-body { padding:1.1rem; flex:1; display:flex; flex-direction:column; }
  .nxmp-card-cond { font-size:0.6rem; font-weight:600; color:var(--ink-ghost); text-transform:uppercase; letter-spacing:0.12em; margin-bottom:0.3rem; }
  .nxmp-card-name { font-family:'Cormorant Garamond',serif; font-size:1.1rem; font-weight:300; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.3rem; letter-spacing:-0.01em; }
  .nxmp-card-price { font-family:'Cormorant Garamond',serif; font-size:1.2rem; font-weight:200; color:var(--amber); margin-bottom:0.3rem; letter-spacing:-0.01em; }
  .nxmp-card-stars { color:var(--amber); font-size:0.65rem; margin-bottom:0.65rem; }
  .nxmp-card-foot { border-top:1px solid rgba(26,23,20,0.06); padding-top:0.65rem; margin-top:auto; display:flex; align-items:center; justify-content:space-between; gap:0.5rem; }
  .nxmp-avail { font-size:0.65rem; font-weight:600; }
  .nxmp-avail.ok { color:#16A34A; }
  .nxmp-avail.out { color:#DC2626; }
  .nxmp-card-actions { display:flex; gap:0.35rem; }
  .nxmp-btn-edit { font-size:0.6rem; color:var(--ink-soft); cursor:pointer; transition:color 0.15s; letter-spacing:0.08em; text-transform:uppercase; background:none; border:1px solid var(--border); padding:0.3rem 0.6rem; font-family:'DM Sans',sans-serif; }
  .nxmp-btn-edit:hover { background:var(--ink); color:var(--cream); border-color:var(--ink); }
  .nxmp-btn-del { font-size:0.6rem; color:#DC2626; cursor:pointer; transition:all 0.15s; letter-spacing:0.08em; text-transform:uppercase; background:none; border:1px solid rgba(220,38,38,0.3); padding:0.3rem 0.6rem; font-family:'DM Sans',sans-serif; }
  .nxmp-btn-del:hover { background:#DC2626; color:var(--white); border-color:#DC2626; }

  .nxmp-err { background:#FEF2F2; border:1px solid #FCA5A5; padding:0.7rem 1rem; margin-bottom:1.25rem; color:#DC2626; font-size:0.82rem; }
  .nxmp-empty { padding:5rem 2rem; text-align:center; border:1px solid var(--border); background:var(--white); }
  .nxmp-empty-title { font-family:'Cormorant Garamond',serif; font-size:2rem; font-weight:200; color:var(--ink); margin-bottom:0.65rem; letter-spacing:-0.015em; }
  .nxmp-empty-sub { font-size:0.85rem; color:var(--ink-soft); max-width:280px; margin:0 auto 2rem; line-height:1.8; }

  /* MODAL */
  .nxpm-overlay { position:fixed; inset:0; background:rgba(26,23,20,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:3000; padding:1rem; }
  .nxpm-modal { background:var(--white); border:1px solid var(--border); width:100%; max-width:560px; box-shadow:0 24px 60px rgba(26,23,20,0.2); max-height:92vh; overflow-y:auto; position:relative; }
  .nxpm-head { padding:1.75rem 2rem 1.5rem; border-bottom:1px solid var(--border); display:flex; align-items:flex-start; justify-content:space-between; background:var(--cream-dark); }
  .nxpm-head-tag { font-size:0.6rem; font-weight:600; letter-spacing:0.22em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:0.4rem; display:flex; align-items:center; gap:0.5rem; }
  .nxpm-head-tag::before { content:''; display:block; width:16px; height:1px; background:var(--ink-soft); }
  .nxpm-head-title { font-family:'Cormorant Garamond',serif; font-size:1.75rem; font-weight:200; color:var(--ink); letter-spacing:-0.015em; }
  .nxpm-close { width:30px; height:30px; background:transparent; border:1px solid var(--border); color:var(--ink-soft); cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center; transition:all 0.15s; margin-top:2px; }
  .nxpm-close:hover { background:var(--ink); color:var(--cream); border-color:var(--ink); }
  .nxpm-body { padding:1.75rem 2rem 2rem; }
  .nxpm-f { margin-bottom:1.1rem; }
  .nxpm-f label { display:block; font-size:0.6rem; font-weight:600; color:var(--ink-soft); margin-bottom:0.45rem; letter-spacing:0.16em; text-transform:uppercase; }
  .nxpm-f input:not([type=file]), .nxpm-f textarea, .nxpm-f select { width:100%; padding:0 0.95rem; background:var(--cream); border:1px solid var(--border); color:var(--ink); font-size:0.88rem; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
  .nxpm-f input:not([type=file]), .nxpm-f select { height:40px; }
  .nxpm-f textarea { padding:0.75rem 0.95rem; height:80px; resize:vertical; line-height:1.6; }
  .nxpm-f input:not([type=file]):focus, .nxpm-f textarea:focus, .nxpm-f select:focus { border-color:var(--ink); }
  .nxpm-f input::placeholder, .nxpm-f textarea::placeholder { color:var(--ink-ghost); }
  .nxpm-f-row { display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; }
  .nxpm-img-zone { border:1px dashed rgba(26,23,20,0.18); background:var(--cream); padding:1.5rem; text-align:center; cursor:pointer; transition:all 0.2s; }
  .nxpm-img-zone:hover { border-color:var(--ink); background:var(--cream-dark); }
  .nxpm-file-hidden { display:none; }
  .nxpm-img-icon { font-size:1.5rem; opacity:0.3; display:block; margin-bottom:0.5rem; }
  .nxpm-img-txt { font-size:0.75rem; color:var(--ink-soft); }
  .nxpm-img-txt b { color:var(--ink); }
  .nxpm-img-preview { margin-top:0.85rem; position:relative; }
  .nxpm-img-preview img { width:100%; max-height:160px; object-fit:cover; display:block; border:1px solid var(--border); }
  .nxpm-img-remove { position:absolute; top:0.4rem; right:0.4rem; background:var(--white); border:1px solid var(--border); color:var(--ink-soft); cursor:pointer; font-size:0.7rem; padding:0.2rem 0.5rem; transition:all 0.15s; }
  .nxpm-img-remove:hover { background:var(--ink); color:var(--cream); }
  .nxpm-modal-err { background:#FEF2F2; border:1px solid #FCA5A5; padding:0.65rem 0.9rem; margin-bottom:1rem; color:#DC2626; font-size:0.8rem; }
  .nxpm-modal-ok  { background:#F0FDF4; border:1px solid #86EFAC; padding:0.65rem 0.9rem; margin-bottom:1rem; color:#16A34A; font-size:0.8rem; }
  .nxpm-foot { display:flex; gap:0.75rem; justify-content:flex-end; padding-top:1.25rem; border-top:1px solid var(--border); margin-top:1.5rem; }
  .nxpm-cancel { height:40px; padding:0 1.4rem; background:transparent; color:var(--ink-soft); border:1px solid var(--border); cursor:pointer; font-size:0.72rem; font-family:'DM Sans',sans-serif; transition:all 0.18s; letter-spacing:0.08em; text-transform:uppercase; }
  .nxpm-cancel:hover { border-color:var(--ink); color:var(--ink); }
  .nxpm-submit { height:40px; padding:0 1.75rem; background:var(--ink); color:var(--cream); font-family:'DM Sans',sans-serif; font-weight:500; font-size:0.72rem; letter-spacing:0.12em; text-transform:uppercase; border:none; cursor:pointer; transition:background 0.2s; }
  .nxpm-submit:hover:not(:disabled) { background:var(--ink-mid); }
  .nxpm-submit:disabled { opacity:0.35; cursor:not-allowed; }
  .nxpm-submit.danger { background:#DC2626; }
  .nxpm-submit.danger:hover:not(:disabled) { background:#B91C1C; }

  /* TOAST */
  .nxmp-toast { position:fixed; bottom:2rem; right:2rem; z-index:9999; padding:0.85rem 1.4rem; border:1px solid; font-size:0.82rem; font-weight:500; display:flex; align-items:center; gap:0.75rem; box-shadow:0 8px 24px rgba(26,23,20,0.12); animation:nxmp-slide 0.2s ease; }
  .nxmp-toast.success { background:#F0FDF4; border-color:#86EFAC; color:#15803D; }
  .nxmp-toast.error   { background:#FEF2F2; border-color:#FCA5A5; color:#DC2626; }
  .nxmp-toast-x { background:none; border:none; cursor:pointer; font-size:0.9rem; color:inherit; opacity:0.6; padding:0; }
  @keyframes nxmp-slide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

  @media (max-width:900px) { .nxmp-sidebar { display:none; } .nxmp-stats { grid-template-columns:repeat(2,1fr); } .nxmp-page { padding:2.5rem 1.5rem 4rem; } }
`;
if (!document.getElementById('nxmp-styles')) {
  const el = document.createElement('style');
  el.id = 'nxmp-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`nxmp-toast ${type}`}>
      <span>{message}</span>
      <button className="nxmp-toast-x" onClick={onClose}>✕</button>
    </div>
  );
}

// ─── Modal Publicar ───────────────────────────────────────────────────────────
function PublishModal({ isOpen, onClose, onPublished }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage  = e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } };
  const handleClose  = () => {
    setForm({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO' });
    setImageFile(null); setImagePreview(null); setError(''); setSuccess('');
    onClose();
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!Number.isInteger(Number(form.stock))) { setError('El stock debe ser un número entero.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titulo', form.titulo); fd.append('descripcion', form.descripcion);
      fd.append('precio', parseFloat(form.precio)); fd.append('stock', parseInt(form.stock));
      fd.append('condicion', form.condicion); fd.append('promedioCalificacion', 0);
      if (imageFile) fd.append('imagen', imageFile);
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Producto publicado correctamente.');
      if (onPublished) onPublished();
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setError(err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Error al publicar.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="nxpm-modal">
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Nuevo producto</div><div className="nxpm-head-title">Publicar producto</div></div>
          <button className="nxpm-close" onClick={handleClose}>✕</button>
        </div>
        <div className="nxpm-body">
          {error   && <div className="nxpm-modal-err">{error}</div>}
          {success && <div className="nxpm-modal-ok">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="nxpm-f"><label>Nombre del producto *</label><input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: Silla Eames vintage" /></div>
            <div className="nxpm-f"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe las características principales…" /></div>
            <div className="nxpm-f-row">
              <div className="nxpm-f"><label>Precio (USD) *</label><input type="number" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required placeholder="0.00" /></div>
              <div className="nxpm-f"><label>Stock *</label><input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required placeholder="0" /></div>
            </div>
            <div className="nxpm-f"><label>Estado</label>
              <select name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="NUEVO">Nuevo</option><option value="USADO">Usado</option><option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div className="nxpm-f">
              <label>Imagen del producto</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="nxpm-file-hidden" ref={fileInputRef} />
              <div className="nxpm-img-zone" onClick={() => fileInputRef.current?.click()}>
                <span className="nxpm-img-icon">📷</span>
                <div className="nxpm-img-txt">{imageFile ? <b>{imageFile.name}</b> : <><b>Haz clic o arrastra</b> una imagen<br /><span style={{ fontSize: '0.68rem', opacity: 0.6 }}>JPG, PNG o WEBP · Máx. 5MB</span></>}</div>
              </div>
              {imagePreview && <div className="nxpm-img-preview"><img src={imagePreview} alt="preview" /><button type="button" className="nxpm-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>✕ Quitar</button></div>}
            </div>
            <div className="nxpm-foot">
              <button type="button" className="nxpm-cancel" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="nxpm-submit" disabled={loading}>{loading ? 'Publicando…' : 'Publicar producto →'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Editar ─────────────────────────────────────────────────────────────
function EditProductModal({ isOpen, onClose, product, onProductUpdated }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setForm({ titulo: product.titulo || '', descripcion: product.descripcion || '', precio: product.precio || '', stock: product.stock || '', condicion: product.condicion || 'NUEVO' });
      setImagePreview(product.imagenes?.[0]?.url || null);
      setImageFile(null);
    }
  }, [product]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImage  = e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } };
  const handleClose  = () => { setError(''); onClose(); };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titulo', form.titulo); fd.append('descripcion', form.descripcion);
      fd.append('precio', parseFloat(form.precio)); fd.append('stock', parseInt(form.stock));
      fd.append('condicion', form.condicion); fd.append('promedioCalificacion', product?.promedioCalificacion || 0);
      if (imageFile) fd.append('imagen', imageFile);
      await api.put(`/products/${product.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (onProductUpdated) onProductUpdated();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Error al actualizar el producto');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="nxpm-modal">
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Editar producto</div><div className="nxpm-head-title">{product?.titulo || 'Producto'}</div></div>
          <button className="nxpm-close" onClick={handleClose}>✕</button>
        </div>
        <div className="nxpm-body">
          {error && <div className="nxpm-modal-err">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="nxpm-f"><label>Nombre del producto *</label><input name="titulo" value={form.titulo} onChange={handleChange} required /></div>
            <div className="nxpm-f"><label>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={handleChange} /></div>
            <div className="nxpm-f-row">
              <div className="nxpm-f"><label>Precio (USD) *</label><input type="number" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required /></div>
              <div className="nxpm-f"><label>Stock *</label><input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required /></div>
            </div>
            <div className="nxpm-f"><label>Estado</label>
              <select name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="NUEVO">Nuevo</option><option value="USADO">Usado</option><option value="REACONDICIONADO">Reacondicionado</option>
              </select>
            </div>
            <div className="nxpm-f">
              <label>Imagen del producto</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="nxpm-file-hidden" ref={fileInputRef} />
              <div className="nxpm-img-zone" onClick={() => fileInputRef.current?.click()}>
                <span className="nxpm-img-icon">📷</span>
                <div className="nxpm-img-txt">{imageFile ? <b>{imageFile.name}</b> : <><b>Haz clic o arrastra</b> para cambiar la imagen</>}</div>
              </div>
              {imagePreview && <div className="nxpm-img-preview"><img src={imagePreview} alt="preview" /><button type="button" className="nxpm-img-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>✕ Quitar</button></div>}
            </div>
            <div className="nxpm-foot">
              <button type="button" className="nxpm-cancel" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="nxpm-submit" disabled={loading}>{loading ? 'Guardando…' : 'Guardar cambios →'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Eliminar ───────────────────────────────────────────────────────────
function DeleteConfirmModal({ isOpen, onClose, onConfirm, productName, loading }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="nxpm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nxpm-modal" style={{ maxWidth: 420 }}>
        <div className="nxpm-head">
          <div><div className="nxpm-head-tag">Acción irreversible</div><div className="nxpm-head-title">Eliminar producto</div></div>
          <button className="nxpm-close" onClick={onClose}>✕</button>
        </div>
        <div className="nxpm-body" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
          <p style={{ color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Estás a punto de eliminar <strong>"{productName}"</strong>. Esta acción no se puede deshacer y la imagen también será borrada de Cloudinary.
          </p>
          <div className="nxpm-foot" style={{ justifyContent: 'center' }}>
            <button className="nxpm-cancel" onClick={onClose} disabled={loading}>Cancelar</button>
            <button className="nxpm-submit danger" onClick={onConfirm} disabled={loading}>{loading ? 'Eliminando…' : 'Sí, eliminar →'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
function MyProducts() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [searchTerm, setSearch]         = useState('');
  const [fCond, setFCond]               = useState('');
  const [fMaxPrice, setFMaxPrice]       = useState(1000);
  const [showModal, setShowModal]       = useState(false);
  const [sortBy, setSortBy]             = useState('newest');
  const [ddOpen, setDdOpen]             = useState(false);
  const [fetching, setFetching]         = useState(false);
  const [editProduct, setEditProduct]   = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast]               = useState(null);

  const token    = localStorage.getItem('token');
  const user     = JSON.parse(localStorage.getItem('user') || 'null');
  const initials = user ? `${(user.nombres || '')[0] || ''}${(user.apellidos || '')[0] || ''}`.toUpperCase() : '';
  const stars    = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  const fetchMyProducts = async (params = {}) => {
    if (fetching) return;
    try {
      setFetching(true); setLoading(true); setError('');
      const { data } = await api.get('/products/my', { params });
      setProducts(data.products || []);
    } catch (err) {
      if (err.response?.status === 429) setError('Demasiadas peticiones. Por favor espera un momento.');
      else if (err.response?.status === 401) { setError('Tu sesión expiró.'); navigate('/login'); }
      else setError(err.response?.data?.error || 'Error al cargar tus productos');
    } finally { setLoading(false); setFetching(false); }
  };

  useEffect(() => { if (!token || !user?.esVendedorVerificado) { navigate('/'); return; } fetchMyProducts(); }, [token]);
  useEffect(() => {
    const h = e => { if (!e.target.closest('.nxmp-user-pill')) setDdOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const doSearch = () => fetchMyProducts({ search: searchTerm || undefined, condition: fCond || undefined, maxPrice: fMaxPrice });
  const doClear  = () => { setSearch(''); setFCond(''); setFMaxPrice(1000); fetchMyProducts(); };

  const handleConfirmDelete = async () => {
    if (!deleteProduct) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleteProduct.id}`);
      setDeleteProduct(null);
      setToast({ message: 'Producto eliminado correctamente', type: 'success' });
      fetchMyProducts();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error al eliminar el producto', type: 'error' });
    } finally { setDeleteLoading(false); }
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-low')  return (a.precio || 0) - (b.precio || 0);
    if (sortBy === 'price-high') return (b.precio || 0) - (a.precio || 0);
    if (sortBy === 'rating')     return (b.promedioCalificacion || 0) - (a.promedioCalificacion || 0);
    return 0;
  });

  const inStock    = products.filter(p => p.stock > 0).length;
  const outStock   = products.filter(p => p.stock === 0).length;
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);

  return (
    <div className="nxmp-root">

      {/* ── Header ── */}
      <header className="nxmp-bar">
        <div className="nxmp-brand" onClick={() => navigate('/')}>
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nxmp-brand-name">Nexont</span>
        </div>
        <div className="nxmp-sep" />
        <span className="nxmp-bar-title">Mis Productos</span>
        <div className="nxmp-gap" />
        <div className="nxmp-bar-right">
          {/* Toggle tema */}
          <button
            className="nxmp-theme-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link
            to="/"
            style={{ height: 38, padding: '0 1rem', background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink-soft)', fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = 'var(--cream)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)'; }}
          >
            ← Tienda
          </Link>

          <button className="nxmp-pub-btn" onClick={() => setShowModal(true)}>+ Publicar</button>

          <div className="nxmp-user-pill" onClick={() => setDdOpen(o => !o)}>
            <div className="nxmp-av">{initials}</div>
            <span className="nxmp-uname">{user?.nombres}</span>
            <span className="nxmp-chev">▾</span>
            {ddOpen && (
              <div className="nxmp-dd">
                <div className="nxmp-dd-sec">
                  <div className="nxmp-dd-lbl">Mi cuenta</div>
                  <div className="nxmp-dd-item">👤 Mi perfil</div>
                  <div className="nxmp-dd-item" onClick={() => navigate('/orders')}>📦 Mis órdenes</div>
                </div>
                <div className="nxmp-dd-sec">
                  <div className="nxmp-dd-lbl">Vendedor</div>
                  <div className="nxmp-dd-item" onClick={() => setShowModal(true)}>➕ Nuevo producto</div>
                  <div className="nxmp-dd-item" onClick={() => navigate('/')}>🏪 Ver catálogo</div>
                </div>
                <div className="nxmp-dd-sec">
                  <div className="nxmp-dd-item danger" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }}>🚪 Cerrar sesión</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Contenido ── */}
      <div className="nxmp-page">
        <div className="nxmp-eyebrow">Panel de vendedor</div>
        <h1 className="nxmp-page-title">Mis Productos</h1>
        <p className="nxmp-page-sub">Gestiona y visualiza todos los productos que has publicado</p>

        {/* Stats */}
        <div className="nxmp-stats">
          <div className="nxmp-stat"><span className="nxmp-stat-val">{products.length}</span><span className="nxmp-stat-lbl">Publicados</span></div>
          <div className="nxmp-stat"><span className="nxmp-stat-val green">{inStock}</span><span className="nxmp-stat-lbl">Con stock</span></div>
          <div className="nxmp-stat"><span className="nxmp-stat-val red">{outStock}</span><span className="nxmp-stat-lbl">Sin stock</span></div>
          <div className="nxmp-stat"><span className="nxmp-stat-val amber">{totalStock}</span><span className="nxmp-stat-lbl">Unidades</span></div>
        </div>

        <div className="nxmp-layout">
          {/* Sidebar filtros */}
          <aside className="nxmp-sidebar">
            <div className="nxmp-sb-head"><span className="nxmp-sb-title">Filtros</span></div>
            <div className="nxmp-sb-sec">
              <span className="nxmp-sb-sec-title">Buscar</span>
              <input className="nxmp-sb-search" placeholder="Nombre del producto…" value={searchTerm} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
            </div>
            <div className="nxmp-sb-sec">
              <span className="nxmp-sb-sec-title">Estado</span>
              {['', 'NUEVO', 'USADO', 'REACONDICIONADO'].map(c => (
                <label key={c} className="nxmp-radio">
                  <input type="radio" name="mpcond" value={c} checked={fCond === c} onChange={() => setFCond(c)} />
                  <span>{c === '' ? 'Todos' : c.charAt(0) + c.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
            <div className="nxmp-sb-sec">
              <span className="nxmp-sb-sec-title">Precio máximo</span>
              <input type="range" min="0" max="1000" step="10" value={fMaxPrice} onChange={e => setFMaxPrice(Number(e.target.value))} className="nxmp-range" />
              <div className="nxmp-range-row"><span>$0</span><span className="nxmp-range-val">${fMaxPrice}</span><span>$1000+</span></div>
            </div>
            <div className="nxmp-sb-btns">
              <button className="nxmp-sb-apply" onClick={doSearch}>Aplicar filtros</button>
              <button className="nxmp-sb-clear" onClick={doClear}>Limpiar</button>
              <button className="nxmp-sb-new" onClick={() => setShowModal(true)}>+ Nuevo producto</button>
            </div>
          </aside>

          {/* Grid de productos */}
          <div className="nxmp-main">
            {error && <div className="nxmp-err">{error}</div>}
            <div className="nxmp-toolbar">
              <div className="nxmp-count">Total: <b>{sorted.length}</b> producto{sorted.length !== 1 ? 's' : ''}</div>
              <select className="nxmp-sortsel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Más reciente</option>
                <option value="price-low">Menor precio</option>
                <option value="price-high">Mayor precio</option>
                <option value="rating">Mejor calificación</option>
              </select>
            </div>

            {loading
              ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ink-ghost)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cargando…</div>
              : sorted.length === 0
                ? (
                  <div className="nxmp-empty">
                    <div className="nxmp-empty-title">Aún no tienes productos</div>
                    <p className="nxmp-empty-sub">Publica tu primer producto y empieza a vender en Nexont.</p>
                    <button className="nxmp-pub-btn" onClick={() => setShowModal(true)}>+ Publicar primer producto</button>
                  </div>
                )
                : (
                  <div className="nxmp-grid">
                    {sorted.map(p => (
                      <div key={p.id} className="nxmp-card">
                        <div className="nxmp-card-img">
                          {p.imagenes?.[0]?.url
                            ? <img src={p.imagenes[0].url} alt={p.titulo} />
                            : <div className="nxmp-card-noimg">Sin imagen</div>}
                          <span className="nxmp-card-stock-badge">Stock: {p.stock}</span>
                        </div>
                        <div className="nxmp-card-body">
                          <div className="nxmp-card-cond">{p.condicion || 'NUEVO'}</div>
                          <div className="nxmp-card-name">{p.titulo}</div>
                          <div className="nxmp-card-price">${(parseFloat(p.precio) || 0).toFixed(2)}</div>
                          <div className="nxmp-card-stars">{stars(p.promedioCalificacion)}</div>
                          <div className="nxmp-card-foot">
                            <span className={`nxmp-avail ${p.stock > 0 ? 'ok' : 'out'}`}>{p.stock > 0 ? '● Disponible' : '● Agotado'}</span>
                            <div className="nxmp-card-actions">
                              <button className="nxmp-btn-edit" onClick={() => setEditProduct(p)}>Editar</button>
                              <button className="nxmp-btn-del" onClick={() => setDeleteProduct(p)}>Eliminar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        </div>
      </div>

      {/* Modales */}
      <PublishModal isOpen={showModal} onClose={() => setShowModal(false)} onPublished={() => fetchMyProducts()} />
      <EditProductModal
        isOpen={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onProductUpdated={() => { fetchMyProducts(); setToast({ message: 'Producto actualizado correctamente', type: 'success' }); }}
      />
      <DeleteConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleConfirmDelete}
        productName={deleteProduct?.titulo || ''}
        loading={deleteLoading}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default MyProducts;