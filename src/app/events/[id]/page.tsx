'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, MapPin, User, Download, Bell, Sparkles, Check } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';
import { EventService } from '@/lib/services/EventService';

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const event = EventService.getEventById(resolvedParams.id);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [now, setNow] = useState(Date.now());

  if (!event) {
    notFound();
  }

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeRem = EventService.getTimeRemaining(event.targetDate);

  const handleDownloadIcs = () => {
    const icsData = EventService.generateIcsCalendarContent(event);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.id}-event.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleReminder = () => {
    setIsSubscribed(!isSubscribed);
  };

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Banner Ad */}
      <div style={{ marginBottom: '2rem' }}>
        <AdSlot type="banner" />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Events Calendar
        </Link>
      </div>

      {/* Main Header Container */}
      <header className="glass" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-purple">{event.category}</span>
          <span className="badge badge-cyan">{event.badgeText}</span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          {event.title}
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {event.description}
        </p>

        {/* Live Countdown Grid */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '14px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '1rem' }}>
            <Clock size={20} /> EVENT COUNTDOWN TELEMETRY:
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'center', minWidth: '90px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'block' }}>{timeRem.days}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Days</span>
            </div>

            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'center', minWidth: '90px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'block' }}>{String(timeRem.hours).padStart(2, '0')}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hours</span>
            </div>

            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'center', minWidth: '90px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', display: 'block' }}>{String(timeRem.minutes).padStart(2, '0')}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mins</span>
            </div>

            <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: '12px', textAlign: 'center', minWidth: '90px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-purple)', display: 'block' }}>{String(timeRem.seconds).padStart(2, '0')}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Secs</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleReminder}
            className={isSubscribed ? 'btn-secondary' : 'btn-primary'}
            style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isSubscribed ? <Check size={16} /> : <Bell size={16} />}
            {isSubscribed ? 'Alert Reminder Set' : 'Set Event Alert Reminder'}
          </button>

          <button
            onClick={handleDownloadIcs}
            className="btn-secondary"
            style={{ padding: '0.6rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Download size={16} /> Download .ICS iCal Calendar
          </button>
        </div>
      </header>

      {/* Main Grid Content with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
              Event Specifications & Platform Information
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={18} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>LOCATION / PLATFORM</span>
                  <span style={{ fontWeight: 600 }}>{event.locationOrPlatform}</span>
                </div>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={18} style={{ color: 'var(--accent-purple)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>HOST / ORGANIZER</span>
                  <span style={{ fontWeight: 600 }}>{event.organizer}</span>
                </div>
              </li>

              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={18} style={{ color: 'var(--accent-cyan)' }} />
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>SCHEDULED DATE & TIME</span>
                  <span style={{ fontWeight: 600 }}>{new Date(event.targetDate).toUTCString()}</span>
                </div>
              </li>
            </ul>
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
