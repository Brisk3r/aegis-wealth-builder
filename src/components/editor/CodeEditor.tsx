"use client";

import { useState } from "react";
import styles from "./Editor.module.css";
import { sanitizeAndFormatSvg } from "@/utils/svgOptimizer";

interface CodeEditorProps {
  svgCode: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ svgCode, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  let isValidXml = true;
  let xmlErrorMsg = "";

  try {
    if (svgCode.trim()) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, "image/svg+xml");
      const parserError = doc.querySelector("parsererror");
      if (parserError) {
        isValidXml = false;
        xmlErrorMsg = parserError.textContent || "XML Syntax Error";
      }
    }
  } catch {
    isValidXml = false;
    xmlErrorMsg = "Invalid XML Document";
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrettify = () => {
    const formatted = sanitizeAndFormatSvg(svgCode);
    onChange(formatted);
  };

  const lineCount = svgCode ? svgCode.split("\n").length : 0;
  const byteSize = new Blob([svgCode]).size;

  return (
    <div className={styles.codeEditorContainer}>
      <div className={styles.codeHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className={styles.codeTitle}>SVG Source (Live Editing)</span>
          <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", background: isValidXml ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)", color: isValidXml ? "#34d399" : "#f87171", border: isValidXml ? "1px solid #34d399" : "1px solid #f87171" }}>
            {isValidXml ? "Valid XML" : "Syntax Error"}
          </span>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>
            {lineCount} lines * {byteSize} B
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={handlePrettify} className={styles.copyBtn}>
            * Prettify XML
          </button>
          <button onClick={handleCopy} className={styles.copyBtn}>
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>

      {!isValidXml && (
        <div style={{ padding: "0.5rem 1rem", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#fca5a5", fontSize: "0.8rem", borderRadius: "4px", marginBottom: "0.5rem" }}>
          [!] {xmlErrorMsg}
        </div>
      )}

      <textarea
        value={svgCode}
        onChange={(e) => onChange(e.target.value)}
        className={styles.codeTextarea}
        spellCheck={false}
        placeholder="Paste or write your raw SVG code here..."
      />
    </div>
  );
}
