'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, TrendingUp, Clock, ArrowRight, Tag, User } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';
import { ResearchService, ResearchPaper } from '@/lib/services/ResearchService';

export default function ResearchHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const papers = ResearchService.getPapersByCategory(selectedCategory);
  const categories = ['ALL', 'Web Architecture', 'Vector Graphics', 'Hardware & Benchmarks', 'AI & ML'];

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner Ad Slot */}
      <div style={{ marginBottom: '2rem' }}>
        <AdSlot type="banner" />
      </div>

      {/* Hero Section */}
      <section className="surface-panel" style={{ borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <BookOpen size={14} /> AEGIS RESEARCH LAB
          </span>
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} /> PEER-REVIEWED BENCHMARKS
          </span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Deep-Dive Technical <span className="gradient-text">Research & Whitepapers</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '800px', lineHeight: 1.6 }}>
          Explore empirical benchmarks, web performance studies, vector mathematics, and hardware telemetry breakdowns designed for software architects and senior engineers.
        </p>

        {/* Category Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: '7px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Content Layout with Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Main Papers List */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {papers.map(paper => (
            <article
              key={paper.id}
              className="surface-card hover-card"
              style={{
                padding: '2rem',
                borderRadius: '14px',
                borderLeft: paper.featured ? '4px solid var(--accent-blue)' : '1px solid var(--card-border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                  {paper.category}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={14} /> {paper.readTimeMinutes} min read
                  </span>
                  <span>*</span>
                  <span>{paper.publishedAt}</span>
                </div>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '1rem 0 0.75rem 0', lineHeight: 1.3 }}>
                <Link href={`/research/${paper.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {paper.title}
                </Link>
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {paper.summary}
              </p>

              {/* Empirical Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', background: '#090d16', border: '1px solid var(--card-border-subtle)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                {paper.metrics.map((m, idx) => (
                  <div key={idx}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {m.label}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {m.value}
                      {m.trend && <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>({m.trend})</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Author & CTA Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={16} style={{ color: '#60a5fa' }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', display: 'block' }}>{paper.author}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{paper.authorRole}</span>
                  </div>
                </div>

                <Link
                  href={`/research/${paper.slug}`}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.15rem', fontSize: '0.82rem' }}
                >
                  Read Paper <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </main>

        {/* Sidebar Column with Sticky Ad & Quick Links */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AdSlot type="sidebar" />

            <div className="surface-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} style={{ color: '#60a5fa' }} /> Key Research Topics
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={14} style={{ color: '#c084fc' }} /> App Router Hydration
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={14} style={{ color: '#c084fc' }} /> Cubic Bezier Parameterization
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={14} style={{ color: '#c084fc' }} /> Hardware Price Scrapers
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={14} style={{ color: '#c084fc' }} /> Web Worker Compositing
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Banner Ad Slot */}
      <div style={{ marginTop: '3rem' }}>
        <AdSlot type="banner" />
      </div>
    </div>
  );
}
