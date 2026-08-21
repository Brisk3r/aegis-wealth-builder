"use client";

import styles from "./Editor.module.css";
import { PathNode } from "@/utils/svgPathParser";

interface NodeInspectorProps {
  nodes: PathNode[];
  onNodesChange: (nodes: PathNode[]) => void;
}

export default function NodeInspector({ nodes, onNodesChange }: NodeInspectorProps) {
  const updateNode = (id: string, updates: Partial<PathNode>) => {
    const updated = nodes.map((node) => (node.id === id ? { ...node, ...updates } : node));
    onNodesChange(updated);
  };

  const deleteNode = (id: string) => {
    onNodesChange(nodes.filter((node) => node.id !== id));
  };

  const changeNodeType = (id: string, newType: PathNode["type"]) => {
    const updated = nodes.map((node) => {
      if (node.id !== id) return node;
      if (newType === "C") {
        return {
          ...node,
          type: "C" as const,
          cp1x: node.x - 30,
          cp1y: node.y - 30,
          cp2x: node.x + 30,
          cp2y: node.y - 30
        };
      } else if (newType === "L") {
        const { cp1x, cp1y, cp2x, cp2y, ...rest } = node;
        void cp1x; void cp1y; void cp2x; void cp2y;
        return { ...rest, type: "L" as const };
      }
      return { ...node, type: newType };
    });
    onNodesChange(updated);
  };

  const addPoint = () => {
    const lastNode = nodes[nodes.length - 1];
    const newNode: PathNode = {
      id: `node-${Date.now()}`,
      type: "L",
      x: (lastNode?.x || 100) + 40,
      y: (lastNode?.y || 100) + 40
    };
    onNodesChange([...nodes, newNode]);
  };

  return (
    <div className={styles.inspectorContainer}>
      <div className={styles.inspectorHeader}>
        <h4 style={{ margin: 0, fontSize: "1rem" }}>Vector Node Inspector ({nodes.length})</h4>
        <button onClick={addPoint} className={styles.addPointBtn}>
          + Add Point
        </button>
      </div>

      <div className={styles.nodeList}>
        {nodes.map((node, index) => (
          <div key={node.id} className={styles.nodeCard}>
            <div className={styles.nodeCardHeader}>
              <span className={styles.nodeBadge}>Point #{index + 1}</span>
              <select 
                value={node.type} 
                onChange={(e) => changeNodeType(node.id, e.target.value as PathNode["type"])}
                className={styles.nodeTypeSelect}
              >
                <option value="M">Move To (M)</option>
                <option value="L">Line To (L)</option>
                <option value="C">Cubic Curve (C)</option>
                <option value="Z">Close Path (Z)</option>
              </select>
              {node.type !== "Z" && (
                <button onClick={() => deleteNode(node.id)} className={styles.deleteNodeBtn} title="Delete Point">
                  [X]
                </button>
              )}
            </div>

            {node.type !== "Z" && (
              <div className={styles.coordsGrid}>
                <div>
                  <label>X:</label>
                  <input 
                    type="number" 
                    value={node.x} 
                    onChange={(e) => updateNode(node.id, { x: parseFloat(e.target.value) || 0 })} 
                  />
                </div>

                <div>
                  <label>Y:</label>
                  <input 
                    type="number" 
                    value={node.y} 
                    onChange={(e) => updateNode(node.id, { y: parseFloat(e.target.value) || 0 })} 
                  />
                </div>
              </div>
            )}

            {node.type === "C" && (
              <div className={styles.controlPointsSection}>
                <span className={styles.cpLabel}>Bezier Control Handles:</span>
                <div className={styles.coordsGrid}>
                  <div>
                    <label>CP1 X:</label>
                    <input 
                      type="number" 
                      value={node.cp1x ?? node.x} 
                      onChange={(e) => updateNode(node.id, { cp1x: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                  <div>
                    <label>CP1 Y:</label>
                    <input 
                      type="number" 
                      value={node.cp1y ?? node.y} 
                      onChange={(e) => updateNode(node.id, { cp1y: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                </div>
                <div className={styles.coordsGrid}>
                  <div>
                    <label>CP2 X:</label>
                    <input 
                      type="number" 
                      value={node.cp2x ?? node.x} 
                      onChange={(e) => updateNode(node.id, { cp2x: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                  <div>
                    <label>CP2 Y:</label>
                    <input 
                      type="number" 
                      value={node.cp2y ?? node.y} 
                      onChange={(e) => updateNode(node.id, { cp2y: parseFloat(e.target.value) || 0 })} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
