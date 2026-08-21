export interface ScheduledEvent {
  id: string;
  title: string;
  description: string;
  category: 'Blog Release' | 'Developer Event' | 'Hardware Launch' | 'Free Giveaway' | 'Webinar';
  targetDate: string; // ISO string e.g. '2026-08-20T18:00:00Z'
  locationOrPlatform: string;
  organizer: string;
  badgeText: string;
  associatedLink?: string;
  tags: string[];
  featured?: boolean;
}

const SCHEDULED_EVENTS: ScheduledEvent[] = [
  {
    id: 'evt-001',
    title: 'Next.js 16.3 Architecture & React Server Components Deep-Dive Blog Release',
    description: 'Scheduled comprehensive blog release detailing React 19 server actions, memory management, and CSS Module optimizations.',
    category: 'Blog Release',
    targetDate: '2026-08-18T14:00:00Z',
    locationOrPlatform: 'Aegis Hub Technical Blog',
    organizer: 'Aegis Editorial Team',
    badgeText: 'Upcoming Blog Drop',
    associatedLink: '/research/nextjs-16-app-router-performance',
    tags: ['Blog', 'Next.js 16', 'React 19', 'Web Engineering'],
    featured: true
  },
  {
    id: 'evt-002',
    title: 'Gamescom 2026 Opening Night Live Telemetry Stream',
    description: 'Live coverage and real-time game deal tracker sync for major world premiere game announcements and steam discounts.',
    category: 'Developer Event',
    targetDate: '2026-08-21T18:00:00Z',
    locationOrPlatform: 'Cologne / Online Stream',
    organizer: 'Gamescom / Aegis News Radar',
    badgeText: 'Major Dev Event',
    associatedLink: '/news',
    tags: ['Gaming', 'Gamescom', 'Live Stream', 'Deals'],
    featured: true
  },
  {
    id: 'evt-003',
    title: 'Epic Games Store Mystery Vault Game Giveaway Drop',
    description: 'Scheduled release of 2 major AAA titles available 100% free to claim for a limited 7-day window.',
    category: 'Free Giveaway',
    targetDate: '2026-08-22T15:00:00Z',
    locationOrPlatform: 'Epic Games Store',
    organizer: 'Epic Games',
    badgeText: '100% Free Loot Drop',
    associatedLink: '/giveaways',
    tags: ['Free Games', 'Giveaway', 'Epic Games'],
    featured: true
  },
  {
    id: 'evt-004',
    title: 'NVIDIA RTX 5080/5090 Architecture & Hardware Telemetry Masterclass',
    description: 'Interactive technical session and hardware benchmark release examining Blackwell architecture and real-time ray reconstruction.',
    category: 'Hardware Launch',
    targetDate: '2026-08-26T16:00:00Z',
    locationOrPlatform: 'Aegis Hardware Telemetry Hub',
    organizer: 'Aegis Tech Research',
    badgeText: 'Hardware Benchmark',
    associatedLink: '/research/hardware-telemetry-deals-analysis',
    tags: ['NVIDIA', 'Hardware', 'GPU', 'Benchmarks'],
    featured: false
  },
  {
    id: 'evt-005',
    title: 'Vector Math & SVG Bezier Workbench Live Workshop',
    description: 'Interactive workshop on cubic Bezier curve math, SVG optimization, and custom component generation.',
    category: 'Webinar',
    targetDate: '2026-08-29T17:00:00Z',
    locationOrPlatform: 'Aegis Developer Hub Live Stream',
    organizer: 'Aegis Dev Tools Team',
    badgeText: 'Live Dev Workshop',
    associatedLink: '/tools/svg-studio',
    tags: ['SVG', 'Bezier Math', 'Vector Graphics', 'Workshop'],
    featured: false
  }
];

export class EventService {
  static getAllEvents(): ScheduledEvent[] {
    return SCHEDULED_EVENTS;
  }

  static getEventById(id: string): ScheduledEvent | undefined {
    return SCHEDULED_EVENTS.find(e => e.id === id);
  }

  static getFeaturedEvents(): ScheduledEvent[] {
    return SCHEDULED_EVENTS.filter(e => e.featured);
  }

  static getEventsByCategory(category: string): ScheduledEvent[] {
    if (category === 'ALL') return SCHEDULED_EVENTS;
    return SCHEDULED_EVENTS.filter(e => e.category === category);
  }

  static getTimeRemaining(targetDateIso: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  } {
    const totalMs = Date.parse(targetDateIso) - Date.now();
    if (totalMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const seconds = Math.floor((totalMs / 1000) % 60);
    const minutes = Math.floor((totalMs / 1000 / 60) % 60);
    const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, isPast: false };
  }

  static generateIcsCalendarContent(event: ScheduledEvent): string {
    const startDate = new Date(event.targetDate).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endDate = new Date(Date.parse(event.targetDate) + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '');

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Aegis Hub//Scheduled Events//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@aegishub.com`,
      `DTSTAMP:${startDate}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.locationOrPlatform}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }
}
