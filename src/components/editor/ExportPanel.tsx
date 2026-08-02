"use client";

import { useState } from "react";
import styles from "./Editor.module.css";
import { convertSvgToReactJsx } from "@/utils/svgOptimizer";

interface ExportPanelProps {
  svgContent: string | null;
  fillColor: string;
  strokeColor: string;
  scale: number;
  strokeWidth: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
}

export default function ExportPanel({
  svgContent,
  fillColor,
  strokeColor,
  scale,
  strokeWidth,
  rotation,
  opacity,
  flipX,
  flipY
}: ExportPanelProps) {
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const getProcessedSvgString = () => {
    if (!svgContent) return "";
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svg = doc.querySelector('svg');
    if (!svg) return svgContent;

    // Apply color, opacity, stroke-width
    svg.setAttribute("stroke", strokeColor);
    svg.setAttribute("fill", fillColor);
    svg.setAttribute("opacity", opacity.toString());
    
    const paths = svg.querySelectorAll('*');
    paths.forEach(p => {
      if (p.hasAttribute('stroke') && p.getAttribute('stroke') !== 'none') {
        p.setAttribute('stroke-width', strokeWidth.toString());
      }
    });

    // Apply transforms via wrapper g tag if needed
    if (rotation !== 0 || flipX || flipY || scale !== 1) {
      const transformParts = [];
      if (rotation !== 0) transformParts.push(`rotate(${rotation})`);
      if (flipX || flipY) transformParts.push(`scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`);
      
      const transformAttr = transformParts.join(" ");
      if (transformAttr) {
        const innerContent = svg.innerHTML;
        svg.innerHTML = `<g transform="${transformAttr}" transform-origin="center">${innerContent}</g>`;
      }
    }

    const w = parseFloat(svg.getAttribute("width") || "24");
    const h = parseFloat(svg.getAttribute("height") || "24");
    svg.setAttribute("width", (w * scale).toString());
    svg.setAttribute("height", (h * scale).toString());

    return new XMLSerializer().serializeToString(svg);
  };

  const handleExportSVG = () => {
    const finalSvg = getProcessedSvgString();
    if (!finalSvg) return;
    
    const blob = new Blob([finalSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aegis-icon.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = () => {
    const finalSvg = getProcessedSvgString();
    if (!finalSvg) return;

    const img = new Image();
    const svgBlob = new Blob([finalSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width * 2; // 2x HD scale
      canvas.height = img.height * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "aegis-icon.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopyJSX = () => {
    const finalSvg = getProcessedSvgString();
    if (!finalSvg) return;

    const jsx = convertSvgToReactJsx(finalSvg, "AegisIcon");
    navigator.clipboard.writeText(jsx);
    setCopiedStatus("jsx");
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const handleCopyDataURI = () => {
    const finalSvg = getProcessedSvgString();
    if (!finalSvg) return;

    const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(finalSvg)}`;
    navigator.clipboard.writeText(encoded);
    setCopiedStatus("datauri");
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  return (
    <div className={`glass ${styles.exportPanel}`}>
      <div className={styles.exportInfo}>
        <h3 className={styles.exportTitle}>Export Studio</h3>
        <p className={styles.exportSub}>Export clean vector assets, high-DPI raster images, or React JSX components.</p>
      </div>

      <div className={styles.exportActions}>
        <button 
          className={styles.exportBtn} 
          onClick={handleExportSVG}
          disabled={!svgContent}
        >
          Download SVG
        </button>

        <button 
          className={styles.exportBtnSecondary} 
          onClick={handleExportPNG}
          disabled={!svgContent}
        >
          Download PNG (HD)
        </button>

        <button 
          className={styles.exportBtnSecondary} 
          onClick={handleCopyJSX}
          disabled={!svgContent}
        >
          {copiedStatus === 'jsx' ? 'Copied JSX!' : 'Copy React JSX'}
        </button>

        <button 
          className={styles.exportBtnSecondary} 
          onClick={handleCopyDataURI}
          disabled={!svgContent}
        >
          {copiedStatus === 'datauri' ? 'Copied Data URI!' : 'Copy Data URI'}
        </button>
      </div>
    </div>
  );
}
