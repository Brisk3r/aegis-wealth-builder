"use client";

export default function SystemSpecsMatrix() {
  const specs = [
    { target: "1080p 60FPS Medium", gpu: "GTX 1660 / RX 580", cpu: "Intel i5-10400 / Ryzen 3600", ram: "16GB DDR4", storage: "50GB SSD" },
    { target: "1440p 60FPS High", gpu: "RTX 3060 Ti / RX 6700 XT", cpu: "Intel i5-12400 / Ryzen 5600X", ram: "16GB DDR4", storage: "100GB NVMe SSD" },
    { target: "4K 60FPS Ultra / Ray Tracing", gpu: "RTX 4080 / RTX 5090", cpu: "Intel i7-14700K / Ryzen 7800X3D", ram: "32GB DDR5", storage: "150GB NVMe M.2" },
  ];

  return (
    <div className="glass" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 style={{ fontSize: "1.05rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>[PC]</span> Aegis Hardware Telemetry & Specs Matrix
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {specs.map((s, idx) => (
          <div key={idx} style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "0.85rem",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem"
          }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--accent-cyan)" }}>{s.target}</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <span>GPU: <strong style={{ color: "#ffffff" }}>{s.gpu}</strong></span>
              <span>CPU: <strong style={{ color: "#ffffff" }}>{s.cpu}</strong></span>
              <span>RAM: <strong style={{ color: "#ffffff" }}>{s.ram}</strong></span>
              <span>Storage: <strong style={{ color: "#ffffff" }}>{s.storage}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
