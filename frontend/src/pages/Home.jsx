import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useHybridCart } from '../hooks/useHybridCart';
import { useTheme } from '../context/ThemeContext';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;0,700;1,200;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --cream: #F5F0E8;
    --cream-dark: #EDE8DF;
    --ink: #1A1714;
    --ink-mid: #3D3830;
    --ink-soft: #7A7268;
    --ink-ghost: #B8B0A6;
    --amber: #C4973A;
    --amber-light: #D4A84A;
    --white: #FDFBF8;
    --border: rgba(26,23,20,0.1);
    --border-soft: rgba(26,23,20,0.06);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .nx-root {
    min-height: 100vh;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
  }

  /* ── TOPBAR ── */
  .nx-nav {
    position: sticky; top: 0; z-index: 200;
    height: 68px;
    background: rgba(245,240,232,0.94);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center;
    padding: 0 3rem; gap: 2rem;
  }
  .nx-nav-brand {
    display: flex; align-items: center; gap: 0.75rem;
    text-decoration: none; flex-shrink: 0;
  }
  .nx-nav-brand img { height: 28px; }
  .nx-nav-wordmark {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem; font-weight: 600;
    color: var(--ink); letter-spacing: 0.06em;
  }
  .nx-nav-sep { width: 1px; height: 20px; background: var(--border); }
  .nx-nav-search {
    flex: 1; max-width: 380px;
    display: flex; align-items: center; gap: 0.5rem;
    background: rgba(26,23,20,0.04);
    border: 1px solid var(--border);
    border-radius: 2px; padding: 0 0.85rem; height: 38px;
    transition: border-color 0.2s;
  }
  .nx-nav-search:focus-within { border-color: rgba(26,23,20,0.3); }
  .nx-nav-search input {
    background: none; border: none; outline: none;
    color: var(--ink); font-size: 0.82rem;
    font-family: 'DM Sans', sans-serif; width: 100%;
    letter-spacing: 0.01em;
  }
  .nx-nav-search input::placeholder { color: var(--ink-ghost); }
  .nx-nav-gap { flex: 1; }
  .nx-nav-actions { display: flex; align-items: center; gap: 0.5rem; }

  .nx-icon-btn {
    width: 38px; height: 38px; border-radius: 2px;
    background: transparent; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--ink-soft); font-size: 0.9rem;
    transition: all 0.18s; position: relative; text-decoration: none;
  }
  .nx-icon-btn:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }

  .nx-cart-dot {
    position: absolute; top: -4px; right: -4px;
    width: 15px; height: 15px; border-radius: 50%;
    background: var(--amber); color: var(--white);
    font-size: 0.55rem; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid var(--cream);
  }

  .nx-nav-cta {
    height: 38px; padding: 0 1.35rem; border-radius: 2px;
    background: var(--ink); color: var(--cream);
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase;
    border: none; cursor: pointer; transition: all 0.2s;
    text-decoration: none; display: inline-flex; align-items: center;
  }
  .nx-nav-cta:hover { background: var(--ink-mid); }

  /* ── User pill ── */
  .nx-user-wrap { position: relative; }
  .nx-user-pill {
    display: flex; align-items: center; gap: 0.5rem;
    height: 38px; padding: 0 0.85rem 0 0.5rem;
    background: transparent; border: 1px solid var(--border);
    border-radius: 2px; cursor: pointer; transition: all 0.18s;
  }
  .nx-user-pill:hover { background: var(--ink); border-color: var(--ink); }
  .nx-user-pill:hover .nx-user-name,
  .nx-user-pill:hover .nx-user-chev { color: var(--cream) !important; }
  .nx-user-pill:hover .nx-user-av { background: rgba(255,255,255,0.2); color: var(--cream); }
  .nx-user-av {
    width: 26px; height: 26px; border-radius: 50%;
    background: var(--ink); color: var(--cream);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.62rem; font-weight: 600; flex-shrink: 0;
    transition: all 0.18s;
  }
  .nx-user-name { font-size: 0.82rem; color: var(--ink); font-weight: 500; transition: color 0.18s; }
  .nx-user-chev { font-size: 0.6rem; color: var(--ink-ghost); transition: color 0.18s; }

  .nx-dropdown {
    position: absolute; top: calc(100% + 6px); right: 0;
    background: var(--white); border: 1px solid var(--border);
    min-width: 210px; z-index: 1000;
    box-shadow: 0 16px 48px rgba(26,23,20,0.14); overflow: hidden;
  }
  .nx-dd-sec { border-bottom: 1px solid var(--border-soft); }
  .nx-dd-sec:last-child { border-bottom: none; }
  .nx-dd-lbl {
    padding: 0.65rem 1rem 0.3rem;
    font-size: 0.58rem; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: var(--ink-ghost);
  }
  .nx-dd-item {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.65rem 1rem; cursor: pointer;
    font-size: 0.82rem; color: var(--ink-mid);
    transition: all 0.12s;
  }
  .nx-dd-item:hover { background: var(--cream-dark); color: var(--ink); }
  .nx-dd-item.danger:hover { background: #FEF2F2; color: #DC2626; }
  .nx-dd-item.highlight { color: var(--amber); font-weight: 500; }

  /* ── HERO ── */
  .nx-hero {
    min-height: calc(100vh - 68px);
    display: grid; grid-template-columns: 1fr 1fr;
    position: relative; overflow: hidden;
  }
  .nx-hero-left {
    display: flex; flex-direction: column;
    justify-content: center; padding: 5rem 4rem 5rem 3rem;
    border-right: 1px solid var(--border);
  }
  .nx-hero-season {
    font-size: 0.65rem; font-weight: 500; letter-spacing: 0.3em;
    text-transform: uppercase; color: var(--ink-soft);
    margin-bottom: 2rem;
    display: flex; align-items: center; gap: 0.85rem;
  }
  .nx-hero-season::before {
    content: ''; display: block; width: 36px; height: 1px; background: var(--ink-soft);
  }
  .nx-hero-h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(4.5rem, 7.5vw, 8.5rem);
    font-weight: 200;
    line-height: 0.92;
    color: var(--ink);
    margin-bottom: 2.5rem;
    letter-spacing: -0.025em;
  }
  .nx-hero-h1 em {
    font-style: italic;
    font-weight: 200;
    color: var(--amber);
    display: block;
  }
  .nx-hero-p {
    font-size: 0.95rem; line-height: 1.9;
    color: var(--ink-soft); font-weight: 300;
    max-width: 380px; margin-bottom: 3rem;
    letter-spacing: 0.025em;
  }
  .nx-hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
  .nx-btn-primary {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--ink); color: var(--cream);
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0 2.25rem; height: 48px; border: none; cursor: pointer;
    transition: all 0.2s; text-decoration: none;
  }
  .nx-btn-primary:hover { background: var(--ink-mid); }
  .nx-btn-outline {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: transparent; color: var(--ink);
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0 2.25rem; height: 48px;
    border: 1px solid var(--border); cursor: pointer;
    transition: all 0.2s; text-decoration: none;
  }
  .nx-btn-outline:hover { border-color: var(--ink); background: var(--cream-dark); }

  .nx-hero-stats {
    display: flex; gap: 0; margin-top: 4.5rem;
    border-top: 1px solid var(--border);
    padding-top: 2.5rem;
  }
  .nx-hstat { flex: 1; padding-right: 2rem; }
  .nx-hstat:not(:last-child) { border-right: 1px solid var(--border); margin-right: 2rem; }
  .nx-hstat-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 3rem; font-weight: 200; color: var(--ink);
    display: block; line-height: 1; margin-bottom: 0.35rem;
    letter-spacing: -0.02em;
  }
  .nx-hstat-lbl {
    font-size: 0.62rem; color: var(--ink-ghost);
    text-transform: uppercase; letter-spacing: 0.15em; display: block;
  }

  /* Hero right */
  .nx-hero-right {
    background: var(--cream-dark);
    display: flex; flex-direction: column;
  }
  .nx-hero-right-head {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .nx-hero-right-title {
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--ink-soft);
  }
  .nx-live-pill {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.62rem; color: #16A34A; font-weight: 600; letter-spacing: 0.08em;
  }
  .nx-live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #16A34A;
    animation: nx-pulse 2s ease infinite;
  }
  .nx-feed-list { flex: 1; overflow-y: auto; }
  .nx-feed-item {
    display: flex; align-items: center; gap: 1rem;
    padding: 1.1rem 2rem; border-bottom: 1px solid var(--border-soft);
    cursor: pointer; transition: background 0.12s;
  }
  .nx-feed-item:hover { background: rgba(26,23,20,0.03); }
  .nx-feed-thumb {
    width: 50px; height: 50px; flex-shrink: 0; overflow: hidden;
    background: var(--cream); border: 1px solid var(--border);
  }
  .nx-feed-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .nx-feed-info { flex: 1; overflow: hidden; }
  .nx-feed-name {
    font-size: 0.85rem; font-weight: 500; color: var(--ink);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 0.2rem;
  }
  .nx-feed-cond {
    font-size: 0.65rem; color: var(--ink-ghost);
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .nx-feed-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.05rem; font-weight: 600; color: var(--ink); flex-shrink: 0;
  }
  .nx-hero-right-empty {
    flex: 1; display: flex; align-items: center; justify-content: center;
    font-size: 0.82rem; color: var(--ink-ghost); padding: 3rem;
    text-align: center; line-height: 1.8;
  }

  /* ── RECENT SECTION ── */
  .nx-section { padding: 5.5rem 3rem; }
  .nx-section-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 3.5rem; padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  .nx-section-eyebrow {
    font-size: 0.62rem; font-weight: 600; letter-spacing: 0.25em;
    text-transform: uppercase; color: var(--ink-soft);
    margin-bottom: 0.75rem; display: block;
  }
  .nx-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(2.2rem, 4vw, 3.5rem);
    font-weight: 200; color: var(--ink); line-height: 1.0;
    letter-spacing: -0.02em;
  }
  .nx-section-link {
    font-size: 0.72rem; font-weight: 500; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--ink-soft);
    text-decoration: none; display: flex; align-items: center; gap: 0.4rem;
    transition: color 0.15s; padding-bottom: 4px; border-bottom: 1px solid currentColor;
    white-space: nowrap; background: none; border-top: none; border-left: none; border-right: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
  }
  .nx-section-link:hover { color: var(--ink); }

  .nx-rgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
  .nx-rcard {
    border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.2s; position: relative;
    display: flex; flex-direction: column;
  }
  .nx-rcard:nth-child(3n) { border-right: none; }
  .nx-rcard:hover { background: var(--cream-dark); }
  .nx-rcard-img {
    aspect-ratio: 4/3; overflow: hidden;
    background: var(--cream-dark); position: relative;
  }
  .nx-rcard-img img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform 0.6s ease;
  }
  .nx-rcard:hover .nx-rcard-img img { transform: scale(1.04); }
  .nx-rcard-badge {
    position: absolute; top: 1rem; left: 1rem;
    background: var(--white); color: var(--ink);
    font-size: 0.56rem; font-weight: 600; letter-spacing: 0.16em;
    text-transform: uppercase; padding: 0.3rem 0.65rem;
    border: 1px solid var(--border);
  }
  .nx-rcard-body { padding: 1.6rem; flex: 1; display: flex; flex-direction: column; }
  .nx-rcard-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.35rem; font-weight: 300; color: var(--ink);
    margin-bottom: 0.35rem; line-height: 1.2;
    letter-spacing: -0.01em;
  }
  .nx-rcard-seller { font-size: 0.7rem; color: var(--ink-ghost); margin-bottom: 0.75rem; letter-spacing: 0.04em; }
  .nx-rcard-stars { color: var(--amber); font-size: 0.7rem; letter-spacing: 0.05em; margin-bottom: auto; }
  .nx-rcard-foot {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-soft);
  }
  .nx-rcard-price {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.5rem; font-weight: 300; color: var(--ink);
    letter-spacing: -0.01em;
  }
  .nx-detail-link {
    font-size: 0.65rem; font-weight: 500; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--ink-ghost);
    background: none; border: none; cursor: pointer;
    transition: color 0.15s; padding-bottom: 2px;
    border-bottom: 1px solid transparent;
    font-family: 'DM Sans', sans-serif;
  }
  .nx-detail-link:hover { color: var(--ink); border-bottom-color: var(--ink); }

  .nx-empty {
    padding: 5rem 2rem; text-align: center;
    border: 1px solid var(--border);
  }
  .nx-empty-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 200; color: var(--ink);
    margin-bottom: 0.75rem; letter-spacing: -0.01em;
  }
  .nx-empty-txt { font-size: 0.85rem; color: var(--ink-soft); max-width: 320px; margin: 0 auto 2rem; line-height: 1.8; }

  .nx-divider { border: none; border-top: 1px solid var(--border); }

  /* ── CATALOG ── */
  .nx-catalog { display: flex; min-height: 100vh; }
  .nx-sidebar {
    width: 240px; flex-shrink: 0;
    border-right: 1px solid var(--border);
    padding: 2rem 0; position: sticky;
    top: 68px; height: calc(100vh - 68px); overflow-y: auto;
  }
  .nx-sb-head { padding: 0 1.5rem 1.25rem; border-bottom: 1px solid var(--border); margin-bottom: 0; }
  .nx-sb-title { font-size: 0.6rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-soft); }
  .nx-sb-sec { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-soft); }
  .nx-sb-sec-title { font-size: 0.58rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-ghost); margin-bottom: 0.85rem; display: block; }
  .nx-sb-radio { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.55rem; cursor: pointer; }
  .nx-sb-radio input { accent-color: var(--ink); cursor: pointer; }
  .nx-sb-radio span { font-size: 0.82rem; color: var(--ink-mid); }
  .nx-sb-range { width: 100%; accent-color: var(--ink); cursor: pointer; margin-bottom: 0.5rem; }
  .nx-sb-range-row { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--ink-ghost); }
  .nx-sb-range-val { font-weight: 600; color: var(--ink); }
  .nx-sb-btns { padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .nx-sb-apply { width: 100%; height: 36px; background: var(--ink); color: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; border: none; cursor: pointer; transition: background 0.18s; }
  .nx-sb-apply:hover { background: var(--ink-mid); }
  .nx-sb-clear { width: 100%; height: 36px; background: transparent; color: var(--ink-soft); font-size: 0.7rem; border: 1px solid var(--border); cursor: pointer; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
  .nx-sb-clear:hover { border-color: var(--ink); color: var(--ink); }

  .nx-cat-main { flex: 1; padding: 2.5rem 3rem; }
  .nx-cat-searchbar { display: flex; gap: 0; margin-bottom: 2rem; }
  .nx-cat-searchbar input { flex: 1; height: 42px; padding: 0 1rem; background: var(--white); border: 1px solid var(--border); border-right: none; color: var(--ink); font-size: 0.85rem; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.2s; }
  .nx-cat-searchbar input:focus { border-color: var(--ink); }
  .nx-cat-searchbar input::placeholder { color: var(--ink-ghost); }
  .nx-cat-searchbar button { height: 42px; padding: 0 1.5rem; background: var(--ink); color: var(--cream); border: none; cursor: pointer; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; transition: background 0.18s; }
  .nx-cat-searchbar button:hover { background: var(--ink-mid); }
  .nx-cat-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 0.75rem; }
  .nx-cat-count { font-size: 0.78rem; color: var(--ink-soft); }
  .nx-cat-count b { color: var(--ink); }
  .nx-cat-heading { padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
  .nx-cat-heading .nx-section-title { font-size: clamp(1.8rem, 3vw, 2.8rem); }
  .nx-toolbar-r { display: flex; align-items: center; gap: 0.5rem; }
  .nx-view-toggle { display: flex; border: 1px solid var(--border); }
  .nx-vbtn { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; cursor: pointer; color: var(--ink-ghost); font-size: 1rem; transition: all 0.15s; }
  .nx-vbtn.on { background: var(--ink); color: var(--cream); }
  .nx-sortsel { height: 34px; padding: 0 0.75rem; background: var(--white); border: 1px solid var(--border); color: var(--ink-mid); font-size: 0.75rem; cursor: pointer; font-family: 'DM Sans', sans-serif; outline: none; }

  .nx-pgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0; margin-bottom: 2rem; }
  .nx-pgrid.list { grid-template-columns: 1fr; }
  .nx-pcard { border: 1px solid var(--border); margin: -1px 0 0 -1px; cursor: pointer; transition: background 0.15s; position: relative; display: flex; flex-direction: column; }
  .nx-pcard:hover { background: var(--cream-dark); z-index: 1; }
  .nx-pcard-img { aspect-ratio: 1; overflow: hidden; background: var(--cream-dark); position: relative; }
  .nx-pcard-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
  .nx-pcard:hover .nx-pcard-img img { transform: scale(1.05); }
  .nx-pcard-badge { position: absolute; top: 0.6rem; left: 0.6rem; background: var(--white); color: var(--ink); font-size: 0.52rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; padding: 0.2rem 0.5rem; border: 1px solid var(--border); }
  .nx-fav { position: absolute; top: 0.6rem; right: 0.6rem; width: 28px; height: 28px; border: 1px solid var(--border); background: var(--white); cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .nx-fav:hover { background: var(--ink); }
  .nx-pcard-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; }
  .nx-pcard-name { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-weight: 300; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.2rem; letter-spacing: -0.01em; }
  .nx-pcard-price { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 300; color: var(--amber); margin-bottom: 0.3rem; letter-spacing: -0.01em; }
  .nx-pcard-stars { color: var(--amber); font-size: 0.65rem; margin-bottom: 0.5rem; }
  .nx-pcard-add-row { display: flex; gap: 0.3rem; }
  .nx-qty { width: 44px; height: 30px; text-align: center; background: var(--white); border: 1px solid var(--border); color: var(--ink); font-size: 0.78rem; outline: none; font-family: 'DM Sans', sans-serif; }
  .nx-add-btn { flex: 1; height: 30px; border: none; font-size: 0.65rem; font-weight: 500; cursor: pointer; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .nx-add-btn.ok { background: var(--ink); color: var(--cream); }
  .nx-add-btn.ok:hover { background: var(--ink-mid); }
  .nx-add-btn.out { background: var(--cream-dark); color: var(--ink-ghost); cursor: not-allowed; }
  .nx-pcard-seller { font-size: 0.62rem; color: var(--ink-ghost); margin-top: 0.4rem; }

  .nx-alert-err { background: #FEF2F2; border: 1px solid #FCA5A5; padding: 0.7rem 1rem; margin-bottom: 1rem; color: #DC2626; font-size: 0.82rem; }
  .nx-alert-ok  { background: #F0FDF4; border: 1px solid #86EFAC; padding: 0.7rem 1rem; margin-bottom: 1rem; color: #16A34A; font-size: 0.82rem; }

  .nx-pages { display: flex; justify-content: center; gap: 0; margin-top: 2rem; border-top: 1px solid var(--border); padding-top: 2rem; }
  .nx-pg { height: 36px; min-width: 36px; padding: 0 0.5rem; background: transparent; border: 1px solid var(--border); margin-left: -1px; color: var(--ink-soft); font-size: 0.78rem; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .nx-pg:hover { background: var(--cream-dark); color: var(--ink); }
  .nx-pg.on { background: var(--ink); color: var(--cream); font-weight: 600; }
  .nx-pg:disabled { opacity: 0.3; cursor: not-allowed; }

  .nx-skel-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0; }
  .nx-skel-card { border: 1px solid var(--border); margin: -1px 0 0 -1px; }
  .nx-skel-img { aspect-ratio: 4/3; background: linear-gradient(90deg, var(--cream-dark) 25%, var(--cream) 50%, var(--cream-dark) 75%); background-size: 200% 100%; animation: nx-shim 1.4s infinite; }
  .nx-skel-body { padding: 1.5rem; }
  .nx-skel-ln { height: 10px; border-radius: 0; margin-bottom: 0.65rem; background: linear-gradient(90deg, var(--cream-dark) 25%, var(--cream) 50%, var(--cream-dark) 75%); background-size: 200% 100%; animation: nx-shim 1.4s infinite; }
  .nx-skel-ln.w60 { width: 60%; } .nx-skel-ln.w40 { width: 40%; }

  .nx-overlay { position: fixed; inset: 0; background: rgba(26,23,20,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 1rem; }
  .nx-modal { background: var(--white); border: 1px solid var(--border); width: 100%; max-width: 480px; position: relative; box-shadow: 0 24px 60px rgba(26,23,20,0.2); max-height: 90vh; overflow-y: auto; }
  .nx-modal-x { position: absolute; top: 1rem; right: 1rem; width: 30px; height: 30px; background: none; border: 1px solid var(--border); color: var(--ink-soft); cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .nx-modal-x:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
  .nx-modal-img { width: 100%; height: 240px; object-fit: cover; display: block; }
  .nx-modal-noimg { width: 100%; height: 240px; background: var(--cream-dark); display: flex; align-items: center; justify-content: center; color: var(--ink-ghost); font-size: 0.82rem; }
  .nx-modal-body { padding: 1.75rem; }
  .nx-modal-title { font-family: 'Cormorant Garamond', serif; font-size: 1.85rem; font-weight: 200; color: var(--ink); margin-bottom: 0.5rem; letter-spacing: -0.01em; }
  .nx-modal-desc { font-size: 0.85rem; color: var(--ink-soft); line-height: 1.8; margin-bottom: 1.25rem; }
  .nx-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 1rem; }
  .nx-modal-stat { border: 1px solid var(--border); padding: 0.85rem 1rem; margin: -1px 0 0 -1px; }
  .nx-ms-lbl { font-size: 0.58rem; color: var(--ink-ghost); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 0.35rem; display: block; }
  .nx-ms-val { font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 300; color: var(--ink); display: block; }
  .nx-modal-seller { border: 1px solid var(--border); padding: 0.85rem 1rem; margin-top: -1px; }

  @keyframes nx-shim { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes nx-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes nx-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 960px) {
    .nx-hero { grid-template-columns: 1fr; }
    .nx-hero-right { display: none; }
    .nx-hero-left { padding: 4rem 2rem; border-right: none; }
    .nx-rgrid { grid-template-columns: repeat(2,1fr); }
    .nx-skel-grid { grid-template-columns: repeat(2,1fr); }
    .nx-sidebar { display: none; }
    .nx-section, .nx-cat-main { padding-left: 1.5rem; padding-right: 1.5rem; }
    .nx-nav { padding: 0 1.5rem; }
  }
  @media (max-width: 580px) {
    .nx-rgrid { grid-template-columns: 1fr; }
    .nx-hero-h1 { font-size: 3.8rem; }
    .nx-hero-stats { flex-direction: column; gap: 1.5rem; }
    .nx-hstat:not(:last-child) { border-right: none; margin-right: 0; padding-right: 0; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
  }
`;

if (!document.getElementById('nx-main-styles')) {
  const el = document.createElement('style');
  el.id = 'nx-main-styles';
  el.textContent = STYLES;
  document.head.appendChild(el);
}

// ── Modal detalle ─────────────────────────────────────────────────────────────
function ProductDetailModal({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then(({ data }) => setProduct(data.product))
      .catch(err => setError(err.response?.data?.error || 'No encontrado'))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const stars = n => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  return (
    <div className="nx-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="nx-modal">
        <button className="nx-modal-x" onClick={onClose}>✕</button>
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-ghost)', fontSize: '0.85rem' }}>Cargando…</div>}
        {error   && <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626', fontSize: '0.85rem' }}>{error}</div>}
        {!loading && !error && product && <>
          {product.imagenes?.[0]?.url
            ? <img src={product.imagenes[0].url} alt={product.titulo} className="nx-modal-img" />
            : <div className="nx-modal-noimg">Sin imagen</div>}
          <div className="nx-modal-body">
            <div className="nx-modal-title">{product.titulo}</div>
            {product.descripcion && <div className="nx-modal-desc">{product.descripcion}</div>}
            <div className="nx-modal-grid">
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Precio</span>
                <span className="nx-ms-val" style={{ color: 'var(--amber)' }}>${parseFloat(product.precio).toFixed(2)}</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Stock</span>
                <span className="nx-ms-val">{product.stock} uds.</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Estado</span>
                <span className="nx-ms-val" style={{ textTransform: 'capitalize' }}>{product.condicion || 'nuevo'}</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Calificación</span>
                <span className="nx-ms-val" style={{ fontSize: '0.85rem', color: 'var(--amber)' }}>{stars(product.promedioCalificacion)}</span>
              </div>
            </div>
            {product.vendedor && (
              <div className="nx-modal-seller">
                <span className="nx-ms-lbl" style={{ display: 'block', marginBottom: '0.3rem' }}>Vendedor</span>
                <div style={{ fontSize: '0.88rem', color: 'var(--ink)', fontWeight: 500 }}>{product.vendedor.nombres} {product.vendedor.apellidos}</div>
                {product.vendedor.correo && <div style={{ fontSize: '0.75rem', color: 'var(--ink-ghost)', marginTop: '0.15rem' }}>{product.vendedor.correo}</div>}
              </div>
            )}
          </div>
        </>}
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function Home() {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [recentProducts, setRecent]     = useState([]);
  const [recentLoading, setRecentLoad]  = useState(true);
  const [ddOpen, setDdOpen]             = useState(false);
  const [searchTerm, setSearch]         = useState('');
  const [sortBy, setSortBy]             = useState('newest');
  const [viewMode, setView]             = useState('grid');
  const [currentPage, setPage]          = useState(1);
  const [favorites, setFavs]            = useState([]);
  const [selectedId, setSelectedId]     = useState(null);
  const [fCond, setFCond]               = useState('');
  const [fMaxPrice, setFMaxPrice]       = useState(1000);
  const [fMinRating, setFMinRating]     = useState(0);
  const [qtys, setQtys]                 = useState({});

  const navigate  = useNavigate();
  const token     = localStorage.getItem('token');
  const user      = JSON.parse(localStorage.getItem('user') || 'null');
  const PER_PAGE  = 12;
  const initials  = user ? `${(user.nombres || '')[0] || ''}${(user.apellidos || '')[0] || ''}`.toUpperCase() : '';
  const { theme, toggleTheme } = useTheme();

  const { cart, error: cartErr, success: cartOk, addToCart, setError: setCartErr } = useHybridCart();

  useEffect(() => {
    api.get('/products/recent')
      .then(({ data }) => setRecent(data.products || []))
      .catch(() => setRecent([]))
      .finally(() => setRecentLoad(false));
  }, []);

  const fetchProducts = useCallback(async (params = {}) => {
    try { setLoading(true); const { data } = await api.get('/products', { params }); setProducts(data.products || []); }
    catch { setError('Error al cargar productos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const h = e => { if (ddOpen && !e.target.closest('.nx-user-wrap')) setDdOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [ddOpen]);

  const doSearch  = () => { setPage(1); fetchProducts({ search: searchTerm || undefined, condition: fCond || undefined, maxPrice: fMaxPrice, minRating: fMinRating > 0 ? fMinRating : undefined }); };
  const doAddToCart = (p, e) => { e.stopPropagation(); const qty = Number(qtys[p.id] || 1); if (!Number.isInteger(qty) || qty < 1) { setCartErr('Cantidad inválida'); return; } addToCart(p.id, qty, { name: p.titulo, price: p.precio }); setQtys(prev => ({ ...prev, [p.id]: 1 })); };

  const sorted   = [...products].sort((a, b) => {
    if (sortBy === 'price-low')  return (a.precio || 0) - (b.precio || 0);
    if (sortBy === 'price-high') return (b.precio || 0) - (a.precio || 0);
    if (sortBy === 'rating')     return (b.promedioCalificacion || 0) - (a.promedioCalificacion || 0);
    return 0;
  });
  const totalPgs = Math.ceil(sorted.length / PER_PAGE);
  const start    = (currentPage - 1) * PER_PAGE;
  const shown    = sorted.slice(start, start + PER_PAGE);
  const toggleFav = id => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  const scrollTo  = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const stars     = n  => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0));

  return (
    <div className="nx-root">

      {/* ── NAV ── */}
      <nav className="nx-nav">
        <Link to="/" className="nx-nav-brand">
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nx-nav-wordmark">Nexont</span>
        </Link>
        <div className="nx-nav-sep" />
        <div className="nx-nav-search">
          <span style={{ color: 'var(--ink-ghost)', fontSize: '0.9rem' }}>⌕</span>
          <input placeholder="Buscar productos…" value={searchTerm} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} />
        </div>
        <div className="nx-nav-gap" />
        <div className="nx-nav-actions">
          {/* Toggle tema */}
          <button
            className="nx-icon-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {token && user && (
            <button className="nx-icon-btn" onClick={() => navigate('/cart')} title="Carrito">
              🛒
              {cart.totalItems > 0 && <span className="nx-cart-dot">{cart.totalItems}</span>}
            </button>
          )}
          <button className="nx-icon-btn" onClick={() => scrollTo('catalogo')} title="Catálogo">⊞</button>

          {token && user?.esVendedorVerificado && (
            <button className="nx-nav-cta" onClick={() => navigate('/my-products')}>+ Publicar</button>
          )}

          {token && user ? (
            <div className="nx-user-wrap">
              <div className="nx-user-pill" onClick={() => setDdOpen(o => !o)}>
                <div className="nx-user-av">{initials}</div>
                <span className="nx-user-name">{user.nombres}</span>
                <span className="nx-user-chev">▾</span>
              </div>
              {ddOpen && (
                <div className="nx-dropdown">
                  <div className="nx-dd-sec">
                    <div className="nx-dd-lbl">Mi cuenta</div>
                    <div className="nx-dd-item">👤 Mi perfil</div>
                    <div className="nx-dd-item" onClick={() => { setDdOpen(false); navigate('/orders'); }}>📦 Mis órdenes</div>
                  </div>
                  {user.esVendedorVerificado && (
                    <div className="nx-dd-sec">
                      <div className="nx-dd-lbl">Vendedor</div>
                      <div className="nx-dd-item" onClick={() => { setDdOpen(false); navigate('/my-products'); }}>🏪 Mis productos</div>
                      <div className="nx-dd-item" onClick={() => { setDdOpen(false); navigate('/my-products'); }}>➕ Agregar producto</div>
                    </div>
                  )}
                  {!user.esVendedorVerificado && (
                    <div className="nx-dd-sec">
                      <div className="nx-dd-item highlight">⭐ Verificarse como vendedor</div>
                    </div>
                  )}
                  <div className="nx-dd-sec">
                    <div className="nx-dd-item danger" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }}>
                      🚪 Cerrar sesión
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nx-btn-outline" style={{ height: 38, fontSize: '0.75rem' }}>Ingresar</Link>
              <Link to="/register" className="nx-nav-cta">Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="nx-hero">
        <div className="nx-hero-left">
          <div className="nx-hero-season">Marketplace Colombiano</div>
          <h1 className="nx-hero-h1">
            Descubre lo<br />
            <em>extraordinario</em>
            en cada objeto
          </h1>
          <p className="nx-hero-p">
            Vendedores verificados, productos únicos y la experiencia
            de compra más refinada de Colombia.
          </p>
          <div className="nx-hero-actions">
            <button className="nx-btn-primary" onClick={() => scrollTo('catalogo')}>Explorar catálogo →</button>
            {!token && <Link to="/register" className="nx-btn-outline">Vender aquí</Link>}
            {token && user?.esVendedorVerificado && (
              <button className="nx-btn-outline" onClick={() => navigate('/my-products')}>Publicar producto</button>
            )}
          </div>
          <div className="nx-hero-stats">
            <div className="nx-hstat">
              <span className="nx-hstat-val">{products.length > 0 ? products.length : '—'}</span>
              <span className="nx-hstat-lbl">Productos activos</span>
            </div>
            <div className="nx-hstat">
              <span className="nx-hstat-val">100%</span>
              <span className="nx-hstat-lbl">Vendedores verificados</span>
            </div>
            <div className="nx-hstat">
              <span className="nx-hstat-val">24h</span>
              <span className="nx-hstat-lbl">Soporte disponible</span>
            </div>
          </div>
        </div>

        {/* Live feed */}
        <div className="nx-hero-right">
          <div className="nx-hero-right-head">
            <span className="nx-hero-right-title">Últimas publicaciones</span>
            <span className="nx-live-pill"><span className="nx-live-dot" /> En vivo</span>
          </div>
          <div className="nx-feed-list">
            {recentLoading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="nx-feed-item">
                <div className="nx-feed-thumb" style={{ background: 'var(--cream-dark)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 10, width: '65%', background: 'var(--cream-dark)', marginBottom: 6 }} />
                  <div style={{ height: 8, width: '35%', background: 'var(--cream-dark)' }} />
                </div>
              </div>
            ))}
            {!recentLoading && recentProducts.length === 0 && (
              <div className="nx-hero-right-empty">Aún no hay publicaciones.<br />Sé el primero en publicar.</div>
            )}
            {!recentLoading && recentProducts.slice(0, 6).map(p => (
              <div key={p.id} className="nx-feed-item" onClick={() => setSelectedId(p.id)}>
                <div className="nx-feed-thumb">
                  {p.imagenes?.[0]?.url
                    ? <img src={p.imagenes[0].url} alt={p.titulo} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--ink-ghost)' }}>📦</div>
                  }
                </div>
                <div className="nx-feed-info">
                  <div className="nx-feed-name">{p.titulo}</div>
                  <div className="nx-feed-cond">{p.condicion || 'NUEVO'} · {stars(p.promedioCalificacion)}</div>
                </div>
                <div className="nx-feed-price">${parseFloat(p.precio || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS RECIENTES ── */}
      <section className="nx-section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="nx-section-head">
          <div>
            <span className="nx-section-eyebrow">Últimas publicaciones</span>
            <h2 className="nx-section-title">Productos Recientes</h2>
          </div>
          <button className="nx-section-link" onClick={() => scrollTo('catalogo')}>Ver catálogo completo →</button>
        </div>

        {recentLoading && (
          <div className="nx-skel-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="nx-skel-card">
                <div className="nx-skel-img" />
                <div className="nx-skel-body">
                  <div className="nx-skel-ln" /><div className="nx-skel-ln w60" /><div className="nx-skel-ln w40" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!recentLoading && recentProducts.length === 0 && (
          <div className="nx-empty">
            <div className="nx-empty-title">El marketplace está por florecer</div>
            <p className="nx-empty-txt">Sé el primero en publicar un producto y llega a miles de compradores.</p>
            {token && user?.esVendedorVerificado
              ? <button className="nx-btn-primary" onClick={() => navigate('/my-products')}>Publicar primer producto →</button>
              : <Link to="/register" className="nx-btn-primary">Comenzar a vender →</Link>
            }
          </div>
        )}

        {!recentLoading && recentProducts.length > 0 && (
          <>
            <div className="nx-rgrid" style={{ borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
              {recentProducts.map(p => (
                <div key={p.id} className="nx-rcard" onClick={() => setSelectedId(p.id)}>
                  <div className="nx-rcard-img">
                    <img
                      src={p.imagenes?.[0]?.url || `https://via.placeholder.com/480x360/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`}
                      alt={p.titulo}
                      onError={e => { e.target.src = `https://via.placeholder.com/480x360/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`; }}
                    />
                    <span className="nx-rcard-badge">{p.condicion || 'NUEVO'}</span>
                  </div>
                  <div className="nx-rcard-body">
                    <div className="nx-rcard-name">{p.titulo}</div>
                    <div className="nx-rcard-seller">{p.vendedor?.nombres} {p.vendedor?.apellidos}</div>
                    <div className="nx-rcard-stars">{stars(p.promedioCalificacion)}</div>
                    <div className="nx-rcard-foot">
                      <span className="nx-rcard-price">${(parseFloat(p.precio) || 0).toFixed(2)}</span>
                      <button className="nx-detail-link" onClick={e => { e.stopPropagation(); setSelectedId(p.id); }}>Ver detalle</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button className="nx-btn-outline" onClick={() => scrollTo('catalogo')}>Ver todos los productos ↓</button>
            </div>
          </>
        )}
      </section>

      <hr className="nx-divider" />

      {/* ── CATÁLOGO COMPLETO ── */}
      <div id="catalogo" className="nx-catalog">
        <aside className="nx-sidebar">
          <div className="nx-sb-head"><span className="nx-sb-title">Filtros</span></div>
          <div className="nx-sb-sec">
            <span className="nx-sb-sec-title">Estado</span>
            {['', 'NUEVO', 'USADO', 'REACONDICIONADO'].map(c => (
              <label key={c} className="nx-sb-radio">
                <input type="radio" name="cond" value={c} checked={fCond === c} onChange={() => setFCond(c)} />
                <span>{c === '' ? 'Todos' : c.charAt(0) + c.slice(1).toLowerCase()}</span>
              </label>
            ))}
          </div>
          <div className="nx-sb-sec">
            <span className="nx-sb-sec-title">Precio máximo</span>
            <input type="range" min="0" max="1000" step="10" value={fMaxPrice} onChange={e => setFMaxPrice(Number(e.target.value))} className="nx-sb-range" />
            <div className="nx-sb-range-row">
              <span>$0</span><span className="nx-sb-range-val">${fMaxPrice}</span><span>$1000+</span>
            </div>
          </div>
          <div className="nx-sb-sec">
            <span className="nx-sb-sec-title">Calificación mín.</span>
            {[0, 1, 2, 3, 4, 5].map(r => (
              <label key={r} className="nx-sb-radio">
                <input type="radio" name="rat" value={r} checked={fMinRating === r} onChange={() => setFMinRating(r)} />
                <span style={{ color: r === 0 ? 'var(--ink-mid)' : 'var(--amber)' }}>{r === 0 ? 'Todas' : stars(r)}</span>
              </label>
            ))}
          </div>
          <div className="nx-sb-btns">
            <button className="nx-sb-apply" onClick={doSearch}>Aplicar filtros</button>
            <button className="nx-sb-clear" onClick={() => { setFCond(''); setFMaxPrice(1000); setFMinRating(0); setSearch(''); fetchProducts(); }}>Limpiar</button>
          </div>
        </aside>

        <div className="nx-cat-main">
          <div className="nx-cat-heading">
            <span className="nx-section-eyebrow">Catálogo completo</span>
            <h2 className="nx-section-title">Todos los productos</h2>
          </div>

          {cartErr && <div className="nx-alert-err">{cartErr}</div>}
          {cartOk  && <div className="nx-alert-ok">{cartOk}</div>}

          <div className="nx-cat-searchbar">
            <input placeholder="Buscar productos…" value={searchTerm} onChange={e => { setSearch(e.target.value); setPage(1); }} onKeyDown={e => e.key === 'Enter' && doSearch()} />
            <button onClick={doSearch}>Buscar</button>
          </div>

          <div className="nx-cat-toolbar">
            <div className="nx-cat-count">
              <b>{start + 1}–{Math.min(start + PER_PAGE, sorted.length)}</b> de <b>{sorted.length}</b> productos
            </div>
            <div className="nx-toolbar-r">
              <div className="nx-view-toggle">
                <button className={`nx-vbtn ${viewMode === 'grid' ? 'on' : ''}`} onClick={() => setView('grid')}>⊞</button>
                <button className={`nx-vbtn ${viewMode === 'list' ? 'on' : ''}`} onClick={() => setView('list')}>≡</button>
              </div>
              <select className="nx-sortsel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="newest">Más reciente</option>
                <option value="price-low">Menor precio</option>
                <option value="price-high">Mayor precio</option>
                <option value="rating">Mejor calificación</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ink-ghost)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Cargando productos…</div>
          ) : error ? (
            <div className="nx-alert-err">{error}</div>
          ) : shown.length === 0 ? (
            <div className="nx-empty">
              <div className="nx-empty-title">Sin resultados</div>
              <p className="nx-empty-txt">No encontramos productos con esos criterios.</p>
            </div>
          ) : (
            <div className={`nx-pgrid ${viewMode === 'list' ? 'list' : ''}`} style={{ borderTop: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
              {shown.map(p => (
                <div key={p.id} className="nx-pcard" onClick={() => setSelectedId(p.id)}>
                  <div className="nx-pcard-img">
                    <img
                      src={p.imagenes?.[0]?.url || `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`}
                      alt={p.titulo}
                      onError={e => { e.target.src = `https://via.placeholder.com/300/EDE8DF/7A7268?text=${encodeURIComponent(p.titulo)}`; }}
                    />
                    <span className="nx-pcard-badge">{p.condicion || 'NUEVO'}</span>
                    <button className="nx-fav" onClick={e => { e.stopPropagation(); toggleFav(p.id); }}>
                      {favorites.includes(p.id) ? '❤️' : '♡'}
                    </button>
                  </div>
                  <div className="nx-pcard-body">
                    <div className="nx-pcard-name">{p.titulo}</div>
                    <div className="nx-pcard-price">${(parseFloat(p.precio) || 0).toFixed(2)}</div>
                    <div className="nx-pcard-stars">{stars(p.promedioCalificacion)}</div>
                    <div className="nx-pcard-add-row" onClick={e => e.stopPropagation()}>
                      <input type="number" min="1" className="nx-qty" value={qtys[p.id] || 1} onChange={e => setQtys(prev => ({ ...prev, [p.id]: e.target.value }))} />
                      <button className={`nx-add-btn ${p.stock === 0 ? 'out' : 'ok'}`} disabled={p.stock === 0} onClick={e => doAddToCart(p, e)}>
                        {p.stock === 0 ? 'Agotado' : '+ Agregar'}
                      </button>
                    </div>
                    <div className="nx-pcard-seller">{p.vendedor?.nombres} {p.vendedor?.apellidos}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPgs > 1 && (
            <div className="nx-pages">
              <button className="nx-pg" disabled={currentPage === 1} onClick={() => setPage(p => p - 1)}>←</button>
              {Array.from({ length: totalPgs }, (_, i) => i + 1).map(pg => (
                <button key={pg} className={`nx-pg ${pg === currentPage ? 'on' : ''}`} onClick={() => setPage(pg)}>{pg}</button>
              ))}
              <button className="nx-pg" disabled={currentPage === totalPgs} onClick={() => setPage(p => p + 1)}>→</button>
            </div>
          )}
        </div>
      </div>

      {selectedId && <ProductDetailModal productId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

export default Home;