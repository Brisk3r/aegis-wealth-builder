"use client";

import { useState, useRef } from "react";
import styles from "./Editor.module.css";
import { PathNode, serializeNodesToD } from "@/utils/svgPathParser";

interface NodeCanvasProps {
  nodes: PathNode[];
  onNodesChange: (nodes: PathNode[]) => void;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  scale: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  bgGrid: "grid-dark" | "grid-light" | "transparent" | "solid";
  showNodes: boolean;
}

export default function NodeCanvas({
  nodes,
  onNodesChange,
  fillColor,
  strokeColor,
  strokeWidth,
  scale,
  rotation,
  opacity,
  flipX,
  flipY,
  bgGrid,
  showNodes
}: NodeCanvasProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ nodeId: string; handleType: "node" | "cp1" | "cp2" } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const pathD = serializeNodesToD(nodes);

  // Mouse coordinate conversion into SVG viewBox space
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return null;
    return {
      x: Math.round((e.clientX - CTM.e) / CTM.a),
      y: Math.round((e.clientY - CTM.f) / CTM.d)
    };
  };

  const handleMouseDown = (nodeId: string, handleType: "node" | "cp1" | "cp2", e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDragState({ nodeId, handleType });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragState) return;
    const coords = getSvgCoordinates(e);
    if (!coords) return;

    const updated = nodes.map((node) => {
      if (node.id !== dragState.nodeId) return node;

      if (dragState.handleType === "node") {
        const dx = coords.x - node.x;
        const dy = coords.y - node.y;
        return {
          ...node,
          x: coords.x,
          y: coords.y,
          cp1x: node.cp1x !== undefined ? node.cp1x + dx : undefined,
          cp1y: node.cp1y !== undefined ? node.cp1y + dy : undefined,
          cp2x: node.cp2x !== undefined ? node.cp2x + dx : undefined,
          cp2y: node.cp2y !== undefined ? node.cp2y + dy : undefined
        };
      } else if (dragState.handleType === "cp1") {
        return { ...node, cp1x: coords.x, cp1y: coords.y };
      } else if (dragState.handleType === "cp2") {
        return { ...node, cp2x: coords.x, cp2y: coords.y };
      }
      return node;
    });

    onNodesChange(updated);
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e);
    if (!coords) return;

    const newNode: PathNode = {
      id: `node-${Date.now()}`,
      type: "L",
      x: coords.x,
      y: coords.y
    };

    // Insert before closing Z command or at end
    const lastIsZ = nodes.length > 0 && nodes[nodes.length - 1].type === "Z";
    const updated = lastIsZ
      ? [...nodes.slice(0, nodes.length - 1), newNode, nodes[nodes.length - 1]]
      : [...nodes, newNode];

    onNodesChange(updated);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    const updated = nodes.filter((n) => n.id !== selectedNodeId);
    onNodesChange(updated);
    setSelectedNodeId(null);
  };

  const transformStyle = `scale(${scale}) rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`;

  return (
    <div 
      className={`${styles.canvasContainer} ${styles[bgGrid]}`} 
      onMouseUp={handleMouseUp}
      onKeyDown={(e) => {
        if (e.key === "Delete" || e.key === "Backspace") handleDeleteSelected();
      }}
      tabIndex={0}
    >
      <div className={styles.canvasToolbarOverlay}>
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          {selectedNodeId ? `Node Selected (${selectedNodeId})` : "Double click canvas to add new node point"}
        </span>
        {selectedNodeId && (
          <button 
            onClick={handleDeleteSelected}
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.25rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
          >
            *** Delete Node
          </button>
        )}
      </div>

      <div 
        className={styles.svgWrapper}
        style={{ transform: transformStyle, opacity: opacity } as React.CSSProperties}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 500 500"
          width="480"
          height="480"
          onMouseMove={handleMouseMove}
          onDoubleClick={handleCanvasDoubleClick}
          style={{ cursor: dragState ? "grabbing" : "crosshair", overflow: "visible" }}
        >
          {/* Main Vector Path */}
          <path
            d={pathD}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Node Anchor Handles */}
          {showNodes && nodes.map((node) => {
            if (node.type === "Z") return null;
            const isSelected = node.id === selectedNodeId;

            return (
              <g key={node.id}>
                {/* Control Point 1 Connector Line */}
                {node.cp1x !== undefined && node.cp1y !== undefined && (
                  <>
                    <line 
                      x1={node.x} y1={node.y} 
                      x2={node.cp1x} y2={node.cp1y} 
                      stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" 
                    />
                    <rect
                      x={node.cp1x - 5}
                      y={node.cp1y - 5}
                      width="10"
                      height="10"
                      fill="#818cf8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      cursor="grab"
                      onMouseDown={(e) => handleMouseDown(node.id, "cp1", e)}
                    />
                  </>
                )}

                {/* Control Point 2 Connector Line */}
                {node.cp2x !== undefined && node.cp2y !== undefined && (
                  <>
                    <line 
                      x1={node.x} y1={node.y} 
                      x2={node.cp2x} y2={node.cp2y} 
                      stroke="#ec4899" strokeWidth="1" strokeDasharray="3 3" 
                    />
                    <rect
                      x={node.cp2x - 5}
                      y={node.cp2y - 5}
                      width="10"
                      height="10"
                      fill="#ec4899"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      cursor="grab"
                      onMouseDown={(e) => handleMouseDown(node.id, "cp2", e)}
                    />
                  </>
                )}

                {/* Main Node Anchor Point */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? "8" : "6"}
                  fill={isSelected ? "#6366f1" : "#ffffff"}
                  stroke={isSelected ? "#ffffff" : "#6366f1"}
                  strokeWidth="2"
                  cursor="grab"
                  onMouseDown={(e) => handleMouseDown(node.id, "node", e)}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
