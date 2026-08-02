"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import ExportPanel from "./ExportPanel";
import CodeEditor from "./CodeEditor";
import styles from "./Editor.module.css";
import { minifySvg, cleanSvgMetadata, sanitizeAndFormatSvg } from "@/utils/svgOptimizer";

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
</svg>`;

export default function SVGEditorWorkspace() {
  const [svgContent, setSvgContent] = useState<string>(DEFAULT_SVG);
  const [fillColor, setFillColor] = useState<string>("#6366f1");
  const [strokeColor, setStrokeColor] = useState<string>("#818cf8");
  const [scale, setScale] = useState<number>(1);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [rotation, setRotation] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [bgGrid, setBgGrid] = useState<"grid-dark" | "grid-light" | "transparent" | "solid">("grid-dark");
  const [activeTab, setActiveTab] = useState<"canvas" | "code">("canvas");

  const handleMinify = () => {
    setSvgContent(minifySvg(svgContent));
  };

  const handleClean = () => {
    setSvgContent(cleanSvgMetadata(svgContent));
  };

  const handleFormat = () => {
    setSvgContent(sanitizeAndFormatSvg(svgContent));
  };

  return (
    <div className={styles.workspace}>
      <Sidebar onSelectSvg={(svg) => {
        setSvgContent(svg);
      }} />
      
      <div className={styles.mainArea}>
        <div className={`glass ${styles.editorCore}`}>
          {/* Top Bar with Mode Switcher & Quick Actions */}
          <div className={styles.tabHeader}>
            <div className={styles.tabGroup}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'canvas' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('canvas')}
              >
                Canvas Studio
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'code' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('code')}
              >
                XML Code Editor
              </button>
            </div>

            <div className={styles.quickActions}>
              <button onClick={handleClean} className={styles.actionBtn} title="Strip metadata and comments">Clean</button>
              <button onClick={handleMinify} className={styles.actionBtn} title="Minify XML">Minify</button>
              <button onClick={handleFormat} className={styles.actionBtn} title="Format XML">Format</button>
            </div>
          </div>

          <Toolbar 
            fillColor={fillColor} setFillColor={setFillColor}
            strokeColor={strokeColor} setStrokeColor={setStrokeColor}
            scale={scale} setScale={setScale}
            strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
            rotation={rotation} setRotation={setRotation}
            opacity={opacity} setOpacity={setOpacity}
            flipX={flipX} setFlipX={setFlipX}
            flipY={flipY} setFlipY={setFlipY}
            bgGrid={bgGrid} setBgGrid={setBgGrid}
          />

          {activeTab === 'canvas' ? (
            <Canvas 
              svgContent={svgContent} 
              fillColor={fillColor}
              strokeColor={strokeColor} 
              scale={scale} 
              strokeWidth={strokeWidth}
              rotation={rotation}
              opacity={opacity}
              flipX={flipX}
              flipY={flipY}
              bgGrid={bgGrid}
            />
          ) : (
            <CodeEditor 
              svgCode={svgContent} 
              onChange={setSvgContent} 
            />
          )}
        </div>

        <ExportPanel 
          svgContent={svgContent}
          fillColor={fillColor}
          strokeColor={strokeColor}
          scale={scale}
          strokeWidth={strokeWidth}
          rotation={rotation}
          opacity={opacity}
          flipX={flipX}
          flipY={flipY}
        />
      </div>
    </div>
  );
}
