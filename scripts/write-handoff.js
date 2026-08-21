const fs = require('fs');
const path = require('path');

// 1. StudioSwitcher.tsx
const studioSwitcherCode = `'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Boxes, 
  ChevronDown, 
  Heart, 
  VectorSquare, 
  Code, 
  Gamepad2, 
  BookOpen, 
  TrendingDown, 
  Calendar, 
  Cpu, 
  ExternalLink
} from 'lucide-react';

interface AppItem {
  name: string;
  division: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  badge: string;
}

const PRODUCTION_APPS: AppItem[] = [
  {
    name: 'Comfort OS',
    division: 'Health & Clinical Systems',
    description: 'Palliative bedside care logging & SBAR handover briefings',
    href: '/palliative-care',
    icon: Heart,
    color: '#2A9D8F',
    badge: 'Clinical OS'
  },
  {
    name: 'VectorForge Pro',
    division: 'Creative Engineering',
    description: 'Precision cubic/quadratic Bezier SVG vector studio',
    href: '/tools/svg-studio',
    icon: VectorSquare,
    color: '#3b82f6',
    badge: 'Creative Suite'
  },
  {
    name: 'RegexIntel Lab',
    division: 'Developer Infrastructure',
    description: 'Pattern evaluation, group visualization & code generation',
    href: '/tools/regex-lab',
    icon: Code,
    color: '#f59e0b',
    badge: 'DevTool'
  },
  {
    name: 'Kinetic Surge & Arcade',
    division: 'Interactive Simulation',
    description: 'Orbital physics roguelite & 7-cabinet arcade engine',
    href: '/play',
    icon: Gamepad2,
    color: '#8b5cf6',
    badge: 'Simulation'
  },
  {
    name: 'Aegis Research Papers',
    division: 'Applied Research',
    description: 'Peer-reviewed web architecture & empirical benchmarks',
    href: '/research',
    icon: BookOpen,
    color: '#60a5fa',
    badge: 'Research'
  },
  {
    name: 'DealRadar Telemetry',
    division: 'Market Telemetry',
    description: 'Live hardware price drops & storefront scrapers',
    href: '/deals',
    icon: TrendingDown,
    color: '#10b981',
    badge: 'Telemetry'
  },
  {
    name: 'Aegis Chrono Pipeline',
    division: 'Release Systems',
    description: 'Scheduled content drops & real-time countdowns',
    href: '/events',
    icon: Calendar,
    color: '#ec4899',
    badge: 'Pipeline'
  },
  {
    name: 'WebOptimizer Lab',
    division: 'Web Utilities',
    description: 'Code minifiers, hash generators & WCAG palette science',
    href: '/tools/web-optimizer',
    icon: Cpu,
    color: '#06b6d4',
    badge: 'Speed Suite'
  }
];

export default function StudioSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.38rem 0.75rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '7px',
          color: '#e2e8f0',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        aria-label="Switch Aegis Apps"
        aria-expanded={isOpen}
      >
        <Boxes size={14} style={{ color: '#60a5fa' }} />
        <span>AEGIS STUDIOS</span>
        <ChevronDown size={12} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--text-muted)' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: '360px',
            maxHeight: '480px',
            overflowY: 'auto',
            background: '#0c1017',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
            padding: '0.75rem',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div style={{ padding: '0.5rem 0.5rem 0.75rem 0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Aegis Software Productions
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.15rem' }}>
              Independent App Ecosystem
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {PRODUCTION_APPS.map(app => {
              const IconComp = app.icon;
              const isActive = pathname?.startsWith(app.href);
              return (
                <Link
                  key={app.name}
                  href={app.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                    border: isActive ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '7px',
                      background: app.color + '15',
                      color: app.color,
                      border: '1px solid ' + app.color + '35',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.1rem'
                    }}
                  >
                    <IconComp size={16} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                        {app.name}
                      </span>
                      <span style={{ fontSize: '0.65rem', background: '#161f2e', color: app.color, padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid ' + app.color + '25' }}>
                        {app.badge}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.2rem 0 0 0', lineHeight: 1.3, whiteSpace: 'normal' }}>
                      {app.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.45rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#60a5fa',
                textDecoration: 'none',
                background: 'rgba(59, 130, 246, 0.06)'
              }}
            >
              <span>View Production House Portfolio</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
`;

