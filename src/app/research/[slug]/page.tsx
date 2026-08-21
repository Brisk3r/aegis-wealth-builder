'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, User, CheckCircle2, Download, Share2, Sparkles } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';
import { ResearchService } from '@/lib/services/ResearchService';

export default function ResearchPaperDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const paper = ResearchService.getPaperBySlug(resolvedParams.slug);

  if (!paper) {
    notFound();
  }

  const handleDownloadBrief = () => {
    const briefContent = `AEGIS RESEARCH BRIEF: ${paper.title}\nAuthor: ${paper.author} (${paper.publishedAt})\n\nKEY TAKEAWAYS:\n${paper.keyTakeaways.map(t => `- ${t}`).join('\n')}\n\nSUMMARY:\n${paper.summary}`;
    const blob = new Blob([briefContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.slug}-brief.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Ad Slot */}
      <div style={{ marginBottom: '2rem' }}>
        <AdSlot type="banner" />
      </div>

      {/* Back Link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/research" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Research Hub
        </Link>
      </div>

      {/* Paper Header Card */}
      <header className="glass" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-purple">{paper.category}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Clock size={14} /> {paper.readTimeMinutes} min read
          </span>
          <span style={{ color: 'var(--text-muted)' }}>*</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Published {paper.publishedAt}</span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.25 }}>
          {paper.title}
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {paper.summary}
        </p>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
          {paper.metrics.map((m, idx) => (
            <div key={idx}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>{m.label}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Author & Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'var(--accent-cyan)' }}>
              <User size={20} />
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'block' }}>{paper.author}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{paper.authorRole}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDownloadBrief} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={14} /> Download Brief
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Article Body */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Key Takeaways Callout Box */}
          <section className="glass" style={{ padding: '1.75rem', borderRadius: '16px', borderLeft: '4px solid var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.05)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} /> Key Research Takeaways
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {paper.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  <CheckCircle2 size={16} style={{ color: '#4ade80', marginTop: '3px', flexShrink: 0 }} />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Paper Sections */}
          {paper.contentSections.map((sec, idx) => (
            <section key={idx} className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                {sec.heading}
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', marginBottom: sec.codeSnippet ? '1.25rem' : '0' }}>
                {sec.body}
              </p>

              {sec.codeSnippet && (
                <div style={{ background: '#0a0d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1.25rem', overflowX: 'auto' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {sec.codeLanguage || 'code'}
                  </div>
                  <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', color: '#38bdf8', lineHeight: 1.5 }}>
                    {sec.codeSnippet}
                  </pre>
                </div>
              )}
            </section>
          ))}
        </main>

        {/* Sidebar Column */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AdSlot type="sidebar" />

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Tags</h4>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {paper.tags.map(tag => (
                  <span key={tag} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Ad Slot */}
      <div style={{ marginTop: '3rem' }}>
        <AdSlot type="banner" />
      </div>
    </div>
  );
}
