'use client';

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
  ExternalLink,
  Sparkles
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
    name: 'GlyphCraft Studio',
    division: 'Creative Unicode Forge',
    description: '1,500+ aesthetic symbols, kaomoji, Lenny faces & 22+ font stylers',
    href: '/symbols',
    icon: Sparkles,
    color: '#a855f7',
    badge: 'Unicode Pro'
  },
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
