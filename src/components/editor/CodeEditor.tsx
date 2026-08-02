"use client";

import { useState } from "react";
import styles from "./Editor.module.css";

interface CodeEditorProps {
  svgCode: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ svgCode, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.codeEditorContainer}>
      <div className={styles.codeHeader}>
        <span className={styles.codeTitle}>SVG Source (Live Editing)</span>
        <button onClick={handleCopy} className={styles.copyBtn}>
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>
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
