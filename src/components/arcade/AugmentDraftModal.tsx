"use client";

import React from "react";
import { AugmentCard } from "@/lib/gameEngine/types";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface AugmentDraftModalProps {
  cards: AugmentCard[];
  onSelect: (card: AugmentCard) => void;
  level: number;
}

export default function AugmentDraftModal({ cards, onSelect, level }: AugmentDraftModalProps) {
  const handlePick = (card: AugmentCard) => {
    soundManager.playDraftSelect();
    onSelect(card);
  };

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY":
        return styles.rarityLegendary;
      case "EPIC":
        return styles.rarityEpic;
      case "RARE":
        return styles.rarityRare;
      default:
        return styles.rarityCommon;
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.draftModalContainer} glass`}>
        <div className={styles.draftHeader}>
          <span className={styles.draftBadge}>QUANTUM SYNAPSE ACTIVE</span>
          <h2 className={styles.draftTitle}>TACTICAL DRAFT // LEVEL {level}</h2>
          <p className={styles.draftSubtitle}>
            Select 1 kinetic augmentation to augment your vessel core for the current run.
          </p>
        </div>

        <div className={styles.draftCardsGrid}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handlePick(card)}
              className={`${styles.draftCard} ${getRarityBadgeStyle(card.rarity)}`}
            >
              <div className={styles.cardRarityRow}>
                <span className={styles.cardCategory}>{card.category}</span>
                <span className={styles.cardRarityTag}>{card.rarity}</span>
              </div>

              <div className={styles.cardIconBox}>
                <span className={styles.cardIcon}>{card.icon}</span>
              </div>

              <h3 className={styles.cardName}>{card.name}</h3>
              <p className={styles.cardTagline}>{card.tagline}</p>
              <p className={styles.cardDesc}>{card.description}</p>

              <button className={styles.cardSelectBtn}>
                [INSTALL AUGMENT]
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
