"use client";

import { useState } from "react";
import styles from "./Generators.module.css";
import { generateCubicBezierWaveSvg } from "@/utils/waveMath";

export default function SVGGenerators() {
  const [activeTab, setActiveTab] = useState<"waves" | "patterns" | "gradients">("waves");

  // Multi-Layer Wave State
  const [amplitude, setAmplitude] = useState<number>(50);
  const [frequency, setFrequency] = useState<number>(3);
  const [waveColor, setWaveColor] = useState<string>("#6366f1");
  const [waveHeight, setWaveHeight] = useState<number>(250);
  const [layerCount, setLayerCount] = useState<number>(3);

  // Pattern Generator State
  const [patternType, setPatternType] = useState<"dots" | "grid" | "isometric">("dots");
  const [patternColor, setPatternColor] = useState<string>("#818cf8");
  const [patternSize, setPatternSize] = useState<number>(24);
  const [dotRadius, setDotRadius] = useState<number>(3);

  // Gradient Generator State
  const [gradColor1, setGradColor1] = useState<string>("#4f46e5");
  const [gradColor2, setGradColor2] = useState<string>("#ec4899");
  const [gradAngle, setGradAngle] = useState<number>(135);

  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Generate Multi-Layer Cubic Bezier Waves
  const generateWaves = () => {
    const layers = [];
    for (let i = 0; i < layerCount; i++) {
      const opacity = 1 - i * (0.6 / Math.max(1, layerCount - 1));
      const amp = amplitude - i * 8;
      const freq = frequency + i * 0.5;
      const phase = i * 0.8;
      layers.push({
        amplitude: Math.max(10, amp),
        frequency: freq,
        phase: phase,
        fillColor: waveColor,
        opacity: Math.max(0.2, opacity)
      });
    }
    return generateCubicBezierWaveSvg(1440, waveHeight, layers);
  };

  // Generate Pattern SVG
  const generatePatternSvg = () => {
    if (patternType === "dots") {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${patternSize}" height="${patternSize}">
  <circle cx="${patternSize / 2}" cy="${patternSize / 2}" r="${dotRadius}" fill="${patternColor}" />
</svg>`;
    } else if (patternType === "grid") {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${patternSize}" height="${patternSize}">
  <path d="M ${patternSize} 0 L 0 0 0 ${patternSize}" fill="none" stroke="${patternColor}" stroke-width="1.5" />
</svg>`;
    } else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${patternSize * 2}" height="${patternSize * 2}">
  <path d="M${patternSize} 0 L${patternSize * 2} ${patternSize} L${patternSize} ${patternSize * 2} L0 ${patternSize} Z" fill="none" stroke="${patternColor}" stroke-width="1.5" />
</svg>`;
    }
  };

  // Generate Gradient SVG
  const generateGradientSvg = () => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="aegis-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradColor1}" />
      <stop offset="100%" stop-color="${gradColor2}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#aegis-gradient)" />
</svg>`;
  };

  const getCurrentSvg = () => {
    if (activeTab === "waves") return generateWaves();
    if (activeTab === "patterns") return generatePatternSvg();
    return generateGradientSvg();
  };

  const currentSvg = getCurrentSvg();

  const handleCopySvg = () => {
    navigator.clipboard.writeText(currentSvg);
    setCopiedFormat("svg");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleCopyCss = () => {
    let cssCode = "";
    if (activeTab === "gradients") {
      cssCode = `background: linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2});`;
    } else {
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(currentSvg)}`;
      cssCode = `background-image: url("${dataUri}");`;
    }
    navigator.clipboard.writeText(cssCode);
    setCopiedFormat("css");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SVG Wave, Pattern & Gradient Studio</h1>
        <p className={styles.description}>
          Generate silky-smooth cubic Bezier section dividers, geometric background patterns, and vibrant mesh gradients.
        </p>
      </div>

      <div className={styles.tabBar}>
        <button 
          className={`${styles.tab} ${activeTab === 'waves' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('waves')}
        >
          ** Smooth Cubic Waves
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'patterns' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          * Background Patterns
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'gradients' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('gradients')}
        >
          ** Mesh Gradients
        </button>
      </div>

      <div className={styles.grid}>
        <div className={`glass ${styles.card}`}>
          <h3>Configuration Controls</h3>

          {activeTab === 'waves' && (
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
                <label>Wave Height ({waveHeight}px)</label>
                <input 
                  type="range" 
                  min="120" 
                  max="400" 
                  value={waveHeight} 
                  onChange={(e) => setWaveHeight(parseInt(e.target.value))} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bezier Amplitude ({amplitude}px)</label>
                <input 
                  type="range" 
                  min="15" 
                  max="120" 
                  value={amplitude} 
                  onChange={(e) => setAmplitude(parseInt(e.target.value))} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Wave Frequency ({frequency})</label>
                <input 
                  type="range" 
                  min="1" 
                  max="6" 
                  step="0.5"
                  value={frequency} 
                  onChange={(e) => setFrequency(parseFloat(e.target.value))} 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Layer Depth ({layerCount} layers)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={layerCount} 
                  onChange={(e) => setLayerCount(parseInt(e.target.value))} 
                />
              </div>
            </>
          )}

          {activeTab === 'patterns' && (
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
                <label>Cell Size ({patternSize}px)</label>
                <input 
                  type="range" 
                  min="12" 
                  max="64" 
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

          {activeTab === 'gradients' && (
            <>
              <div className={styles.formGroup}>
                <label>Start Color</label>
                <input 
                  type="color" 
                  value={gradColor1} 
                  onChange={(e) => setGradColor1(e.target.value)} 
                  className={styles.colorPicker}
                />
              </div>

              <div className={styles.formGroup}>
                <label>End Color</label>
                <input 
                  type="color" 
                  value={gradColor2} 
                  onChange={(e) => setGradColor2(e.target.value)} 
                  className={styles.colorPicker}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Gradient Angle ({gradAngle} deg)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="360" 
                  step="15"
                  value={gradAngle} 
                  onChange={(e) => setGradAngle(parseInt(e.target.value))} 
                />
              </div>
            </>
          )}
        </div>

        <div className={`glass ${styles.card}`}>
          <div className={styles.cardHeader}>
            <h3>Live Vector Preview</h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={handleCopySvg} className={styles.copyBtn}>
                {copiedFormat === 'svg' ? 'Copied SVG!' : 'Copy SVG Code'}
              </button>
              <button onClick={handleCopyCss} className={styles.copyBtnSecondary}>
                {copiedFormat === 'css' ? 'Copied CSS!' : 'Copy CSS Rule'}
              </button>
            </div>
          </div>

          <div 
            className={styles.previewBox}
            dangerouslySetInnerHTML={{ __html: currentSvg }}
          />

          <div className={styles.codeOutput}>
            <span className={styles.outputTitle}>Generated Markup</span>
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
