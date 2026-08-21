'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="layout-container" style={{ background: '#070913', minHeight: '100vh', color: '#f8fafc' }}>
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}
