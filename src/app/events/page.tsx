'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Sparkles, Bell, Download, ExternalLink, Tag } from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';
import { EventService, ScheduledEvent } from '@/lib/services/EventService';

export default function EventsCalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setEvents(EventService.getEventsByCategory(selectedCategory));
  }, [selectedCategory]);

  // Update live clock every second for exact countdown precision
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = ['ALL', 'Blog Release', 'Developer Event', 'Hardware Launch', 'Free Giveaway', 'Webinar'];

  const handleDownloadCalendar = (event: ScheduledEvent) => {
    const icsData = EventService.generateIcsCalendarContent(event);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.id}-event.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '2rem 0', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header Ad Slot */}
      <div style={{ marginBottom: '2rem' }}>
        <AdSlot type="banner" />
      </div>

      {/* Hero Section */}
      <section className="surface-panel" style={{ borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={14} /> AEGIS CONTENT RADAR
          </span>
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={14} /> AUTOMATED EVENT PIPELINE
          </span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
          Scheduled Events & <span className="gradient-text">Content Release Calendar</span>
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '800px', lineHeight: 1.6 }}>
          Track upcoming tech blog releases, developer webinars, hardware benchmark drops, developer events, and free loot releases with real-time countdown timers.
        </p>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', borderRadius: '7px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid Content with Sticky Sidebar Ad */}
      <div className="content-with-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        {/* Events Timeline List */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {events.map(evt => {
            const timeRem = EventService.getTimeRemaining(evt.targetDate);
            return (
              <article
                key={evt.id}
                className="surface-card hover-card"
                style={{
                  padding: '2rem',
                  borderRadius: '14px',
                  borderLeft: evt.featured ? '4px solid var(--accent-indigo)' : '1px solid var(--card-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                      {evt.category}
                    </span>
                    <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                      {evt.badgeText}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    ** {evt.locationOrPlatform}
                  </span>
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '1rem 0 0.5rem 0' }}>
                  <Link href={`/events/${evt.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {evt.title}
                  </Link>
                </h2>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {evt.description}
                </p>

                {/* Live Countdown Timer Grid */}
                <div style={{ background: '#090d16', border: '1px solid var(--card-border-subtle)', padding: '1.25rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.88rem' }}>
                    <Clock size={16} /> LIVE COUNTDOWN:
                  </div>

                  {timeRem.isPast ? (
                    <span style={{ color: '#34d399', fontWeight: 700 }}>EVENT IS LIVE NOW</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', display: 'block' }}>{timeRem.days}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Days</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', alignSelf: 'center' }}>:</span>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', display: 'block' }}>{String(timeRem.hours).padStart(2, '0')}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hours</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', alignSelf: 'center' }}>:</span>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#60a5fa', display: 'block' }}>{String(timeRem.minutes).padStart(2, '0')}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mins</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', alignSelf: 'center' }}>:</span>
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#c084fc', display: 'block' }}>{String(timeRem.seconds).padStart(2, '0')}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Secs</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions & Calendar Export */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {evt.tags.map(tag => (
                      <span key={tag} className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDownloadCalendar(evt)}
                      className="btn-secondary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Download size={13} /> Add to Calendar (.ics)
                    </button>
                    <Link
                      href={`/events/${evt.id}`}
                      className="btn-primary"
                      style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      Details & Reminder <Bell size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </main>

        {/* Sidebar Column with Ad */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AdSlot type="sidebar" />

            <div className="surface-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: '#60a5fa' }} /> Automated Blog Pipeline
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Aegis Hub continuously synchronizes upcoming scheduled developer events with automated research blog posts to ensure fresh content drops every week.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Ad Slot */}
      <div style={{ marginTop: '3rem' }}>
        <AdSlot type="banner" />
      </div>
    </div>
  );
}
