'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, DollarSign, TrendingDown, Bell, Sparkles, RefreshCw, Check } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';
import { useCurrency } from '@/context/CurrencyContext';

export default function TelemetryDealsPage() {
  const { currency, formatPrice } = useCurrency();
  const [originalPrice, setOriginalPrice] = useState<number>(59.99);
  const [currentPrice, setCurrentPrice] = useState<number>(14.99);
  const [historicalLowest, setHistoricalLowest] = useState<number>(11.99);
  const [targetAlertPercent, setTargetAlertPercent] = useState<number>(75);

  const discountAmount = Math.max(0, originalPrice - currentPrice);
  const discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
  const isAllTimeLow = currentPrice <= historicalLowest;
  const targetAlertPrice = originalPrice * (1 - targetAlertPercent / 100);

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
            <Tag size={14} /> AEGIS PRICE TELEMETRY
          </span>
          <span className="badge badge-cyan">All-Time Low Threshold Lab</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Hardware & Price Telemetry Lab</h1>
      </section>

      {/* Main Grid Content with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Telemetry Input Controls */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} style={{ color: 'var(--accent-cyan)' }} /> Price & Discount Telemetry Parameters
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  REGULAR MSRP PRICE ({currency.code})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={originalPrice}
                  onChange={e => setOriginalPrice(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.15)', padding: '0.75rem', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  CURRENT SALE PRICE ({currency.code})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={e => setCurrentPrice(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.15)', padding: '0.75rem', borderRadius: '8px', color: '#38bdf8', fontSize: '1rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                  HISTORICAL ALL-TIME LOW ({currency.code})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={historicalLowest}
                  onChange={e => setHistoricalLowest(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', background: '#0a0d14', border: '1px solid rgba(255,255,255,0.15)', padding: '0.75rem', borderRadius: '8px', color: '#a855f7', fontSize: '1rem' }}
                />
              </div>
            </div>
          </div>

          {/* Telemetry Output Metrics Grid */}
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingDown size={18} style={{ color: 'var(--accent-purple)' }} /> Discount & Telemetry Analytics Output
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SAVINGS DISCOUNT</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4ade80', display: 'block' }}>-{discountPercent}%</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>You save {formatPrice(discountAmount)}</span>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ALL-TIME LOW STATUS</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem', color: isAllTimeLow ? '#4ade80' : 'var(--accent-cyan)' }}>
                  {isAllTimeLow ? '[HOT] ALL-TIME LOW!' : `+${formatPrice(currentPrice - historicalLowest)} above ATL`}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TARGET {targetAlertPercent}% ALERT THRESHOLD</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'block' }}>
                  {formatPrice(targetAlertPrice)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trigger alert when price hits threshold</span>
              </div>
            </div>
          </div>
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
