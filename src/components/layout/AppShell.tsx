'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CareAppHeader from '@/components/palliative/CareAppHeader';
import CareAppFooter from '@/components/palliative/CareAppFooter';
import VectorForgeHeader from './VectorForgeHeader';
import RegexIntelHeader from './RegexIntelHeader';
import ArcadeHeader from './ArcadeHeader';
import ResearchHeader from './ResearchHeader';
import TelemetryHeader from './TelemetryHeader';
import ChronoHeader from './ChronoHeader';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname() || '';

  // 1. Comfort OS (Palliative Clinical Suite)
  if (pathname.startsWith('/palliative-care')) {
    return (
      <div className="layout-container" style={{ background: '#0F1117', minHeight: '100vh', color: '#F0EDE8' }}>
        <CareAppHeader />
        <main className="main-content" style={{ padding: '1rem', maxWidth: '1380px', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
        <CareAppFooter />
      </div>
    );
  }

  // 2. VectorForge Pro (Creative Engineering)
  if (pathname.startsWith('/tools/svg-studio') || pathname.startsWith('/svg-')) {
    return (
      <div className="layout-container" style={{ background: '#05070d', minHeight: '100vh' }}>
        <VectorForgeHeader />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 3. RegexIntel Lab & DevTools (Developer Infrastructure)
  if (pathname.startsWith('/tools/regex-lab') || pathname.startsWith('/utilities/regex')) {
    return (
      <div className="layout-container" style={{ background: '#07090e', minHeight: '100vh' }}>
        <RegexIntelHeader />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 4. Kinetic Surge & Arcade Universe (Interactive Simulation)
  if (pathname.startsWith('/play') || pathname.startsWith('/arcade')) {
    return (
      <div className="layout-container" style={{ background: '#05060b', minHeight: '100vh' }}>
        <ArcadeHeader />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 5. Aegis Research Papers (Applied Research)
  if (pathname.startsWith('/research')) {
    return (
      <div className="layout-container" style={{ background: '#07090f', minHeight: '100vh' }}>
        <ResearchHeader />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 6. DealRadar Telemetry (Market Telemetry)
  if (pathname.startsWith('/deals') || pathname.startsWith('/tools/telemetry-deals') || pathname.startsWith('/dashboard')) {
    return (
      <div className="layout-container" style={{ background: '#070b14', minHeight: '100vh' }}>
        <TelemetryHeader />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // 7. Chrono Pipeline (Release Systems)
  if (pathname.startsWith('/events')) {
    return (
      <div className="layout-container" style={{ background: '#080612', minHeight: '100vh' }}>
        <ChronoHeader />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Default: Umbrella Aegis Software Productions Hub
  return (
    <div className="layout-container">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

