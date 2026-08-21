/**
 * Aegis Arcade Hub - Smooth Cubic & Quadratic Bezier Mathematics & Telemetry Curves
 * Swarm 2: Agents 9-16 Architecture
 *
 * Capabilities:
 * 1. Multi-Layer Harmonic Cubic Bezier Wave SVG Generator (100% backward compatible).
 * 2. Catmull-Rom Spline to Cubic Bezier Curve Converter for Telemetry Area Graphs.
 * 3. High-precision Bezier Point, Tangent & Arc-Length mathematical solvers.
 * 4. Circular Arc & Neon Orbital Gauge Bezier Path Generators.
 * 5. Native Canvas2D Smooth Bezier Path Drawing Utilities.
 * 6. Responsive Telemetry Trendline SVG Generator with glowing gradients & metrics.
 *
 * Strict 7-bit ASCII compliant (Zero Unicode mojibake / ANSI-1252 safe).
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface WaveLayerConfig {
  amplitude: number;
  frequency: number;
  phase: number;
  fillColor: string;
  opacity: number;
  gradientId?: string;
  gradientColors?: [string, string];
}

export interface TelemetryGraphOptions {
  width?: number;
  height?: number;
  strokeColor?: string;
  glowColor?: string;
  fillGradientStart?: string;
  fillGradientEnd?: string;
  strokeWidth?: number;
  tension?: number;
  showPoints?: boolean;
  showGrid?: boolean;
  gridLines?: number;
  title?: string;
  unit?: string;
}

export interface GaugeSvgOptions {
  size?: number;
  radius?: number;
  strokeWidth?: number;
  value: number; // 0.0 to 1.0
  startAngleDeg?: number;
  endAngleDeg?: number;
  trackColor?: string;
  progressColor?: string;
  glowColor?: string;
  label?: string;
  valueText?: string;
}

// ============================================================================
// 1. BEZIER MATHEMATICAL SOLVERS & POINT EVALUATORS
// ============================================================================

/**
 * Evaluates a 2D point along a quadratic Bezier curve at parameter t in [0, 1].
 * Formula: B(t) = (1-t)^2 * P0 + 2*(1-t)*t * CP + t^2 * P1
 */
export function evaluateQuadraticBezier(
  p0: Point2D,
  cp: Point2D,
  p1: Point2D,
  t: number
): Point2D {
  const clampedT = Math.max(0, Math.min(1, t));
  const u = 1 - clampedT;
  const tt = clampedT * clampedT;
  const uu = u * u;

  return {
    x: uu * p0.x + 2 * u * clampedT * cp.x + tt * p1.x,
    y: uu * p0.y + 2 * u * clampedT * cp.y + tt * p1.y,
  };
}

/**
 * Evaluates a 2D point along a cubic Bezier curve at parameter t in [0, 1].
 * Formula: B(t) = (1-t)^3 * P0 + 3*(1-t)^2*t * CP1 + 3*(1-t)*t^2 * CP2 + t^3 * P3
 */
export function evaluateCubicBezier(
  p0: Point2D,
  cp1: Point2D,
  cp2: Point2D,
  p3: Point2D,
  t: number
): Point2D {
  const clampedT = Math.max(0, Math.min(1, t));
  const u = 1 - clampedT;
  const tt = clampedT * clampedT;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * clampedT;

  return {
    x: uuu * p0.x + 3 * uu * clampedT * cp1.x + 3 * u * tt * cp2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * clampedT * cp1.y + 3 * u * tt * cp2.y + ttt * p3.y,
  };
}

/**
 * Calculates instantaneous tangent vector along a cubic Bezier curve at parameter t.
 * Formula: B'(t) = 3*(1-t)^2 * (CP1 - P0) + 6*(1-t)*t * (CP2 - CP1) + 3*t^2 * (P3 - CP2)
 */
