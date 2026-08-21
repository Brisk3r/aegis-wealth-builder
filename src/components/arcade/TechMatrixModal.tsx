"use client";

import React, { useState } from "react";
import { TechUpgrade } from "@/lib/gameEngine/types";
import { ProgressionManager } from "@/lib/gameEngine/progression";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface TechMatrixModalProps {
  totalShards: number;
  onClose: () => void;
  onUpdateShards: (newTotal: number) => void;
}

export default function TechMatrixModal({
  totalShards,
  onClose,
  onUpdateShards,
}: TechMatrixModalProps) {
  const [upgrades, setUpgrades] = useState<TechUpgrade[]>(() =>
    ProgressionManager.getTechUpgrades()
  );
  const [shards, setShards] = useState<number>(totalShards);

  const handleUpgrade = (item: TechUpgrade) => {
    if (item.level >= item.maxLevel) return;
    const cost = item.costPerLevel * (item.level + 1);
    if (shards < cost) return;

    const updatedShards = shards - cost;
    setShards(updatedShards);
    onUpdateShards(updatedShards);

    const updatedUpgrades = upgrades.map((u) =>
      u.id === item.id ? { ...u, level: u.level + 1 } : u
    );
    setUpgrades(updatedUpgrades);
    ProgressionManager.saveTechUpgrades(updatedUpgrades);

    soundManager.playDraftSelect();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.techModalContainer} glass`}>
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>PERMANENT TECH MATRIX</div>
            <h2 className={styles.modalTitle}>ORBITAL FORGE // CORE UPGRADES</h2>
            <p className={styles.modalSubtitle}>
              Spend Quantum Shards to permanently elevate physical parameters across all vessels.
            </p>
          </div>
          <div className={styles.shardWalletBox}>
            <span className={styles.shardWalletLabel}>QUANTUM VAULT:</span>
            <span className={styles.shardWalletValue}>[+] {shards.toLocaleString()} SHARDS</span>
          </div>
        </div>

        <div className={styles.techGrid}>
          {upgrades.map((item) => {
            const isMaxed = item.level >= item.maxLevel;
            const cost = item.costPerLevel * (item.level + 1);
            const canAfford = shards >= cost && !isMaxed;
            const currentBonus = item.level * item.valuePerLevel;
            const nextBonus = (item.level + 1) * item.valuePerLevel;

            return (
              <div key={item.id} className={styles.techCard}>
                <div className={styles.techCardHeader}>
                  <span className={styles.techIcon}>{item.icon}</span>
                  <div className={styles.techTitleCol}>
                    <h4 className={styles.techName}>{item.name}</h4>
                    <span className={styles.techLevelTag}>
                      LVL {item.level} / {item.maxLevel}
                    </span>
                  </div>
                </div>

                <p className={styles.techDescription}>{item.description}</p>

                <div className={styles.techStatsRow}>
                  <span className={styles.statCurrent}>
                    Current: +{currentBonus}{item.unit}
                  </span>
                  {!isMaxed && (
                    <span className={styles.statNext}>
                      [+] Next: +{nextBonus}{item.unit}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className={styles.techProgressBarBg}>
                  <div
                    className={styles.techProgressBarFill}
                    style={{ width: `${(item.level / item.maxLevel) * 100}%` }}
                  />
                </div>

                <button
                  disabled={!canAfford || isMaxed}
                  onClick={() => handleUpgrade(item)}
                  className={`${styles.techUpgradeBtn} ${
                    isMaxed
                      ? styles.btnMaxed
                      : canAfford
                      ? styles.btnAfford
                      : styles.btnLocked
                  }`}
                >
                  {isMaxed
                    ? "[MAX LEVEL REACHED]"
                    : canAfford
                    ? `[UPGRADE - ${cost} SHARDS]`
                    : `[LOCKED - ${cost} SHARDS]`}
                </button>
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
