"use client";

import React, { useState } from "react";
import { AchievementItem } from "@/lib/gameEngine/types";
import { ProgressionManager } from "@/lib/gameEngine/progression";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface AchievementsModalProps {
  onClose: () => void;
  onRewardClaimed: (amount: number) => void;
}

export default function AchievementsModal({ onClose, onRewardClaimed }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(() =>
    ProgressionManager.getAchievements()
  );

  const handleClaim = (ach: AchievementItem) => {
    if (!ach.unlocked && ach.progress >= ach.target) {
      const updated = achievements.map((a) =>
        a.id === ach.id ? { ...a, unlocked: true } : a
      );
      setAchievements(updated);
      ProgressionManager.saveAchievements(updated);
      onRewardClaimed(ach.rewardShards);
      soundManager.playDraftSelect();
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked || a.progress >= a.target).length;

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.achModalContainer} glass`}>
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>CAREER TELEMETRY</div>
            <h2 className={styles.modalTitle}>ACHIEVEMENT HONORS // RECORD MATRIX</h2>
            <p className={styles.modalSubtitle}>
              Milestone medals awarded for trajectory excellence, high combat scores, and singularity kills.
            </p>
          </div>
          <div className={styles.shardWalletBox}>
            <span className={styles.shardWalletLabel}>COMPLETED:</span>
            <span className={styles.shardWalletValue}>
              {unlockedCount} / {achievements.length} BADGES
            </span>
          </div>
        </div>

        <div className={styles.achievementsGrid}>
          {achievements.map((ach) => {
            const isCompleted = ach.progress >= ach.target;
            const isClaimed = ach.unlocked;

            return (
              <div
                key={ach.id}
                className={`${styles.achCard} ${
                  isClaimed ? styles.achClaimed : isCompleted ? styles.achReady : ""
                }`}
              >
                <div className={styles.achHeaderRow}>
                  <span className={styles.achIcon}>{ach.icon}</span>
                  <div className={styles.achTitleCol}>
                    <h4 className={styles.achName}>{ach.title}</h4>
                    <span className={styles.achDesc}>{ach.description}</span>
                  </div>
                </div>

                <div className={styles.achProgressRow}>
                  <div className={styles.achProgressBarBg}>
                    <div
                      className={styles.achProgressBarFill}
                      style={{
                        width: `${Math.min(100, (ach.progress / ach.target) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className={styles.achProgressText}>
                    {ach.progress} / {ach.target}
                  </span>
                </div>

                <div className={styles.achFooterRow}>
                  <span className={styles.achRewardTag}>
                    Reward: +{ach.rewardShards} Shards
                  </span>
                  {isClaimed ? (
                    <span className={styles.badgeClaimed}>[CLAIMED]</span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(ach)}
                      className={styles.btnClaimReward}
                    >
                      [CLAIM +{ach.rewardShards} SHARDS]
                    </button>
                  ) : (
                    <span className={styles.badgeLocked}>[IN PROGRESS]</span>
                  )}
                </div>
              </div>
            );
          })}
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