export function evaluateCubicTangent(
  p0: Point2D,
  cp1: Point2D,
  cp2: Point2D,
  p3: Point2D,
  t: number
): Point2D {
  const clampedT = Math.max(0, Math.min(1, t));
  const u = 1 - clampedT;
  const tt = clampedT * clampedT;
  const uu = u * u;

  const dx =
    3 * uu * (cp1.x - p0.x) +
    6 * u * clampedT * (cp2.x - cp1.x) +
    3 * tt * (p3.x - cp2.x);
  const dy =
    3 * uu * (cp1.y - p0.y) +
    6 * u * clampedT * (cp2.y - cp1.y) +
    3 * tt * (p3.y - cp2.y);

  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

/**
 * Approximates arc length of a cubic Bezier curve using Riemann numerical integration.
 */
export function calculateCubicBezierLength(
  p0: Point2D,
  cp1: Point2D,
  cp2: Point2D,
  p3: Point2D,
  samples: number = 20
): number {
  let length = 0;
  let prev = p0;

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const curr = evaluateCubicBezier(p0, cp1, cp2, p3, t);
    length += Math.hypot(curr.x - prev.x, curr.y - prev.y);
    prev = curr;
  }

  return length;
}

// ============================================================================
// 2. CATMULL-ROM SPLINE TO CUBIC BEZIER CONVERTER FOR TELEMETRY
// ============================================================================

export interface BezierSegment {
  p0: Point2D;
  cp1: Point2D;
  cp2: Point2D;
  p1: Point2D;
}

/**
 * Converts a sequence of discrete discrete telemetry points into smooth cubic
 * Bezier segments using Catmull-Rom spline formulation.
 */
export function pointsToCubicBezierSegments(
  points: Point2D[],
  tension: number = 0.35
): BezierSegment[] {
  if (points.length < 2) return [];

  const segments: BezierSegment[] = [];
  const n = points.length;

  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    // Neighboring points for tangent estimation with clamped boundaries
    const pPrev = i > 0 ? points[i - 1] : { x: 2 * p0.x - p1.x, y: 2 * p0.y - p1.y };
    const pNext = i < n - 2 ? points[i + 2] : { x: 2 * p1.x - p0.x, y: 2 * p1.y - p0.y };

    // Catmull-Rom tangent control points
    const cp1: Point2D = {
      x: p0.x + (p1.x - pPrev.x) * tension,
      y: p0.y + (p1.y - pPrev.y) * tension,
    };

    const cp2: Point2D = {
      x: p1.x - (pNext.x - p0.x) * tension,
      y: p1.y - (pNext.y - p0.y) * tension,
    };

    segments.push({ p0, cp1, cp2, p1 });
  }

  return segments;
}

/**
 * Generates an SVG path string ('M ... C ...') passing smoothly through all points.
 */
export function generateCatmullRomToBezierPath(
  points: Point2D[],
  tension: number = 0.35
): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

  const segments = pointsToCubicBezierSegments(points, tension);
  let d = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

  for (const seg of segments) {
    d += ` C ${seg.cp1.x.toFixed(2)},${seg.cp1.y.toFixed(2)} ${seg.cp2.x.toFixed(2)},${seg.cp2.y.toFixed(2)} ${seg.p1.x.toFixed(2)},${seg.p1.y.toFixed(2)}`;
  }

  return d;
}

/**
 * Generates a closed SVG path for filled area graphs under the telemetry curve.
 */
export function generateSmoothBezierAreaPath(
  points: Point2D[],
  baselineY: number,
  tension: number = 0.35
): string {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points[points.length - 1];

  const curvePath = generateCatmullRomToBezierPath(points, tension);
  return `${curvePath} L ${last.x.toFixed(2)},${baselineY.toFixed(2)} L ${first.x.toFixed(2)},${baselineY.toFixed(2)} Z`;
}

// ============================================================================
// 3. CANVAS 2D NATIVE SMOOTH BEZIER DRAWING UTILITIES
// ============================================================================

/**
 * Draws a smooth cubic Bezier curve on an HTML5 Canvas 2D context.
 */
export function drawSmoothBezierCurve(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  tension: number = 0.35
): void {
  if (points.length < 2) return;

  const segments = pointsToCubicBezierSegments(points, tension);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (const seg of segments) {
    ctx.bezierCurveTo(
      seg.cp1.x,
      seg.cp1.y,
      seg.cp2.x,
      seg.cp2.y,
      seg.p1.x,
      seg.p1.y
    );
  }
}

