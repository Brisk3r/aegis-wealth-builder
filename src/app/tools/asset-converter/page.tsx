'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Palette, Copy, Check, Sparkles, Image as ImageIcon, Download, FileCode, CheckCircle, XCircle } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';

export default function AssetConverterPage() {
  // Base64 State
  const [inputText, setInputText] = useState('Aegis Hub Asset Converter Workbench');
  const [base64Output, setBase64Output] = useState(btoa('Aegis Hub Asset Converter Workbench'));

  // Color Contrast State
  const [bgColor, setBgColor] = useState('#0f172a');
  const [fgColor, setFgColor] = useState('#38bdf8');

  // SVG PNG Converter state
  const [sampleSvg, setSampleSvg] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#38bdf8" />
  <path d="M 30 50 L 45 65 L 70 35" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round" />
</svg>`);
  const [pngScale, setPngScale] = useState<number>(2);

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Encode Text
  const handleEncode = (text: string) => {
    setInputText(text);
    try {
      setBase64Output(btoa(text));
    } catch {
      setBase64Output('Encoding Error');
    }
  };

  // Decode Text
  const handleDecode = (b64: string) => {
    setBase64Output(b64);
    try {
      setInputText(atob(b64));
    } catch {
      setInputText('Invalid Base64 string');
    }
  };

  // Color Luminance & Contrast Math
  const getLuminance = (hex: string) => {
    const rgb = hex.replace('#', '').match(/.{1,2}/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0];
    const a = rgb.map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const l1 = getLuminance(bgColor);
  const l2 = getLuminance(fgColor);
  const contrastRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  const passAa = contrastRatio >= 4.5;
  const passAaa = contrastRatio >= 7.0;

  // SVG to PNG Canvas Export
  const handleExportPng = () => {
    const blob = new Blob([sampleSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400 * pngScale;
      canvas.height = 400 * pngScale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `aegis-asset-${pngScale}x.png`;
        downloadLink.click();
      }
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Ad */}
      <div style={{ marginBottom: '2rem' }}>
        <AdSlot type="banner" />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/tools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Key Tools Suite
        </Link>
      </div>

      {/* Hero Title */}
      <section className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Palette size={14} /> SMART ASSET WORKBENCH
          </span>
          <span className="badge badge-cyan">WCAG AAA & Base64 Converter</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Smart Asset & Color Palette Converter</h1>
      </section>

      {/* Main Grid Content with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Feature 1: Base64 Encoder & Decoder */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCode size={18} style={{ color: 'var(--accent-cyan)' }} /> Base64 Data String Encoder & Decoder
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  RAW STRING INPUT
                </label>
                <textarea
                  value={inputText}
                  onChange={e => handleEncode(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    background: '#0a0d14',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    BASE64 ENCODED RESULT
                  </label>
                  <button onClick={() => copyText(base64Output, 'b64')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    {copiedType === 'b64' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />} Copy
                  </button>
                </div>
                <textarea
                  value={base64Output}
                  onChange={e => handleDecode(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    background: '#0a0d14',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>
          </section>

          {/* Feature 2: WCAG Color Contrast Analyzer */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} /> WCAG AAA Color Contrast Compliance Inspector
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  BACKGROUND COLOR: {bgColor}
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', cursor: 'pointer', background: 'none', border: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  FOREGROUND COLOR: {fgColor}
                </label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={e => setFgColor(e.target.value)}
                  style={{ width: '100%', height: '42px', borderRadius: '8px', cursor: 'pointer', background: 'none', border: 'none' }}
                />
              </div>
            </div>

            {/* Contrast Preview Box */}
            <div style={{ background: bgColor, color: fgColor, padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>Aegis Hub Color Preview Text</span>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>Sample text evaluating accessibility contrast ratio.</p>
            </div>

            {/* Contrast Compliance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONTRAST RATIO</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'block' }}>{contrastRatio.toFixed(2)}:1</span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WCAG AA PASS (4.5+)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', color: passAa ? '#4ade80' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  {passAa ? <CheckCircle size={18} /> : <XCircle size={18} />} {passAa ? 'PASSED' : 'FAILED'}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WCAG AAA PASS (7.0+)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', color: passAaa ? '#4ade80' : '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
                  {passAaa ? <CheckCircle size={18} /> : <XCircle size={18} />} {passAaa ? 'PASSED' : 'FAILED'}
                </div>
              </div>
            </div>
          </section>

          {/* Feature 3: SVG to Canvas PNG Exporter */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} style={{ color: 'var(--accent-cyan)' }} /> SVG Vector to HTML5 Canvas PNG Exporter
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                SVG SOURCE MARKUP
              </label>
              <textarea
                value={sampleSvg}
                onChange={e => setSampleSvg(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  background: '#0a0d14',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>EXPORT SCALE:</span>
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    onClick={() => setPngScale(s)}
                    className={pngScale === s ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    {s}x ({400 * s}px)
                  </button>
                ))}
              </div>

              <button onClick={handleExportPng} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Download size={16} /> Render PNG Image
              </button>
            </div>
          </section>
        </main>

        {/* Sidebar Column with Ad */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AdSlot type="sidebar" />
          </div>
        </aside>
      </div>

      {/* Footer Ad */}
      <div style={{ marginTop: '3rem' }}>
        <AdSlot type="banner" />
      </div>
    </div>
  );
}