// 2. VectorForgeHeader.tsx
const vectorForgeHeaderCode = `'use client';

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
`;

// 3. RegexIntelHeader.tsx
const regexIntelHeaderCode = `'use client';

import React from 'react';
import Link from 'next/link';
import { Code, Terminal, Sparkles, BookOpen, Layers } from 'lucide-react';
import StudioSwitcher from './StudioSwitcher';

export default function RegexIntelHeader() {
  return (
    <header style={{
      background: '#07090e',
      borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
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

          <Link href="/tools/regex-lab" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <Code size={18} />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '-0.2px' }}>
                REGEXINTEL <span style={{ color: '#f59e0b' }}>LAB</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                Developer Infrastructure // Pattern Compiler & Match Inspector
              </div>
            </div>
          </Link>
        </div>

        {/* Sub-Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/tools/regex-lab"
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Terminal size={13} /> Pattern Evaluator
          </Link>

          <Link
            href="/tools/web-optimizer"
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
            <Sparkles size={13} /> Code Optimizer
          </Link>

          <Link
            href="/tools/asset-converter"
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
            <Layers size={13} /> Palette & Assets
          </Link>
        </nav>
      </div>
    </header>
  );
}
`;

// 4. ArcadeHeader.tsx
const arcadeHeaderCode = `'use client';

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
`;

// 5. ResearchHeader.tsx
const researchHeaderCode = `'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Sparkles, TrendingUp, Tag } from 'lucide-react';
import StudioSwitcher from './StudioSwitcher';

export default function ResearchHeader() {
  return (
    <header style={{
      background: '#070a12',
      borderBottom: '1px solid rgba(96, 165, 250, 0.2)',
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

          <Link href="/research" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
              <BookOpen size={18} />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', letterSpacing: '-0.2px' }}>
                AEGIS <span style={{ color: '#60a5fa' }}>PAPERS</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 500 }}>
                Applied Research // Web Architecture & Empirical Benchmarks
              </div>
            </div>
          </Link>
        </div>

        {/* Research Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link
            href="/research"
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
            <BookOpen size={13} /> Whitepapers
          </Link>

          <Link
            href="/events"
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
            <Sparkles size={13} /> Release Radar
          </Link>
        </nav>
      </div>
    </header>
  );
}
`;

// 6. TelemetryHeader.tsx
const telemetryHeaderCode = `'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingDown, Tag, Heart, Bell, Cpu } from 'lucide-react';
import StudioSwitcher from './StudioSwitcher';
import { useCurrency } from '@/context/CurrencyContext';

export default function TelemetryHeader() {
  const { currentCurrency, setCurrency, availableCurrencies } = useCurrency();

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
            value={currentCurrency.code}
            onChange={e => setCurrency(e.target.value)}
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
            {availableCurrencies.map(c => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
`;

// 7. ChronoHeader.tsx
const chronoHeaderCode = `'use client';

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
`;

fs.writeFileSync('src/components/layout/StudioSwitcher.tsx', studioSwitcherCode, 'utf8');
fs.writeFileSync('src/components/layout/VectorForgeHeader.tsx', vectorForgeHeaderCode, 'utf8');
fs.writeFileSync('src/components/layout/RegexIntelHeader.tsx', regexIntelHeaderCode, 'utf8');
fs.writeFileSync('src/components/layout/ArcadeHeader.tsx', arcadeHeaderCode, 'utf8');
fs.writeFileSync('src/components/layout/ResearchHeader.tsx', researchHeaderCode, 'utf8');
fs.writeFileSync('src/components/layout/TelemetryHeader.tsx', telemetryHeaderCode, 'utf8');
fs.writeFileSync('src/components/layout/ChronoHeader.tsx', chronoHeaderCode, 'utf8');

console.log('Successfully generated all independent App Headers and StudioSwitcher!');

