"use client";

import React, { useState, useMemo } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import {
  ProgressionManager,
  SEASON_PASS_TIERS,
  SeasonPassData,
  SeasonPassTier,
} from "@/lib/gameEngine/progression";
import styles from "./KineticGame.module.css";

interface SeasonPassProps {
  onClose: () => void;
  onClaimReward: (shards: number) => void;
}

type FilterMode = "ALL" | "CLAIMABLE" | "UNLOCKED" | "LOCKED";

export default function SeasonPassModal({ onClose, onClaimReward }: SeasonPassProps) {
  const [passData, setPassData] = useState<SeasonPassData>(() =>
    ProgressionManager.getSeasonPassData()
  );
  const [walletShards, setWalletShards] = useState<number>(() =>
    ProgressionManager.getTelemetry().totalQuantumShards
  );
  const [filter, setFilter] = useState<FilterMode>("ALL");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Compute current level based on XP
  const currentTierLevel = useMemo(() => {
    let lvl = 0;
    for (const t of SEASON_PASS_TIERS) {
      if (passData.xp >= t.xpRequired) {
        lvl = t.tier;
      } else {
        break;
      }
    }
    return lvl;
  }, [passData.xp]);

  // Compute next tier XP requirement
  const nextTierConfig = useMemo(() => {
    return SEASON_PASS_TIERS.find((t) => passData.xp < t.xpRequired) || null;
  }, [passData.xp]);

  // Compute total claimable rewards count
  const claimableInfo = useMemo(() => {
    let freeCount = 0;
    let premiumCount = 0;
    let totalShards = 0;

    for (const t of SEASON_PASS_TIERS) {
      if (passData.xp >= t.xpRequired) {
        if (!passData.claimedFreeTiers.includes(t.tier)) {
          freeCount++;
          totalShards += t.freeReward.shards;
        }
        if (passData.isPremium && !passData.claimedPremiumTiers.includes(t.tier)) {
          premiumCount++;
          totalShards += t.premiumReward.shards;
        }
      }
    }

    return {
      freeCount,
      premiumCount,
      totalCount: freeCount + premiumCount,
      totalShards,
    };
  }, [passData]);

  // Filtered tier list
  const displayedTiers = useMemo(() => {
    return SEASON_PASS_TIERS.filter((t) => {
      const isUnlocked = passData.xp >= t.xpRequired;
      const isFreeClaimed = passData.claimedFreeTiers.includes(t.tier);
      const isPremiumClaimed = passData.isPremium && passData.claimedPremiumTiers.includes(t.tier);
      const isFullyClaimed = isFreeClaimed && (!passData.isPremium || isPremiumClaimed);
      const hasUnclaimed = isUnlocked && (!isFreeClaimed || (passData.isPremium && !isPremiumClaimed));

      if (filter === "CLAIMABLE") return hasUnclaimed;
      if (filter === "UNLOCKED") return isUnlocked;
      if (filter === "LOCKED") return !isUnlocked;
      return true;
    });
  }, [filter, passData]);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 3000);
  };

  const handleClaimTier = (t: SeasonPassTier) => {
    const result = ProgressionManager.claimSeasonTier(t.tier);
    if (result.success && result.shardsClaimed > 0) {
      const updated = ProgressionManager.getSeasonPassData();
      setPassData(updated);
      const updatedShards = ProgressionManager.getTelemetry().totalQuantumShards;
      setWalletShards(updatedShards);
      onClaimReward(result.shardsClaimed);
      soundManager.playDraftSelect();
      showFeedback(`[+] Claimed Tier ${t.tier}: +${result.shardsClaimed} Shards!`);
    }
  };

  const handleClaimAll = () => {
    const result = ProgressionManager.claimAllAvailableSeasonTiers();
    if (result.totalShardsClaimed > 0) {
      const updated = ProgressionManager.getSeasonPassData();
      setPassData(updated);
      const updatedShards = ProgressionManager.getTelemetry().totalQuantumShards;
      setWalletShards(updatedShards);
      onClaimReward(result.totalShardsClaimed);
      soundManager.playOverdriveActivate();
      showFeedback(
        `[+] Claimed ${result.claimedTierCount} Tiers: +${result.totalShardsClaimed.toLocaleString()} Quantum Shards!`
      );
    }
  };

  const handleUnlockPremium = () => {
    if (passData.isPremium) return;
    if (walletShards < 500) {
      showFeedback("[!] Insufficient Quantum Shards (Requires 500 Shards)");
      return;
    }

    const res = ProgressionManager.unlockPremiumSeasonPass(500);
    if (res.success) {
      const updated = ProgressionManager.getSeasonPassData();
      setPassData(updated);
      const updatedShards = ProgressionManager.getTelemetry().totalQuantumShards;
      setWalletShards(updatedShards);
      soundManager.playOverdriveActivate();
      showFeedback("[+] Premium Season Pass Activated! All Premium tracks unlocked.");
    } else {
      showFeedback(`[!] ${res.error || "Unlock failed"}`);
    }
  };

  const maxSeasonXp = SEASON_PASS_TIERS[SEASON_PASS_TIERS.length - 1]?.xpRequired || 42500;
  const progressPercent = Math.min(100, (passData.xp / maxSeasonXp) * 100);

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.techModalContainer} glass`}>
        {/* Header */}
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>SEASON 1 // QUANTUM MATRIX LADDER</div>
            <h2 className={styles.modalTitle}>ARCADE PASS & PRESTIGE MATRIX</h2>
            <p className={styles.modalSubtitle}>
              Progress through 30 tactical tiers across Free and Premium tracks. Earn Shards, Vessels, and Cosmetics.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className={styles.shardWalletBox}>
              <span className={styles.shardWalletLabel}>QUANTUM VAULT:</span>
              <span className={styles.shardWalletValue}>[+] {walletShards.toLocaleString()} SHARDS</span>
            </div>
            <button onClick={onClose} className={styles.modalCloseBtn}>[X]</button>
          </div>
        </div>

        {/* Feedback Alert Ribbon */}
        {feedbackMsg && (
          <div
            style={{
              padding: "0.6rem 1rem",
              background: "rgba(0, 240, 255, 0.15)",
              border: "1px solid #00F0FF",
              borderRadius: "8px",
              color: "#00F0FF",
              fontWeight: 800,
              fontSize: "0.85rem",
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            {feedbackMsg}
          </div>
        )}

        {/* Season XP Progress Card */}
        <div
          className="glass"
          style={{
            padding: "1.2rem",
            borderRadius: "14px",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            alignItems: "center",
            gap: "1.2rem",
            border: "1px solid rgba(0, 240, 255, 0.35)",
            background: "rgba(11, 15, 25, 0.85)",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>
                SEASON 1 PROGRESSION // {currentTierLevel === 30 ? "MAX TIER COMPLETED" : `TIER ${currentTierLevel} OF 30`}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#39FF14", fontWeight: 800 }}>
                {passData.xp.toLocaleString()} / {maxSeasonXp.toLocaleString()} XP ({progressPercent.toFixed(1)}%)
              </span>
            </div>

            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#00F0FF", marginTop: "0.2rem" }}>
              {nextTierConfig
                ? `Next Tier ${nextTierConfig.tier}: ${(nextTierConfig.xpRequired - passData.xp).toLocaleString()} XP remaining`
                : "ALL 30 TIERS UNLOCKED"}
            </div>

            <div
              style={{
                width: "100%",
                height: "10px",
                background: "rgba(15, 23, 42, 0.9)",
                borderRadius: "5px",
                marginTop: "0.6rem",
                overflow: "hidden",
                border: "1px solid rgba(0, 240, 255, 0.2)",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #00F0FF, #39FF14, #FFE600)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>

          {/* Claim All Button */}
          <div>
            {claimableInfo.totalCount > 0 ? (
              <button
                onClick={handleClaimAll}
                className={styles.overdriveBtn}
                style={{
                  padding: "0.75rem 1.25rem",
                  margin: 0,
                  background: "linear-gradient(135deg, rgba(57, 255, 20, 0.25), rgba(0, 240, 255, 0.2))",
                  borderColor: "#39FF14",
                  color: "#39FF14",
                }}
              >
                [CLAIM ALL ({claimableInfo.totalCount}) // +{claimableInfo.totalShards} SHARDS]
              </button>
            ) : (
              <div
                style={{
                  padding: "0.6rem 1rem",
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: "8px",
                  color: "#64748B",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                [NO PENDING CLAIMS]
              </div>
            )}
          </div>

          {/* Premium Status / Unlock Box */}
          <div>
            {!passData.isPremium ? (
              <button
                onClick={handleUnlockPremium}
                className={styles.overdriveBtn}
                style={{
                  padding: "0.75rem 1.25rem",
                  margin: 0,
                  background: "linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 85, 0, 0.2))",
                  borderColor: "#FFD700",
                  color: "#FFD700",
                }}
              >
                [UNLOCK PREMIUM PASS (500 SHARDS)]
              </button>
            ) : (
              <span
                style={{
                  padding: "0.6rem 1.1rem",
                  background: "rgba(255, 215, 0, 0.15)",
                  border: "1px solid #FFD700",
                  borderRadius: "8px",
                  color: "#FFD700",
                  fontWeight: 800,
                  fontSize: "0.82rem",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                [PREMIUM PASS ACTIVE]
              </span>
            )}
          </div>
        </div>

        {/* Filter Tab Bar */}
        <div style={{ display: "flex", gap: "0.6rem", margin: "1rem 0 0.5rem 0", flexWrap: "wrap" }}>
          <button
            onClick={() => setFilter("ALL")}
            className={`${styles.hangarTabBtn} ${filter === "ALL" ? styles.tabActive : ""}`}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
          >
            [ALL TIERS (30)]
          </button>
          <button
            onClick={() => setFilter("CLAIMABLE")}
            className={`${styles.hangarTabBtn} ${filter === "CLAIMABLE" ? styles.tabActive : ""}`}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
          >
            [CLAIMABLE ({claimableInfo.totalCount})]
          </button>
          <button
            onClick={() => setFilter("UNLOCKED")}
            className={`${styles.hangarTabBtn} ${filter === "UNLOCKED" ? styles.tabActive : ""}`}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
          >
            [UNLOCKED ({currentTierLevel})]
          </button>
          <button
            onClick={() => setFilter("LOCKED")}
            className={`${styles.hangarTabBtn} ${filter === "LOCKED" ? styles.tabActive : ""}`}
            style={{ padding: "0.4rem 0.9rem", fontSize: "0.78rem" }}
          >
            [LOCKED ({30 - currentTierLevel})]
          </button>
        </div>

        {/* 30-Tier Ladder Scroll Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.65rem",
            maxHeight: "440px",
            overflowY: "auto",
            paddingRight: "0.5rem",
          }}
        >
          {displayedTiers.map((t) => {
            const isUnlocked = passData.xp >= t.xpRequired;
            const isFreeClaimed = passData.claimedFreeTiers.includes(t.tier);
            const isPremiumClaimed = passData.isPremium && passData.claimedPremiumTiers.includes(t.tier);
            const isFullyClaimed = isFreeClaimed && (!passData.isPremium || isPremiumClaimed);
            const canClaim = isUnlocked && (!isFreeClaimed || (passData.isPremium && !isPremiumClaimed));

            return (
              <div
                key={t.tier}
                className="glass"
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 1fr 140px",
                  alignItems: "center",
                  padding: "0.85rem 1.1rem",
                  borderRadius: "10px",
                  gap: "0.85rem",
                  border: isUnlocked
                    ? isFullyClaimed
                      ? "1px solid rgba(148, 163, 184, 0.25)"
                      : "1px solid rgba(0, 240, 255, 0.45)"
                    : "1px solid rgba(148, 163, 184, 0.1)",
                  background: isUnlocked
                    ? isFullyClaimed
                      ? "rgba(15, 23, 42, 0.4)"
                      : "rgba(15, 23, 42, 0.85)"
                    : "rgba(11, 15, 25, 0.5)",
                  opacity: isUnlocked ? 1 : 0.65,
                  transition: "all 0.2s ease",
                }}
              >
                {/* Tier Number & XP */}
                <div>
                  <span style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 700 }}>TIER</span>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 900,
                      color: isUnlocked ? "#00F0FF" : "#64748B",
                    }}
                  >
                    {t.tier.toString().padStart(2, "0")}
                  </div>
                  <span style={{ fontSize: "0.68rem", color: isUnlocked ? "#39FF14" : "#64748B" }}>
                    {t.xpRequired.toLocaleString()} XP
                  </span>
                </div>

                {/* Free Track Card */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(0, 240, 255, 0.05)",
                    border: "1px solid rgba(0, 240, 255, 0.18)",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.65rem", color: "#00F0FF", fontWeight: 800 }}>[FREE TRACK]</span>
                    <span style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 700 }}>{t.freeReward.icon}</span>
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "#F8FAFC", fontWeight: 800, marginTop: "0.2rem" }}>
                    {t.freeReward.title}
                  </span>
                  <span style={{ fontSize: "0.68rem", color: isFreeClaimed ? "#64748B" : "#39FF14", fontWeight: 700 }}>
                    {isFreeClaimed ? "[CLAIMED]" : `+${t.freeReward.shards} Shards`}
                  </span>
                </div>

                {/* Premium Track Card */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0.5rem 0.75rem",
                    background: passData.isPremium
                      ? "rgba(255, 215, 0, 0.08)"
                      : "rgba(15, 23, 42, 0.5)",
                    border: passData.isPremium
                      ? "1px solid rgba(255, 215, 0, 0.3)"
                      : "1px dashed rgba(148, 163, 184, 0.2)",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.65rem", color: "#FFE600", fontWeight: 800 }}>[PREMIUM TRACK]</span>
                    <span style={{ fontSize: "0.65rem", color: "#FFE600", fontWeight: 700 }}>{t.premiumReward.icon}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: passData.isPremium ? "#F8FAFC" : "#64748B",
                      fontWeight: 800,
                      marginTop: "0.2rem",
                    }}
                  >
                    {t.premiumReward.title}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: isPremiumClaimed
                        ? "#64748B"
                        : passData.isPremium
                        ? "#FFE600"
                        : "#64748B",
                      fontWeight: 700,
                    }}
                  >
                    {isPremiumClaimed
                      ? "[CLAIMED]"
                      : passData.isPremium
                      ? `+${t.premiumReward.shards} Shards`
                      : "[LOCKED - PREMIUM]"}
                  </span>
                </div>

                {/* Action / Status Button */}
                <div style={{ textAlign: "right" }}>
                  {isFullyClaimed ? (
                    <span
                      style={{
                        padding: "0.45rem 0.8rem",
                        background: "rgba(148, 163, 184, 0.1)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "6px",
                        color: "#64748B",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "inline-block",
                      }}
                    >
                      [CLAIMED]
                    </span>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaimTier(t)}
                      className={styles.deckNavBtn}
                      style={{
                        padding: "0.55rem 0.9rem",
                        fontSize: "0.78rem",
                        color: "#39FF14",
                        borderColor: "#39FF14",
                        background: "rgba(57, 255, 20, 0.12)",
                        width: "100%",
                      }}
                    >
                      [CLAIM REWARD]
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#64748B",
                        fontWeight: 700,
                      }}
                    >
                      [LOCKED -- {(t.xpRequired - passData.xp).toLocaleString()} XP]
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.modalFooterRow} style={{ marginTop: "1rem" }}>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            [RETURN TO LAUNCHPAD]
          </button>
        </div>
      </div>
    </div>
  );
}
