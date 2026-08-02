import Link from "next/link";
import styles from "./guides.module.css";

export const metadata = {
  title: "Developer Guides & SVG Tutorials | Aegis Hub",
  description: "In-depth technical guides on SVG performance optimization, React component conversion, and glassmorphic UI design.",
};

const GUIDES = [
  {
    slug: "mastering-svg-performance-and-svgo",
    title: "Mastering SVG Performance: The Complete SVGO & Optimization Guide",
    description: "Learn how to strip unnecessary metadata, collapse vector paths, and reduce SVG file sizes by up to 80% for web performance.",
    category: "Performance & Optimization",
    readTime: "6 min read"
  },
  {
    slug: "converting-svg-to-react-jsx-tsx",
    title: "Converting and Optimizing SVGs for React, Next.js & TypeScript",
    description: "Best practices for using vector graphics in modern React applications, SVG component props, and zero-runtime icon pipelines.",
    category: "React & Next.js",
    readTime: "8 min read"
  },
  {
    slug: "creating-glassmorphic-and-neon-svg-filters",
    title: "Designing Next-Gen Glassmorphic & Neon UI Effects with SVG Filters",
    description: "Harness SVG feGaussianBlur, feColorMatrix, and linearGradient tags to create hyper-modern glassmorphic UI overlays.",
    category: "UI & CSS Effects",
    readTime: "7 min read"
  }
];

export default function GuidesPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Developer Guides & Technical Articles</h1>
        <p className={styles.description}>
          Actionable, in-depth tutorials on frontend graphics, vector performance, and modern web UI architectures.
        </p>
      </div>

      <div className={styles.grid}>
        {GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className={`glass ${styles.card}`}>
            <span className={styles.category}>{guide.category} • {guide.readTime}</span>
            <h3>{guide.title}</h3>
            <p>{guide.description}</p>
            <span className={styles.readMore}>Read Article &rarr;</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
