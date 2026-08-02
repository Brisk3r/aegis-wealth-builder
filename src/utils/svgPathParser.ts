/**
 * SVG Path Command & Anchor Point Parser / Serializer
 */

export interface PathNode {
  id: string;
  type: "M" | "L" | "C" | "Q" | "Z";
  x: number;
  y: number;
  cp1x?: number;
  cp1y?: number;
  cp2x?: number;
  cp2y?: number;
}

export function parseSvgPathD(d: string): PathNode[] {
  if (!d) return [];

  const nodes: PathNode[] = [];
  // Tokenize path command letters and numbers
  const tokens = d.match(/([a-df-zA-DF-Z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?)/g);
  if (!tokens) return nodes;

  let idx = 0;
  let currentCmd = "M";

  while (idx < tokens.length) {
    const token = tokens[idx];

    if (/^[a-df-zA-DF-Z]$/.test(token)) {
      currentCmd = token;
      idx++;
      if (currentCmd === "Z" || currentCmd === "z") {
        nodes.push({ id: `node-${nodes.length}`, type: "Z", x: 0, y: 0 });
        continue;
      }
    }

    if (currentCmd === "M" || currentCmd === "m" || currentCmd === "L" || currentCmd === "l") {
      const x = parseFloat(tokens[idx++] || "0");
      const y = parseFloat(tokens[idx++] || "0");
      nodes.push({
        id: `node-${nodes.length}`,
        type: currentCmd.toUpperCase() as "M" | "L",
        x,
        y
      });
    } else if (currentCmd === "C" || currentCmd === "c") {
      const cp1x = parseFloat(tokens[idx++] || "0");
      const cp1y = parseFloat(tokens[idx++] || "0");
      const cp2x = parseFloat(tokens[idx++] || "0");
      const cp2y = parseFloat(tokens[idx++] || "0");
      const x = parseFloat(tokens[idx++] || "0");
      const y = parseFloat(tokens[idx++] || "0");
      nodes.push({
        id: `node-${nodes.length}`,
        type: "C",
        x,
        y,
        cp1x,
        cp1y,
        cp2x,
        cp2y
      });
    } else if (currentCmd === "Q" || currentCmd === "q") {
      const cp1x = parseFloat(tokens[idx++] || "0");
      const cp1y = parseFloat(tokens[idx++] || "0");
      const x = parseFloat(tokens[idx++] || "0");
      const y = parseFloat(tokens[idx++] || "0");
      nodes.push({
        id: `node-${nodes.length}`,
        type: "Q",
        x,
        y,
        cp1x,
        cp1y
      });
    } else {
      idx++;
    }
  }

  return nodes;
}

export function serializeNodesToD(nodes: PathNode[]): string {
  if (nodes.length === 0) return "";

  return nodes
    .map((node) => {
      if (node.type === "M" || node.type === "L") {
        return `${node.type} ${node.x.toFixed(1)} ${node.y.toFixed(1)}`;
      }
      if (node.type === "C") {
        return `C ${(node.cp1x ?? node.x).toFixed(1)} ${(node.cp1y ?? node.y).toFixed(1)}, ${(node.cp2x ?? node.x).toFixed(1)} ${(node.cp2y ?? node.y).toFixed(1)}, ${node.x.toFixed(1)} ${node.y.toFixed(1)}`;
      }
      if (node.type === "Q") {
        return `Q ${(node.cp1x ?? node.x).toFixed(1)} ${(node.cp1y ?? node.y).toFixed(1)}, ${node.x.toFixed(1)} ${node.y.toFixed(1)}`;
      }
      if (node.type === "Z") {
        return "Z";
      }
      return "";
    })
    .join(" ");
}
