"use client";

import React, { useState } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import AdSlot from "@/components/layout/AdSlot";
import styles from "./KineticGame.module.css";

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  shardsEarned: number;
  comboCount: number;
  sector: number;
  totalBounces: number;
  onRestart: () => void;
  onRevive: () => void;
  onOpenTech: () => void;
  onOpenHangar: () => void;
  onClaimDoubleShards: () => void;
  canRevive: boolean;
}

export default function GameOverModal({
  score,
  highScore,
  isNewHighScore,
  shardsEarned,
  comboCount,
  sector,
  totalBounces,
  onRestart,
  onRevive,
  onOpenTech,
  onOpenHangar,
  onClaimDoubleShards,
  canRevive,
}: GameOverModalProps) {
  const [doubleClaimed, setDoubleClaimed] = useState<boolean>(false);
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);

  const handleDoubleShards = () => {
    if (doubleClaimed || isWatchingAd) return;
    setIsWatchingAd(true);

    // Simulate rewarded transmission (2 seconds)
    setTimeout(() => {
      setIsWatchingAd(false);
      setDoubleClaimed(true);
      onClaimDoubleShards();
      soundManager.playDraftSelect();
    }, 1800);
  };

  const handleReviveAction = () => {
    if (isWatchingAd) return;
    setIsWatchingAd(true);
    setTimeout(() => {
      setIsWatchingAd(false);
      onRevive();
      soundManager.playOverdriveActivate();
    }, 1800);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.gameOverModalContainer} glass`}>
        <div className={styles.gameOverHeader}>
          <span className={styles.lossBadge}>MISSION DEBRIEF</span>
          <h2 className={styles.lossTitle}>
            {isNewHighScore ? "NEW ORBITAL RECORD ESTABLISHED!" : "CORE TRAJECTORY EXHAUSTED"}
          </h2>
          <p className={styles.lossSubtitle}>
            Telemetry extracted. Quantum Shards safely transferred to your primary vault.
          </p>
        </div>

        {/* Highlight Score Box */}
        <div className={styles.scoreHighlightGrid}>
          <div className={styles.scoreBoxMain}>
            <span className={styles.scoreLabel}>FINAL MISSION SCORE</span>
            <span className={styles.scoreValueMain}>{score.toLocaleString()}</span>
            {isNewHighScore && <span className={styles.newRecordTag}>[NEW ALL-TIME RECORD]</span>}
          </div>
          <div className={styles.scoreBoxSide}>
            <span className={styles.scoreLabel}>ORBITAL HIGH SCORE</span>
            <span className={styles.scoreValueSide}>{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Telemetry Stats Breakdown */}
        <div className={styles.telemetryGrid}>
          <div className={styles.telemetryCard}>
            <span className={styles.telLabel}>SECTOR REACHED</span>
            <span className={styles.telVal}>Sector {sector}</span>
          </div>
          <div className={styles.telemetryCard}>
            <span className={styles.telLabel}>PEAK COMBO</span>
            <span className={styles.telVal}>{comboCount}x Chain</span>
          </div>
          <div className={styles.telemetryCard}>
            <span className={styles.telLabel}>KINETIC BOUNCES</span>
            <span className={styles.telVal}>{totalBounces} Collisions</span>
          </div>
          <div className={styles.telemetryCard}>
            <span className={styles.telLabel}>SHARDS HARVESTED</span>
            <span className={styles.telValHighlight}>
              +{doubleClaimed ? shardsEarned * 2 : shardsEarned} Shards
            </span>
          </div>
        </div>

        {/* Dynamic Run Performance Telemetry Graph */}
        <div className="glass" style={{ padding: "0.85rem", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 800 }}>
            <span style={{ color: "#00F0FF" }}>MISSION VELOCITY & RESONANCE CURVE</span>
            <span style={{ color: "#39FF14" }}>PEAK COMBOS: {comboCount}x</span>
          </div>
          <svg viewBox="0 0 500 70" style={{ width: "100%", height: "70px", overflow: "visible" }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="50%" stopColor="#39FF14" />
                <stop offset="100%" stopColor="#FFE600" />
              </linearGradient>
            </defs>
            {/* Background gridlines */}
            <line x1="0" y1="15" x2="500" y2="15" stroke="rgba(148,163,184,0.15)" strokeDasharray="4 4" />
            <line x1="0" y1="35" x2="500" y2="35" stroke="rgba(148,163,184,0.15)" strokeDasharray="4 4" />
            <line x1="0" y1="55" x2="500" y2="55" stroke="rgba(148,163,184,0.15)" strokeDasharray="4 4" />
            {/* Trajectory smooth Bezier curve */}
            <path
              d="M 0 60 Q 120 45, 200 25 T 350 18 T 500 8"
              fill="none"
              stroke="url(#scoreGrad)"
              strokeWidth="3"
              filter="drop-shadow(0 0 6px rgba(0,240,255,0.6))"
            />
            {/* Apex Points */}
            <circle cx="200" cy="25" r="4" fill="#00F0FF" />
            <circle cx="350" cy="18" r="4" fill="#39FF14" />
            <circle cx="500" cy="8" r="5" fill="#FFE600" />
          </svg>
        </div>

        {/* Rewarded Ad / Multiplier Hook */}
        <div className={styles.rewardHookBox}>
          <div className={styles.rewardHookInfo}>
            <span className={styles.rewardHookBadge}>SPONSORED QUANTUM RELAY</span>
            <h4 className={styles.rewardHookTitle}>2X SHARD EXTRACTION MULTIPLIER</h4>
            <p className={styles.rewardHookDesc}>
              Stream sponsored sponsor telemetry to instantly double your harvested Quantum Shards (+{shardsEarned} extra).
            </p>
          </div>
          <button
            disabled={doubleClaimed || isWatchingAd}
            onClick={handleDoubleShards}
            className={`${styles.rewardClaimBtn} ${doubleClaimed ? styles.btnClaimed : ""}`}
          >
            {isWatchingAd
              ? "[RECEIVING TELEMETRY...]"
              : doubleClaimed
              ? "[2X SHARDS CLAIMED]"
              : `[ACTIVATE 2X BOOST (+${shardsEarned})]`}
          </button>
        </div>

        {canRevive && (
          <div className={styles.reviveOptionBox}>
            <button
              disabled={isWatchingAd}
              onClick={handleReviveAction}
              className={styles.reviveBtn}
            >
              {isWatchingAd ? "[INITIALIZING RECHARGE...]" : "[FREE EMERGENCY REVIVE // +1 LAUNCH]"}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.gameOverActionRow}>
          <button onClick={onRestart} className={styles.btnRestartPrimary}>
            [RE-LAUNCH ORB // NEW RUN]
          </button>
          <button onClick={onOpenTech} className={styles.btnSecondaryNav}>
            [TECH MATRIX]
          </button>
          <button onClick={onOpenHangar} className={styles.btnSecondaryNav}>
            [FLEET HANGAR]
          </button>
        </div>

        {/* Architectural AdSlot inside modal */}
        <div className={styles.modalAdWrapper}>
          <AdSlot type="banner" />
        </div>
      </div>
    </div>
  );
}
