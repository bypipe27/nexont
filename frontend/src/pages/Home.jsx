import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useHybridCart } from '../hooks/useHybridCart';

// ─── Estilos globales ─────────────────────────────────────────────────────────
const HOME_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

  .nx-root {
    min-height: 100vh;
    background: #0a0908;
    font-family: 'Inter', sans-serif;
    color: #f0ece4;
    line-height: 1.6;
  }

  /* ── TOPBAR ── */
  .nx-topbar {
    position: sticky; top: 0; z-index: 200;
    height: 60px;
    background: rgba(10,9,8,0.95);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(212,163,62,0.14);
    display: flex; align-items: center;
    padding: 0 2rem; gap: 1rem;
  }
  .nx-topbar-brand {
    display: flex; align-items: center; gap: 0.65rem;
    text-decoration: none; flex-shrink: 0;
  }
  .nx-topbar-brand img { height: 30px; width: auto; }
  .nx-topbar-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem; font-weight: 800;
    color: #f0ece4; letter-spacing: 0.02em;
  }
  .nx-topbar-sep { width: 1px; height: 24px; background: rgba(212,163,62,0.18); flex-shrink: 0; }
  .nx-topbar-search {
    flex: 1; max-width: 360px;
    display: flex; align-items: center; gap: 0.5rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; padding: 0 0.85rem; height: 36px;
    transition: border-color 0.2s;
  }
  .nx-topbar-search:focus-within { border-color: rgba(212,163,62,0.3); }
  .nx-topbar-search input {
    background: none; border: none; outline: none;
    color: #f0ece4; font-size: 0.85rem;
    font-family: 'Inter', sans-serif; width: 100%;
    letter-spacing: 0.01em;
  }
  .nx-topbar-search input::placeholder { color: rgba(240,236,228,0.28); }
  .nx-topbar-kbd {
    font-size: 0.62rem; color: rgba(240,236,228,0.2);
    border: 1px solid rgba(240,236,228,0.1);
    border-radius: 3px; padding: 0.1rem 0.3rem; flex-shrink: 0;
  }
  .nx-topbar-gap { flex: 1; }
  .nx-topbar-right { display: flex; align-items: center; gap: 0.5rem; }

  .nx-icon-btn {
    width: 36px; height: 36px; border-radius: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: rgba(240,236,228,0.55); font-size: 1rem;
    transition: all 0.18s; position: relative;
    text-decoration: none;
  }
  .nx-icon-btn:hover { background: rgba(212,163,62,0.1); color: #d4a33e; border-color: rgba(212,163,62,0.25); }

  .nx-cart-badge {
    position: absolute; top: -5px; right: -5px;
    width: 16px; height: 16px; border-radius: 50%;
    background: #d4a33e; color: #0a0908;
    font-size: 0.58rem; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #0a0908;
  }

  .nx-publish-btn {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 0.8rem; letter-spacing: 0.04em;
    padding: 0 1.1rem; height: 36px; border-radius: 7px;
    border: none; cursor: pointer; transition: all 0.2s;
    text-decoration: none; white-space: nowrap;
  }
  .nx-publish-btn:hover { background: #e8b84b; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,163,62,0.35); }

  /* ── User pill / dropdown ── */
  .nx-user-wrap { position: relative; }
  .nx-user-pill {
    display: flex; align-items: center; gap: 0.55rem;
    padding: 0 0.85rem 0 0.45rem; height: 36px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; cursor: pointer; transition: all 0.18s;
  }
  .nx-user-pill:hover { border-color: rgba(212,163,62,0.28); }
  .nx-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, #d4a33e, #8b6914);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.68rem; font-weight: 800; color: #0a0908; flex-shrink: 0;
  }
  .nx-user-name { font-size: 0.82rem; color: #f0ece4; font-weight: 500; letter-spacing: 0.01em; }
  .nx-chevron { font-size: 0.62rem; color: rgba(240,236,228,0.35); }

  .nx-dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: #141210; border: 1px solid rgba(212,163,62,0.18);
    border-radius: 9px; min-width: 210px; z-index: 1000;
    box-shadow: 0 20px 50px rgba(0,0,0,0.65); overflow: hidden;
  }
  .nx-dd-section { padding: 0.35rem 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .nx-dd-section:last-child { border-bottom: none; }
  .nx-dd-item {
    display: flex; align-items: center; gap: 0.65rem;
    padding: 0.7rem 1rem; cursor: pointer;
    font-size: 0.84rem; color: rgba(240,236,228,0.65);
    transition: all 0.15s; letter-spacing: 0.01em;
  }
  .nx-dd-item:hover { background: rgba(212,163,62,0.09); color: #d4a33e; }
  .nx-dd-item.nx-dd-danger:hover { background: rgba(239,68,68,0.08); color: #ef4444; }
  .nx-dd-item.nx-dd-highlight { color: #d4a33e; background: rgba(212,163,62,0.06); }
  .nx-dd-label {
    padding: 0.5rem 1rem 0.2rem;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; color: rgba(240,236,228,0.25);
  }

  /* ── HERO ── */
  .nx-hero {
    position: relative; overflow: hidden;
    min-height: calc(100vh - 60px);
    display: flex; align-items: center;
  }
  .nx-hero-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 65% 55% at 68% 38%, rgba(212,163,62,0.13) 0%, transparent 62%),
      radial-gradient(ellipse 45% 65% at 8% 85%, rgba(139,105,20,0.07) 0%, transparent 52%),
      #0a0908;
  }
  .nx-hero-grid {
    position: absolute; inset: 0; opacity: 0.025;
    background-image:
      linear-gradient(rgba(212,163,62,1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,163,62,1) 1px, transparent 1px);
    background-size: 64px 64px;
  }
  .nx-hero-sideline {
    position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
    background: linear-gradient(to bottom, transparent 0%, #d4a33e 20%, #d4a33e 80%, transparent 100%);
    opacity: 0.45;
  }
  .nx-hero-inner {
    position: relative; z-index: 2;
    max-width: 1280px; margin: 0 auto; padding: 5rem 2.5rem;
    width: 100%;
    display: grid; grid-template-columns: 1.15fr 0.85fr;
    gap: 5rem; align-items: center;
  }

  /* Hero left */
  .nx-hero-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(212,163,62,0.1); border: 1px solid rgba(212,163,62,0.22);
    color: #d4a33e; font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase;
    padding: 0.38rem 1rem; border-radius: 2rem;
    margin-bottom: 2rem;
    animation: nxUp 0.5s ease both;
  }
  .nx-hero-h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.8rem, 4.5vw, 4.4rem);
    font-weight: 800; line-height: 1.05;
    color: #f0ece4; margin-bottom: 1.75rem;
    letter-spacing: -0.01em;
    animation: nxUp 0.52s ease 0.07s both;
  }
  .nx-hero-h1 em { font-style: italic; color: #d4a33e; }
  .nx-hero-p {
    font-size: 1.05rem; line-height: 1.9;
    color: rgba(240,236,228,0.48); font-weight: 300;
    max-width: 440px; margin-bottom: 2.75rem;
    animation: nxUp 0.52s ease 0.14s both;
    letter-spacing: 0.01em;
  }
  .nx-hero-actions {
    display: flex; gap: 0.85rem; flex-wrap: wrap;
    animation: nxUp 0.52s ease 0.21s both;
  }
  .nx-hero-cta {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 0.88rem; letter-spacing: 0.04em;
    padding: 0 1.75rem; height: 46px; border-radius: 8px;
    border: none; cursor: pointer; transition: all 0.2s; text-decoration: none;
  }
  .nx-hero-cta:hover { background: #e8b84b; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(212,163,62,0.32); }
  .nx-hero-ghost {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: transparent; color: rgba(240,236,228,0.58);
    font-family: 'Inter', sans-serif; font-weight: 500;
    font-size: 0.88rem; padding: 0 1.75rem; height: 46px;
    border-radius: 8px; border: 1px solid rgba(240,236,228,0.14);
    cursor: pointer; transition: all 0.2s; text-decoration: none;
  }
  .nx-hero-ghost:hover { border-color: rgba(212,163,62,0.45); color: #d4a33e; }

  /* Hero stats */
  .nx-hero-stats {
    display: flex; gap: 0; margin-top: 3.5rem;
    border: 1px solid rgba(212,163,62,0.12); border-radius: 9px; overflow: hidden;
    animation: nxUp 0.52s ease 0.28s both;
  }
  .nx-hstat {
    flex: 1; padding: 1.1rem 1.35rem;
    border-right: 1px solid rgba(212,163,62,0.1);
    background: rgba(212,163,62,0.025);
  }
  .nx-hstat:last-child { border-right: none; }
  .nx-hstat-val {
    font-family: 'Syne', sans-serif; font-size: 1.75rem;
    font-weight: 800; color: #f0ece4; display: block; line-height: 1;
    margin-bottom: 0.35rem;
  }
  .nx-hstat-lbl {
    font-size: 0.72rem; color: rgba(240,236,228,0.35);
    text-transform: uppercase; letter-spacing: 0.1em; display: block;
  }
  .nx-hstat-delta { font-size: 0.72rem; color: #4ade80; font-weight: 600; margin-top: 0.25rem; display: block; }

  /* Hero right panel */
  .nx-hero-panel {
    background: rgba(255,255,255,0.028);
    border: 1px solid rgba(212,163,62,0.12);
    border-radius: 12px; overflow: hidden;
    animation: nxUp 0.58s ease 0.16s both;
    position: relative;
  }
  .nx-panel-head {
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid rgba(212,163,62,0.08);
    display: flex; align-items: center; justify-content: space-between;
  }
  .nx-panel-title {
    font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 700;
    color: rgba(240,236,228,0.5); letter-spacing: 0.12em; text-transform: uppercase;
  }
  .nx-live-pill {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.7rem; color: #4ade80; font-weight: 600; letter-spacing: 0.03em;
  }
  .nx-live-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #4ade80;
    animation: nxPulse 2s ease infinite;
  }
  .nx-panel-list { padding: 0.4rem 0; }
  .nx-pi {
    display: flex; align-items: center; gap: 1rem;
    padding: 0.75rem 1.4rem; cursor: pointer; transition: background 0.15s;
  }
  .nx-pi:hover { background: rgba(212,163,62,0.055); }
  .nx-pi-thumb {
    width: 40px; height: 40px; border-radius: 7px;
    background: rgba(212,163,62,0.08); overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
  }
  .nx-pi-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .nx-pi-info { flex: 1; overflow: hidden; }
  .nx-pi-name {
    font-size: 0.82rem; font-weight: 500; color: #f0ece4;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 0.18rem; letter-spacing: 0.01em;
  }
  .nx-pi-meta { font-size: 0.7rem; color: rgba(240,236,228,0.32); letter-spacing: 0.01em; }
  .nx-pi-price {
    font-family: 'Syne', sans-serif; font-size: 0.85rem;
    font-weight: 800; color: #d4a33e; flex-shrink: 0;
  }

  /* Floating cards */
  .nx-fc {
    position: absolute;
    background: #141210; border: 1px solid rgba(212,163,62,0.2);
    border-radius: 8px; padding: 0.7rem 1rem;
    box-shadow: 0 16px 40px rgba(0,0,0,0.55);
  }
  .nx-fc-tl { top: -16px; left: -16px; animation: nxFloat 4s ease-in-out infinite; }
  .nx-fc-br { bottom: -12px; right: -12px; animation: nxFloat 4s ease-in-out 2s infinite; }
  .nx-fc-lbl { font-size: 0.64rem; color: rgba(240,236,228,0.35); margin-bottom: 0.2rem; letter-spacing: 0.04em; }
  .nx-fc-val { font-family: 'Syne', sans-serif; font-size: 0.88rem; font-weight: 800; color: #f0ece4; }
  .nx-fc-sub { font-size: 0.64rem; color: #4ade80; margin-top: 0.18rem; font-weight: 600; }

  /* ── RECENTS SECTION ── */
  .nx-recents {
    padding: 5.5rem 0 4.5rem;
    border-top: 1px solid rgba(212,163,62,0.08);
  }
  .nx-container { max-width: 1280px; margin: 0 auto; padding: 0 2.5rem; }

  .nx-sec-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-bottom: 2.25rem; flex-wrap: wrap; gap: 1rem;
  }
  .nx-eyebrow {
    display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.65rem;
  }
  .nx-eyebrow-bar { width: 22px; height: 2px; background: #d4a33e; border-radius: 2px; }
  .nx-eyebrow-txt {
    font-size: 0.67rem; font-weight: 700; letter-spacing: 0.22em;
    text-transform: uppercase; color: #d4a33e;
  }
  .nx-sec-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 800; color: #f0ece4; line-height: 1.1;
    margin-bottom: 0.5rem; letter-spacing: -0.01em;
  }
  .nx-sec-sub {
    font-size: 0.88rem; color: rgba(240,236,228,0.38);
    font-weight: 300; line-height: 1.7; max-width: 380px;
    letter-spacing: 0.01em;
  }

  /* ── Recent cards grid ── */
  .nx-rgrid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
  .nx-rcard {
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(212,163,62,0.1);
    border-radius: 10px; overflow: hidden;
    cursor: pointer; transition: all 0.22s;
    display: flex; flex-direction: column;
  }
  .nx-rcard:hover {
    border-color: rgba(212,163,62,0.3);
    background: rgba(255,255,255,0.04);
    transform: translateY(-3px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }
  .nx-rcard-img { aspect-ratio: 16/10; overflow: hidden; background: #1a1612; position: relative; }
  .nx-rcard-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
  .nx-rcard:hover .nx-rcard-img img { transform: scale(1.05); }
  .nx-rcard-badge {
    position: absolute; top: 0.7rem; left: 0.7rem;
    background: rgba(10,9,8,0.82); border: 1px solid rgba(212,163,62,0.28);
    color: #d4a33e; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.14em; text-transform: uppercase;
    padding: 0.28rem 0.6rem; border-radius: 4px;
  }
  .nx-rcard-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
  .nx-rcard-name {
    font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700;
    color: #f0ece4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    letter-spacing: 0.01em;
  }
  .nx-rcard-seller { font-size: 0.72rem; color: rgba(240,236,228,0.3); letter-spacing: 0.01em; }
  .nx-rcard-stars { color: #d4a33e; font-size: 0.72rem; letter-spacing: 0.06em; }
  .nx-rcard-foot {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: auto; padding-top: 0.9rem;
    border-top: 1px solid rgba(212,163,62,0.08);
  }
  .nx-rcard-price {
    font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 800; color: #f0ece4;
  }
  .nx-detail-btn {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.72rem; font-weight: 600; color: rgba(240,236,228,0.38);
    background: none; border: 1px solid rgba(240,236,228,0.1);
    padding: 0.32rem 0.75rem; border-radius: 5px;
    cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
    letter-spacing: 0.01em;
  }
  .nx-detail-btn:hover { border-color: #d4a33e; color: #d4a33e; }

  /* Empty state */
  .nx-empty {
    padding: 5rem 2rem; text-align: center;
    border: 1px dashed rgba(212,163,62,0.14); border-radius: 10px;
    background: rgba(212,163,62,0.018);
  }
  .nx-empty-icon { font-size: 3.5rem; margin-bottom: 1.5rem; opacity: 0.28; display: block; }
  .nx-empty-title {
    font-family: 'Syne', sans-serif; font-size: 1.35rem; font-weight: 800;
    color: #f0ece4; margin-bottom: 0.75rem; letter-spacing: -0.01em;
  }
  .nx-empty-txt {
    font-size: 0.88rem; color: rgba(240,236,228,0.35); max-width: 340px;
    margin: 0 auto 2rem; line-height: 1.75; letter-spacing: 0.01em;
  }

  /* View more */
  .nx-viewmore { text-align: center; margin-top: 2.75rem; }
  .nx-outline-btn {
    display: inline-flex; align-items: center; gap: 0.55rem;
    background: transparent; color: rgba(240,236,228,0.45);
    font-family: 'Inter', sans-serif; font-size: 0.82rem; font-weight: 500;
    padding: 0 1.75rem; height: 40px; border-radius: 7px;
    border: 1px solid rgba(240,236,228,0.1);
    cursor: pointer; transition: all 0.2s; letter-spacing: 0.01em;
    text-decoration: none;
  }
  .nx-outline-btn:hover { border-color: #d4a33e; color: #d4a33e; }

  /* ── DIVIDER ── */
  .nx-hr { border: none; border-top: 1px solid rgba(212,163,62,0.08); margin: 0; }

  /* ── CATALOG ── */
  .nx-catalog { padding: 4.5rem 0 5.5rem; }
  .nx-catalog-layout { display: flex; gap: 1.75rem; align-items: flex-start; }

  /* Sidebar */
  .nx-sidebar {
    width: 230px; flex-shrink: 0;
    background: rgba(255,255,255,0.022);
    border: 1px solid rgba(212,163,62,0.1);
    border-radius: 9px; overflow: hidden;
    position: sticky; top: 76px;
  }
  .nx-sb-head {
    padding: 0.9rem 1.15rem;
    border-bottom: 1px solid rgba(212,163,62,0.08);
  }
  .nx-sb-title {
    font-family: 'Syne', sans-serif; font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase; color: rgba(240,236,228,0.38);
  }
  .nx-sb-sec {
    padding: 1rem 1.15rem;
    border-bottom: 1px solid rgba(212,163,62,0.06);
  }
  .nx-sb-sec:last-child { border-bottom: none; }
  .nx-sb-sec-title {
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.14em;
    text-transform: uppercase; color: rgba(240,236,228,0.3);
    margin-bottom: 0.75rem; display: block;
  }
  .nx-radio {
    display: flex; align-items: center; gap: 0.55rem;
    margin-bottom: 0.55rem; cursor: pointer;
  }
  .nx-radio input { accent-color: #d4a33e; cursor: pointer; width: 14px; height: 14px; }
  .nx-radio span { font-size: 0.82rem; color: rgba(240,236,228,0.55); letter-spacing: 0.01em; }
  .nx-range { width: 100%; accent-color: #d4a33e; cursor: pointer; margin-bottom: 0.5rem; }
  .nx-range-row {
    display: flex; justify-content: space-between;
    font-size: 0.7rem; color: rgba(240,236,228,0.28);
  }
  .nx-range-val { font-weight: 700; color: #d4a33e; }
  .nx-sb-btns { padding: 1rem 1.15rem; display: flex; flex-direction: column; gap: 0.55rem; }
  .nx-sb-apply {
    width: 100%; height: 34px; border-radius: 6px;
    background: #d4a33e; color: #0a0908;
    font-family: 'Syne', sans-serif; font-weight: 800;
    font-size: 0.74rem; letter-spacing: 0.05em;
    border: none; cursor: pointer; transition: background 0.18s;
  }
  .nx-sb-apply:hover { background: #e8b84b; }
  .nx-sb-clear {
    width: 100%; height: 34px; border-radius: 6px;
    background: transparent; color: rgba(240,236,228,0.32);
    font-size: 0.74rem; border: 1px solid rgba(240,236,228,0.09);
    cursor: pointer; transition: all 0.18s; font-family: 'Inter', sans-serif;
  }
  .nx-sb-clear:hover { border-color: rgba(240,236,228,0.22); color: rgba(240,236,228,0.6); }

  /* Catalog main */
  .nx-cat-main { flex: 1; min-width: 0; }
  .nx-searchbar { display: flex; gap: 0.6rem; margin-bottom: 1.4rem; }
  .nx-searchbar input {
    flex: 1; height: 38px; padding: 0 1rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(212,163,62,0.12); border-radius: 7px;
    color: #f0ece4; font-size: 0.85rem; outline: none;
    font-family: 'Inter', sans-serif; transition: border-color 0.2s;
    letter-spacing: 0.01em;
  }
  .nx-searchbar input:focus { border-color: rgba(212,163,62,0.35); }
  .nx-searchbar input::placeholder { color: rgba(240,236,228,0.22); }
  .nx-searchbar button {
    height: 38px; padding: 0 1.25rem; border-radius: 7px;
    background: rgba(212,163,62,0.12); color: #d4a33e;
    border: 1px solid rgba(212,163,62,0.22); cursor: pointer;
    font-size: 0.8rem; font-weight: 600; transition: all 0.18s;
    font-family: 'Inter', sans-serif; letter-spacing: 0.02em;
  }
  .nx-searchbar button:hover { background: rgba(212,163,62,0.22); }

  .nx-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;
  }
  .nx-count { font-size: 0.8rem; color: rgba(240,236,228,0.32); letter-spacing: 0.01em; }
  .nx-count b { color: rgba(240,236,228,0.7); }
  .nx-toolbar-r { display: flex; align-items: center; gap: 0.5rem; }
  .nx-viewtoggle {
    display: flex; border: 1px solid rgba(212,163,62,0.12); border-radius: 6px; overflow: hidden;
  }
  .nx-vbtn {
    width: 33px; height: 31px; display: flex; align-items: center; justify-content: center;
    background: transparent; border: none; cursor: pointer;
    color: rgba(240,236,228,0.28); font-size: 1rem; transition: all 0.15s;
  }
  .nx-vbtn.on { background: rgba(212,163,62,0.12); color: #d4a33e; }
  .nx-sortsel {
    height: 31px; padding: 0 0.75rem;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(212,163,62,0.12);
    border-radius: 6px; color: rgba(240,236,228,0.55); font-size: 0.77rem;
    cursor: pointer; font-family: 'Inter', sans-serif; outline: none;
  }
  .nx-sortsel option { background: #141210; }

  /* Product cards */
  .nx-pgrid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(195px, 1fr));
    gap: 1.1rem; margin-bottom: 2rem;
  }
  .nx-pgrid.nx-list { grid-template-columns: 1fr; }
  .nx-pcard {
    background: rgba(255,255,255,0.022);
    border: 1px solid rgba(212,163,62,0.09);
    border-radius: 9px; overflow: hidden; cursor: pointer;
    transition: all 0.2s; display: flex; flex-direction: column;
  }
  .nx-pcard:hover {
    border-color: rgba(212,163,62,0.28);
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.35);
  }
  .nx-pcard-img { aspect-ratio: 1; overflow: hidden; background: #1a1612; position: relative; }
  .nx-pcard-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
  .nx-pcard:hover .nx-pcard-img img { transform: scale(1.06); }
  .nx-pcard-cond {
    position: absolute; top: 0.5rem; left: 0.5rem;
    background: rgba(10,9,8,0.78); border: 1px solid rgba(212,163,62,0.22);
    color: #d4a33e; font-size: 0.57rem; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 0.22rem 0.5rem; border-radius: 4px;
  }
  .nx-fav {
    position: absolute; top: 0.5rem; right: 0.5rem;
    width: 27px; height: 27px; border-radius: 50%;
    background: rgba(10,9,8,0.72); border: none;
    cursor: pointer; font-size: 0.82rem; display: flex;
    align-items: center; justify-content: center; transition: background 0.18s;
  }
  .nx-fav:hover { background: rgba(10,9,8,0.9); }
  .nx-pcard-body { padding: 0.85rem; flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }
  .nx-pcard-name {
    font-family: 'Syne', sans-serif; font-size: 0.82rem; font-weight: 700;
    color: #f0ece4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    letter-spacing: 0.01em;
  }
  .nx-pcard-price { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800; color: #d4a33e; }
  .nx-pcard-stars { color: #d4a33e; font-size: 0.65rem; letter-spacing: 0.05em; }
  .nx-pcard-addrow { display: flex; gap: 0.35rem; margin-top: 0.3rem; }
  .nx-pcard-qty {
    width: 46px; height: 28px; text-align: center;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(212,163,62,0.14);
    border-radius: 5px; color: #f0ece4; font-size: 0.77rem; outline: none;
    font-family: 'Inter', sans-serif;
  }
  .nx-pcard-add {
    flex: 1; height: 28px; border-radius: 5px; border: none;
    font-size: 0.74rem; font-weight: 700; cursor: pointer;
    font-family: 'Syne', sans-serif; transition: all 0.15s; letter-spacing: 0.02em;
  }
  .nx-pcard-add.ok { background: rgba(212,163,62,0.14); color: #d4a33e; }
  .nx-pcard-add.ok:hover { background: rgba(212,163,62,0.26); }
  .nx-pcard-add.out { background: rgba(255,255,255,0.04); color: rgba(240,236,228,0.2); cursor: not-allowed; }
  .nx-pcard-seller { font-size: 0.65rem; color: rgba(240,236,228,0.22); margin-top: 0.25rem; letter-spacing: 0.01em; }

  /* Pagination */
  .nx-pages { display: flex; justify-content: center; gap: 0.35rem; margin-top: 2.25rem; }
  .nx-pg {
    height: 32px; min-width: 32px; padding: 0 0.5rem;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(212,163,62,0.1);
    border-radius: 6px; color: rgba(240,236,228,0.42); font-size: 0.77rem;
    cursor: pointer; transition: all 0.15s; font-family: 'Inter', sans-serif;
  }
  .nx-pg:hover { border-color: rgba(212,163,62,0.35); color: #d4a33e; }
  .nx-pg.on { background: #d4a33e; color: #0a0908; border-color: #d4a33e; font-weight: 700; }
  .nx-pg:disabled { opacity: 0.22; cursor: not-allowed; }

  /* Skeleton */
  .nx-skel-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.25rem; }
  .nx-skel-card { background: rgba(255,255,255,0.022); border: 1px solid rgba(212,163,62,0.08); border-radius: 10px; overflow: hidden; }
  .nx-skel-img { aspect-ratio: 16/10; background: linear-gradient(90deg, #1a1612 25%, #221f1a 50%, #1a1612 75%); background-size: 200% 100%; animation: nxShim 1.5s infinite; }
  .nx-skel-body { padding: 1.1rem; }
  .nx-skel-ln { height: 10px; border-radius: 4px; margin-bottom: 0.65rem; background: linear-gradient(90deg, #1a1612 25%, #221f1a 50%, #1a1612 75%); background-size: 200% 100%; animation: nxShim 1.5s infinite; }
  .nx-skel-ln.w60 { width: 60%; } .nx-skel-ln.w40 { width: 40%; }

  /* Modal */
  .nx-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.72);
    backdrop-filter: blur(7px);
    display: flex; align-items: center; justify-content: center;
    z-index: 2000; padding: 1rem;
  }
  .nx-modal {
    background: #141210; border: 1px solid rgba(212,163,62,0.16);
    border-radius: 11px; width: 100%; max-width: 460px;
    position: relative; box-shadow: 0 36px 90px rgba(0,0,0,0.72);
    max-height: 90vh; overflow-y: auto;
  }
  .nx-modal-x {
    position: absolute; top: 0.9rem; right: 0.9rem;
    width: 29px; height: 29px; border-radius: 6px;
    background: rgba(255,255,255,0.06); border: none;
    color: rgba(240,236,228,0.38); cursor: pointer; font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .nx-modal-x:hover { background: rgba(255,255,255,0.12); color: #f0ece4; }
  .nx-modal-img { width: 100%; height: 200px; object-fit: cover; border-radius: 11px 11px 0 0; }
  .nx-modal-noimg {
    width: 100%; height: 200px; background: #1a1612;
    display: flex; align-items: center; justify-content: center;
    color: rgba(240,236,228,0.2); font-size: 0.85rem; border-radius: 11px 11px 0 0;
  }
  .nx-modal-body { padding: 1.4rem; }
  .nx-modal-title {
    font-family: 'Syne', sans-serif; font-size: 1.15rem; font-weight: 800;
    color: #f0ece4; margin-bottom: 0.6rem; letter-spacing: -0.01em;
  }
  .nx-modal-desc { font-size: 0.84rem; color: rgba(240,236,228,0.42); line-height: 1.75; margin-bottom: 1.1rem; letter-spacing: 0.01em; }
  .nx-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.55rem; margin-bottom: 0.8rem; }
  .nx-modal-stat { background: rgba(212,163,62,0.05); border: 1px solid rgba(212,163,62,0.1); border-radius: 7px; padding: 0.7rem 0.85rem; }
  .nx-ms-lbl { font-size: 0.62rem; color: rgba(240,236,228,0.28); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.3rem; display: block; }
  .nx-ms-val { font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: #f0ece4; display: block; }
  .nx-modal-seller { background: rgba(212,163,62,0.04); border: 1px solid rgba(212,163,62,0.1); border-radius: 7px; padding: 0.7rem 0.85rem; }

  /* ── Keyframes ── */
  @keyframes nxUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes nxFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
  @keyframes nxShim { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes nxPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.38; } }

  /* ── Alerts ── */
  .nx-alert-err { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 7px; padding: 0.65rem 1rem; margin-bottom: 1.1rem; color: #ef4444; font-size: 0.82rem; letter-spacing: 0.01em; }
  .nx-alert-ok { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); border-radius: 7px; padding: 0.65rem 1rem; margin-bottom: 1.1rem; color: #4ade80; font-size: 0.82rem; letter-spacing: 0.01em; }

  /* ── Responsive ── */
  @media (max-width: 1000px) {
    .nx-hero-inner { grid-template-columns: 1fr; gap: 3.5rem; }
    .nx-hero-panel { display: none; }
    .nx-hero-p { max-width: 100%; }
    .nx-rgrid, .nx-skel-grid { grid-template-columns: repeat(2,1fr); }
    .nx-sidebar { display: none; }
    .nx-pgrid { grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); }
  }
  @media (max-width: 600px) {
    .nx-hero-inner { padding: 3rem 1.5rem; }
    .nx-container { padding: 0 1.5rem; }
    .nx-hero-h1 { font-size: 2.4rem; }
    .nx-hero-stats { flex-direction: column; }
    .nx-hstat { border-right: none; border-bottom: 1px solid rgba(212,163,62,0.1); }
    .nx-hstat:last-child { border-bottom: none; }
    .nx-rgrid, .nx-skel-grid { grid-template-columns: 1fr; }
    .nx-topbar { padding: 0 1rem; }
    .nx-topbar-search { display: none; }
  }
`;

if (!document.getElementById('nx-styles-v3')) {
  const el = document.createElement('style');
  el.id = 'nx-styles-v3';
  el.textContent = HOME_STYLES;
  document.head.appendChild(el);
}

// ─── Modal ────────────────────────────────────────────────────────────────────
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
        {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(240,236,228,0.3)', fontSize: '0.85rem' }}>Cargando…</div>}
        {error && <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontSize: '0.85rem' }}>{error}</div>}
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
                <span className="nx-ms-val" style={{ color: '#d4a33e' }}>${parseFloat(product.price).toFixed(2)}</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Stock</span>
                <span className="nx-ms-val">{product.stock} uds.</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Estado</span>
                <span className="nx-ms-val" style={{ textTransform: 'capitalize' }}>{product.condition || 'nuevo'}</span>
              </div>
              <div className="nx-modal-stat">
                <span className="nx-ms-lbl">Calificación</span>
                <span className="nx-ms-val" style={{ color: '#d4a33e' }}>{stars(product.rating)}</span>
              </div>
            </div>
            {product.seller && (
              <div className="nx-modal-seller">
                <span className="nx-ms-lbl" style={{ display: 'block', marginBottom: '0.3rem' }}>Vendedor</span>
                <div style={{ fontSize: '0.85rem', color: '#f0ece4', fontWeight: 500 }}>{product.seller.nombres} {product.seller.apellidos}</div>
                {product.seller.correo && <div style={{ fontSize: '0.74rem', color: 'rgba(240,236,228,0.3)', marginTop: '0.15rem' }}>{product.seller.correo}</div>}
              </div>
            )}
          </div>
        </>}
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home() {
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [recentProducts, setRecent]     = useState([]);
  const [recentLoading, setRecentLoad]  = useState(true);
  const [dropdownOpen, setDdOpen]       = useState(false);
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

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || 'null');
  const PER_PAGE = 12;

  const { cart, error: cartErr, success: cartOk, addToCart, setError: setCartErr } = useHybridCart();

  const initials = user
    ? `${(user.nombres || '')[0] || ''}${(user.apellidos || '')[0] || ''}`.toUpperCase()
    : '';

  // Load recents
  useEffect(() => {
    api.get('/products/recent')
      .then(({ data }) => setRecent(data.products || []))
      .catch(() => setRecent([]))
      .finally(() => setRecentLoad(false));
  }, []);

  // Load catalog
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
    } catch { setError('Error al cargar productos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = e => { if (dropdownOpen && !e.target.closest('.nx-user-wrap')) setDdOpen(false); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, [dropdownOpen]);

  const doSearch = () => {
    setPage(1);
    fetchProducts({
      search: searchTerm || undefined,
      condition: fCond || undefined,
      maxPrice: fMaxPrice,
      minRating: fMinRating > 0 ? fMinRating : undefined,
    });
  };

  const doAddToCart = (p, e) => {
    e.stopPropagation();
    const qty = Number(qtys[p.id] || 1);
    if (!Number.isInteger(qty) || qty < 1) { setCartErr('Cantidad inválida'); return; }
    addToCart(p.id, qty, { name: p.titulo, price: p.price });
    setQtys(prev => ({ ...prev, [p.id]: 1 }));
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
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

      {/* ── TOPBAR ─────────────────────────────────────────────────────── */}
      <header className="nx-topbar">
        <Link to="/" className="nx-topbar-brand">
          <img src="/resources/icone.png" alt="Nexont" />
          <span className="nx-topbar-brand-name">Nexont</span>
        </Link>

        <div className="nx-topbar-sep" />

        <div className="nx-topbar-search">
          <span style={{ color: 'rgba(240,236,228,0.28)', fontSize: '0.95rem' }}>⌕</span>
          <input
            placeholder="Buscar productos, vendedores…"
            value={searchTerm}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          <span className="nx-topbar-kbd">⌘K</span>
        </div>

        <div className="nx-topbar-gap" />

        <div className="nx-topbar-right">
          {/* Carrito */}
          {token && user && (
            <button className="nx-icon-btn" onClick={() => navigate('/cart')} title="Carrito">
              🛒
              {cart.totalItems > 0 && <span className="nx-cart-badge">{cart.totalItems}</span>}
            </button>
          )}

          <button className="nx-icon-btn" title="Notificaciones">🔔</button>

          <button className="nx-icon-btn" onClick={() => scrollTo('nx-catalog')} title="Catálogo">⊞</button>

          {/* Publicar producto — visible si está autenticado y es vendedor */}
          {token && user?.esVendedorVerificado && (
            <button className="nx-publish-btn" onClick={() => navigate('/my-products')}>
              + Publicar producto
            </button>
          )}

          {token && user ? (
            <div className="nx-user-wrap">
              <div className="nx-user-pill" onClick={() => setDdOpen(o => !o)}>
                <div className="nx-avatar">{initials}</div>
                <span className="nx-user-name">{user.nombres}</span>
                <span className="nx-chevron">▾</span>
              </div>

              {dropdownOpen && (
                <div className="nx-dropdown">
                  <div className="nx-dd-section">
                    <div className="nx-dd-label">Mi cuenta</div>
                    <div className="nx-dd-item">👤 Mi perfil</div>
                    <div className="nx-dd-item" onClick={() => { setDdOpen(false); navigate('/orders'); }}>
                      📦 Mis órdenes
                    </div>
                  </div>

                  {user.esVendedorVerificado && (
                    <div className="nx-dd-section">
                      <div className="nx-dd-label">Vendedor</div>
                      <div className="nx-dd-item" onClick={() => { setDdOpen(false); navigate('/my-products'); }}>
                        🏪 Mis productos
                      </div>
                      <div className="nx-dd-item" onClick={() => { setDdOpen(false); navigate('/my-products'); }}>
                        ➕ Agregar producto
                      </div>
                    </div>
                  )}

                  {!user.esVendedorVerificado && (
                    <div className="nx-dd-section">
                      <div className="nx-dd-item nx-dd-highlight">⭐ Verificarse como vendedor</div>
                    </div>
                  )}

                  <div className="nx-dd-section">
                    <div className="nx-dd-item nx-dd-danger" onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('user');
                      window.location.reload();
                    }}>
                      🚪 Cerrar sesión
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="nx-outline-btn" style={{ height: 36, fontSize: '0.82rem', padding: '0 1rem' }}>
                Iniciar sesión
              </Link>
              <button className="nx-publish-btn" onClick={() => navigate('/register')}>
                Registrarse
              </button>
            </>
          )}
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="nx-hero">
        <div className="nx-hero-bg" />
        <div className="nx-hero-grid" />
        <div className="nx-hero-sideline" />

        <div className="nx-hero-inner">
          {/* Left */}
          <div>
            <div className="nx-hero-badge">✦ &nbsp; Marketplace Colombiano</div>

            <h1 className="nx-hero-h1">
              El mercado donde<br />
              lo <em>extraordinario</em><br />
              se encuentra
            </h1>

            <p className="nx-hero-p">
              Vendedores verificados, productos de calidad y la mejor
              experiencia de compra en un solo lugar.
            </p>

            <div className="nx-hero-actions">
              <button className="nx-hero-cta" onClick={() => scrollTo('nx-catalog')}>
                Explorar catálogo →
              </button>
              {!token && (
                <Link to="/register" className="nx-hero-ghost">Vender aquí</Link>
              )}
              {token && user?.esVendedorVerificado && (
                <button className="nx-hero-ghost" onClick={() => navigate('/my-products')}>
                  + Publicar producto
                </button>
              )}
            </div>

            <div className="nx-hero-stats">
              <div className="nx-hstat">
                <span className="nx-hstat-val">{products.length > 0 ? products.length : '–'}</span>
                <span className="nx-hstat-lbl">Productos activos</span>
                <span className="nx-hstat-delta">↑ En vivo</span>
              </div>
              <div className="nx-hstat">
                <span className="nx-hstat-val">100%</span>
                <span className="nx-hstat-lbl">Vendedores verificados</span>
              </div>
              <div className="nx-hstat">
                <span className="nx-hstat-val">24/7</span>
                <span className="nx-hstat-lbl">Soporte disponible</span>
              </div>
            </div>
          </div>

          {/* Right — live feed panel */}
          <div style={{ position: 'relative' }}>
            <div className="nx-hero-panel">
              <div className="nx-panel-head">
                <span className="nx-panel-title">Últimas publicaciones</span>
                <span className="nx-live-pill">
                  <span className="nx-live-dot" /> En vivo
                </span>
              </div>
              <div className="nx-panel-list">
                {recentLoading && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="nx-pi">
                    <div className="nx-pi-thumb" />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 9, width: '70%', background: '#1a1612', borderRadius: 3, marginBottom: 6 }} />
                      <div style={{ height: 9, width: '45%', background: '#1a1612', borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
                {!recentLoading && recentProducts.length === 0 && (
                  <div style={{ padding: '1.75rem', textAlign: 'center', color: 'rgba(240,236,228,0.22)', fontSize: '0.8rem', letterSpacing: '0.01em' }}>
                    Aún no hay publicaciones
                  </div>
                )}
                {!recentLoading && recentProducts.slice(0, 5).map(p => (
                  <div key={p.id} className="nx-pi" onClick={() => setSelectedId(p.id)}>
                    <div className="nx-pi-thumb">
                      {p.imagenes?.[0]?.url
                        ? <img src={p.imagenes[0].url} alt={p.titulo} />
                        : '📦'}
                    </div>
                    <div className="nx-pi-info">
                      <div className="nx-pi-name">{p.titulo}</div>
                      <div className="nx-pi-meta" style={{ textTransform: 'capitalize' }}>
                        {p.condition || 'nuevo'} · {stars(p.rating)}
                      </div>
                    </div>
                    <div className="nx-pi-price">${parseFloat(p.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {recentProducts[0] && (
              <div className="nx-fc nx-fc-tl">
                <div className="nx-fc-lbl">Más reciente</div>
                <div className="nx-fc-val">{recentProducts[0].titulo?.slice(0, 16)}…</div>
                <div className="nx-fc-sub">↑ ${parseFloat(recentProducts[0].price).toFixed(2)}</div>
              </div>
            )}
            <div className="nx-fc nx-fc-br">
              <div className="nx-fc-lbl">Compra segura</div>
              <div className="nx-fc-val">✓ Verificado</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS RECIENTES ─────────────────────────────────────────── */}
      <section className="nx-recents">
        <div className="nx-container">
          <div className="nx-sec-head">
            <div>
              <div className="nx-eyebrow">
                <div className="nx-eyebrow-bar" />
                <span className="nx-eyebrow-txt">Últimas publicaciones</span>
              </div>
              <h2 className="nx-sec-title">Productos Recientes</h2>
              <p className="nx-sec-sub">Las 6 publicaciones más nuevas del marketplace</p>
            </div>
            <button className="nx-outline-btn" onClick={() => scrollTo('nx-catalog')}>
              Ver todo el catálogo →
            </button>
          </div>

          {/* Skeleton */}
          {recentLoading && (
            <div className="nx-skel-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="nx-skel-card">
                  <div className="nx-skel-img" />
                  <div className="nx-skel-body">
                    <div className="nx-skel-ln" />
                    <div className="nx-skel-ln w60" />
                    <div className="nx-skel-ln w40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!recentLoading && recentProducts.length === 0 && (
            <div className="nx-empty">
              <span className="nx-empty-icon">🌱</span>
              <div className="nx-empty-title">El marketplace está por florecer</div>
              <p className="nx-empty-txt">
                Sé el primero en publicar un producto y llega a miles de compradores.
              </p>
              {token && user?.esVendedorVerificado
                ? <button className="nx-hero-cta" onClick={() => navigate('/my-products')}>Publicar mi primer producto →</button>
                : <Link to="/register" className="nx-hero-cta">Comenzar a vender →</Link>
              }
            </div>
          )}

          {/* Cards */}
          {!recentLoading && recentProducts.length > 0 && (
            <>
              <div className="nx-rgrid">
                {recentProducts.map(p => (
                  <div key={p.id} className="nx-rcard" onClick={() => setSelectedId(p.id)}>
                    <div className="nx-rcard-img">
                      <img
                        src={p.imagenes?.[0]?.url || `https://via.placeholder.com/480x300/1a1612/d4a33e?text=${encodeURIComponent(p.titulo)}`}
                        alt={p.titulo}
                        onError={e => { e.target.src = `https://via.placeholder.com/480x300/1a1612/d4a33e?text=${encodeURIComponent(p.titulo)}`; }}
                      />
                      <span className="nx-rcard-badge">{p.condition || 'nuevo'}</span>
                    </div>
                    <div className="nx-rcard-body">
                      <div className="nx-rcard-name">{p.titulo}</div>
                      <div className="nx-rcard-seller">{p.seller?.nombres} {p.seller?.apellidos}</div>
                      <div className="nx-rcard-stars">{stars(p.rating)}</div>
                      <div className="nx-rcard-foot">
                        <span className="nx-rcard-price">${(parseFloat(p.price) || 0).toFixed(2)}</span>
                        <button className="nx-detail-btn" onClick={e => { e.stopPropagation(); setSelectedId(p.id); }}>
                          Ver detalle →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="nx-viewmore">
                <button className="nx-outline-btn" onClick={() => scrollTo('nx-catalog')}>
                  Ver catálogo completo ↓
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <hr className="nx-hr" />

      {/* ── CATÁLOGO ────────────────────────────────────────────────────── */}
      <section className="nx-catalog" id="nx-catalog">
        <div className="nx-container">
          <div className="nx-sec-head" style={{ marginBottom: '1.75rem' }}>
            <div>
              <div className="nx-eyebrow">
                <div className="nx-eyebrow-bar" />
                <span className="nx-eyebrow-txt">Catálogo completo</span>
              </div>
              <h2 className="nx-sec-title">Todos los productos</h2>
            </div>
          </div>

          {cartErr && <div className="nx-alert-err">{cartErr}</div>}
          {cartOk  && <div className="nx-alert-ok">{cartOk}</div>}

          <div className="nx-catalog-layout">
            {/* Sidebar */}
            <aside className="nx-sidebar">
              <div className="nx-sb-head">
                <span className="nx-sb-title">Filtros</span>
              </div>
              <div className="nx-sb-sec">
                <span className="nx-sb-sec-title">Estado</span>
                {['', 'nuevo', 'usado', 'reacondicionado'].map(c => (
                  <label key={c} className="nx-radio">
                    <input type="radio" name="cond" value={c} checked={fCond === c} onChange={() => setFCond(c)} />
                    <span>{c === '' ? 'Todos' : c.charAt(0).toUpperCase() + c.slice(1)}</span>
                  </label>
                ))}
              </div>
              <div className="nx-sb-sec">
                <span className="nx-sb-sec-title">Precio máximo</span>
                <input type="range" min="0" max="1000" step="10" value={fMaxPrice} onChange={e => setFMaxPrice(Number(e.target.value))} className="nx-range" />
                <div className="nx-range-row">
                  <span>$0</span>
                  <span className="nx-range-val">${fMaxPrice}</span>
                  <span>$1000+</span>
                </div>
              </div>
              <div className="nx-sb-sec">
                <span className="nx-sb-sec-title">Calificación mín.</span>
                {[0,1,2,3,4,5].map(r => (
                  <label key={r} className="nx-radio">
                    <input type="radio" name="rat" value={r} checked={fMinRating === r} onChange={() => setFMinRating(r)} />
                    <span style={{ color: r === 0 ? 'rgba(240,236,228,0.45)' : '#d4a33e' }}>
                      {r === 0 ? 'Todas' : stars(r)}
                    </span>
                  </label>
                ))}
              </div>
              <div className="nx-sb-btns">
                <button className="nx-sb-apply" onClick={doSearch}>Aplicar filtros</button>
                <button className="nx-sb-clear" onClick={() => { setFCond(''); setFMaxPrice(1000); setFMinRating(0); setSearch(''); fetchProducts(); }}>
                  Limpiar
                </button>
              </div>
            </aside>

            {/* Main */}
            <div className="nx-cat-main">
              <div className="nx-searchbar">
                <input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                />
                <button onClick={doSearch}>Buscar</button>
              </div>

              <div className="nx-toolbar">
                <div className="nx-count">
                  Mostrando <b>{start + 1}–{Math.min(start + PER_PAGE, sorted.length)}</b> de <b>{sorted.length}</b> productos
                </div>
                <div className="nx-toolbar-r">
                  <div className="nx-viewtoggle">
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
                <div style={{ textAlign: 'center', padding: '3.5rem', color: 'rgba(240,236,228,0.28)', fontSize: '0.88rem', letterSpacing: '0.02em' }}>
                  Cargando productos…
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '3.5rem', color: '#ef4444', fontSize: '0.88rem' }}>{error}</div>
              ) : shown.length === 0 ? (
                <div className="nx-empty">
                  <span className="nx-empty-icon">🔍</span>
                  <div className="nx-empty-title">Sin resultados</div>
                  <p className="nx-empty-txt">No encontramos productos con esos criterios. Intenta ajustar los filtros.</p>
                </div>
              ) : (
                <div className={`nx-pgrid ${viewMode === 'list' ? 'nx-list' : ''}`}>
                  {shown.map(p => (
                    <div key={p.id} className="nx-pcard" onClick={() => setSelectedId(p.id)}>
                      <div className="nx-pcard-img">
                        <img
                          src={p.imagenes?.[0]?.url || `https://via.placeholder.com/300/1a1612/d4a33e?text=${encodeURIComponent(p.titulo)}`}
                          alt={p.titulo}
                          onError={e => { e.target.src = `https://via.placeholder.com/300/1a1612/d4a33e?text=${encodeURIComponent(p.titulo)}`; }}
                        />
                        <span className="nx-pcard-cond">{p.condition || 'nuevo'}</span>
                        <button className="nx-fav" onClick={e => { e.stopPropagation(); toggleFav(p.id); }}>
                          {favorites.includes(p.id) ? '❤️' : '🤍'}
                        </button>
                      </div>
                      <div className="nx-pcard-body">
                        <div className="nx-pcard-name">{p.titulo}</div>
                        <div className="nx-pcard-price">${(parseFloat(p.price) || 0).toFixed(2)}</div>
                        <div className="nx-pcard-stars">{stars(p.rating)}</div>
                        <div className="nx-pcard-addrow" onClick={e => e.stopPropagation()}>
                          <input
                            type="number" min="1" className="nx-pcard-qty"
                            value={qtys[p.id] || 1}
                            onChange={e => setQtys(prev => ({ ...prev, [p.id]: e.target.value }))}
                          />
                          <button
                            className={`nx-pcard-add ${p.stock === 0 ? 'out' : 'ok'}`}
                            disabled={p.stock === 0}
                            onClick={e => doAddToCart(p, e)}
                          >
                            {p.stock === 0 ? 'Sin stock' : '+ Agregar'}
                          </button>
                        </div>
                        <div className="nx-pcard-seller">{p.seller?.nombres} {p.seller?.apellidos}</div>
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
        </div>
      </section>

      {/* ── Modal ── */}
      {selectedId && <ProductDetailModal productId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

export default Home;
