"use client";

import { useState } from "react";
import styles from "../utilities.module.css";
import AdSlot from "@/components/AdSlot";

export default function RoasCalculatorPage() {
  const [adSpend, setAdSpend] = useState<number>(1200);
  const [customersAcquired, setCustomersAcquired] = useState<number>(50);
  const [arpu, setArpu] = useState<number>(49); // Average Revenue Per User (Monthly)
  const [cogsPerUser, setCogsPerUser] = useState<number>(8); // Server / API cost per user
  const [lifetimeMonths, setLifetimeMonths] = useState<number>(14);

  // Unit Economics Math
  const totalGrossRevenue = customersAcquired * arpu;
  const totalCogs = customersAcquired * cogsPerUser;
  const cac = customersAcquired > 0 ? (adSpend / customersAcquired).toFixed(2) : "0";
  const ltv = (arpu - cogsPerUser) * lifetimeMonths;
  const ltvToCacRatio = parseFloat(cac) > 0 ? (ltv / parseFloat(cac)).toFixed(2) : "0";
  
  const roasMultiplier = adSpend > 0 ? (totalGrossRevenue / adSpend).toFixed(2) : "0";
  const netProfit = totalGrossRevenue - adSpend - totalCogs;
  const profitMargin = totalGrossRevenue > 0 ? ((netProfit / totalGrossRevenue) * 100).toFixed(1) : "0";

  // Visual Breakdown Width Percentages
  const adSpendPercent = totalGrossRevenue > 0 ? Math.min(100, Math.max(5, (adSpend / totalGrossRevenue) * 100)) : 0;
  const cogsPercent = totalGrossRevenue > 0 ? Math.min(100, Math.max(5, (totalCogs / totalGrossRevenue) * 100)) : 0;
  const profitPercent = totalGrossRevenue > 0 ? Math.max(0, 100 - adSpendPercent - cogsPercent) : 0;

  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      inputs: { adSpend, customersAcquired, arpu, cogsPerUser, lifetimeMonths },
      metrics: {
        totalGrossRevenue,
        totalCogs,
        cac: `$${cac}`,
        ltv: `$${ltv}`,
        ltvToCacRatio: `${ltvToCacRatio}x`,
        roasMultiplier: `${roasMultiplier}x`,
        netProfit: `$${netProfit}`,
        profitMargin: `${profitMargin}%`
      }
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saas-unit-economics-report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SaaS Unit Economics & ROAS Financial Dashboard</h1>
        <p className={styles.description}>
          Evaluate Customer Acquisition Cost (CAC), Lifetime Value (LTV), break-even ad targets, and net profit margins.
        </p>
      </div>

      {/* Dedicated Architectural Top Banner Ad Slot */}
      <AdSlot type="banner" />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Main Dashboard Card */}
        <div className="glass" style={{ padding: "2rem", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "1.25rem" }}>1. Financial Inputs & Assumptions</h3>
            <button 
              onClick={handleExportReport}
              style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "0.4rem 0.9rem", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
            >
              📥 Export JSON Report
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Ad Spend Budget ($)</label>
              <input 
                type="number" 
                value={adSpend} 
                onChange={(e) => setAdSpend(parseFloat(e.target.value) || 0)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.65rem", borderRadius: "6px", outline: "none", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Customers Acquired</label>
              <input 
                type="number" 
                value={customersAcquired} 
                onChange={(e) => setCustomersAcquired(parseInt(e.target.value) || 0)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.65rem", borderRadius: "6px", outline: "none", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Monthly Price / ARPU ($)</label>
              <input 
                type="number" 
                value={arpu} 
                onChange={(e) => setArpu(parseFloat(e.target.value) || 0)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.65rem", borderRadius: "6px", outline: "none", fontSize: "1rem" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>COGS / Server Cost per User ($)</label>
              <input 
                type="number" 
                value={cogsPerUser} 
                onChange={(e) => setCogsPerUser(parseFloat(e.target.value) || 0)}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.65rem", borderRadius: "6px", outline: "none", fontSize: "1rem" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Avg Customer Retention ({lifetimeMonths} Months)</label>
              <input 
                type="range" 
                min="1" 
                max="36" 
                value={lifetimeMonths} 
                onChange={(e) => setLifetimeMonths(parseInt(e.target.value))}
                style={{ cursor: "pointer", marginTop: "0.5rem" }}
              />
            </div>
          </div>

          {/* Core Metrics Grid */}
          <h3 style={{ margin: "1rem 0 0 0", fontSize: "1.25rem" }}>2. Unit Economics & Profitability</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>ROAS Multiplier</span>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: parseFloat(roasMultiplier) >= 2 ? "#34d399" : "#f87171", marginTop: "0.25rem" }}>
                {roasMultiplier}x
              </div>
            </div>

            <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Customer CAC</span>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#a5b4fc", marginTop: "0.25rem" }}>
                ${cac}
              </div>
            </div>

            <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Customer LTV</span>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#34d399", marginTop: "0.25rem" }}>
                ${ltv}
              </div>
            </div>

            <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", textAlign: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>LTV : CAC Ratio</span>
              <div style={{ fontSize: "1.75rem", fontWeight: 800, color: parseFloat(ltvToCacRatio) >= 3 ? "#34d399" : "#fbbf24", marginTop: "0.25rem" }}>
                {ltvToCacRatio}x
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>Net Profit / Loss</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: netProfit >= 0 ? "#34d399" : "#f87171" }}>
                ${netProfit.toLocaleString()}
              </span>
            </div>

            <div style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", padding: "1.25rem", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.7)" }}>Net Profit Margin</span>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: parseFloat(profitMargin) >= 0 ? "#818cf8" : "#f87171" }}>
                {profitMargin}%
              </span>
            </div>
          </div>

          {/* Visual Financial Revenue Allocation Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Revenue Allocation Breakdown</span>
            <div style={{ height: "24px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${adSpendPercent}%`, background: "#f87171" }} title="Ad Spend" />
              <div style={{ width: `${cogsPercent}%`, background: "#fbbf24" }} title="COGS / Infrastructure" />
              <div style={{ width: `${profitPercent}%`, background: "#34d399" }} title="Net Profit" />
            </div>
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#f87171" }} /> Ad Spend ({adSpendPercent.toFixed(0)}%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24" }} /> Infrastructure ({cogsPercent.toFixed(0)}%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#34d399" }} /> Net Margin ({profitPercent.toFixed(0)}%)
              </span>
            </div>
          </div>

        </div>

        {/* Sidebar Column with Architectural Ad Space */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h4 style={{ margin: 0, fontSize: "1.05rem" }}>Benchmark Guidelines</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
              Healthy SaaS companies target an <strong>LTV : CAC ratio ≥ 3.0x</strong> and a CAC payback period under 12 months.
            </p>
          </div>

          <AdSlot type="sidebar" />
        </div>
      </div>
    </div>
  );
}
