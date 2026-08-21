'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingDown, Tag, Heart, Bell, Cpu } from 'lucide-react';
import StudioSwitcher from './StudioSwitcher';
import { useCurrency } from '@/context/CurrencyContext';
import { SUPPORTED_CURRENCIES } from '@/utils/currency';

export default function TelemetryHeader() {
  const { currency, setCurrencyCode } = useCurrency();

  return (
    <header style={{
      background: '#070b14',
      borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
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

          <Link href="/deals" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <TrendingDown size={18} />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '-0.2px' }}>
                DEALRADAR <span style={{ color: '#34d399' }}>TELEMETRY</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                Market Telemetry // Hardware & Storefront Scraper Engine
              </div>
            </div>
          </Link>
        </div>

        {/* Telemetry Nav & Currency Selector */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/deals"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Tag size={13} /> Live Drops
          </Link>

          <Link
            href="/tools/telemetry-deals"
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
            <Cpu size={13} /> Hardware Math
          </Link>

          <Link
            href="/dashboard"
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
            <Heart size={13} /> Wishlist Alerts
          </Link>

          <select
            value={currency.code}
            onChange={e => setCurrencyCode(e.target.value)}
            style={{
              background: '#0c1017',
              border: '1px solid var(--card-border)',
              color: '#f8fafc',
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {Object.values(SUPPORTED_CURRENCIES).map(c => (
              <option key={c.code} value={c.code}>
                [{c.code}] {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
