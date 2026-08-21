'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Cpu, Copy, Check, Sparkles, Code2, RefreshCw, FileText } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';

export default function WebOptimizerPage() {
  // JSON State
  const [jsonInput, setJsonInput] = useState<string>(`{\n  "hub": "Aegis",\n  "version": "16.2.12",\n  "pillars": ["News & Research", "Scheduled Events", "Key Tools Suite"],\n  "status": "Optimal"\n}`);
  const [jsonFormatted, setJsonFormatted] = useState<string>(jsonInput);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // String Transform State
  const [strInput, setStrInput] = useState<string>('https://aegishub.com/search?query=react 19 & nextjs 16');
  const [urlEncoded, setUrlEncoded] = useState<string>(encodeURIComponent('https://aegishub.com/search?query=react 19 & nextjs 16'));

  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Format JSON
  const handleFormatJson = (raw: string) => {
    setJsonInput(raw);
    try {
      const parsed = JSON.parse(raw);
      setJsonFormatted(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format');
    }
  };

  // Minify JSON
  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonFormatted(JSON.stringify(parsed));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON format');
    }
  };

  // Transform URL
  const handleTransformUrl = (text: string) => {
    setStrInput(text);
    try {
      setUrlEncoded(encodeURIComponent(text));
    } catch {
      setUrlEncoded('Encoding error');
    }
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
            <Cpu size={14} /> DEV SPEED LAB
          </span>
          <span className="badge badge-cyan">JSON Inspector & URL Transformer</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Dev Speed & Code Optimizer Lab</h1>
      </section>

      {/* Main Grid Content with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Feature 1: JSON Formatter & Minifier */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={18} style={{ color: 'var(--accent-cyan)' }} /> JSON Tree Inspector & Formatter
              </h3>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleFormatJson(jsonInput)} className="btn-primary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}>
                  Pretty Print
                </button>
                <button onClick={handleMinifyJson} className="btn-secondary" style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}>
                  Minify JSON
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  INPUT JSON STRING
                </label>
                <textarea
                  value={jsonInput}
                  onChange={e => handleFormatJson(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    background: '#0a0d14',
                    border: jsonError ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}
                />
                {jsonError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>[!] {jsonError}</span>}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    FORMATTED JSON OUTPUT
                  </label>
                  <button onClick={() => copyText(jsonFormatted, 'json')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    {copiedType === 'json' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />} Copy
                  </button>
                </div>
                <textarea
                  value={jsonFormatted}
                  readOnly
                  rows={8}
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

          {/* Feature 2: URL Encoder & Decoder */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: 'var(--accent-purple)' }} /> URL Encoder & Data Transformer
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  RAW STRING / URL
                </label>
                <input
                  type="text"
                  value={strInput}
                  onChange={e => handleTransformUrl(e.target.value)}
                  style={{ width: '100%', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.15)', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    PERCENT-ENCODED URL
                  </label>
                  <button onClick={() => copyText(urlEncoded, 'url')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    {copiedType === 'url' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />} Copy
                  </button>
                </div>
                <input
                  type="text"
                  value={urlEncoded}
                  readOnly
                  style={{ width: '100%', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.15)', padding: '0.75rem', borderRadius: '8px', color: '#a855f7', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
              </div>
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
