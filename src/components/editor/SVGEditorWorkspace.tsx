"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import NodeCanvas from "./NodeCanvas";
import NodeInspector from "./NodeInspector";
import Toolbar from "./Toolbar";
import ExportPanel from "./ExportPanel";
import CodeEditor from "./CodeEditor";
import styles from "./Editor.module.css";
import { parseSvgPathD, serializeNodesToD, PathNode } from "@/utils/svgPathParser";

const INITIAL_NODES: PathNode[] = [
  { id: "node-1", type: "M", x: 250, y: 50 },
  { id: "node-2", type: "C", x: 450, y: 250, cp1x: 350, cp1y: 50, cp2x: 450, cp2y: 150 },
  { id: "node-3", type: "C", x: 250, y: 450, cp1x: 450, cp1y: 350, cp2x: 350, cp2y: 450 },
  { id: "node-4", type: "C", x: 50, y: 250, cp1x: 150, cp1y: 450, cp2x: 50, cp2y: 350 },
  { id: "node-5", type: "C", x: 250, y: 50, cp1x: 50, cp1y: 150, cp2x: 150, cp2y: 50 },
  { id: "node-6", type: "Z", x: 0, y: 0 }
];

export default function SVGEditorWorkspace() {
  const [nodes, setNodes] = useState<PathNode[]>(INITIAL_NODES);
  const [fillColor, setFillColor] = useState<string>("#6366f1");
  const [strokeColor, setStrokeColor] = useState<string>("#818cf8");
  const [scale, setScale] = useState<number>(1);
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [rotation, setRotation] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [bgGrid, setBgGrid] = useState<"grid-dark" | "grid-light" | "transparent" | "solid">("grid-dark");
  const [showNodes, setShowNodes] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"canvas" | "inspector" | "code">("canvas");

  const currentPathD = serializeNodesToD(nodes);
  const fullSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <path d="${currentPathD}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
</svg>`;

  const handleSelectSvgFromLibrary = (rawSvg: string) => {
    try {
      const match = rawSvg.match(/d="([^"]+)"/);
      if (match && match[1]) {
        const parsed = parseSvgPathD(match[1]);
        if (parsed.length > 0) {
          setNodes(parsed);
          return;
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleCodeChange = (newCode: string) => {
    const match = newCode.match(/d="([^"]+)"/);
    if (match && match[1]) {
      const parsed = parseSvgPathD(match[1]);
      if (parsed.length > 0) {
        setNodes(parsed);
      }
    }
  };

  return (
    <div className={styles.workspace}>
      <Sidebar onSelectSvg={handleSelectSvgFromLibrary} />
      
      <div className={styles.mainArea}>
        <div className={`glass ${styles.editorCore}`}>
          {/* Top Bar with Studio Modes */}
          <div className={styles.tabHeader}>
            <div className={styles.tabGroup}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'canvas' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('canvas')}
              >
                📍 Node Canvas Studio
              </button>

              <button 
                className={`${styles.tabBtn} ${activeTab === 'inspector' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('inspector')}
              >
                ⚙️ Coordinate Inspector
              </button>

              <button 
                className={`${styles.tabBtn} ${activeTab === 'code' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('code')}
              >
                XML Code Editor
              </button>
            </div>

            <div className={styles.quickActions}>
              <button 
                onClick={() => setShowNodes(!showNodes)} 
                className={`${styles.actionBtn} ${showNodes ? styles.toggleActive : ''}`}
              >
                {showNodes ? "Hide Handles" : "Show Handles"}
              </button>
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

          {activeTab === 'canvas' && (
            <NodeCanvas 
              nodes={nodes}
              onNodesChange={setNodes}
              fillColor={fillColor}
              strokeColor={strokeColor} 
              scale={scale} 
              strokeWidth={strokeWidth}
              rotation={rotation}
              opacity={opacity}
              flipX={flipX}
              flipY={flipY}
              bgGrid={bgGrid}
              showNodes={showNodes}
            />
          )}

          {activeTab === 'inspector' && (
            <NodeInspector 
              nodes={nodes} 
              onNodesChange={setNodes} 
            />
          )}

          {activeTab === 'code' && (
            <CodeEditor 
              svgCode={fullSvgContent} 
              onChange={handleCodeChange} 
            />
          )}
        </div>

        <ExportPanel 
          svgContent={fullSvgContent}
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
