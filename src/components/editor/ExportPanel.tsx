"use client";

import styles from "./Editor.module.css";

interface ExportPanelProps {
  svgContent: string | null;
  color: string;
  scale: number;
  strokeWidth: number;
}

export default function ExportPanel({ svgContent, color, scale, strokeWidth }: ExportPanelProps) {
  const handleExportSVG = () => {
    if (!svgContent) return;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svg = doc.querySelector('svg');
    if (svg) {
      svg.setAttribute("color", color);
      
      const paths = svg.querySelectorAll('*');
      paths.forEach(p => {
        if (p.hasAttribute('stroke') && p.getAttribute('stroke') !== 'none') {
          p.setAttribute('stroke-width', strokeWidth.toString());
        }
      });
      
      const w = parseFloat(svg.getAttribute("width") || "24");
      const h = parseFloat(svg.getAttribute("height") || "24");
      svg.setAttribute("width", (w * scale).toString());
      svg.setAttribute("height", (h * scale).toString());

      const finalSvg = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([finalSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "aegis-icon.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`glass ${styles.exportPanel}`}>
      <h3 className={styles.exportTitle}>Export</h3>
      <div className={styles.exportActions}>
        <button 
          className={styles.exportBtn} 
          onClick={handleExportSVG}
          disabled={!svgContent}
        >
          Download SVG
        </button>
      </div>
    </div>
  );
}