/**
 * Draws a smooth cubic Bezier area fill on an HTML5 Canvas 2D context.
 */
export function drawSmoothBezierArea(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  baselineY: number,
  strokeColor: string,
  fillColorOrGrad: string | CanvasGradient,
  tension: number = 0.35
): void {
  if (points.length < 2) return;

  const first = points[0];
  const last = points[points.length - 1];
  const segments = pointsToCubicBezierSegments(points, tension);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(first.x, baselineY);
  ctx.lineTo(first.x, first.y);

  for (const seg of segments) {
    ctx.bezierCurveTo(
      seg.cp1.x,
      seg.cp1.y,
      seg.cp2.x,
      seg.cp2.y,
      seg.p1.x,
      seg.p1.y
    );
  }

  ctx.lineTo(last.x, baselineY);
  ctx.closePath();

  ctx.fillStyle = fillColorOrGrad;
  ctx.fill();

  // Stroke top edge
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (const seg of segments) {
    ctx.bezierCurveTo(
      seg.cp1.x,
      seg.cp1.y,
      seg.cp2.x,
      seg.cp2.y,
      seg.p1.x,
      seg.p1.y
    );
  }
  ctx.strokeStyle = strokeColor;
  ctx.stroke();

  ctx.restore();
}

// ============================================================================
// 4. MULTI-LAYER CUBIC BEZIER WAVE SVG GENERATOR
// ============================================================================

/**
 * Generates multi-layered smooth cubic Bezier wave SVG strings.
 * Fully backward compatible with legacy signature while supporting gradients.
 */
