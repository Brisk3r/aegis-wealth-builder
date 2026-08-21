'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code, Copy, Check, Sparkles, Layers, BookOpen, AlertCircle } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';

interface MatchResult {
  index: number;
  matchText: string;
  groups: string[];
}

const REGEX_PRESETS = [
  { name: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'gi', sample: 'Contact support@aegishub.com or dev.lead@tech.io for queries.' },
  { name: 'URL / Web Link', pattern: 'https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(?:/[^\\s]*)?', flags: 'gi', sample: 'Visit https://aegis-wealth-builder.vercel.app/tools or http://example.com/api.' },
  { name: 'IPv4 Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', sample: 'Servers online at 192.168.1.1 and 10.0.0.254 active.' },
  { name: 'Hex Color Code', pattern: '#(?:[a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b', flags: 'g', sample: 'Colors used: #38bdf8, #a855f7, and #000.' },
  { name: 'SVG Path Command', pattern: '[MmLlHhVvCcSsQqTtAaZz](?:\\s*[-+]?\\d*\\.?\\d+)*', flags: 'g', sample: 'M 40 360 C 120 60, 280 60, 360 360 Z' }
];

export default function RegexLabPage() {
  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState<{ g: boolean; i: boolean; m: boolean; s: boolean }>({ g: true, i: true, m: false, s: false });
  const [testText, setTestText] = useState<string>('Welcome to Aegis Hub! Email us at support@aegishub.com or contact admin@aegishub.org for assistance.');
  const [replacementText, setReplacementText] = useState<string>('[REDACTED EMAIL]');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const flagString = useMemo(() => {
    let f = '';
    if (flags.g) f += 'g';
    if (flags.i) f += 'i';
    if (flags.m) f += 'm';
    if (flags.s) f += 's';
    return f;
  }, [flags]);

  // Compute Regex Matches and Error handling
  const { matches, error, replacedOutput } = useMemo(() => {
    if (!pattern) return { matches: [], error: null, replacedOutput: testText };
    try {
      const regex = new RegExp(pattern, flagString);
      const matchResults: MatchResult[] = [];

      if (flags.g) {
        let match: RegExpExecArray | null;
        let lastIdx = -1;
        while ((match = regex.exec(testText)) !== null) {
          if (match.index === lastIdx) {
            regex.lastIndex++; // Prevent infinite loop on empty match
            continue;
          }
          lastIdx = match.index;
          matchResults.push({
            index: match.index,
            matchText: match[0],
            groups: match.slice(1)
          });
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matchResults.push({
            index: match.index,
            matchText: match[0],
            groups: match.slice(1)
          });
        }
      }

      const replaced = testText.replace(regex, replacementText);
      return { matches: matchResults, error: null, replacedOutput: replaced };
    } catch (err: any) {
      return { matches: [], error: err.message || 'Invalid Regular Expression', replacedOutput: testText };
    }
  }, [pattern, flagString, testText, replacementText, flags]);

  const jsSnippet = `const regex = new RegExp("${pattern.replace(/\\/g, '\\\\')}", "${flagString}");\nconst matches = [...text.matchAll(regex)];`;
  const pythonSnippet = `import re\npattern = r"${pattern}"\nmatches = re.findall(pattern, text)`;

  const copyText = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const applyPreset = (preset: typeof REGEX_PRESETS[0]) => {
    setPattern(preset.pattern);
    setTestText(preset.sample);
    setFlags({
      g: preset.flags.includes('g'),
      i: preset.flags.includes('i'),
      m: preset.flags.includes('m'),
      s: preset.flags.includes('s')
    });
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
            <Code size={14} /> REGEX INTELLIGENCE LAB
          </span>
          <span className="badge badge-cyan">Real-Time Match Inspector</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Regex Pattern Workbench & Code Generator</h1>
      </section>

      {/* Main Grid Content with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        {/* Main Workbench Body */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pattern Input & Flag Toggles */}
          <div className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                REGULAR EXPRESSION PATTERN
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={e => setPattern(e.target.value)}
                  placeholder="e.g. [a-z]+"
                  style={{
                    flex: 1,
                    background: '#0a0d14',
                    border: error ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.15)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>/{flagString}</span>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            {/* Flag Checkboxes */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>FLAGS:</span>
              <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input type="checkbox" checked={flags.g} onChange={e => setFlags({ ...flags, g: e.target.checked })} /> Global (g)
              </label>
              <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input type="checkbox" checked={flags.i} onChange={e => setFlags({ ...flags, i: e.target.checked })} /> Insensitive (i)
              </label>
              <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input type="checkbox" checked={flags.m} onChange={e => setFlags({ ...flags, m: e.target.checked })} /> Multiline (m)
              </label>
              <label style={{ fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <input type="checkbox" checked={flags.s} onChange={e => setFlags({ ...flags, s: e.target.checked })} /> DotAll (s)
              </label>
            </div>
          </div>

          {/* Test Text & Replacement Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                TEST INPUT STRING
              </label>
              <textarea
                value={testText}
                onChange={e => setTestText(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  background: '#0a0d14',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                REPLACEMENT TEXT TEMPLATE
              </label>
              <input
                type="text"
                value={replacementText}
                onChange={e => setReplacementText(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0d14',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  color: '#a855f7',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  outline: 'none',
                  marginBottom: '1rem'
                }}
              />
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                REPLACED OUTPUT RESULT:
              </label>
              <div style={{ background: '#0a0d14', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.85rem', color: '#4ade80', minHeight: '80px' }}>
                {replacedOutput}
              </div>
            </div>
          </div>

          {/* Match Results Telemetry */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} /> Match Group Telemetry ({matches.length} matches found)
              </h3>
            </div>

            {matches.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No matches found for the current regular expression pattern.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {matches.map((m, idx) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>MATCH #{idx + 1} AT INDEX {m.index}</span>
                      <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700, fontSize: '0.95rem' }}>"{m.matchText}"</span>
                    </div>

                    {m.groups.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {m.groups.map((grp, gIdx) => (
                          <span key={gIdx} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                            Group {gIdx + 1}: {grp}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Multi-Language Code Generator */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--accent-purple)' }} /> Code Snippet Exporters
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* JS Snippet */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>JavaScript / TypeScript</span>
                  <button onClick={() => copyText(jsSnippet, 'js')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    {copiedCode === 'js' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />} Copy
                  </button>
                </div>
                <pre style={{ background: '#0a0d14', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#38bdf8', margin: 0, overflowX: 'auto' }}>
                  {jsSnippet}
                </pre>
              </div>

              {/* Python Snippet */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Python (re module)</span>
                  <button onClick={() => copyText(pythonSnippet, 'py')} className="btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                    {copiedCode === 'py' ? <Check size={12} style={{ color: '#4ade80' }} /> : <Copy size={12} />} Copy
                  </button>
                </div>
                <pre style={{ background: '#0a0d14', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#a855f7', margin: 0, overflowX: 'auto' }}>
                  {pythonSnippet}
                </pre>
              </div>
            </div>
          </section>
        </main>

        {/* Sidebar Column with Ad & Preset Library */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AdSlot type="sidebar" />

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={16} style={{ color: 'var(--accent-cyan)' }} /> Pattern Presets
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {REGEX_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => applyPreset(preset)}
                    className="btn-secondary"
                    style={{ textAlign: 'left', justifyContent: 'flex-start', padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    [EPIC] {preset.name}
                  </button>
                ))}
              </div>
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
