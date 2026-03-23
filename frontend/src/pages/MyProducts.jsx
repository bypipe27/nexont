import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  .nx-mp-root { min-height: 100vh; background: #0a0908; font-family: 'Inter', sans-serif; color: #f0ece4; }

  /* Topbar */
  .nx-mp-bar {
    position: sticky; top: 0; z-index: 200;
    height: 60px; background: rgba(10,9,8,0.96);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(212,163,62,0.12);
    display: flex; align-items: center;
    padding: 0 2rem; gap: 1rem;
  }
  .nx-mp-brand { display: flex; align-items: center; gap: 0.65rem; text-decoration: none; cursor: pointer; }
  .nx-mp-brand img { height: 28px; }
  .nx-mp-brand-name { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #f0ece4; letter-spacing: 0.02em; }
  .nx-mp-bar-sep { width: 1px; height: 24px; background: rgba(212,163,62,0.16); }
  .nx-mp-bar-title { font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700; color: rgba(240,236,228,0.4); letter-spacing: 0.1em; text-transform: uppercase; }
  .nx-mp-bar-gap { flex: 1; }
  .nx-mp-bar-right { display: flex; align-items: center; gap: 0.6rem; }

  .nx-mp-icon-btn {
    width: 36px; height: 36px; border-radius: 7px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(240,236,228,0.5); font-size: 1rem; transition: all 0.18s;
    text-decoration: none;
  }
  .nx-mp-icon-btn:hover { background: rgba(212,163,62,0.1); color: #d4a33e; border-color: rgba(212,163,62,0.25); }

  .nx-mp-pub-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 0.8rem; letter-spacing: 0.04em;
    padding: 0 1.1rem; height: 36px; border-radius: 7px;
    border: none; cursor: pointer; transition: all 0.2s;
  }
  .nx-mp-pub-btn:hover { background: #e8b84b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,163,62,0.3); }

  /* User pill */
  .nx-mp-user { position: relative; }
  .nx-mp-pill {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0 0.85rem 0 0.45rem; height: 36px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; cursor: pointer; transition: border-color 0.18s;
  }
  .nx-mp-pill:hover { border-color: rgba(212,163,62,0.28); }
  .nx-mp-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, #d4a33e, #8b6914);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.68rem; font-weight: 800; color: #0a0908;
  }
  .nx-mp-uname { font-size: 0.82rem; color: #f0ece4; font-weight: 500; }
  .nx-mp-chev { font-size: 0.6rem; color: rgba(240,236,228,0.35); }

  .nx-mp-dd {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: #141210; border: 1px solid rgba(212,163,62,0.16);
    border-radius: 9px; min-width: 200px; z-index: 1000;
    box-shadow: 0 20px 50px rgba(0,0,0,0.65); overflow: hidden;
  }
  .nx-mp-dd-sec { padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .nx-mp-dd-sec:last-child { border-bottom: none; }
  .nx-mp-dd-lbl { padding: 0.5rem 1rem 0.2rem; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(240,236,228,0.25); }
  .nx-mp-dd-item {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.65rem 1rem; cursor: pointer;
    font-size: 0.82rem; color: rgba(240,236,228,0.6); transition: all 0.15s;
  }
  .nx-mp-dd-item:hover { background: rgba(212,163,62,0.09); color: #d4a33e; }
  .nx-mp-dd-item.danger:hover { background: rgba(239,68,68,0.08); color: #ef4444; }

  /* Page layout */
  .nx-mp-page { max-width: 1280px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }

  /* Page header */
  .nx-mp-header { margin-bottom: 2.5rem; }
  .nx-mp-eyebrow { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; }
  .nx-mp-eyebrow-bar { width: 20px; height: 2px; background: #d4a33e; border-radius: 2px; }
  .nx-mp-eyebrow-txt { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #d4a33e; }
  .nx-mp-page-title { font-family: 'Syne', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 800; color: #f0ece4; margin-bottom: 0.4rem; letter-spacing: -0.01em; }
  .nx-mp-page-sub { font-size: 0.88rem; color: rgba(240,236,228,0.35); letter-spacing: 0.01em; line-height: 1.6; }

  /* Stats strip */
  .nx-mp-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
    background: rgba(212,163,62,0.08); border: 1px solid rgba(212,163,62,0.08);
    border-radius: 9px; overflow: hidden; margin-bottom: 2.5rem;
  }
  .nx-mp-stat { background: #0f0d0b; padding: 1.1rem 1.4rem; }
  .nx-mp-stat-val { font-family: 'Syne', sans-serif; font-size: 1.6rem; font-weight: 800; color: #f0ece4; display: block; line-height: 1; margin-bottom: 0.3rem; }
  .nx-mp-stat-lbl { font-size: 0.68rem; color: rgba(240,236,228,0.32); text-transform: uppercase; letter-spacing: 0.1em; display: block; }
  .nx-mp-stat-val.gold { color: #d4a33e; }
  .nx-mp-stat-val.green { color: #4ade80; }
  .nx-mp-stat-val.red { color: #ef4444; }

  /* Layout */
  .nx-mp-layout { display: flex; gap: 1.75rem; align-items: flex-start; }

  /* Sidebar */
  .nx-mp-sidebar {
    width: 230px; flex-shrink: 0;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(212,163,62,0.1);
    border-radius: 9px; overflow: hidden; position: sticky; top: 76px;
  }
  .nx-mp-sb-head { padding: 0.9rem 1.15rem; border-bottom: 1px solid rgba(212,163,62,0.08); }
  .nx-mp-sb-title { font-family: 'Syne', sans-serif; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(240,236,228,0.38); }
  .nx-mp-sb-sec { padding: 0.95rem 1.15rem; border-bottom: 1px solid rgba(212,163,62,0.06); }
  .nx-mp-sb-sec:last-child { border-bottom: none; }
  .nx-mp-sb-sec-title { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(240,236,228,0.28); margin-bottom: 0.7rem; display: block; }
  .nx-mp-sb-search {
    width: 100%; height: 34px; padding: 0 0.75rem;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(212,163,62,0.12);
    border-radius: 6px; color: #f0ece4; font-size: 0.8rem; outline: none;
    font-family: 'Inter', sans-serif; transition: border-color 0.2s; box-sizing: border-box;
  }
  .nx-mp-sb-search:focus { border-color: rgba(212,163,62,0.35); }
  .nx-mp-sb-search::placeholder { color: rgba(240,236,228,0.2); }
  .nx-mp-radio { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.5rem; cursor: pointer; }
  .nx-mp-radio input { accent-color: #d4a33e; cursor: pointer; width: 14px; height: 14px; }
  .nx-mp-radio span { font-size: 0.8rem; color: rgba(240,236,228,0.52); letter-spacing: 0.01em; }
  .nx-mp-range { width: 100%; accent-color: #d4a33e; cursor: pointer; margin-bottom: 0.45rem; }
  .nx-mp-range-row { display: flex; justify-content: space-between; font-size: 0.68rem; color: rgba(240,236,228,0.28); }
  .nx-mp-range-val { font-weight: 700; color: #d4a33e; }
  .nx-mp-sb-btns { padding: 0.95rem 1.15rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .nx-mp-sb-apply {
    width: 100%; height: 33px; border-radius: 6px;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.72rem; letter-spacing: 0.05em;
    border: none; cursor: pointer; transition: background 0.18s;
  }
  .nx-mp-sb-apply:hover { background: #e8b84b; }
  .nx-mp-sb-clear {
    width: 100%; height: 33px; border-radius: 6px;
    background: transparent; color: rgba(240,236,228,0.3); font-size: 0.72rem;
    border: 1px solid rgba(240,236,228,0.08); cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.18s;
  }
  .nx-mp-sb-clear:hover { border-color: rgba(240,236,228,0.2); color: rgba(240,236,228,0.6); }
  .nx-mp-sb-pub {
    width: 100%; height: 38px; border-radius: 6px;
    background: rgba(212,163,62,0.12); color: #d4a33e;
    border: 1px solid rgba(212,163,62,0.22);
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.78rem; letter-spacing: 0.04em;
    cursor: pointer; transition: all 0.2s;
  }
  .nx-mp-sb-pub:hover { background: rgba(212,163,62,0.22); }

  /* Main */
  .nx-mp-main { flex: 1; min-width: 0; }
  .nx-mp-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;
  }
  .nx-mp-count { font-size: 0.8rem; color: rgba(240,236,228,0.3); letter-spacing: 0.01em; }
  .nx-mp-count b { color: rgba(240,236,228,0.65); }
  .nx-mp-sortsel {
    height: 32px; padding: 0 0.75rem;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(212,163,62,0.12);
    border-radius: 6px; color: rgba(240,236,228,0.55); font-size: 0.77rem;
    cursor: pointer; font-family: 'Inter', sans-serif; outline: none;
  }
  .nx-mp-sortsel option { background: #141210; }

  /* Product grid */
  .nx-mp-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 1.1rem;
  }
  .nx-mp-card {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(212,163,62,0.09);
    border-radius: 9px; overflow: hidden; transition: all 0.2s;
  }
  .nx-mp-card:hover { border-color: rgba(212,163,62,0.28); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
  .nx-mp-card-img { aspect-ratio: 1; overflow: hidden; background: #1a1612; position: relative; }
  .nx-mp-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  .nx-mp-card:hover .nx-mp-card-img img { transform: scale(1.06); }
  .nx-mp-card-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(240,236,228,0.2); font-size: 0.8rem; }
  .nx-mp-card-stock-badge {
    position: absolute; top: 0.55rem; left: 0.55rem;
    background: rgba(10,9,8,0.8); border: 1px solid rgba(212,163,62,0.22);
    color: #d4a33e; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0.22rem 0.55rem; border-radius: 4px;
  }
  .nx-mp-card-body { padding: 0.9rem; }
  .nx-mp-card-cond { font-size: 0.62rem; font-weight: 700; color: rgba(212,163,62,0.6); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.25rem; }
  .nx-mp-card-name { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 700; color: #f0ece4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.4rem; letter-spacing: 0.01em; }
  .nx-mp-card-price { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 800; color: #d4a33e; margin-bottom: 0.25rem; }
  .nx-mp-card-stars { color: #d4a33e; font-size: 0.68rem; letter-spacing: 0.05em; margin-bottom: 0.55rem; }
  .nx-mp-card-foot { border-top: 1px solid rgba(212,163,62,0.08); padding-top: 0.6rem; margin-top: 0.4rem; display: flex; align-items: center; justify-content: space-between; }
  .nx-mp-card-avail { font-size: 0.68rem; font-weight: 700; }
  .nx-mp-card-avail.ok { color: #4ade80; }
  .nx-mp-card-avail.out { color: #ef4444; }
  .nx-mp-card-edit { font-size: 0.68rem; color: rgba(240,236,228,0.28); cursor: pointer; transition: color 0.15s; letter-spacing: 0.01em; }
  .nx-mp-card-edit:hover { color: #d4a33e; }

  /* Alerts */
  .nx-mp-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 0.7rem 1rem; margin-bottom: 1.25rem; color: #ef4444; font-size: 0.82rem; }
  .nx-mp-ok  { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); border-radius: 7px; padding: 0.7rem 1rem; margin-bottom: 1.25rem; color: #4ade80; font-size: 0.82rem; }

  /* Empty */
  .nx-mp-empty {
    padding: 5rem 2rem; text-align: center;
    border: 1px dashed rgba(212,163,62,0.14); border-radius: 10px;
    background: rgba(212,163,62,0.018);
  }
  .nx-mp-empty-icon { font-size: 3rem; margin-bottom: 1.25rem; opacity: 0.28; display: block; }
  .nx-mp-empty-title { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 800; color: #f0ece4; margin-bottom: 0.6rem; letter-spacing: -0.01em; }
  .nx-mp-empty-sub { font-size: 0.86rem; color: rgba(240,236,228,0.32); max-width: 300px; margin: 0 auto 1.75rem; line-height: 1.75; }

  /* ── MODAL ── */
  .nx-mp-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    z-index: 3000; padding: 1rem;
  }
  .nx-mp-modal {
    background: #111009; border: 1px solid rgba(212,163,62,0.18);
    border-radius: 12px; width: 100%; max-width: 580px;
    position: relative; box-shadow: 0 40px 100px rgba(0,0,0,0.75);
    max-height: 92vh; overflow-y: auto;
  }
  .nx-mp-modal-head {
    padding: 1.5rem 1.75rem 0;
    border-bottom: 1px solid rgba(212,163,62,0.08);
    padding-bottom: 1.25rem;
    display: flex; align-items: flex-start; justify-content: space-between;
  }
  .nx-mp-modal-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #d4a33e; margin-bottom: 0.35rem; display: block; }
  .nx-mp-modal-title { font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800; color: #f0ece4; letter-spacing: -0.01em; }
  .nx-mp-modal-x {
    width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0;
    background: rgba(255,255,255,0.05); border: none;
    color: rgba(240,236,228,0.38); cursor: pointer; font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    margin-top: 4px;
  }
  .nx-mp-modal-x:hover { background: rgba(255,255,255,0.1); color: #f0ece4; }
  .nx-mp-modal-body { padding: 1.5rem 1.75rem 1.75rem; }

  /* Form fields inside modal */
  .nx-mf { margin-bottom: 1.15rem; }
  .nx-mf label {
    display: block; font-size: 0.72rem; font-weight: 600;
    color: rgba(240,236,228,0.45); margin-bottom: 0.45rem;
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .nx-mf input, .nx-mf textarea, .nx-mf select {
    width: 100%; padding: 0 0.95rem;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(212,163,62,0.14);
    border-radius: 7px; color: #f0ece4; font-size: 0.88rem;
    font-family: 'Inter', sans-serif; outline: none; transition: border-color 0.2s;
    box-sizing: border-box; letter-spacing: 0.01em;
  }
  .nx-mf input, .nx-mf select { height: 42px; }
  .nx-mf textarea { padding: 0.75rem 0.95rem; height: 88px; resize: vertical; line-height: 1.6; }
  .nx-mf input:focus, .nx-mf textarea:focus, .nx-mf select:focus { border-color: rgba(212,163,62,0.45); background: rgba(255,255,255,0.055); }
  .nx-mf input::placeholder, .nx-mf textarea::placeholder { color: rgba(240,236,228,0.2); }
  .nx-mf select option { background: #141210; }
  .nx-mf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }

  /* Image upload */
  .nx-img-upload {
    border: 1px dashed rgba(212,163,62,0.2); border-radius: 8px;
    padding: 1.25rem; text-align: center; cursor: pointer;
    transition: all 0.2s; position: relative;
    background: rgba(212,163,62,0.02);
  }
  .nx-img-upload:hover { border-color: rgba(212,163,62,0.4); background: rgba(212,163,62,0.05); }
  .nx-img-upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .nx-img-upload-icon { font-size: 1.75rem; margin-bottom: 0.5rem; opacity: 0.5; display: block; }
  .nx-img-upload-txt { font-size: 0.8rem; color: rgba(240,236,228,0.38); letter-spacing: 0.01em; }
  .nx-img-upload-txt b { color: #d4a33e; }
  .nx-img-preview { margin-top: 1rem; border-radius: 7px; overflow: hidden; position: relative; }
  .nx-img-preview img { width: 100%; max-height: 180px; object-fit: cover; display: block; }
  .nx-img-preview-remove {
    position: absolute; top: 0.5rem; right: 0.5rem;
    background: rgba(10,9,8,0.8); border: none; border-radius: 5px;
    color: rgba(240,236,228,0.6); cursor: pointer; font-size: 0.75rem;
    padding: 0.25rem 0.5rem; transition: all 0.15s;
  }
  .nx-img-preview-remove:hover { background: rgba(239,68,68,0.3); color: #ef4444; }

  /* Modal alerts */
  .nx-mp-modal-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 0.65rem 0.9rem; margin-bottom: 1rem; color: #ef4444; font-size: 0.8rem; }
  .nx-mp-modal-ok  { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); border-radius: 7px; padding: 0.65rem 0.9rem; margin-bottom: 1rem; color: #4ade80; font-size: 0.8rem; }

  /* Modal footer */
  .nx-mp-modal-foot {
    display: flex; gap: 0.75rem; justify-content: flex-end;
    padding-top: 1.25rem; border-top: 1px solid rgba(212,163,62,0.08);
    margin-top: 1.5rem;
  }
  .nx-mp-cancel-btn {
    height: 40px; padding: 0 1.4rem; border-radius: 7px;
    background: transparent; color: rgba(240,236,228,0.45);
    border: 1px solid rgba(240,236,228,0.1); cursor: pointer;
    font-size: 0.82rem; font-family: 'Inter', sans-serif; transition: all 0.18s;
  }
  .nx-mp-cancel-btn:hover { border-color: rgba(240,236,228,0.25); color: rgba(240,236,228,0.7); }
  .nx-mp-publish-btn {
    height: 40px; padding: 0 1.75rem; border-radius: 7px;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 0.82rem; letter-spacing: 0.04em;
    border: none; cursor: pointer; transition: all 0.2s;
  }
  .nx-mp-publish-btn:hover:not(:disabled) { background: #e8b84b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,163,62,0.3); }
  .nx-mp-publish-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Responsive */
  @media (max-width: 900px) {
    .nx-mp-sidebar { display: none; }
    .nx-mp-stats { grid-template-columns: repeat(2, 1fr); }
    .nx-mp-page { padding: 2rem 1.25rem 4rem; }
  }
  @media (max-width: 500px) {
    .nx-mp-stats { grid-template-columns: 1fr 1fr; }
    .nx-mp-modal { border-radius: 10px 10px 0 0; }
    .nx-mf-row { grid-template-columns: 1fr; }
  }
`;

if (!document.getElementById('nx-mp-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-mp-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

// ─── Modal Publicar Producto ──────────────────────────────────────────────────
function PublishModal({ isOpen, onClose, onPublished }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO', promedioCalificacion: '0' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const resetForm = () => {
    setForm({ titulo: '', descripcion: '', precio: '', stock: '', condicion: 'NUEVO', promedioCalificacion: '0' });
    setImageFile(null); setImagePreview(null); setError(''); setSuccess('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    const stockNum = Number(form.stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) { setError('El stock debe ser un número entero positivo.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('titulo', form.titulo);
      fd.append('descripcion', form.descripcion);
      fd.append('precio', parseFloat(form.precio));
      fd.append('stock', parseInt(form.stock));
      fd.append('condicion', form.condicion);
      fd.append('promedioCalificacion', parseFloat(form.promedioCalificacion));
      if (imageFile) fd.append('imagen', imageFile);
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('¡Producto publicado correctamente!');
      if (onPublished) onPublished();
      setTimeout(() => { handleClose(); }, 1600);
    } catch (err) {
      const msg = err.response?.data?.details?.join(', ') || err.response?.data?.error || 'Error al publicar el producto';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') handleClose(); };
    if (isOpen) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="nx-mp-overlay" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="nx-mp-modal">
        {/* Header */}
        <div className="nx-mp-modal-head">
          <div>
            <span className="nx-mp-modal-tag">Nuevo producto</span>
            <div className="nx-mp-modal-title">Publicar producto</div>
          </div>
          <button className="nx-mp-modal-x" onClick={handleClose}>✕</button>
        </div>

        <div className="nx-mp-modal-body">
          {error   && <div className="nx-mp-modal-err">{error}</div>}
          {success && <div className="nx-mp-modal-ok">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div className="nx-mf">
              <label>Nombre del producto *</label>
              <input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Ej: Zapatillas Nike Air Max" />
            </div>

            {/* Descripción */}
            <div className="nx-mf">
              <label>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Describe las características principales del producto…" />
            </div>

            {/* Precio + Stock */}
            <div className="nx-mf-row">
              <div className="nx-mf">
                <label>Precio * (USD)</label>
                <input type="number" name="precio" value={form.precio} onChange={handleChange} step="0.01" min="0.01" required placeholder="0.00" />
              </div>
              <div className="nx-mf">
                <label>Stock disponible *</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} min="0" required placeholder="0" />
              </div>
            </div>

            {/* Condición + Calificación */}
            <div className="nx-mf-row">
              <div className="nx-mf">
                <label>Estado del producto</label>
                <select name="condicion" value={form.condicion} onChange={handleChange}>
                  <option value="NUEVO">✨ Nuevo</option>
                  <option value="USADO">📦 Usado</option>
                  <option value="REACONDICIONADO">🔧 Reacondicionado</option>
                </select>
              </div>
              <div className="nx-mf">
                <label>Calificación inicial (0–5)</label>
                <input type="number" name="promedioCalificacion" value={form.promedioCalificacion} onChange={handleChange} min="0" max="5" step="0.1" placeholder="0" />
              </div>
            </div>

            {/* Imagen */}
            <div className="nx-mf">
              <label>Imagen del producto</label>
              <div className="nx-img-upload">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} />
                <span className="nx-img-upload-icon">📷</span>
                <div className="nx-img-upload-txt">
                  {imageFile
                    ? <><b>{imageFile.name}</b><br /><span style={{ fontSize: '0.72rem' }}>Haz clic para cambiar</span></>
                    : <><b>Haz clic o arrastra</b> una imagen<br /><span style={{ fontSize: '0.72rem', opacity: 0.6 }}>JPG, PNG o WEBP · Máx. 5MB</span></>
                  }
                </div>
              </div>
              {imagePreview && (
                <div className="nx-img-preview">
                  <img src={imagePreview} alt="Vista previa" />
                  <button type="button" className="nx-img-preview-remove" onClick={() => { setImageFile(null); setImagePreview(null); }}>
                    ✕ Quitar
                  </button>
                </div>
              )}
            </div>

            <div className="nx-mp-modal-foot">
              <button type="button" className="nx-mp-cancel-btn" onClick={handleClose}>Cancelar</button>
              <button type="submit" className="nx-mp-publish-btn" disabled={loading}>
                {loading ? 'Publicando…' : '+ Publicar producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── MyProducts ───────────────────────────────────────────────────────────────
function MyProducts() {
  const navigate = useNavigate();
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [searchTerm, setSearch]       = useState('');
  const [fCond, setFCond]             = useState('');
  const [fMaxPrice, setFMaxPrice]     = useState(1000);
  const [showModal, setShowModal]     = useState(false);
  const [sortBy, setSortBy]           = useState('newest');
  const [ddOpen, setDdOpen]           = useState(false);
  const [fetching, setFetching]       = useState(false);

  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  const initials = user ? `${(user.nombres||'')[0]||''}${(user.apellidos||'')[0]||''}`.toUpperCase() : '';

  const fetchMyProducts = async (params = {}) => {
    if (fetching) return;
    try {
      setFetching(true); setLoading(true); setError('');
      const { data } = await api.get('/products/my', { params });
      setProducts(data.products || []);
    } catch (err) {
      if (err.response?.status === 401) { setError('Sesión expirada.'); navigate('/login'); }
      else setError(err.response?.data?.error || 'Error al cargar tus productos');
    } finally { setLoading(false); setFetching(false); }
  };

  useEffect(() => {
    if (!token || !user?.esVendedorVerificado) { navigate('/'); return; }
    fetchMyProducts();
  }, [token]);

  useEffect(() => {
    const h = e => { if (!e.target.closest('.nx-mp-user')) setDdOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const doSearch = () => fetchMyProducts({ search: searchTerm || undefined, condition: fCond || undefined, maxPrice: fMaxPrice });
  const doClear  = () => { setSearch(''); setFCond(''); setFMaxPrice(1000); fetchMyProducts(); };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const totalStock  = products.reduce((s, p) => s + (p.stock || 0), 0);
  const inStock     = products.filter(p => p.stock > 0).length;
  const outOfStock  = products.filter(p => p.stock === 0).length;
  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  return (
    <div className="nx-mp-root">

      {/* ── Topbar ── */}
      <header className="nx-mp-bar">
        <div className="nx-mp-brand" onClick={() => navigate('/')}>
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nx-mp-brand-name">Nexont</span>
        </div>
        <div className="nx-mp-bar-sep" />
        <span className="nx-mp-bar-title">Mis Productos</span>
        <div className="nx-mp-bar-gap" />
        <div className="nx-mp-bar-right">
          <Link to="/" className="nx-mp-icon-btn" title="Volver al catálogo">🏠</Link>
          <button className="nx-mp-pub-btn" onClick={() => setShowModal(true)}>
            + Publicar producto
          </button>
          <div className="nx-mp-user">
            <div className="nx-mp-pill" onClick={() => setDdOpen(o => !o)}>
              <div className="nx-mp-avatar">{initials}</div>
              <span className="nx-mp-uname">{user?.nombres}</span>
              <span className="nx-mp-chev">▾</span>
            </div>
            {ddOpen && (
              <div className="nx-mp-dd">
                <div className="nx-mp-dd-sec">
                  <div className="nx-mp-dd-lbl">Mi cuenta</div>
                  <div className="nx-mp-dd-item">👤 Mi perfil</div>
                  <div className="nx-mp-dd-item" onClick={() => navigate('/orders')}>📦 Mis órdenes</div>
                </div>
                <div className="nx-mp-dd-sec">
                  <div className="nx-mp-dd-lbl">Vendedor</div>
                  <div className="nx-mp-dd-item" onClick={() => setShowModal(true)}>➕ Nuevo producto</div>
                  <div className="nx-mp-dd-item" onClick={() => navigate('/')}>🏪 Ver catálogo</div>
                </div>
                <div className="nx-mp-dd-sec">
                  <div className="nx-mp-dd-item danger" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }}>
                    🚪 Cerrar sesión
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="nx-mp-page">

        {/* Page header */}
        <div className="nx-mp-header">
          <div className="nx-mp-eyebrow">
            <div className="nx-mp-eyebrow-bar" />
            <span className="nx-mp-eyebrow-txt">Panel de vendedor</span>
          </div>
          <h1 className="nx-mp-page-title">Mis Productos</h1>
          <p className="nx-mp-page-sub">Gestiona y visualiza todos los productos que has publicado en Nexont</p>
        </div>

        {/* Stats strip */}
        <div className="nx-mp-stats">
          <div className="nx-mp-stat">
            <span className="nx-mp-stat-val">{products.length}</span>
            <span className="nx-mp-stat-lbl">Total publicados</span>
          </div>
          <div className="nx-mp-stat">
            <span className="nx-mp-stat-val green">{inStock}</span>
            <span className="nx-mp-stat-lbl">Con stock</span>
          </div>
          <div className="nx-mp-stat">
            <span className="nx-mp-stat-val red">{outOfStock}</span>
            <span className="nx-mp-stat-lbl">Sin stock</span>
          </div>
          <div className="nx-mp-stat">
            <span className="nx-mp-stat-val gold">{totalStock}</span>
            <span className="nx-mp-stat-lbl">Unidades totales</span>
          </div>
        </div>

        {/* Layout */}
        <div className="nx-mp-layout">
          {/* Sidebar */}
          <aside className="nx-mp-sidebar">
            <div className="nx-mp-sb-head"><span className="nx-mp-sb-title">Filtros</span></div>
            <div className="nx-mp-sb-sec">
              <span className="nx-mp-sb-sec-title">Buscar</span>
              <input
                className="nx-mp-sb-search"
                placeholder="Nombre del producto…"
                value={searchTerm}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
              />
            </div>
            <div className="nx-mp-sb-sec">
              <span className="nx-mp-sb-sec-title">Estado</span>
              {['', 'nuevo', 'usado', 'reacondicionado'].map(c => (
                <label key={c} className="nx-mp-radio">
                  <input type="radio" name="mpcond" value={c} checked={fCond === c} onChange={() => setFCond(c)} />
                  <span>{c === '' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}</span>
                </label>
              ))}
            </div>
            <div className="nx-mp-sb-sec">
              <span className="nx-mp-sb-sec-title">Precio máximo</span>
              <input type="range" min="0" max="1000" step="10" value={fMaxPrice} onChange={e => setFMaxPrice(Number(e.target.value))} className="nx-mp-range" />
              <div className="nx-mp-range-row">
                <span>$0</span>
                <span className="nx-mp-range-val">${fMaxPrice}</span>
                <span>$1000+</span>
              </div>
            </div>
            <div className="nx-mp-sb-btns">
              <button className="nx-mp-sb-apply" onClick={doSearch}>Aplicar filtros</button>
              <button className="nx-mp-sb-clear" onClick={doClear}>Limpiar</button>
              <button className="nx-mp-sb-pub" onClick={() => setShowModal(true)}>+ Nuevo producto</button>
            </div>
          </aside>

          {/* Main */}
          <div className="nx-mp-main">
            {error && <div className="nx-mp-err">{error}</div>}

            <div className="nx-mp-toolbar">
              <div className="nx-mp-count">
                Total: <b>{sorted.length}</b> producto{sorted.length !== 1 ? 's' : ''}
              </div>
              <select className="nx-mp-sortsel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Más reciente</option>
                <option value="price-low">Menor precio</option>
                <option value="price-high">Mayor precio</option>
                <option value="rating">Mejor calificación</option>
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: 'rgba(240,236,228,0.28)', fontSize: '0.88rem' }}>
                Cargando productos…
              </div>
            ) : sorted.length === 0 ? (
              <div className="nx-mp-empty">
                <span className="nx-mp-empty-icon">📦</span>
                <div className="nx-mp-empty-title">Aún no tienes productos</div>
                <p className="nx-mp-empty-sub">Publica tu primer producto y empieza a vender en Nexont hoy mismo.</p>
                <button className="nx-mp-pub-btn" onClick={() => setShowModal(true)}>
                  + Publicar primer producto
                </button>
              </div>
            ) : (
              <div className="nx-mp-grid">
                {sorted.map(p => (
                  <div key={p.id} className="nx-mp-card">
                    <div className="nx-mp-card-img">
                      {p.imagenes?.[0]?.url
                        ? <img src={p.imagenes[0].url} alt={p.titulo} />
                        : <div className="nx-mp-card-no-img">Sin imagen</div>
                      }
                      <span className="nx-mp-card-stock-badge">Stock: {p.stock}</span>
                    </div>
                    <div className="nx-mp-card-body">
                      <div className="nx-mp-card-cond">{p.condition || 'nuevo'}</div>
                      <div className="nx-mp-card-name">{p.titulo}</div>
                      <div className="nx-mp-card-price">${(parseFloat(p.price) || 0).toFixed(2)}</div>
                      <div className="nx-mp-card-stars">{stars(p.rating)}</div>
                      <div className="nx-mp-card-foot">
                        <span className={`nx-mp-card-avail ${p.stock > 0 ? 'ok' : 'out'}`}>
                          {p.stock > 0 ? '● Disponible' : '● Agotado'}
                        </span>
                        <span className="nx-mp-card-edit">Editar →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PublishModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPublished={() => fetchMyProducts()}
      />
    </div>
  );
}

export default MyProducts;