export function generateCubicBezierWaveSvg(
  width: number = 1440,
  height: number = 300,
  layers: WaveLayerConfig[] = []
): string {
  if (layers.length === 0) {
    layers = [
      {
        amplitude: 60,
        frequency: 3,
        phase: 0,
        fillColor: "#6366f1",
        opacity: 1,
      },
    ];
  }

  const defs: string[] = [];

  const svgLayers = layers.map((layer, layerIdx) => {
    const { amplitude, frequency, phase, fillColor, opacity, gradientColors } = layer;
    const segments = Math.max(2, Math.round(frequency * 2));
    const segmentWidth = width / segments;
    const baseline = height / 2;

    let fillAttr = fillColor;
    if (gradientColors && gradientColors.length >= 2) {
      const gradId = `wave-grad-${layerIdx}`;
      defs.push(`    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${gradientColors[0]}" />
      <stop offset="100%" stop-color="${gradientColors[1]}" />
    </linearGradient>`);
      fillAttr = `url(#${gradId})`;
    }

    const startY = (baseline + Math.sin(phase) * amplitude).toFixed(2);
    let path = `M 0,${height} L 0,${startY}`;

    for (let i = 0; i < segments; i++) {
      const x0 = i * segmentWidth;
      const x1 = (i + 1) * segmentWidth;

      const dir = i % 2 === 0 ? 1 : -1;
      const y0 = baseline + Math.sin(phase + (i * Math.PI) / 2) * amplitude * dir;
      const y1 = baseline + Math.sin(phase + ((i + 1) * Math.PI) / 2) * amplitude * -dir;

      // Cubic Bezier control points for smooth continuous tangent
      const cp1x = (x0 + segmentWidth * 0.5).toFixed(2);
      const cp1y = y0.toFixed(2);
      const cp2x = (x0 + segmentWidth * 0.5).toFixed(2);
      const cp2y = y1.toFixed(2);
      const endX = x1.toFixed(2);
      const endY = y1.toFixed(2);

      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
    }

    path += ` L ${width},${height} Z`;

    return `  <path fill="${fillAttr}" fill-opacity="${opacity}" d="${path}" />`;
  });

  const defsSection = defs.length > 0 ? `  <defs>\n${defs.join("\n")}\n  </defs>\n` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none">
${defsSection}${svgLayers.join("\n")}
</svg>`;
}

// ============================================================================
// 5. RESPONSIVE TELEMETRY GRAPH SVG GENERATOR
// ============================================================================

/**
 * Generates an SVG telemetry area graph with glowing cubic curves,
 * data point markers, and telemetry statistics.
 */
export function generateTelemetryGraphSvg(
  dataPoints: number[],
  options: TelemetryGraphOptions = {}
): string {
  const width = options.width ?? 600;
  const height = options.height ?? 220;
  const strokeColor = options.strokeColor ?? "#00F0FF";
  const glowColor = options.glowColor ?? "#00F0FF";
  const fillStart = options.fillGradientStart ?? "rgba(0, 240, 255, 0.35)";
  const fillEnd = options.fillGradientEnd ?? "rgba(0, 240, 255, 0.00)";
  const strokeWidth = options.strokeWidth ?? 3;
  const tension = options.tension ?? 0.32;
  const showPoints = options.showPoints ?? true;
  const showGrid = options.showGrid ?? true;
  const gridLines = options.gridLines ?? 4;
  const title = options.title ?? "ORBITAL TELEMETRY TRENDLINE";
  const unit = options.unit ?? "PTS";

  if (!dataPoints || dataPoints.length === 0) {
    dataPoints = [0, 0];
  }

  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 45;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const minVal = Math.min(...dataPoints);
  const maxVal = Math.max(...dataPoints, minVal + 1);
  const range = maxVal - minVal || 1;

  // Map data to canvas coordinates
  const pts: Point2D[] = dataPoints.map((val, idx) => {
    const x = paddingLeft + (idx / Math.max(1, dataPoints.length - 1)) * chartW;
    const y = paddingTop + chartH - ((val - minVal) / range) * chartH;
    return { x, y };
  });

  const curvePath = generateCatmullRomToBezierPath(pts, tension);
  const baselineY = paddingTop + chartH;
  const areaPath = generateSmoothBezierAreaPath(pts, baselineY, tension);

  // Generate gridlines
  let gridSvg = "";
  if (showGrid) {
    for (let g = 0; g <= gridLines; g++) {
      const gy = paddingTop + (g / gridLines) * chartH;
      const gVal = Math.round(maxVal - (g / gridLines) * range);
      gridSvg += `    <line x1="${paddingLeft}" y1="${gy.toFixed(2)}" x2="${(paddingLeft + chartW).toFixed(2)}" y2="${gy.toFixed(2)}" stroke="rgba(255, 255, 255, 0.08)" stroke-dasharray="3,3" />\n`;
      gridSvg += `    <text x="${paddingLeft - 8}" y="${(gy + 4).toFixed(2)}" fill="rgba(255, 255, 255, 0.45)" font-size="9" font-family="monospace" text-anchor="end">${gVal}</text>\n`;
    }
  }

  // Generate point markers
  let pointsSvg = "";
  if (showPoints && pts.length <= 40) {
    for (let p = 0; p < pts.length; p++) {
      const pt = pts[p];
      pointsSvg += `    <circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="3.5" fill="#0A0E17" stroke="${strokeColor}" stroke-width="2" />\n`;
    }
  }

  const gradId = "telemetry-area-grad";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}">
  <defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${fillStart}" />
      <stop offset="100%" stop-color="${fillEnd}" />
    </linearGradient>
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background container -->
  <rect x="0" y="0" width="${width}" height="${height}" rx="8" fill="#060A12" stroke="rgba(255, 255, 255, 0.06)" />

  <!-- Header Title & Stats -->
  <text x="${paddingLeft}" y="24" fill="#00F0FF" font-size="11" font-weight="bold" font-family="monospace" letter-spacing="1">[+] ${title}</text>
  <text x="${(width - paddingRight).toFixed(2)}" y="24" fill="rgba(255, 255, 255, 0.6)" font-size="10" font-family="monospace" text-anchor="end">MAX: ${maxVal.toLocaleString()} ${unit}</text>

  <!-- Grid lines -->
${gridSvg}
  <!-- Area Fill -->
  <path d="${areaPath}" fill="url(#${gradId})" />

  <!-- Telemetry Bezier Stroke -->
  <path d="${curvePath}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" filter="url(#neon-glow)" />

  <!-- Data Points -->
${pointsSvg}</svg>`;
}

