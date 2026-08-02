"use client";

import { useState } from "react";
import styles from "./Generators.module.css";

export default function SVGGenerators() {
  const [activeTab, setActiveTab] = useState<"waves" | "patterns">("waves");

  // Wave Generator State
  const [amplitude, setAmplitude] = useState<number>(50);
  const [frequency, setFrequency] = useState<number>(3);
  const [waveColor, setWaveColor] = useState<string>("#6366f1");
  const [waveHeight, setWaveHeight] = useState<number>(200);

  // Pattern Generator State
  const [patternType, setPatternType] = useState<"dots" | "grid" | "isometric">("dots");
  const [patternColor, setPatternColor] = useState<string>("#818cf8");
  const [patternSize, setPatternSize] = useState<number>(20);
  const [dotRadius, setDotRadius] = useState<number>(2);

  const [copied, setCopied] = useState(false);

  // Generate Wave SVG Path
  const generateWavePath = () => {
    const width = 1440;
    const points = [];
    const step = width / (frequency * 10);
    
    for (let x = 0; x <= width; x += step) {
      const y = waveHeight / 2 + Math.sin((x / width) * Math.PI * 2 * frequency) * amplitude;
      points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }

    const pathData = `M 0,${waveHeight} L ${points.join(" L ")} L ${width},${waveHeight} Z`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${waveHeight}" width="100%" height="${waveHeight}">
  <path fill="${waveColor}" d="${pathData}" />
</svg>`;
  };

  // Generate Pattern SVG
  const generatePatternSvg = () => {
    if (patternType === "dots") {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${patternSize}" height="${patternSize}">
  <circle cx="${patternSize / 2}" cy="${patternSize / 2}" r="${dotRadius}" fill="${patternColor}" />
</svg>`;
    } else if (patternType === "grid") {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${patternSize}" height="${patternSize}">
  <path d="M ${patternSize} 0 L 0 0 0 ${patternSize}" fill="none" stroke="${patternColor}" stroke-width="1" />
</svg>`;
    } else {
      // Isometric
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${patternSize * 2}" height="${patternSize * 2}">
  <path d="M${patternSize} 0 L${patternSize * 2} ${patternSize} L${patternSize} ${patternSize * 2} L0 ${patternSize} Z" fill="none" stroke="${patternColor}" stroke-width="1" />
</svg>`;
    }
  };

  const currentSvg = activeTab === "waves" ? generateWavePath() : generatePatternSvg();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SVG Wave & Pattern Studio</h1>
        <p className={styles.description}>
          Design liquid section dividers and geometric background patterns for web UI.
        </p>
      </div>

      {/* Selector Tabs */}
      <div className={styles.tabBar}>
        <button 
          className={`${styles.tab} ${activeTab === 'waves' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('waves')}
        >
          🌊 Wave Divider Generator
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'patterns' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          ✨ Background Pattern Generator
        </button>
      </div>

      <div className={styles.grid}>
        {/* Controls Column */}
        <div className={`glass ${styles.card}`}>
          <h3>{activeTab === 'waves' ? 'Wave Configuration' : 'Pattern Configuration'}</h3>

          {activeTab === 'waves' ? (
            <>
              <div className={styles.formGroup}>
                <label>Wave Color</label>
                <input 
                  type="color" 
                  value={waveColor} 
                  onChange={(e) => setWaveColor(e.target.value)} 
                  className={styles.colorPicker}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Amplitude ({amplitude}px)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="120" 
                  value={amplitude} 
                  onChange={(e) => setAmplitude(parseInt(e.target.value))} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Frequency ({frequency})</label>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  value={frequency} 
                  onChange={(e) => setFrequency(parseInt(e.target.value))} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Canvas Height ({waveHeight}px)</label>
                <input 
                  type="range" 
                  min="100" 
                  max="400" 
                  value={waveHeight} 
                  onChange={(e) => setWaveHeight(parseInt(e.target.value))} 
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label>Pattern Style</label>
                <select 
                  value={patternType} 
                  onChange={(e) => setPatternType(e.target.value as "dots" | "grid" | "isometric")}
                  className={styles.select}
                >
                  <option value="dots">Dot Matrix</option>
                  <option value="grid">Line Grid</option>
                  <option value="isometric">Isometric Diamond</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Pattern Color</label>
                <input 
                  type="color" 
                  value={patternColor} 
                  onChange={(e) => setPatternColor(e.target.value)} 
                  className={styles.colorPicker}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Grid Cell Size ({patternSize}px)</label>
                <input 
                  type="range" 
                  min="10" 
                  max="60" 
                  value={patternSize} 
                  onChange={(e) => setPatternSize(parseInt(e.target.value))} 
                />
              </div>

              {patternType === 'dots' && (
                <div className={styles.formGroup}>
                  <label>Dot Radius ({dotRadius}px)</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={dotRadius} 
                    onChange={(e) => setDotRadius(parseInt(e.target.value))} 
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Live Preview & Export Column */}
        <div className={`glass ${styles.card}`}>
          <div className={styles.cardHeader}>
            <h3>Live Preview</h3>
            <button onClick={handleCopy} className={styles.copyBtn}>
              {copied ? 'Copied SVG!' : 'Copy SVG Code'}
            </button>
          </div>

          <div 
            className={styles.previewBox}
            dangerouslySetInnerHTML={{ __html: currentSvg }}
          />

          <div className={styles.codeOutput}>
            <span className={styles.outputTitle}>Generated SVG Markup</span>
            <textarea 
              value={currentSvg} 
              readOnly 
              className={styles.textarea}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
