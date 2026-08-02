"use client";

import { useEffect, useRef } from "react";
import styles from "./Editor.module.css";
import { applyDeepColorOverrides } from "@/utils/svgOptimizer";

interface CanvasProps {
  svgContent: string | null;
  fillColor: string;
  strokeColor: string;
  scale: number;
  strokeWidth: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  bgGrid: "grid-dark" | "grid-light" | "transparent" | "solid";
}

export default function Canvas({
  svgContent,
  fillColor,
  strokeColor,
  scale,
  strokeWidth,
  rotation,
  opacity,
  flipX,
  flipY,
  bgGrid
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      const processed = applyDeepColorOverrides(svgContent, fillColor, strokeColor, strokeWidth);
      containerRef.current.innerHTML = processed;
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
      }
    }
  }, [svgContent, fillColor, strokeColor, strokeWidth]);

  const transformStyle = `scale(${scale}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`;

  return (
    <div className={`${styles.canvasContainer} ${styles[bgGrid]}`}>
      {svgContent ? (
        <div 
          ref={containerRef} 
          className={styles.svgWrapper}
          style={{ 
            color: strokeColor,
            fill: fillColor,
            transform: transformStyle,
            opacity: opacity
          } as React.CSSProperties}
        />
      ) : (
        <div className={styles.emptyState}>Select an icon from the library to begin editing.</div>
      )}
    </div>
  );
}