// ============================================================================
// 6. CIRCULAR ARC & NEON GAUGE BEZIER PATH GENERATOR
// ============================================================================

/**
 * Generates an SVG path for a circular arc using cubic Bezier approximations.
 */
export function generateCircularArcBezierPath(
  cx: number,
  cy: number,
  radius: number,
  startAngleRad: number,
  endAngleRad: number
): string {
  let angleDiff = endAngleRad - startAngleRad;
  if (Math.abs(angleDiff) < 0.0001) return "";

  // Split large arcs into <= 90 degree segments for accurate cubic Bezier fit
  const numSegments = Math.ceil(Math.abs(angleDiff) / (Math.PI / 2));
  const segmentAngle = angleDiff / numSegments;
  let currentAngle = startAngleRad;

  const startX = cx + radius * Math.cos(currentAngle);
  const startY = cy + radius * Math.sin(currentAngle);
  let d = `M ${startX.toFixed(2)},${startY.toFixed(2)}`;

  for (let s = 0; s < numSegments; s++) {
    const nextAngle = currentAngle + segmentAngle;
    const halfAngle = (nextAngle - currentAngle) / 2;

    // Standard cubic bezier circular arc control point factor
    const k = (4 / 3) * Math.tan(halfAngle / 2);

    const cosA = Math.cos(currentAngle);
    const sinA = Math.sin(currentAngle);
    const cosB = Math.cos(nextAngle);
    const sinB = Math.sin(nextAngle);

    const cp1x = cx + radius * (cosA - k * sinA);
    const cp1y = cy + radius * (sinA + k * cosA);
    const cp2x = cx + radius * (cosB + k * sinB);
    const cp2y = cy + radius * (sinB - k * cosB);
    const endX = cx + radius * cosB;
    const endY = cy + radius * sinB;

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${endX.toFixed(2)},${endY.toFixed(2)}`;
    currentAngle = nextAngle;
  }

  return d;
}

/**
 * Generates a full neon circular orbital gauge SVG.
 */
export function generateNeonGaugeSvg(options: GaugeSvgOptions): string {
  const size = options.size ?? 160;
  const radius = options.radius ?? 60;
  const strokeWidth = options.strokeWidth ?? 8;
  const value = Math.max(0, Math.min(1, options.value));
  const startAngleDeg = options.startAngleDeg ?? 135;
  const endAngleDeg = options.endAngleDeg ?? 405;
  const trackColor = options.trackColor ?? "rgba(255, 255, 255, 0.1)";
  const progressColor = options.progressColor ?? "#00F0FF";
  const glowColor = options.glowColor ?? "#00F0FF";
  const label = options.label ?? "CORE SHIELD";
  const valueText = options.valueText ?? `${Math.round(value * 100)}%`;

  const cx = size / 2;
  const cy = size / 2;

  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;
  const totalAngle = endRad - startRad;
  const progressRad = startRad + totalAngle * value;

  const trackPath = generateCircularArcBezierPath(cx, cy, radius, startRad, endRad);
  const progressPath =
    value > 0.001
      ? generateCircularArcBezierPath(cx, cy, radius, startRad, progressRad)
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <filter id="gauge-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Track Arc -->
  <path d="${trackPath}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />

  <!-- Progress Arc with Neon Bloom -->
  ${
    progressPath
      ? `<path d="${progressPath}" fill="none" stroke="${progressColor}" stroke-width="${strokeWidth}" stroke-linecap="round" filter="url(#gauge-glow)" />`
      : ""
  }

  <!-- Value & Label -->
  <text x="${cx}" y="${cy - 4}" fill="#FFFFFF" font-size="18" font-weight="900" font-family="monospace" text-anchor="middle">${valueText}</text>
  <text x="${cx}" y="${cy + 16}" fill="rgba(255, 255, 255, 0.55)" font-size="8" font-weight="bold" font-family="monospace" text-anchor="middle" letter-spacing="1">${label}</text>
</svg>`;
}
