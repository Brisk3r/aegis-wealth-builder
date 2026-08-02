"use client";

import { useState } from "react";
import styles from "./Converter.module.css";
import { minifySvg, cleanSvgMetadata, convertSvgToReactJsx, convertSvgToVue } from "@/utils/svgOptimizer";

const INITIAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 2 7 12 12 22 7 12 2"/>
  <polyline points="2 17 12 22 22 17"/>
  <polyline points="2 12 12 17 22 12"/>
</svg>`;

export default function SVGConverter() {
  const [svgInput, setSvgInput] = useState(INITIAL_SVG);
  const [exportFormat, setExportFormat] = useState<"png" | "webp" | "jpeg" | "jsx" | "vue" | "datauri">("png");
  const [scaleFactor, setScaleFactor] = useState<number>(4);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [outputCode, setOutputCode] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) setSvgInput(text);
      };
      reader.readAsText(file);
    }
  };

  const handleOptimize = () => {
    const cleaned = cleanSvgMetadata(minifySvg(svgInput));
    setSvgInput(cleaned);
  };

  const handleConvert = () => {
    if (!svgInput) return;

    if (exportFormat === "jsx") {
      setOutputCode(convertSvgToReactJsx(svgInput, "AegisIcon"));
    } else if (exportFormat === "vue") {
      setOutputCode(convertSvgToVue(svgInput));
    } else if (exportFormat === "datauri") {
      setOutputCode(`data:image/svg+xml;utf8,${encodeURIComponent(svgInput)}`);
    } else {
      // Ultra-HD Rasterizer with Supersampling
      const img = new Image();
      const svgBlob = new Blob([svgInput], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const baseWidth = img.width || 300;
        const baseHeight = img.height || 300;
        
        const canvas = document.createElement("canvas");
        canvas.width = baseWidth * scaleFactor;
        canvas.height = baseHeight * scaleFactor;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Background Fill
          if (bgColor !== "transparent" || exportFormat === "jpeg") {
            ctx.fillStyle = bgColor === "transparent" ? "#ffffff" : bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.scale(scaleFactor, scaleFactor);
          ctx.drawImage(img, 0, 0);

          const mimeType = `image/${exportFormat}`;
          const dataUrl = canvas.toDataURL(mimeType, 0.95);

          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `converted-vector.${exportFormat}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SVG Converter & HD Rasterizer Studio</h1>
        <p className={styles.description}>
          Batch clean metadata, strip bloat, and convert SVGs to 4K Ultra-HD PNG, WEBP, JPEG, React JSX, or Vue 3.
        </p>
      </div>

      <div className={styles.grid}>
        <div className={`glass ${styles.card}`}>
          <div className={styles.cardHeader}>
            <h3>1. Input SVG Code or Upload File</h3>
            <label className={styles.uploadLabel}>
              Upload .svg
              <input type="file" accept=".svg" onChange={handleFileUpload} hidden />
            </label>
          </div>

          <textarea 
            className={styles.textarea} 
            value={svgInput} 
            onChange={(e) => setSvgInput(e.target.value)}
            placeholder="Paste raw <svg> code here..."
            spellCheck={false}
          />

          <div className={styles.actionsRow}>
            <button onClick={handleOptimize} className={styles.secondaryBtn}>
              ⚡ Optimize & Clean XML
            </button>
          </div>

          <div className={styles.previewContainer}>
            <span className={styles.previewLabel}>Live Vector Preview</span>
            <div 
              className={styles.previewBox} 
              dangerouslySetInnerHTML={{ __html: svgInput }}
            />
          </div>
        </div>

        <div className={`glass ${styles.card}`}>
          <h3>2. Export & HD Rasterizer Settings</h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Target Output Format</label>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value as "png" | "webp" | "jpeg" | "jsx" | "vue" | "datauri")}
              className={styles.select}
            >
              <option value="png">PNG Image (.png)</option>
              <option value="webp">WEBP Image (.webp)</option>
              <option value="jpeg">JPEG Image (.jpg)</option>
              <option value="jsx">React Component (.tsx / .jsx)</option>
              <option value="vue">Vue 3 Component (.vue)</option>
              <option value="datauri">Data URI String</option>
            </select>
          </div>

          {["png", "webp", "jpeg"].includes(exportFormat) && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Resolution Scale ({scaleFactor}x Supersampled)</label>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  step="1" 
                  value={scaleFactor} 
                  onChange={(e) => setScaleFactor(parseInt(e.target.value))}
                  className={styles.range}
                />
                <span className={styles.hint}>8x supersampling generates 4K crystal-clear raster images.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Background Canvas Fill</label>
                <select 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  className={styles.select}
                >
                  <option value="transparent">Transparent Background</option>
                  <option value="#ffffff">Solid White (#ffffff)</option>
                  <option value="#000000">Solid Black (#000000)</option>
                  <option value="#0d0e15">Dark Theme (#0d0e15)</option>
                </select>
              </div>
            </>
          )}

          <button onClick={handleConvert} className={styles.primaryBtn}>
            Convert & Export Asset
          </button>

          {["jsx", "vue", "datauri"].includes(exportFormat) && outputCode && (
            <div className={styles.outputBox}>
              <div className={styles.outputHeader}>
                <span>Converted Output Code</span>
                <button onClick={handleCopyCode} className={styles.copyBtn}>
                  {copied ? "Copied!" : "Copy Snippet"}
                </button>
              </div>
              <textarea 
                className={styles.outputTextarea} 
                value={outputCode} 
                readOnly 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
