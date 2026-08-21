'use client';

import React from 'react';
import Link from 'next/link';
import { VectorSquare, Sparkles, Layers, ArrowLeft, Download, Code, Palette } from 'lucide-react';
import StudioSwitcher from './StudioSwitcher';

export default function VectorForgeHeader() {
  return (
    <header style={{
      background: '#070a12',
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0.65rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Column */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <StudioSwitcher />

          <div style={{ width: '1px', height: '22px', background: 'rgba(255, 255, 255, 0.1)' }} />

          <Link href="/tools/svg-studio" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}>
              <VectorSquare size={18} />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '-0.2px' }}>
                VECTORFORGE <span style={{ color: '#60a5fa' }}>PRO</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                Creative Engineering // Bezier Math Studio
              </div>
            </div>
          </Link>
        </div>

        {/* Studio Sub-Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/tools/svg-studio"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#60a5fa',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <VectorSquare size={13} /> Bezier Workbench
          </Link>

          <Link
            href="/svg-editor"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Layers size={13} /> Path Editor
          </Link>

          <Link
            href="/svg-converter"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Download size={13} /> Canvas Exporter
          </Link>

          <Link
            href="/svg-generators"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Sparkles size={13} /> Wave & Blob Forge
          </Link>
        </nav>
      </div>
    </header>
  );
}
