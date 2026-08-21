"use client";

import { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";

interface PriceCalculatorProps {
  initialBudgetUSD?: number;
}

export default function PriceCalculator({ initialBudgetUSD = 50 }: PriceCalculatorProps) {
  const { formatPrice, convertPrice } = useCurrency();
  const [budgetUSD, setBudgetUSD] = useState(initialBudgetUSD);
  const [selectedGameCount, setSelectedGameCount] = useState(3);
  const [avgDiscountPct, setAvgDiscountPct] = useState(40);

  const budgetConverted = convertPrice(budgetUSD);
  const estimatedSavingsUSD = (budgetUSD * (avgDiscountPct / 100)) / (1 - (avgDiscountPct / 100));

  return (
    <div className="glass" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 style={{ fontSize: "1.05rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span>**</span> Aegis Deal Budget Calculator
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <span>Target Gaming Budget:</span>
          <span style={{ fontWeight: 800, color: "var(--accent-cyan)" }}>{formatPrice(budgetUSD)}</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          step="10"
          value={budgetUSD}
          onChange={(e) => setBudgetUSD(Number(e.target.value))}
          style={{ accentColor: "var(--accent-cyan)", cursor: "pointer" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          <span>Target Average Discount:</span>
          <span style={{ fontWeight: 800, color: "var(--accent-green)" }}>{avgDiscountPct}% OFF</span>
        </div>
        <input
          type="range"
          min="20"
          max="80"
          step="10"
          value={avgDiscountPct}
          onChange={(e) => setAvgDiscountPct(Number(e.target.value))}
          style={{ accentColor: "var(--accent-green)", cursor: "pointer" }}
        />
      </div>

      <div style={{
        background: "rgba(0, 240, 255, 0.08)",
        border: "1px solid rgba(0, 240, 255, 0.25)",
        padding: "0.85rem",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Estimated Savings Realized:</span>
        <span style={{ fontFamily: "var(--font-outfit)", fontSize: "1.2rem", fontWeight: 900, color: "var(--accent-cyan)" }}>
          {formatPrice(estimatedSavingsUSD)}
        </span>
      </div>
    </div>
  );
}
