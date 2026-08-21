"use client";

import React, { useState } from "react";
import { DAILY_QUESTS, SIMULATED_GLOBAL_LEADERBOARD } from "@/lib/gameEngine/gameModes";
import { ProgressionManager } from "@/lib/gameEngine/progression";
import { soundManager } from "@/lib/gameEngine/audio";
import { QuestItem } from "@/lib/gameEngine/types";
import styles from "./KineticGame.module.css";

interface LeaderboardAndQuestsModalProps {
  onClose: () => void;
  onRewardClaimed: (amount: number) => void;
}

export default function LeaderboardAndQuestsModal({
  onClose,
  onRewardClaimed,
}: LeaderboardAndQuestsModalProps) {
  const [activeTab, setActiveTab] = useState<"QUESTS" | "LEADERBOARD" | "CAREER">("QUESTS");
  const [quests, setQuests] = useState<QuestItem[]>(DAILY_QUESTS);
  const telemetry = ProgressionManager.getTelemetry();

  const handleClaimQuest = (quest: QuestItem) => {
    if (quest.claimed) return;
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, claimed: true } : q))
    );
    onRewardClaimed(quest.rewardShards);
    soundManager.playDraftSelect();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.techModalContainer} glass`}>
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>GLOBAL TELEMETRY & OPERATIONS</div>
            <h2 className={styles.modalTitle}>COMMAND RADAR // DAILY MISSIONS & RANKS</h2>
            <p className={styles.modalSubtitle}>
              Execute daily priority directives, track career battle records, and compare sector depths against global ace pilots.
            </p>
          </div>
          <div className={styles.shardWalletBox}>
            <span className={styles.shardWalletLabel}>QUANTUM VAULT:</span>
            <span className={styles.shardWalletValue}>
              [+] {telemetry.totalQuantumShards.toLocaleString()} SHARDS
            </span>
          </div>
        </div>

        {/* Tab switch */}
        <div className={styles.hangarTabRow}>
          <button
            onClick={() => setActiveTab("QUESTS")}
            className={`${styles.hangarTabBtn} ${activeTab === "QUESTS" ? styles.tabActive : ""}`}
          >
            [DAILY OPERATIONS]
          </button>
          <button
            onClick={() => setActiveTab("LEADERBOARD")}
            className={`${styles.hangarTabBtn} ${activeTab === "LEADERBOARD" ? styles.tabActive : ""}`}
          >
            [GLOBAL LEADERBOARD]
          </button>
          <button
            onClick={() => setActiveTab("CAREER")}
            className={`${styles.hangarTabBtn} ${activeTab === "CAREER" ? styles.tabActive : ""}`}
          >
            [PILOT CAREER LOG]
          </button>
        </div>

        {activeTab === "QUESTS" && (
          <div className={styles.achievementsGrid}>
            {quests.map((q) => {
              const isReady = q.progress >= q.target || q.completed;

              return (
                <div
                  key={q.id}
                  className={`${styles.achCard} ${
                    q.claimed ? styles.achClaimed : isReady ? styles.achReady : ""
                  }`}
                >
                  <div className={styles.achHeaderRow}>
                    <span className={styles.achIcon}>[QUEST]</span>
                    <div className={styles.achTitleCol}>
                      <h4 className={styles.achName}>{q.title}</h4>
                      <span className={styles.achDesc}>{q.description}</span>
                    </div>
                  </div>

                  <div className={styles.achProgressRow}>
                    <div className={styles.achProgressBarBg}>
                      <div
                        className={styles.achProgressBarFill}
                        style={{
                          width: `${Math.min(100, (q.progress / q.target) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className={styles.achProgressText}>
                      {q.progress} / {q.target}
                    </span>
                  </div>

                  <div className={styles.achFooterRow}>
                    <span className={styles.achRewardTag}>
                      Bounty: +{q.rewardShards} Shards
                    </span>
                    {q.claimed ? (
                      <span className={styles.badgeClaimed}>[CLAIMED]</span>
                    ) : isReady ? (
                      <button
                        onClick={() => handleClaimQuest(q)}
                        className={styles.btnClaimReward}
                      >
                        [CLAIM BOUNTY]
                      </button>
                    ) : (
                      <span className={styles.badgeLocked}>
                        [EXPIRES IN {q.expiresInHours}H]
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "LEADERBOARD" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "50px 1fr 110px 90px 100px",
                padding: "0.65rem 1rem",
                background: "rgba(15,23,42,0.9)",
                borderRadius: "8px",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#94A3B8",
                textTransform: "uppercase",
              }}
            >
              <span>Rank</span>
              <span>Pilot Handle</span>
              <span style={{ textAlign: "right" }}>Score</span>
              <span style={{ textAlign: "center" }}>Sector</span>
              <span style={{ textAlign: "right" }}>Vessel</span>
            </div>

            {SIMULATED_GLOBAL_LEADERBOARD.map((entry) => (
              <div
                key={entry.rank}
                style={{
                  display: "grid",
                  gridTemplateColumns: "50px 1fr 110px 90px 100px",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  background: entry.rank === 1 ? "rgba(255,215,0,0.1)" : "rgba(30,41,59,0.5)",
                  border: entry.rank === 1 ? "1px solid rgba(255,215,0,0.4)" : "1px solid rgba(148,163,184,0.15)",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                }}
              >
                <span style={{ fontWeight: 900, color: entry.rank === 1 ? "#FFD700" : entry.rank === 2 ? "#C0C0C0" : entry.rank === 3 ? "#CD7F32" : "#F8FAFC" }}>
                  #{entry.rank}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "#F8FAFC", fontWeight: 700 }}>{entry.pilotHandle}</span>
                  <span style={{ fontSize: "0.68rem", color: "#64748B" }}>[{entry.region}]</span>
                </div>
                <span style={{ textAlign: "right", color: "#00F0FF", fontWeight: 800, fontFamily: "monospace" }}>
                  {entry.score.toLocaleString()}
                </span>
                <span style={{ textAlign: "center", color: "#39FF14", fontWeight: 700 }}>
                  Sec {entry.sector}
                </span>
                <span style={{ textAlign: "right", color: "#CBD5E1", fontSize: "0.75rem" }}>
                  {entry.vesselUsed}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "CAREER" && (
          <div className={styles.telemetryGrid} style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className={styles.telemetryCard} style={{ padding: "1.25rem" }}>
              <span className={styles.telLabel}>LIFETIME ORBITAL HIGH SCORE</span>
              <span className={styles.telValHighlight} style={{ fontSize: "1.4rem" }}>
                {telemetry.highScore.toLocaleString()} PTS
              </span>
            </div>
            <div className={styles.telemetryCard} style={{ padding: "1.25rem" }}>
              <span className={styles.telLabel}>MAX SECTOR PENETRATION</span>
              <span className={styles.telVal} style={{ fontSize: "1.4rem" }}>
                Sector {telemetry.maxSectorReached}
              </span>
            </div>
            <div className={styles.telemetryCard} style={{ padding: "1.25rem" }}>
              <span className={styles.telLabel}>LIFETIME QUANTUM SHARDS</span>
              <span className={styles.telValHighlight} style={{ fontSize: "1.4rem" }}>
                {telemetry.totalQuantumShards.toLocaleString()}
              </span>
            </div>
            <div className={styles.telemetryCard} style={{ padding: "1.25rem" }}>
              <span className={styles.telLabel}>TOTAL KINETIC BOUNCES</span>
              <span className={styles.telVal} style={{ fontSize: "1.4rem" }}>
                {telemetry.totalBounces.toLocaleString()} Hits
              </span>
            </div>
            <div className={styles.telemetryCard} style={{ padding: "1.25rem" }}>
              <span className={styles.telLabel}>TITAN BOSSES ELIMINATED</span>
              <span className={styles.telVal} style={{ fontSize: "1.4rem" }}>
                {telemetry.bossesDefeated} Slain
              </span>
            </div>
            <div className={styles.telemetryCard} style={{ padding: "1.25rem" }}>
              <span className={styles.telLabel}>TOTAL MISSIONS LAUNCHED</span>
              <span className={styles.telVal} style={{ fontSize: "1.4rem" }}>
                {telemetry.runsCompleted} Runs
              </span>
            </div>
          </div>
        )}

        <div className={styles.modalFooterRow}>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            [RETURN TO LAUNCHPAD]
          </button>
        </div>
      </div>
    </div>
  );
}
