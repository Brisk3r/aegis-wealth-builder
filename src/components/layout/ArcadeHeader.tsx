'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Zap, Trophy, Flame } from 'lucide-react';
import StudioSwitcher from './StudioSwitcher';

export default function ArcadeHeader() {
  return (
    <header style={{
      background: '#06070d',
      borderBottom: '1px solid rgba(139, 92, 246, 0.25)',
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

          <Link href="/play" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc'
            }}>
              <Gamepad2 size={18} />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '-0.2px' }}>
                KINETIC SURGE <span style={{ color: '#c084fc' }}>// ARCADE</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                Interactive Simulation // 7-Cabinet Engine
              </div>
            </div>
          </Link>
        </div>

        {/* Game Mode Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/play"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#c084fc',
              background: 'rgba(139, 92, 246, 0.12)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Zap size={13} /> Arcade Arena
          </Link>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: '#111624', padding: '0.3rem 0.65rem', borderRadius: '5px', border: '1px solid var(--card-border-subtle)' }}>
            FPS: 60 // Web Audio V2
          </span>
        </nav>
      </div>
    </header>
  );
}
