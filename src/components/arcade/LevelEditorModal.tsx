"use client";

import React, { useState } from "react";
import { BossType, Bumper, BumperType, CustomLevelData, GravityWell, LaserBeam } from "@/lib/gameEngine/types";
import { exportLevelToBase64, safeDeserializeLevelCode } from "@/lib/gameEngine/levels";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface LevelEditorModalProps {
  onClose: () => void;
  onPlayCustomLevel: (levelData: CustomLevelData) => void;
}

export const PREBUILT_COMMUNITY_LEVELS: CustomLevelData[] = [
  {
    id: "lvl_pinball_mayhem",
    name: "Pinball Super-Colosseum",
    author: "AegisCore",
    targetScore: 12000,
    ambientColor: "#0F051D",
    hasBoss: false,
    bumpers: [
      { id: "b1", x: 200, y: 200, radius: 24, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 0, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b2", x: 400, y: 200, radius: 24, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 15, pulsePhase: 1, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b3", x: 300, y: 320, radius: 30, type: "GOLDEN_CORE", hp: 4, maxHp: 4, points: 800, shards: 60, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
      { id: "b4", x: 150, y: 400, radius: 20, type: "EXPLOSIVE", hp: 1, maxHp: 1, points: 400, shards: 20, pulsePhase: 3, color: "#FF3366", glowColor: "rgba(255,51,102,0.5)", isDestroyed: false },
      { id: "b5", x: 450, y: 400, radius: 20, type: "EXPLOSIVE", hp: 1, maxHp: 1, points: 400, shards: 20, pulsePhase: 4, color: "#FF3366", glowColor: "rgba(255,51,102,0.5)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 250, radius: 120, innerRadius: 16, strength: 4500, pulseSpeed: 0.05, pulseOffset: 0, color: "#00F0FF" },
    ],
    laserBeams: [],
  },
  {
    id: "lvl_laser_gauntlet",
    name: "Dual Laser Helix",
    author: "QuantumPilot",
    targetScore: 18000,
    ambientColor: "#170308",
    hasBoss: true,
    bossType: "VORTEX_TITAN",
    bumpers: [
      { id: "b1", x: 220, y: 350, radius: 22, type: "PRISM_LASER", hp: 3, maxHp: 3, points: 500, shards: 25, pulsePhase: 0, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
      { id: "b2", x: 380, y: 350, radius: 22, type: "PRISM_LASER", hp: 3, maxHp: 3, points: 500, shards: 25, pulsePhase: 1, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 400, radius: 100, innerRadius: 14, strength: -3800, pulseSpeed: 0.08, pulseOffset: 0, color: "#FF3366" },
    ],
    laserBeams: [
      { id: "l1", startX: 300, startY: 300, endX: 300, endY: 300, angle: 0, angularVelocity: 0.025, length: 140, isActive: true, warmupTimer: 0, activeTimer: 0, duration: 180, interval: 120, damage: 1, color: "#FF0055" },
    ],
  },
  {
    id: "lvl_titan_crucible",
    name: "Titan Singularity Crucible",
    author: "AegisCommand",
    targetScore: 25000,
    ambientColor: "#0A0314",
    hasBoss: true,
    bossType: "CHRONOS_PRIME",
    bumpers: [
      { id: "b1", x: 180, y: 220, radius: 22, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 20, pulsePhase: 0, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b2", x: 420, y: 220, radius: 22, type: "BOUNCE_SUPER", hp: 3, maxHp: 3, points: 300, shards: 20, pulsePhase: 1, color: "#39FF14", glowColor: "rgba(57,255,20,0.5)", isDestroyed: false },
      { id: "b3", x: 300, y: 360, radius: 28, type: "GOLDEN_CORE", hp: 4, maxHp: 4, points: 900, shards: 75, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 200, y: 300, radius: 100, innerRadius: 15, strength: 4000, pulseSpeed: 0.06, pulseOffset: 0, color: "#00F0FF" },
      { id: "gw2", x: 400, y: 300, radius: 100, innerRadius: 15, strength: -3600, pulseSpeed: 0.06, pulseOffset: Math.PI, color: "#FF3366" },
    ],
    laserBeams: [],
  },
  {
    id: "lvl_void_leviathan",
    name: "Void Leviathan Maw",
    author: "VoidPilot",
    targetScore: 40000,
    ambientColor: "#02080E",
    hasBoss: true,
    bossType: "VOID_LEVIATHAN",
    bumpers: [
      { id: "b1", x: 150, y: 250, radius: 24, type: "PRISM_LASER", hp: 4, maxHp: 4, points: 600, shards: 35, pulsePhase: 0, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
      { id: "b2", x: 450, y: 250, radius: 24, type: "PRISM_LASER", hp: 4, maxHp: 4, points: 600, shards: 35, pulsePhase: 1, color: "#BF00FF", glowColor: "rgba(191,0,255,0.5)", isDestroyed: false },
      { id: "b3", x: 300, y: 200, radius: 26, type: "GOLDEN_CORE", hp: 5, maxHp: 5, points: 1000, shards: 80, pulsePhase: 2, color: "#FFD700", glowColor: "rgba(255,215,0,0.7)", isDestroyed: false },
    ],
    gravityWells: [
      { id: "gw1", x: 300, y: 320, radius: 130, innerRadius: 20, strength: 5200, pulseSpeed: 0.07, pulseOffset: 0, color: "#00FFCC" },
    ],
    laserBeams: [],
  },
];

export default function LevelEditorModal({ onClose, onPlayCustomLevel }: LevelEditorModalProps) {
  const [levelName, setLevelName] = useState<string>("Custom Sector 01");
  const [targetScore, setTargetScore] = useState<number>(10000);
  const [hasBoss, setHasBoss] = useState<boolean>(false);
  const [bossType, setBossType] = useState<BossType>("VORTEX_TITAN");
  const [bumpers, setBumpers] = useState<Bumper[]>([...PREBUILT_COMMUNITY_LEVELS[0].bumpers]);
  const [gravityWells, setGravityWells] = useState<GravityWell[]>([...PREBUILT_COMMUNITY_LEVELS[0].gravityWells]);
  const [selectedTool, setSelectedTool] = useState<"BUMPER_STANDARD" | "BUMPER_SUPER" | "BUMPER_EXPLOSIVE" | "BUMPER_GOLD" | "GRAVITY_ATTRACT" | "GRAVITY_REPEL" | "ERASE">("BUMPER_STANDARD");
  const [importCode, setImportCode] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (selectedTool === "ERASE") {
      setBumpers((prev) => prev.filter((b) => Math.hypot(b.x - x, b.y - y) > b.radius + 10));
      setGravityWells((prev) => prev.filter((gw) => Math.hypot(gw.x - x, gw.y - y) > 35));
      soundManager.playExplosion("SMALL");
      return;
    }

    if (selectedTool.startsWith("BUMPER")) {
      const type: BumperType = 
        selectedTool === "BUMPER_SUPER" ? "BOUNCE_SUPER" : 
        selectedTool === "BUMPER_EXPLOSIVE" ? "EXPLOSIVE" : 
        selectedTool === "BUMPER_GOLD" ? "GOLDEN_CORE" : "STANDARD";
      
      const color = 
        type === "BOUNCE_SUPER" ? "#39FF14" : 
        type === "EXPLOSIVE" ? "#FF3366" : 
        type === "GOLDEN_CORE" ? "#FFD700" : "#00F0FF";
      
      const newBumper: Bumper = {
        id: `custom_b_${Date.now()}`,
        x,
        y,
        radius: type === "GOLDEN_CORE" ? 26 : 20,
        type,
        hp: type === "GOLDEN_CORE" ? 4 : type === "BOUNCE_SUPER" ? 3 : 1,
        maxHp: type === "GOLDEN_CORE" ? 4 : type === "BOUNCE_SUPER" ? 3 : 1,
        points: type === "GOLDEN_CORE" ? 800 : type === "EXPLOSIVE" ? 400 : 200,
        shards: type === "GOLDEN_CORE" ? 50 : 15,
        pulsePhase: 0,
        color,
        glowColor: color,
        isDestroyed: false,
      };

      setBumpers((prev) => [...prev, newBumper]);
      soundManager.playBumperHit(1, type);
    } else if (selectedTool.startsWith("GRAVITY")) {
      const isAttract = selectedTool === "GRAVITY_ATTRACT";
      const newWell: GravityWell = {
        id: `custom_gw_${Date.now()}`,
        x,
        y,
        radius: 110,
        innerRadius: 16,
        strength: isAttract ? 4200 : -3500,
        pulseSpeed: 0.05,
        pulseOffset: 0,
        color: isAttract ? "#00F0FF" : "#FF3366",
      };

      setGravityWells((prev) => [...prev, newWell]);
      soundManager.playOverdriveActivate();
    }
  };

  const handleExportCode = () => {
    const data: CustomLevelData = {
      id: `custom_${Date.now()}`,
      name: levelName,
      author: "Commander",
      targetScore,
      ambientColor: "#0B0F19",
      hasBoss,
      bossType: hasBoss ? bossType : undefined,
      bumpers,
      gravityWells,
      laserBeams: [],
    };

    const base64 = exportLevelToBase64(data);
    navigator.clipboard.writeText(base64);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleImportCode = () => {
    const result = safeDeserializeLevelCode(importCode);
    if (result.success && result.data) {
      const data = result.data;
      setLevelName(data.name || "Imported Level");
      setTargetScore(data.targetScore || 10000);
      setHasBoss(!!data.hasBoss);
      if (data.bossType) setBossType(data.bossType);
      setBumpers(data.bumpers);
      setGravityWells(data.gravityWells || []);
      soundManager.playDraftSelect();
    } else {
      alert("Invalid level code format.");
    }
  };

  const handleLaunchLevel = (level: CustomLevelData) => {
    soundManager.playOverdriveActivate();
    onPlayCustomLevel(level);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.techModalContainer} glass`} style={{ maxWidth: "1050px" }}>
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>CREATIVE LAB // STAGE BUILDER</div>
            <h2 className={styles.modalTitle}>ORBITAL SANDBOX // LEVEL DESIGNER</h2>
            <p className={styles.modalSubtitle}>
              Craft customized kinetic sectors, place gravity vortexes, configure boss encounters, and export shareable level codes.
            </p>
          </div>
        </div>

        {/* Builder Toolbar & Canvas Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "1.25rem", marginTop: "1rem" }}>
          {/* Left: Palette & Config */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <div className="glass" style={{ padding: "0.85rem", borderRadius: "8px" }}>
              <span className={styles.deckSectionTitle}>PLACEMENT TOOL</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginTop: "0.5rem" }}>
                <button
                  onClick={() => setSelectedTool("BUMPER_STANDARD")}
                  className={`${styles.deckNavBtn} ${selectedTool === "BUMPER_STANDARD" ? styles.tabActive : ""}`}
                >
                  [*] Standard Cyan Bumper
                </button>
                <button
                  onClick={() => setSelectedTool("BUMPER_SUPER")}
                  className={`${styles.deckNavBtn} ${selectedTool === "BUMPER_SUPER" ? styles.tabActive : ""}`}
                >
                  [^] Super Bounce Green
                </button>
                <button
                  onClick={() => setSelectedTool("BUMPER_EXPLOSIVE")}
                  className={`${styles.deckNavBtn} ${selectedTool === "BUMPER_EXPLOSIVE" ? styles.tabActive : ""}`}
                >
                  [!] Explosive Crimson
                </button>
                <button
                  onClick={() => setSelectedTool("BUMPER_GOLD")}
                  className={`${styles.deckNavBtn} ${selectedTool === "BUMPER_GOLD" ? styles.tabActive : ""}`}
                >
                  [$] Golden Core Node
                </button>
                <button
                  onClick={() => setSelectedTool("GRAVITY_ATTRACT")}
                  className={`${styles.deckNavBtn} ${selectedTool === "GRAVITY_ATTRACT" ? styles.tabActive : ""}`}
                >
                  [+] Gravity Pull Well
                </button>
                <button
                  onClick={() => setSelectedTool("GRAVITY_REPEL")}
                  className={`${styles.deckNavBtn} ${selectedTool === "GRAVITY_REPEL" ? styles.tabActive : ""}`}
                >
                  [-] Repulsion Pulsar
                </button>
                <button
                  onClick={() => setSelectedTool("ERASE")}
                  className={`${styles.deckNavBtn} ${selectedTool === "ERASE" ? styles.tabActive : ""}`}
                  style={{ color: "#FF3366" }}
                >
                  [X] Delete / Eraser Tool
                </button>
              </div>
            </div>

            {/* Level Settings */}
            <div className="glass" style={{ padding: "0.85rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span className={styles.deckSectionTitle}>STAGE CONFIG</span>
              <input
                type="text"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="Sector Name"
                style={{ background: "#0B0F19", border: "1px solid rgba(0,240,255,0.3)", color: "#F8FAFC", padding: "0.45rem", borderRadius: "6px", fontSize: "0.8rem" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#94A3B8" }}>
                <span>Target Score:</span>
                <input
                  type="number"
                  step="1000"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value, 10) || 5000)}
                  style={{ width: "90px", background: "#0B0F19", border: "1px solid rgba(0,240,255,0.3)", color: "#00F0FF", padding: "0.3rem", borderRadius: "4px", textAlign: "right" }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "#CBD5E1", cursor: "pointer" }}>
                <input type="checkbox" checked={hasBoss} onChange={(e) => setHasBoss(e.target.checked)} />
                Spawn Sector Boss Encounter
              </label>
              {hasBoss && (
                <select
                  value={bossType}
                  onChange={(e) => setBossType(e.target.value as BossType)}
                  style={{ background: "#0B0F19", border: "1px solid rgba(0,240,255,0.3)", color: "#F8FAFC", padding: "0.35rem", borderRadius: "4px", fontSize: "0.75rem" }}
                >
                  <option value="VORTEX_TITAN">Vortex Titan (Sector 3)</option>
                  <option value="SOLAR_HYPERION">Solar Hyperion (Sector 4)</option>
                  <option value="AEGIS_DREADNOUGHT">Aegis Dreadnought (Sector 5)</option>
                  <option value="CHRONOS_PRIME">Chronos Prime (Sector 6)</option>
                  <option value="VOID_LEVIATHAN">Void Leviathan (Sector 7)</option>
                </select>
              )}
            </div>

            {/* Community Presets Loader */}
            <div className="glass" style={{ padding: "0.85rem", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span className={styles.deckSectionTitle}>LOAD PRESET TEMPLATE</span>
              {PREBUILT_COMMUNITY_LEVELS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setLevelName(preset.name);
                    setTargetScore(preset.targetScore);
                    setHasBoss(preset.hasBoss);
                    if (preset.bossType) setBossType(preset.bossType);
                    setBumpers(preset.bumpers.map((b) => ({ ...b })));
                    setGravityWells(preset.gravityWells.map((gw) => ({ ...gw })));
                    soundManager.playDraftSelect();
                  }}
                  className={styles.deckNavBtn}
                  style={{ padding: "0.35rem 0.5rem", fontSize: "0.72rem", textAlign: "left" }}
                >
                  [STAGE] {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Interactive Placement Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div
              onClick={handleCanvasClick}
              style={{
                width: "100%",
                height: "440px",
                background: "#040812",
                border: "2px dashed rgba(0,240,255,0.4)",
                borderRadius: "12px",
                position: "relative",
                overflow: "hidden",
                cursor: selectedTool === "ERASE" ? "not-allowed" : "crosshair",
              }}
            >
              {/* Grid Lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "radial-gradient(rgba(0,240,255,0.15) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                  pointerEvents: "none",
                }}
              />

              {/* Placed Gravity Wells */}
              {gravityWells.map((gw) => (
                <div
                  key={gw.id}
                  style={{
                    position: "absolute",
                    left: `${gw.x - gw.radius}px`,
                    top: `${gw.y - gw.radius}px`,
                    width: `${gw.radius * 2}px`,
                    height: `${gw.radius * 2}px`,
                    borderRadius: "50%",
                    border: `1.5px dashed ${gw.color}`,
                    background: `radial-gradient(circle, ${gw.color}33 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Placed Bumpers */}
              {bumpers.map((b) => (
                <div
                  key={b.id}
                  style={{
                    position: "absolute",
                    left: `${b.x - b.radius}px`,
                    top: `${b.y - b.radius}px`,
                    width: `${b.radius * 2}px`,
                    height: `${b.radius * 2}px`,
                    borderRadius: "50%",
                    backgroundColor: b.color,
                    boxShadow: `0 0 12px ${b.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0B0F19",
                    fontWeight: 800,
                    fontSize: "0.65rem",
                    pointerEvents: "none",
                  }}
                >
                  {b.type === "GOLDEN_CORE" ? "$" : b.type === "BOUNCE_SUPER" ? "^" : b.type === "EXPLOSIVE" ? "!" : "*"}
                </div>
              ))}

              <div style={{ position: "absolute", bottom: "10px", left: "10px", fontSize: "0.72rem", color: "#64748B", pointerEvents: "none" }}>
                [+] CLICK TO PLACE {selectedTool} ({bumpers.length} BUMPERS, {gravityWells.length} WELLS)
              </div>
            </div>

            {/* Actions Bar */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() =>
                  handleLaunchLevel({
                    id: `custom_${Date.now()}`,
                    name: levelName,
                    author: "Commander",
                    targetScore,
                    ambientColor: "#080C1A",
                    hasBoss,
                    bossType: hasBoss ? bossType : undefined,
                    bumpers,
                    gravityWells,
                    laserBeams: [],
                  })
                }
                className={styles.btnRestartPrimary}
                style={{ flex: 1 }}
              >
                [PLAYTEST CUSTOM STAGE NOW]
              </button>

              <button onClick={handleExportCode} className={styles.btnSecondaryNav}>
                {copySuccess ? "[CODE COPIED TO CLIPBOARD!]" : "[EXPORT LEVEL CODE]"}
              </button>

              <button
                onClick={() => {
                  setBumpers([]);
                  setGravityWells([]);
                }}
                className={styles.btnSecondaryNav}
                style={{ color: "#FF3366" }}
              >
                [CLEAR ALL]
              </button>
            </div>

            {/* Import & Community Challenges */}
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste Base64 Level Code..."
                style={{ flex: 1, background: "#0B0F19", border: "1px solid rgba(148,163,184,0.3)", color: "#F8FAFC", padding: "0.45rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem" }}
              />
              <button onClick={handleImportCode} className={styles.deckNavBtn} style={{ padding: "0.45rem 0.9rem" }}>
                [LOAD CODE]
              </button>
            </div>
          </div>
        </div>

        <div className={styles.modalFooterRow}>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            [RETURN TO LAUNCHPAD]
          </button>
        </div>
      </div>
    </div>
  );
}
