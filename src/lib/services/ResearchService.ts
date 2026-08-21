export interface ResearchPaper {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: 'AI & ML' | 'Web Architecture' | 'Vector Graphics' | 'Hardware & Benchmarks' | 'Dev Tooling';
  author: string;
  authorRole: string;
  publishedAt: string;
  readTimeMinutes: number;
  keyTakeaways: string[];
  metrics: { label: string; value: string; trend?: string }[];
  contentSections: {
    heading: string;
    body: string;
    codeSnippet?: string;
    codeLanguage?: string;
  }[];
  tags: string[];
  featured?: boolean;
}

const RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'res-001',
    slug: 'nextjs-16-app-router-performance',
    title: 'High-Density React 19 & Next.js 16 App Router Performance Benchmarks',
    summary: 'An empirical evaluation of server components vs client-side dynamic rendering in high-density web dashboards, measuring TBT, INP, and memory allocations.',
    category: 'Web Architecture',
    author: 'Dr. Marcus Vance',
    authorRole: 'Principal Web Architect',
    publishedAt: '2026-08-10',
    readTimeMinutes: 8,
    featured: true,
    keyTakeaways: [
      'Server-side rendering reduces initial JS bundle size by up to 64% in data-dense layouts.',
      'CSS Modules with scoped CSS variables outperform utility-first dynamic class injection during heavy micro-animations.',
      'Web Worker offloading for SVG Bezier path computation eliminates main thread blocking during dynamic UI interactions.'
    ],
    metrics: [
      { label: 'Bundle Size Reduction', value: '64%', trend: '+12% vs Next 15' },
      { label: 'Main Thread INP', value: '14ms', trend: 'Ultra Low' },
      { label: 'DOM Node Efficiency', value: '99.4%', trend: 'Optimal' }
    ],
    contentSections: [
      {
        heading: 'Executive Summary & Methodology',
        body: 'Modern web applications require high data density without compromising smooth 60fps interaction. This study evaluates rendering performance across 100,000 active nodes using Next.js 16 App Router architecture.'
      },
      {
        heading: 'Server Components vs Client Hydration',
        body: 'By isolating client interactivity strictly to sub-component boundaries (e.g. SVG path manipulation and live canvas rendering), static shell components stream without hydration overhead.',
        codeSnippet: `// Optimized Server-Client Boundary Pattern
import HeaderAd from '@/components/layout/AdSlot';
import DynamicSvgEditor from '@/components/editor/DynamicSvgEditor';

export default async function ResearchWorkbench() {
  const dataset = await fetchTelemetryDataset();
  return (
    <div className="layout-grid">
      <HeaderAd type="banner" />
      <DynamicSvgEditor initialData={dataset} />
    </div>
  );
}`,
        codeLanguage: 'typescript'
      },
      {
        heading: 'Micro-Animation Performance & GPU Acceleration',
        body: 'Enforcing GPU layer compositing (\`will-change: transform, opacity\`) prevents costly browser layout recalculations when animating glassmorphic backdrops and dynamic charts.'
      }
    ],
    tags: ['Next.js 16', 'React 19', 'Web Architecture', 'Performance', 'Benchmarks']
  },
  {
    id: 'res-002',
    slug: 'cubic-bezier-path-optimization',
    title: 'Precision Vector Math: Cubic & Quadratic Bezier Path Optimization',
    summary: 'A deep mathematical analysis of Bezier curve smooth interpolation algorithms, path simplification, and SVG rendering efficiency in modern web browsers.',
    category: 'Vector Graphics',
    author: 'Elena Rostova',
    authorRole: 'Lead Graphics Engineer',
    publishedAt: '2026-08-08',
    readTimeMinutes: 12,
    featured: true,
    keyTakeaways: [
      'Cubic Bezier curve commands (\`C\`) provide smooth curvature continuity (C2 continuity) compared to linear piecewise approximation.',
      'Curve subdivision via de Casteljau algorithm allows dynamic arc length parameterization with exact pixel-space bounding boxes.',
      'Clean path quantization reduces SVG file sizes by up to 45% without visual distortion.'
    ],
    metrics: [
      { label: 'Path Compression', value: '45%', trend: 'Lossless' },
      { label: 'Rendering Latency', value: '0.4ms', trend: '60 FPS' },
      { label: 'Curve Precision', value: '64-bit', trend: 'Float Acc' }
    ],
    contentSections: [
      {
        heading: 'Mathematical Foundation of Cubic Curves',
        body: 'A cubic Bezier curve is parameterized by four control points P0, P1, P2, and P3 according to the explicit Bernstein polynomial formulation B(t) = (1-t)^3P0 + 3(1-t)^2tP1 + 3(1-t)t^2P2 + t^3P3.'
      },
      {
        heading: 'De Casteljau Subdivision & Interactive Editing',
        body: 'Interactive vector tools utilize recursive de Casteljau splitting to calculate exact curve intersections and tangent vectors for real-time handle dragging.',
        codeSnippet: `export function calculateCubicBezierPoint(
  p0: number, p1: number, p2: number, p3: number, t: number
): number {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return uuu * p0 + 3 * uu * t * p1 + 3 * u * tt * p2 + ttt * p3;
}`,
        codeLanguage: 'typescript'
      }
    ],
    tags: ['SVG', 'Bezier Math', 'Vector Graphics', 'Algorithms', 'Geometry']
  },
  {
    id: 'res-003',
    slug: 'hardware-telemetry-deals-analysis',
    title: 'PC Gaming Hardware Price Telemetry & Storefront Aggregation Algorithms',
    summary: 'Analyzing price drop frequencies, storefront API rate limits, and currency volatility algorithms across digital and physical distribution networks.',
    category: 'Hardware & Benchmarks',
    author: 'Aegis Telemetry Team',
    authorRole: 'Data Analytics Group',
    publishedAt: '2026-08-05',
    readTimeMinutes: 6,
    featured: false,
    keyTakeaways: [
      'Digital storefront sale cycles follow deterministic quarterly windows with predictable discount depths.',
      'Multi-currency normalization prevents arbitrage distortion when tracking regional lowest price thresholds.',
      'Automated price telemetry scrapers require adaptive exponential backoff to maintain 99.9% API uptime.'
    ],
    metrics: [
      { label: 'Storefront Coverage', value: '14 Stores', trend: 'Global' },
      { label: 'Telemetry Sync Rate', value: '5 Min', trend: 'Real-Time' },
      { label: 'Price Alert Accuracy', value: '99.8%', trend: 'Verified' }
    ],
    contentSections: [
      {
        heading: 'Telemetry Architecture Overview',
        body: 'Aegis Telemetry collects price data from Steam, Epic Games, GOG, PlayStation Store, Nintendo eShop, and Xbox Store, parsing pricing tiers and regional discounts into a unified historical database.'
      }
    ],
    tags: ['Price Telemetry', 'Deals Aggregation', 'Data Science', 'Storefront APIs']
  }
];

export class ResearchService {
  static getAllPapers(): ResearchPaper[] {
    return RESEARCH_PAPERS;
  }

  static getPaperBySlug(slug: string): ResearchPaper | undefined {
    return RESEARCH_PAPERS.find(p => p.slug === slug);
  }

  static getFeaturedPapers(): ResearchPaper[] {
    return RESEARCH_PAPERS.filter(p => p.featured);
  }

  static getPapersByCategory(category: string): ResearchPaper[] {
    if (category === 'ALL') return RESEARCH_PAPERS;
    return RESEARCH_PAPERS.filter(p => p.category === category);
  }
}
