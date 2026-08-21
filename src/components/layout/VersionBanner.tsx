"use client";

import { useEffect, useState } from "react";

export default function VersionBanner() {
  const [versionData, setVersionData] = useState<{ version: string; passesCompleted: number } | null>(null);

  useEffect(() => {
    async function loadVersion() {
      try {
        const res = await fetch("/api/aegis/version");
        const data = await res.json();
        setVersionData(data);
      } catch (e) {}
    }
    loadVersion();
  }, []);

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      background: "rgba(0, 240, 255, 0.08)",
      border: "1px solid rgba(0, 240, 255, 0.25)",
      padding: "0.2rem 0.6rem",
      borderRadius: "6px",
      fontSize: "0.7rem",
      fontWeight: 800,
      color: "var(--accent-cyan)",
      fontFamily: "var(--font-outfit)",
      letterSpacing: "0.04em"
    }}>
      <span>[EPIC] AEGIS v{versionData ? versionData.version : "25.0"}</span>
      <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>|</span>
      <span>PASS 25/25 COMPLETE</span>
    </div>
  );
}
