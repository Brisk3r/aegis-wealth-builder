"use client";

import React, { useState } from "react";
import { ProgressionManager } from "@/lib/gameEngine/progression";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface SupplyDropModalProps {
  onClose: () => void;
  onRewardClaimed: (rewardAmount: number) => void;
}

export default function SupplyDropModal({ onClose, onRewardClaimed }: SupplyDropModalProps) {
  const [canClaim, setCanClaim] = useState<boolean>(() =>
    ProgressionManager.canClaimDailySupplyDrop()
  );
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wonReward, setWonReward] = useState<number | null>(null);

  const handleOpenCrate = () => {
    if (!canClaim || isSpinning) return;
    setIsSpinning(true);
    soundManager.playOverdriveActivate();

    const possibleRewards = [
      { amount: 250, weight: 50 },
      { amount: 500, weight: 30 },
      { amount: 1000, weight: 14 },
      { amount: 2500, weight: 6 },
    ];

    setTimeout(() => {
      const totalWeight = possibleRewards.reduce((acc, r) => acc + r.weight, 0);
      let rand = Math.random() * totalWeight;
      let chosen = possibleRewards[0].amount;

      for (const r of possibleRewards) {
        if (rand < r.weight) {
          chosen = r.amount;
          break;
        }
        rand -= r.weight;
      }

      setWonReward(chosen);
      setIsSpinning(false);
      setCanClaim(false);
      ProgressionManager.recordSupplyDropClaim();
      onRewardClaimed(chosen);
      soundManager.playDraftSelect();
    }, 2200);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.supplyModalContainer} glass`}>
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>DAILY QUANTUM RE-SUPPLY</div>
            <h2 className={styles.modalTitle}>SUPPLY CRATE // CARGO DECK</h2>
            <p className={styles.modalSubtitle}>
              Decrypt daily encrypted supply pods to extract raw Quantum Shards for tech upgrades.
            </p>
          </div>
        </div>

        <div className={styles.supplyCrateDisplay}>
          <div
            className={`${styles.crateIconBox} ${
              isSpinning ? styles.crateSpinning : wonReward ? styles.crateOpened : ""
            }`}
          >
            <span className={styles.crateEmoji}>
              {wonReward ? "[OPENED]" : isSpinning ? "[DECRYPTING]" : "[CRATE]"}
            </span>
          </div>

          {wonReward ? (
            <div className={styles.rewardAnnouncement}>
              <span className={styles.rewardWonBadge}>CARGO DECRYPTED SUCCESSFULLY!</span>
              <h3 className={styles.rewardWonTitle}>+{wonReward.toLocaleString()} QUANTUM SHARDS</h3>
              <p className={styles.rewardWonSub}>Shards deposited directly into your primary vault.</p>
            </div>
          ) : (
            <div className={styles.rewardOddsList}>
              <div className={styles.oddItem}><span>250 Shards</span><span className={styles.oddPct}>50.0% Odds</span></div>
              <div className={styles.oddItem}><span>500 Shards</span><span className={styles.oddPct}>30.0% Odds</span></div>
              <div className={styles.oddItem}><span>1,000 Shards</span><span className={styles.oddPct}>14.0% Odds</span></div>
              <div className={styles.oddItem}><span>2,500 Shards</span><span className={styles.oddPct}>6.0% Odds</span></div>
            </div>
          )}
        </div>

        <div className={styles.modalFooterRow}>
          {!wonReward ? (
            <button
              disabled={!canClaim || isSpinning}
              onClick={handleOpenCrate}
              className={`${styles.btnRestartPrimary} ${
                !canClaim ? styles.btnLocked : ""
              }`}
            >
              {isSpinning
                ? "[DECRYPTING ORBITAL CRATE...]"
                : canClaim
                ? "[OPEN DAILY SUPPLY CRATE]"
                : "[DAILY DROP CLAIMED // COOLDOWN ACTIVE]"}
            </button>
          ) : (
            <button onClick={onClose} className={styles.modalCloseBtn}>
              [CLAIM & RETURN TO LAUNCHPAD]
            </button>
          )}

          {!wonReward && (
            <button onClick={onClose} className={styles.btnSecondaryNav}>
              [BACK]
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
