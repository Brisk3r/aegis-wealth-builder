'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, VectorSquare, Copy, Check, Sparkles, Download, RefreshCw, Layers } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';

export default function SvgStudioPage() {
  // Bezier Curve Control Points (0 to 400 space)
  const [p0, setP0] = useState({ x: 40, y: 360 });
  const [p1, setP1] = useState({ x: 120, y: 60 });
  const [p2, setP2] = useState({ x: 280, y: 60 });
  const [p3, setP3] = useState({ x: 360, y: 360 });

  // Curve Styling Options
  const [curveType, setCurveType] = useState<'cubic' | 'quadratic'>('cubic');
  const [strokeColor, setStrokeColor] = useState('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillColor, setFillColor] = useState('rgba(56, 189, 248, 0.1)');
  const [animatePath, setAnimatePath] = useState(false);

  // Copy state
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Path string math
  const pathD = curveType === 'cubic'
    ? `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}`
    : `M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y}, ${p3.x} ${p3.y}`;

  const fullSvgCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <path d="${pathD}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />
</svg>`;

  const jsxCode = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" className="w-full h-full">
  <path d="${pathD}" fill="${fillColor}" stroke="${strokeColor}" strokeWidth={${strokeWidth}} strokeLinecap="round" />
</svg>`;

  const cssCode = `background-image: url("data:image/svg+xml,${encodeURIComponent(fullSvgCode)}");`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleReset = () => {
    setP0({ x: 40, y: 360 });
    setP1({ x: 120, y: 60 });
    setP2({ x: 280, y: 60 });
    setP3({ x: 360, y: 360 });
    setStrokeColor('#38bdf8');
    setStrokeWidth(4);
    setFillColor('rgba(56, 189, 248, 0.1)');
    setCurveType('cubic');
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

      {/* Hero Title Header */}
      <section className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <VectorSquare size={14} /> VECTOR MATH WORKBENCH
              </span>
              <span className="badge badge-cyan">Smooth C/S/Q Curves</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>SVG Studio Pro & Bezier Curve Workbench</h1>
          </div>

          <button onClick={handleReset} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            <RefreshCw size={14} /> Reset Controls
          </button>
        </div>
      </section>

      {/* Main Workbench Grid with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        {/* Left Column: Visual Canvas & Math Controls */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Visual SVG Render Canvas */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Live Vector Preview</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>400 * 400 ViewBox</span>
              </div>

              <div style={{ width: '100%', aspectRatio: '1/1', background: '#0a0d14', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                {/* Background Grid Lines */}
                <svg width="100%" height="100%" viewBox="0 0 400 400" style={{ position: 'absolute', inset: 0 }}>
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Control Lines */}
                  <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" strokeWidth="1.5" />
                  {curveType === 'cubic' && (
                    <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" strokeWidth="1.5" />
                  )}
                  {curveType === 'quadratic' && (
                    <line x1={p1.x} y1={p1.y} x2={p3.x} y2={p3.y} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" strokeWidth="1.5" />
                  )}

                  {/* Rendered Bezier Path */}
                  <path
                    d={pathD}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{
                      transition: animatePath ? 'd 0.3s ease' : 'none'
                    }}
                  />

                  {/* Control Handle Circles */}
                  <circle cx={p0.x} cy={p0.y} r="6" fill="#38bdf8" />
                  <circle cx={p1.x} cy={p1.y} r="6" fill="#a855f7" />
                  {curveType === 'cubic' && <circle cx={p2.x} cy={p2.y} r="6" fill="#a855f7" />}
                  <circle cx={p3.x} cy={p3.y} r="6" fill="#38bdf8" />
                </svg>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', width: '100%' }}>
                <button
                  onClick={() => setCurveType('cubic')}
                  className={curveType === 'cubic' ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                >
                  Cubic (C/S)
                </button>
                <button
                  onClick={() => setCurveType('quadratic')}
                  className={curveType === 'quadratic' ? 'btn-primary' : 'btn-secondary'}
                  style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                >
                  Quadratic (Q)
                </button>
              </div>
            </div>

            {/* Bezier Math Controls */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} /> Control Points & Coordinates
              </h3>

              {/* P0 Controls */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  Start Point P0 ({p0.x}, {p0.y})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    X: {p0.x}
                    <input type="range" min="0" max="400" value={p0.x} onChange={e => setP0({ ...p0, x: Number(e.target.value) })} style={{ width: '100%' }} />
                  </label>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Y: {p0.y}
                    <input type="range" min="0" max="400" value={p0.y} onChange={e => setP0({ ...p0, y: Number(e.target.value) })} style={{ width: '100%' }} />
                  </label>
                </div>
              </div>

              {/* P1 Controls */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                  Control Point P1 ({p1.x}, {p1.y})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    X: {p1.x}
                    <input type="range" min="0" max="400" value={p1.x} onChange={e => setP1({ ...p1, x: Number(e.target.value) })} style={{ width: '100%' }} />
                  </label>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Y: {p1.y}
                    <input type="range" min="0" max="400" value={p1.y} onChange={e => setP1({ ...p1, y: Number(e.target.value) })} style={{ width: '100%' }} />
                  </label>
                </div>
              </div>

              {/* P2 Controls (Only for Cubic) */}
              {curveType === 'cubic' && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
                    Control Point P2 ({p2.x}, {p2.y})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      X: {p2.x}
                      <input type="range" min="0" max="400" value={p2.x} onChange={e => setP2({ ...p2, x: Number(e.target.value) })} style={{ width: '100%' }} />
                    </label>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Y: {p2.y}
                      <input type="range" min="0" max="400" value={p2.y} onChange={e => setP2({ ...p2, y: Number(e.target.value) })} style={{ width: '100%' }} />
                    </label>
                  </div>
                </div>
              )}

              {/* P3 Controls */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                  End Point P3 ({p3.x}, {p3.y})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    X: {p3.x}
                    <input type="range" min="0" max="400" value={p3.x} onChange={e => setP3({ ...p3, x: Number(e.target.value) })} style={{ width: '100%' }} />
                  </label>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Y: {p3.y}
                    <input type="range" min="0" max="400" value={p3.y} onChange={e => setP3({ ...p3, y: Number(e.target.value) })} style={{ width: '100%' }} />
                  </label>
                </div>
              </div>

              {/* Stroke Width Slider */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '10px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                  Stroke Width: {strokeWidth}px
                  <input type="range" min="1" max="20" value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} style={{ width: '100%', marginTop: '0.3rem' }} />
                </label>
              </div>
            </div>
          </div>

          {/* Generated Code Exporters */}
          <section className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} style={{ color: 'var(--accent-cyan)' }} /> Export Clean SVG Markup & Code
            </h3>

            {/* SVG Markup Export */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>RAW SVG MARKUP</span>
                <button onClick={() => copyToClipboard(fullSvgCode, 'svg')} className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {copiedType === 'svg' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />}
                  {copiedType === 'svg' ? 'Copied SVG!' : 'Copy SVG'}
                </button>
              </div>
              <pre style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#38bdf8', overflowX: 'auto', margin: 0 }}>
                {fullSvgCode}
              </pre>
            </div>

            {/* React JSX Export */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>REACT 19 / NEXT.JS JSX COMPONENT</span>
                <button onClick={() => copyToClipboard(jsxCode, 'jsx')} className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {copiedType === 'jsx' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />}
                  {copiedType === 'jsx' ? 'Copied JSX!' : 'Copy JSX'}
                </button>
              </div>
              <pre style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#a855f7', overflowX: 'auto', margin: 0 }}>
                {jsxCode}
              </pre>
            </div>

            {/* CSS Background Export */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>CSS BACKGROUND-IMAGE DATA URI</span>
                <button onClick={() => copyToClipboard(cssCode, 'css')} className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {copiedType === 'css' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />}
                  {copiedType === 'css' ? 'Copied CSS!' : 'Copy CSS'}
                </button>
              </div>
              <pre style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#f472b6', overflowX: 'auto', margin: 0 }}>
                {cssCode}
              </pre>
            </div>
          </section>
        </main>

        {/* Sidebar Column with Sticky Ad */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AdSlot type="sidebar" />

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Bezier Path Math</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Cubic curves evaluate C2 curvature continuity along 4 control points P0, P1, P2, P3 using smooth Bernstein polynomials.
              </p>
            </div>
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
