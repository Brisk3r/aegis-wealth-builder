"use client";

import { useState } from "react";
import styles from "../utilities.module.css";
import AdSlot from "@/components/AdSlot";

const PRESETS = [
  { name: "Email Address", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", sample: "Contact info@aegisdev.com or user.test@gmail.com for help." },
  { name: "URL / Domain", pattern: "https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(/\\S*)?", sample: "Visit https://aegisdev.com/svg-editor or http://example.org today." },
  { name: "IPv4 Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b", sample: "Server logs: 192.168.1.1 and 10.0.0.254 active." },
  { name: "Hex Color Code", pattern: "#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b", sample: "Colors: #6366f1, #000, and #ffffff." }
];

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState<string>("([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.com");
  const [flags, setFlags] = useState<string>("g");
  const [testText, setTestText] = useState<string>("Hello contact user@example.com or admin@test.com today.");

  const applyPreset = (p: typeof PRESETS[0]) => {
    setPattern(p.pattern);
    setTestText(p.sample);
  };

  let matches: string[] = [];
  let isError = false;
  let errorMessage = "";

  try {
    if (pattern) {
      const regex = new RegExp(pattern, flags);
      const matchedArray = testText.match(regex);
      if (matchedArray) {
        matches = Array.from(matchedArray);
      }
    }
  } catch (err: unknown) {
    isError = true;
    errorMessage = (err as Error)?.message || "Invalid Regular Expression Syntax";
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>RegEx Tester & Debugger Studio</h1>
        <p className={styles.description}>
          Test JavaScript regular expressions live with instant pattern matching and flags evaluation.
        </p>
      </div>

      <AdSlot type="banner" />

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div className="glass" style={{ padding: "2rem", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Pattern Presets:</span>
            {PRESETS.map((p) => (
              <button 
                key={p.name}
                type="button" 
                onClick={() => applyPreset(p)}
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Expression Pattern</label>
              <input 
                type="text" 
                value={pattern} 
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. [a-z]+"
                style={{ background: "rgba(255,255,255,0.05)", border: isError ? "1px solid #ef4444" : "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", fontFamily: "monospace", outline: "none" }}
              />
            </div>

            <div style={{ width: "100px", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Flags</label>
              <input 
                type="text" 
                value={flags} 
                onChange={(e) => setFlags(e.target.value)}
                placeholder="g, i, m"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", fontFamily: "monospace", outline: "none" }}
              />
            </div>
          </div>

          {isError && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.75rem", borderRadius: "6px", fontSize: "0.9rem" }}>
              [!] {errorMessage}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Test String</label>
            <textarea 
              value={testText} 
              onChange={(e) => setTestText(e.target.value)}
              rows={5}
              style={{ background: "rgba(10,10,15,0.8)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.8rem", borderRadius: "6px", fontFamily: "monospace", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
              Matches Found ({matches.length}):
            </span>
            <div style={{ background: "rgba(10,10,15,0.9)", border: "1px solid var(--glass-border)", padding: "1rem", borderRadius: "6px", minHeight: "80px" }}>
              {matches.length === 0 ? (
                <span style={{ color: "rgba(255,255,255,0.4)" }}>No matches found for current pattern.</span>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {matches.map((m, idx) => (
                    <span key={idx} style={{ background: "rgba(99,102,241,0.25)", border: "1px solid var(--accent)", color: "#a5b4fc", padding: "0.25rem 0.6rem", borderRadius: "4px", fontFamily: "monospace" }}>
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <AdSlot type="sidebar" />
        </div>
      </div>
    </div>
  );
}
