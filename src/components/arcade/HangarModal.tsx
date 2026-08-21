"use client";

import React, { useState } from "react";
import { HullVessel } from "@/lib/gameEngine/types";
import { COSMETIC_TRAILS, ProgressionManager } from "@/lib/gameEngine/progression";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface HangarModalProps {
  totalShards: number;
  onClose: () => void;
  onSelectVessel: (vesselId: string) => void;
  onSelectTrail: (trailId: string) => void;
  onUpdateShards: (newTotal: number) => void;
}

export default function HangarModal({
  totalShards,
  onClose,
  onSelectVessel,
  onSelectTrail,
  onUpdateShards,
}: HangarModalProps) {
  const [vessels, setVessels] = useState<HullVessel[]>(() => ProgressionManager.getVessels());
  const [activeVesselId, setActiveVesselId] = useState<string>(() => ProgressionManager.getActiveVesselId());
  const [activeTrailId, setActiveTrailId] = useState<string>(() => ProgressionManager.getActiveTrailId());
  const [shards, setShards] = useState<number>(totalShards);
  const [activeTab, setActiveTab] = useState<"VESSELS" | "TRAILS">("VESSELS");

  const handleUnlockVessel = (vessel: HullVessel) => {
    if (vessel.unlocked || shards < vessel.cost) return;

    const newShards = shards - vessel.cost;
    setShards(newShards);
    onUpdateShards(newShards);

    const updated = vessels.map((v) =>
      v.id === vessel.id ? { ...v, unlocked: true } : v
    );
    setVessels(updated);
    ProgressionManager.saveVessels(updated);

    // Auto-equip
    setActiveVesselId(vessel.id);
    ProgressionManager.setActiveVesselId(vessel.id);
    onSelectVessel(vessel.id);

    soundManager.playDraftSelect();
  };

  const handleEquipVessel = (id: string) => {
    setActiveVesselId(id);
    ProgressionManager.setActiveVesselId(id);
    onSelectVessel(id);
    soundManager.playDraftSelect();
  };

  const handleEquipTrail = (id: string) => {
    setActiveTrailId(id);
    ProgressionManager.setActiveTrailId(id);
    onSelectTrail(id);
    soundManager.playDraftSelect();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.hangarModalContainer} glass`}>
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>HANGAR & CHASSIS DOCK</div>
            <h2 className={styles.modalTitle}>VESSEL MATRIX // FLEET CUSTOMIZER</h2>
            <p className={styles.modalSubtitle}>
              Deploy specialized hulls engineered with unique kinetic mass, bounce multipliers, and signature overcharge protocols.
            </p>
          </div>
          <div className={styles.shardWalletBox}>
            <span className={styles.shardWalletLabel}>QUANTUM VAULT:</span>
            <span className={styles.shardWalletValue}>[+] {shards.toLocaleString()} SHARDS</span>
          </div>
        </div>

        {/* Tab switch */}
        <div className={styles.hangarTabRow}>
          <button
            onClick={() => setActiveTab("VESSELS")}
            className={`${styles.hangarTabBtn} ${activeTab === "VESSELS" ? styles.tabActive : ""}`}
          >
            [HULL CHASSIS FLEET]
          </button>
          <button
            onClick={() => setActiveTab("TRAILS")}
            className={`${styles.hangarTabBtn} ${activeTab === "TRAILS" ? styles.tabActive : ""}`}
          >
            [ION PARTICLE TRAILS]
          </button>
        </div>

        {activeTab === "VESSELS" && (
          <div className={styles.vesselsGrid}>
            {vessels.map((vessel) => {
              const isEquipped = activeVesselId === vessel.id;
              const canAfford = shards >= vessel.cost;

              return (
                <div
                  key={vessel.id}
                  className={`${styles.vesselCard} ${isEquipped ? styles.vesselEquipped : ""}`}
                >
                  <div className={styles.vesselHeader}>
                    <div
                      className={styles.vesselOrbPreview}
                      style={{
                        backgroundColor: vessel.color,
                        boxShadow: `0 0 15px ${vessel.color}`,
                      }}
                    />
                    <div>
                      <h3 className={styles.vesselName}>{vessel.name}</h3>
                      <span className={styles.vesselTitle}>{vessel.title}</span>
                    </div>
                  </div>

                  <p className={styles.vesselDesc}>{vessel.description}</p>

                  <div className={styles.vesselTraitBadge}>
                    <span>TRAIT: {vessel.specialTrait}</span>
                  </div>

                  <div className={styles.vesselStatsList}>
                    <div className={styles.statLine}>
                      <span>Velocity Factor</span>
                      <span className={styles.statVal}>{(vessel.speedMultiplier * 100).toFixed(0)}%</span>
                    </div>
                    <div className={styles.statLine}>
                      <span>Kinetic Mass</span>
                      <span className={styles.statVal}>{vessel.mass.toFixed(1)}x</span>
                    </div>
                    <div className={styles.statLine}>
                      <span>Bounce Restitution</span>
                      <span className={styles.statVal}>{(vessel.bounceMultiplier * 100).toFixed(0)}%</span>
                    </div>
                    <div className={styles.statLine}>
                      <span>Base Shields</span>
                      <span className={styles.statVal}>{vessel.shieldSlots} Units</span>
                    </div>
                  </div>

                  {vessel.unlocked ? (
                    <button
                      onClick={() => handleEquipVessel(vessel.id)}
                      className={`${styles.vesselActionBtn} ${
                        isEquipped ? styles.btnEquipped : styles.btnEquip
                      }`}
                    >
                      {isEquipped ? "[ACTIVE VESSEL]" : "[DEPLOY VESSEL]"}
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => handleUnlockVessel(vessel)}
                      className={`${styles.vesselActionBtn} ${
                        canAfford ? styles.btnUnlock : styles.btnLocked
                      }`}
                    >
                      {canAfford
                        ? `[UNLOCK - ${vessel.cost} SHARDS]`
                        : `[LOCKED - ${vessel.cost} SHARDS]`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "TRAILS" && (
          <div className={styles.trailsGrid}>
            {COSMETIC_TRAILS.map((trail) => {
              const isEquipped = activeTrailId === trail.id;

              return (
                <div
                  key={trail.id}
                  onClick={() => handleEquipTrail(trail.id)}
                  className={`${styles.trailCard} ${isEquipped ? styles.trailEquipped : ""}`}
                >
                  <div
                    className={styles.trailColorSample}
                    style={{
                      backgroundColor: trail.color,
                      boxShadow: `0 0 16px ${trail.color}`,
                    }}
                  />
                  <div className={styles.trailInfoCol}>
                    <h4 className={styles.trailName}>{trail.name}</h4>
                    <span className={styles.trailStatus}>
                      {isEquipped ? "[ACTIVE TRAIL]" : "[CLICK TO EQUIP]"}
                    </span>
                  </div>
                </div>
              );
            })}
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
