"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import ExportPanel from "./ExportPanel";
import styles from "./Editor.module.css";

export default function SVGEditorWorkspace() {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#818cf8");
  const [scale, setScale] = useState<number>(1);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);

  return (
    <div className={styles.workspace}>
      <Sidebar onSelectSvg={setSvgContent} />
      <div className={styles.mainArea}>
        <div className={`glass ${styles.editorCore}`}>
          <Toolbar 
            color={color} setColor={setColor}
            scale={scale} setScale={setScale}
            strokeWidth={strokeWidth} setStrokeWidth={setStrokeWidth}
          />
          <Canvas 
            svgContent={svgContent} 
            color={color} 
            scale={scale} 
            strokeWidth={strokeWidth}
          />
        </div>
        <ExportPanel 
          svgContent={svgContent}
          color={color}
          scale={scale}
          strokeWidth={strokeWidth}
        />
      </div>
    </div>
  );
}
