'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';

export default function CareAppFooter() {
  return (
    <footer className="noPrint" style={{
      marginTop: '4rem',
      borderTop: '1px solid rgba(42, 157, 143, 0.12)',
      background: 'rgba(10, 12, 20, 0.98)',
      paddingTop: '2rem'
    }}>
      {/* Mandatory Architectural Footer Ad */}
      <div style={{ maxWidth: '1380px', margin: '0 auto 2rem auto', padding: '0 1.5rem' }}>
        <AdSlot type="banner" />
      </div>

      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '0 1.5rem 3rem 1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2.5rem'
      }}>
        {/* Brand & Purpose */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(42, 157, 143, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2A9D8F'
            }}>
              <Heart size={16} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--p-text-primary)' }}>
              Aegis Care
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', lineHeight: 1.6, margin: '0 0 1rem 0', fontWeight: 400 }}>
            Helping families coordinate care together
          </p>

          <div style={{ fontSize: '0.8rem', color: 'var(--p-text-muted)', fontWeight: 400 }}>
            (C) {new Date().getFullYear()} Aegis Care.
          </div>
        </div>

        {/* Safety & Emergency Notice */}
        <div style={{
          background: 'rgba(42, 157, 143, 0.05)',
          padding: '1.25rem',
          borderRadius: '16px',
          border: '1px solid rgba(42, 157, 143, 0.12)'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--p-text-primary)', marginBottom: '0.5rem', marginTop: 0 }}>
            Emergency notice
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--p-text-secondary)', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>
            In a medical emergency, call 000 / 911 / 999 immediately. This app supports care coordination but does not replace professional medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
