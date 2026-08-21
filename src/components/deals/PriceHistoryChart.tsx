"use client";

import { PricePoint } from "@/lib/aegisEngine";
import { useCurrency } from "@/context/CurrencyContext";

interface PriceHistoryChartProps {
  priceHistory: PricePoint[];
  msrpUSD: number;
  height?: number;
}

export default function PriceHistoryChart({ priceHistory, msrpUSD, height = 140 }: PriceHistoryChartProps) {
  const { formatPrice, convertPrice } = useCurrency();

  if (!priceHistory || priceHistory.length < 2) {
    return <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "1rem" }}>Price history telemetry recording...</div>;
  }

  const width = 360;
  const padding = 25;

  const prices = priceHistory.map(p => convertPrice(p.priceUSD));
  const msrpConverted = convertPrice(msrpUSD);
  const maxVal = Math.max(...prices, msrpConverted) * 1.15;
  const minVal = Math.max(0, Math.min(...prices) * 0.85);

  const getX = (index: number) => padding + (index / (priceHistory.length - 1)) * (width - 2 * padding);
  const getY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);

  const msrpY = getY(msrpConverted);

  // Generate smooth cubic Bezier path
  const points = priceHistory.map((p, i) => ({
    x: getX(i),
    y: getY(convertPrice(p.priceUSD)),
    date: p.date,
    price: convertPrice(p.priceUSD)
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>[CHART] Price Drop Telemetry (Aegis Index)</span>
        <span style={{ color: "var(--accent-green)", fontWeight: 800 }}>Low: {formatPrice(Math.min(...priceHistory.map(p => p.priceUSD)))}</span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* MSRP Reference Line */}
        <line
          x1={padding}
          y1={msrpY}
          x2={width - padding}
          y2={msrpY}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        <text x={width - padding} y={msrpY - 4} fill="rgba(255, 255, 255, 0.4)" fontSize="9" textAnchor="end">
          MSRP {formatPrice(msrpUSD)}
        </text>

        {/* Fill Area */}
        <path d={areaD} fill="url(#chartGradient)" />

        {/* Smooth Price Curve Line */}
        <path d={pathD} fill="none" stroke="var(--accent-cyan)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Data Points */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={pt.y} r="4" fill="var(--accent-cyan)" stroke="#0f172a" strokeWidth="2" />
            <text x={pt.x} y={pt.y - 8} fill="#ffffff" fontSize="9" fontWeight="700" textAnchor="middle">
              {formatPrice(priceHistory[idx].priceUSD)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
