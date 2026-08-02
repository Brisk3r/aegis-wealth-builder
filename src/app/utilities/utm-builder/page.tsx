"use client";

import { useState } from "react";
import styles from "../utilities.module.css";

export default function UtmBuilderPage() {
  const [baseUrl, setBaseUrl] = useState("https://aegisdev.com");
  const [source, setSource] = useState("twitter");
  const [medium, setMedium] = useState("social");
  const [campaign, setCampaign] = useState("launch_v1");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const applyPreset = (presetSource: string, presetMedium: string, presetCampaign: string) => {
    setSource(presetSource);
    setMedium(presetMedium);
    setCampaign(presetCampaign);
  };

  const generateUrl = () => {
    if (!baseUrl) return "";
    try {
      const url = new URL(baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`);
      if (source) url.searchParams.set("utm_source", source);
      if (medium) url.searchParams.set("utm_medium", medium);
      if (campaign) url.searchParams.set("utm_campaign", campaign);
      if (term) url.searchParams.set("utm_term", term);
      if (content) url.searchParams.set("utm_content", content);
      return url.toString();
    } catch {
      return baseUrl;
    }
  };

  const finalUrl = generateUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>UTM Campaign Parameter Builder</h1>
        <p className={styles.description}>
          Build clean, standardized campaign tracking URLs for analytics without dark social attribution leaks.
        </p>
      </div>

      <div className="glass" style={{ padding: "2rem", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
        {/* Presets Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Quick Presets:</span>
          <button 
            type="button" 
            onClick={() => applyPreset("reddit", "social", "product_launch")}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
          >
            Reddit Launch
          </button>
          <button 
            type="button" 
            onClick={() => applyPreset("twitter", "social", "announcement")}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
          >
            Twitter Post
          </button>
          <button 
            type="button" 
            onClick={() => applyPreset("producthunt", "referral", "ph_launch")}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
          >
            Product Hunt
          </button>
          <button 
            type="button" 
            onClick={() => applyPreset("newsletter", "email", "weekly_digest")}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.3rem 0.6rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer" }}
          >
            Email Digest
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Website URL *</label>
          <input 
            type="text" 
            value={baseUrl} 
            onChange={(e) => setBaseUrl(e.target.value)}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Campaign Source (utm_source) *</label>
            <input 
              type="text" 
              value={source} 
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. reddit, twitter, newsletter"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Campaign Medium (utm_medium) *</label>
            <input 
              type="text" 
              value={medium} 
              onChange={(e) => setMedium(e.target.value)}
              placeholder="e.g. cpc, social, email"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Campaign Name (utm_campaign) *</label>
            <input 
              type="text" 
              value={campaign} 
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="e.g. summer_sale, launch"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Campaign Term (utm_term)</label>
            <input 
              type="text" 
              value={term} 
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. running_shoes, SaaS"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Campaign Content (utm_content)</label>
          <input 
            type="text" 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. banner_ad, sidebar_link"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)", color: "#fff", padding: "0.6rem", borderRadius: "6px", outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Generated URL:</span>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <input 
              type="text" 
              value={finalUrl} 
              readOnly 
              style={{ flex: 1, background: "rgba(10,10,15,0.9)", border: "1px solid var(--glass-border)", color: "#34d399", padding: "0.6rem", borderRadius: "6px", fontFamily: "monospace" }}
            />
            <button 
              onClick={handleCopy}
              style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "0 1.25rem", borderRadius: "6px", fontWeight: 600, cursor: "pointer" }}
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
