/**
 * Smooth Cubic Bezier Wave Generator Math Utility
 */

export interface WaveLayerConfig {
  amplitude: number;
  frequency: number;
  phase: number;
  fillColor: string;
  opacity: number;
}

export function generateCubicBezierWaveSvg(
  width: number = 1440,
  height: number = 300,
  layers: WaveLayerConfig[] = []
): string {
  if (layers.length === 0) {
    layers = [{ amplitude: 60, frequency: 3, phase: 0, fillColor: "#6366f1", opacity: 1 }];
  }

  const svgLayers = layers.map((layer) => {
    const { amplitude, frequency, phase, fillColor, opacity } = layer;
    const segments = frequency * 2;
    const segmentWidth = width / segments;
    const baseline = height / 2;

    let path = `M 0,${height} L 0,${(baseline + Math.sin(phase) * amplitude).toFixed(2)}`;

    for (let i = 0; i < segments; i++) {
      const x0 = i * segmentWidth;
      const x1 = (i + 1) * segmentWidth;
      
      const dir = (i % 2 === 0) ? 1 : -1;
      const y0 = baseline + Math.sin(phase + (i * Math.PI) / 2) * amplitude * dir;
      const y1 = baseline + Math.sin(phase + ((i + 1) * Math.PI) / 2) * amplitude * (-dir);

      // Control points for smooth cubic bezier curve
      const cp1x = (x0 + segmentWidth * 0.5).toFixed(2);
      const cp1y = y0.toFixed(2);
      const cp2x = (x0 + segmentWidth * 0.5).toFixed(2);
      const cp2y = y1.toFixed(2);
      const endX = x1.toFixed(2);
      const endY = y1.toFixed(2);

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
    }

    path += ` L ${width},${height} Z`;

    return `  <path fill="${fillColor}" fill-opacity="${opacity}" d="${path}" />`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none">
${svgLayers.join("\n")}
</svg>`;
}
