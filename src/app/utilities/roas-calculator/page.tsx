"use client";

import { useState } from "react";
import styles from "../utilities.module.css";

export default function RoasCalculatorPage() {
  const [adSpend, setAdSpend] = useState<number>(1000);
  const [revenue, setRevenue] = useState<number>(3500);
  const [cogs, setCogs] = useState<number>(500); // cost of goods / server costs

  const roas = adSpend > 0 ? (revenue / adSpend).toFixed(2) : "0";
  const profit = revenue - adSpend - cogs;
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ROAS & SaaS Financial Calculator</h1>
        <p className={styles.description}>
          Evaluate ad spend efficiency, break-even targets, and net profitability for developer micro-SaaS launches.
        </p>
      </div>

      <div className="glass" style={{ padding: "2rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Ad Spend ($)</label>
            <input 
              type="number" 
              value={adSpend} 
              onChange={(e) => setAdSpend(parseFloat(e.target.value) || 0)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Gross Revenue ($)</label>
            <input 
              type="number" 
              value={revenue} 
              onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Server/COGS ($)</label>
            <input 
              type="number" 
              value={cogs} 
              onChange={(e) => setCogs(parseFloat(e.target.value) || 0)}
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
            />
          </div>
        </div>

        {/* Results Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Return on Ad Spend</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: parseFloat(roas) >= 2 ? "#34d399" : "#f87171", marginTop: "0.25rem" }}>
              {roas}x
            </div>
          </div>

          <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Net Profit</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: profit >= 0 ? "#34d399" : "#f87171", marginTop: "0.25rem" }}>
              ${profit.toLocaleString()}
            </div>
          </div>

          <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", textAlign: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>Profit Margin</span>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: parseFloat(margin) >= 0 ? "#818cf8" : "#f87171", marginTop: "0.25rem" }}>
              {margin}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
