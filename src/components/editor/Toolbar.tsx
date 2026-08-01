"use client";

import styles from "./Editor.module.css";

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  scale: number;
  setScale: (scale: number) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

export default function Toolbar({ color, setColor, scale, setScale, strokeWidth, setStrokeWidth }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Color</label>
        <input 
          type="color" 
          value={color} 
          onChange={(e) => setColor(e.target.value)} 
          className={styles.colorPicker}
        />
      </div>
      <div className={styles.toolGroup}>
        <label className={styles.toolLabel}>Scale ({scale}x)</label>
        <input 
          type="range" 
          min="0.5" 
          max="10" 
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
    </div>
  );
}
