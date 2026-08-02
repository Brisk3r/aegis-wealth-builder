"use client";

import styles from "./Editor.module.css";

interface ToolbarProps {
  fillColor: string;
  setFillColor: (color: string) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  scale: number;
  setScale: (scale: number) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  rotation: number;
  setRotation: (deg: number) => void;
  opacity: number;
  setOpacity: (val: number) => void;
  flipX: boolean;
  setFlipX: (val: boolean) => void;
  flipY: boolean;
  setFlipY: (val: boolean) => void;
  bgGrid: "grid-dark" | "grid-light" | "transparent" | "solid";
  setBgGrid: (grid: "grid-dark" | "grid-light" | "transparent" | "solid") => void;
}

export default function Toolbar({
  fillColor, setFillColor,
  strokeColor, setStrokeColor,
  scale, setScale,
  strokeWidth, setStrokeWidth,
  rotation, setRotation,
  opacity, setOpacity,
  flipX, setFlipX,
  flipY, setFlipY,
  bgGrid, setBgGrid
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Fill Color</label>
        <input 
          type="color" 
          value={fillColor} 
          onChange={(e) => setFillColor(e.target.value)} 
          className={styles.colorPicker}
        />
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Stroke Color</label>
        <input 
          type="color" 
          value={strokeColor} 
          onChange={(e) => setStrokeColor(e.target.value)} 
          className={styles.colorPicker}
        />
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Scale ({scale}x)</label>
        <input 
          type="range" 
          min="0.5" 
          max="8" 
          step="0.1" 
          value={scale} 
          onChange={(e) => setScale(parseFloat(e.target.value))} 
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Stroke ({strokeWidth}px)</label>
        <input 
          type="range" 
          min="0.5" 
          max="10" 
          step="0.5" 
          value={strokeWidth} 
          onChange={(e) => setStrokeWidth(parseFloat(e.target.value))} 
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Rotate ({rotation}°)</label>
        <input 
          type="range" 
          min="-180" 
          max="180" 
          step="5" 
          value={rotation} 
          onChange={(e) => setRotation(parseInt(e.target.value))} 
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Opacity ({Math.round(opacity * 100)}%)</label>
        <input 
          type="range" 
          min="0.1" 
          max="1" 
          step="0.05" 
          value={opacity} 
          onChange={(e) => setOpacity(parseFloat(e.target.value))} 
          className={styles.rangeInput}
        />
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Transform</label>
        <div className={styles.toggleRow}>
          <button 
            type="button" 
            className={`${styles.toggleBtn} ${flipX ? styles.toggleActive : ''}`}
            onClick={() => setFlipX(!flipX)}
          >
            Flip X
          </button>
          <button 
            type="button" 
            className={`${styles.toggleBtn} ${flipY ? styles.toggleActive : ''}`}
            onClick={() => setFlipY(!flipY)}
          >
            Flip Y
          </button>
        </div>
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Background</label>
        <select 
          value={bgGrid} 
          onChange={(e) => setBgGrid(e.target.value as "grid-dark" | "grid-light" | "transparent" | "solid")}
          className={styles.selectInput}
        >
          <option value="grid-dark">Dark Grid</option>
          <option value="grid-light">Light Grid</option>
          <option value="transparent">Transparent</option>
          <option value="solid">Solid Black</option>
        </select>
      </div>
    </div>
  );
}
