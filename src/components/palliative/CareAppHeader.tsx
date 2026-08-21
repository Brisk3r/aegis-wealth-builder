'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Moon, 
  Sun, 
  Smartphone, 
  Wifi
} from 'lucide-react';
import styles from './palliative.module.css';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface CareAppHeaderProps {
  onOpenPhoneConnect?: () => void;
}

export default function CareAppHeader({ onOpenPhoneConnect }: CareAppHeaderProps) {
  const [themeMode, setThemeMode] = useState<'default' | 'amber_night' | 'dim_red'>('default');
  const [activePodName, setActivePodName] = useState<string>('');

  useEffect(() => {
    PalliativeDb.initialize();
    const mode = PalliativeDb.getThemeMode();
    const currentPod = PalliativeDb.getCarePod();
    setThemeMode(mode);
    setActivePodName(currentPod?.patient_display_name || '');
  }, []);

  const handleCycleTheme = () => {
    PalliativeSpeech.triggerHaptic('medium');
    let nextTheme: 'default' | 'amber_night' | 'dim_red' = 'amber_night';
    if (themeMode === 'default') nextTheme = 'amber_night';
    else if (themeMode === 'amber_night') nextTheme = 'dim_red';
    else nextTheme = 'default';

    setThemeMode(nextTheme);
    PalliativeDb.setThemeMode(nextTheme);
  };

  return (
    <header className="noPrint" style={{
      background: 'rgba(15, 18, 28, 0.97)',
      borderBottom: '1px solid rgba(42, 157, 143, 0.15)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Main Care Brand Header */}
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand Logo & Subtitle */}
        <Link href="/palliative-care" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(42, 157, 143, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2A9D8F'
          }}>
            <Heart size={22} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Aegis Care
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--p-text-secondary)', fontWeight: 400 }}>
              Family care coordination {activePodName && `* ${activePodName}`}
            </div>
          </div>
        </Link>

        {/* Header Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Theme Toggle */}
          <button
            onClick={handleCycleTheme}
            className={styles.themeToggleBtn}
            style={{ 
              minHeight: '40px', 
              fontSize: '0.875rem', 
              padding: '0.5rem 1rem',
              borderRadius: '24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--p-text-primary)',
              cursor: 'pointer'
            }}
            title="Toggle Night Light"
          >
            {themeMode === 'default' ? <Moon size={16} /> : themeMode === 'amber_night' ? <Sun size={16} style={{ color: '#E9C46A' }} /> : <Heart size={16} style={{ color: '#E76F51' }} />}
            <span style={{ display: 'inline-block' }}>
              {themeMode === 'default' ? 'Night light' : themeMode === 'amber_night' ? 'Warm glow' : 'Rest mode'}
            </span>
          </button>

          {/* Connect Phone Button */}
          {onOpenPhoneConnect && (
            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenPhoneConnect(); }}
              style={{ 
                minHeight: '40px', 
                fontSize: '0.875rem', 
                padding: '0.5rem 1rem', 
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem', 
                background: 'rgba(42, 157, 143, 0.1)',
                border: '1px solid rgba(42, 157, 143, 0.2)',
                borderRadius: '24px',
                color: '#2A9D8F',
                cursor: 'pointer'
              }}
            >
              <Smartphone size={16} /> Pair device
            </button>
          )}

          {/* Offline Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.5rem',
            borderRadius: '24px',
            background: 'transparent',
            color: 'var(--p-text-secondary)',
            fontSize: '0.875rem',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2A9D8F', display: 'inline-block' }} />
            <span>Synced</span>
          </div>
        </div>
      </div>
    </header>
  );
}
