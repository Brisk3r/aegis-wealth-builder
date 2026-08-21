'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, Bell, Sparkles } from 'lucide-react';
import StudioSwitcher from './StudioSwitcher';

export default function ChronoHeader() {
  return (
    <header style={{
      background: '#090712',
      borderBottom: '1px solid rgba(236, 72, 153, 0.2)',
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

          <Link href="/events" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(236, 72, 153, 0.15)',
              border: '1px solid rgba(236, 72, 153, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f472b6'
            }}>
              <Calendar size={18} />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '-0.2px' }}>
                AEGIS <span style={{ color: '#f472b6' }}>CHRONO</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                Release Systems // Content Pipeline & Countdown Engine
              </div>
            </div>
          </Link>
        </div>

        {/* Chrono Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/events"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#f472b6',
              background: 'rgba(236, 72, 153, 0.1)',
              border: '1px solid rgba(236, 72, 153, 0.25)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Clock size={13} /> Scheduled Drops
          </Link>

          <Link
            href="/news"
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
            <Sparkles size={13} /> Editorial Radar
          </Link>
        </nav>
      </div>
    </header>
  );
}
