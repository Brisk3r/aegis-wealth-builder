"use client";

import { useEffect, useRef } from "react";
import styles from "./Editor.module.css";

interface CanvasProps {
  svgContent: string | null;
  color: string;
  scale: number;
  strokeWidth: number;
}

export default function Canvas({ svgContent, color, scale, strokeWidth }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      containerRef.current.innerHTML = svgContent;
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
      }
    }
  }, [svgContent]);

  return (
    <div className={styles.canvasContainer}>
      {svgContent ? (
        <div 
          ref={containerRef} 
          className={styles.svgWrapper}
          style={{ 
            color: color, 
            transform: `scale(${scale})`,
            "--svg-stroke-width": `${strokeWidth}px` 
          } as React.CSSProperties}
        />
      ) : (
        <div className={styles.emptyState}>Select an icon from the library to begin editing.</div>
      )}
    </div>
  );
}
