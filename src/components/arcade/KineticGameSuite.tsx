"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AugmentCard,
  CustomLevelData,
  GameMode,
  GameStatus,
  GameTelemetry,
  HullVessel,
  TacticalAbility,
  TechUpgrade,
} from "@/lib/gameEngine/types";
import { getRandomAugmentDraft } from "@/lib/gameEngine/augments";
import {
  COSMETIC_TRAILS,
  INITIAL_VESSELS,
  ProgressionManager,
} from "@/lib/gameEngine/progression";
import {
  GAME_MODES,
  INITIAL_TACTICAL_ABILITIES,
} from "@/lib/gameEngine/gameModes";
import { soundManager } from "@/lib/gameEngine/audio";
import KineticCanvas from "./KineticCanvas";
import AugmentDraftModal from "./AugmentDraftModal";
import TechMatrixModal from "./TechMatrixModal";
import HangarModal from "./HangarModal";
import GameOverModal from "./GameOverModal";
import SupplyDropModal from "./SupplyDropModal";
import AchievementsModal from "./AchievementsModal";
import PauseMenuModal from "./PauseMenuModal";
import LevelEditorModal from "./LevelEditorModal";
import LeaderboardAndQuestsModal from "./LeaderboardAndQuestsModal";
import SeasonPassModal from "./SeasonPassModal";
import BenchmarkModal from "./BenchmarkModal";
import StepSequencerModal from "./StepSequencerModal";
import AdSlot from "@/components/layout/AdSlot";
import styles from "./KineticGame.module.css";

export default function KineticGameSuite() {
  const [status, setStatus] = useState<GameStatus>("IDLE");
  const [currentMode, setCurrentMode] = useState<GameMode>("CAMPAIGN");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [sector, setSector] = useState<number>(1);
  const [launchesLeft, setLaunchesLeft] = useState<number>(5);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalBounces, setTotalBounces] = useState<number>(0);
  const [shardsRun, setShardsRun] = useState<number>(0);
  const [totalShards, setTotalShards] = useState<number>(250);
  const [overdriveCharge, setOverdriveCharge] = useState<number>(0);
  const [draftLevel, setDraftLevel] = useState<number>(1);

  // Time Attack Mode timer
  const [timeRemaining, setTimeRemaining] = useState<number>(60);

  // Tactical Abilities
  const [abilities, setAbilities] = useState<TacticalAbility[]>(INITIAL_TACTICAL_ABILITIES);
  const [empFreezeActive, setEmpFreezeActive] = useState<boolean>(false);
  const [microSingularityTrigger, setMicroSingularityTrigger] = useState<number>(0);
  const [triCloneTrigger, setTriCloneTrigger] = useState<number>(0);

  // Custom Level Sandbox Data
  const [customLevel, setCustomLevel] = useState<CustomLevelData | null>(null);

  // Modals
  const [showDraft, setShowDraft] = useState<boolean>(false);
  const [draftCards, setDraftCards] = useState<AugmentCard[]>([]);
  const [showTechMatrix, setShowTechMatrix] = useState<boolean>(false);
  const [showHangar, setShowHangar] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showSupplyDrop, setShowSupplyDrop] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [showPause, setShowPause] = useState<boolean>(false);
  const [showLevelEditor, setShowLevelEditor] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showSeasonPass, setShowSeasonPass] = useState<boolean>(false);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(false);
  const [showStepSequencer, setShowStepSequencer] = useState<boolean>(false);

  // Active progression state
  const [techUpgrades, setTechUpgrades] = useState<TechUpgrade[]>(() =>
    ProgressionManager.getTechUpgrades()
  );
  const [activeVessel, setActiveVessel] = useState<HullVessel>(() => {
    const vessels = ProgressionManager.getVessels();
    const activeId = ProgressionManager.getActiveVesselId();
    return vessels.find((v) => v.id === activeId) || INITIAL_VESSELS[0];
  });
  const [activeTrailColor, setActiveTrailColor] = useState<string>(() => {
    const trailId = ProgressionManager.getActiveTrailId();
    const trail = COSMETIC_TRAILS.find((t) => t.id === trailId);
    return trail ? trail.color : "#00F0FF";
  });
  const [equippedAugments, setEquippedAugments] = useState<AugmentCard[]>([]);

  // Load initial telemetry from storage
  useEffect(() => {
    const telemetry = ProgressionManager.getTelemetry();
    setHighScore(telemetry.highScore || 0);
    setTotalShards(telemetry.totalQuantumShards || 250);
  }, []);

  // Time Attack Countdown Timer
  useEffect(() => {
    if (currentMode !== "TIME_ATTACK" || status === "PAUSED" || status === "GAMEOVER") return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleGameOver(score, totalBounces, maxCombo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentMode, status, score, totalBounces, maxCombo]);

  // Abilities Cooldown Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setAbilities((prev) =>
        prev.map((a) => ({
          ...a,
          currentCooldown: Math.max(0, a.currentCooldown - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ability Activation Trigger
  const triggerAbility = useCallback((abilityId: "EMP_PULSE" | "GRAVITY_ANCHOR" | "QUANTUM_CLONE") => {
    const ability = abilities.find((a) => a.id === abilityId);
    if (!ability || ability.currentCooldown > 0) return;

    // Reset cooldown
    setAbilities((prev) =>
      prev.map((a) => (a.id === abilityId ? { ...a, currentCooldown: a.cooldownSeconds } : a))
    );

    if (abilityId === "EMP_PULSE") {
      setEmpFreezeActive(true);
      soundManager.playOverdriveActivate();
      setTimeout(() => setEmpFreezeActive(false), 4500);
    } else if (abilityId === "GRAVITY_ANCHOR") {
      setMicroSingularityTrigger((prev) => prev + 1);
      soundManager.playExplosion("MEDIUM");
    } else if (abilityId === "QUANTUM_CLONE") {
      setTriCloneTrigger((prev) => prev + 1);
      soundManager.playLaunch(0.9);
    }
  }, [abilities]);

  // Keyboard listener for abilities 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "1") triggerAbility("EMP_PULSE");
      if (e.key === "2") triggerAbility("GRAVITY_ANCHOR");
      if (e.key === "3") triggerAbility("QUANTUM_CLONE");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerAbility]);

  // Switch Game Mode
  const handleSelectMode = (mode: GameMode) => {
    setCurrentMode(mode);
    setScore(0);
    setSector(1);
    setCombo(0);
    setMaxCombo(0);
    setShardsRun(0);
    setOverdriveCharge(0);
    setEquippedAugments([]);
    setDraftLevel(1);
    setIsNewHighScore(false);
    setTimeRemaining(60);

    const modeConfig = GAME_MODES.find((m) => m.mode === mode);
    setLaunchesLeft(modeConfig ? modeConfig.startingLaunches : 5);
    setStatus("IDLE");
    soundManager.playDraftSelect();
  };

  const handlePlayCustomLevel = (levelData: CustomLevelData) => {
    setCustomLevel(levelData);
    setCurrentMode("CUSTOM_SANDBOX");
    setShowLevelEditor(false);
    setScore(0);
    setSector(1);
    setLaunchesLeft(5);
    setStatus("IDLE");
  };

  // Handlers for canvas updates
  const handleScoreUpdate = (newScore: number) => {
    const multiplier = currentMode === "TIME_ATTACK" ? 3 : 1;
    const computed = newScore * multiplier;
    setScore(computed);
    if (computed > highScore) {
      setHighScore(computed);
      setIsNewHighScore(true);
    }
  };

  const handleShardsCollected = (shardsCount: number) => {
    setShardsRun((prev) => prev + shardsCount);
    setTotalShards((prev) => {
      const updated = prev + shardsCount;
      const t = ProgressionManager.getTelemetry();
      t.totalQuantumShards = updated;
      ProgressionManager.saveTelemetry(t);
      return updated;
    });
  };

  const handleComboChange = (currentCombo: number) => {
    setCombo(currentCombo);
    if (currentCombo > maxCombo) setMaxCombo(currentCombo);
  };

  const handleTriggerDraft = () => {
    const cards = getRandomAugmentDraft(equippedAugments.map((a) => a.id));
    setDraftCards(cards);
    setShowDraft(true);
    setStatus("DRAFTING");
  };

  const handleSelectAugment = (card: AugmentCard) => {
    setEquippedAugments((prev) => [...prev, card]);
    setShowDraft(false);
    setDraftLevel((prev) => prev + 1);
    setStatus("IDLE");
  };

  const handleSectorComplete = () => {
    setSector((prev) => prev + 1);
    soundManager.playDraftSelect();
  };

  const handleBossDefeated = () => {
    soundManager.playExplosion("MASSIVE");
    setScore((prev) => prev + 5000);
    setSector((prev) => prev + 1);
  };

  const handleGameOver = (finalScore: number, bounces: number, peakCombo: number) => {
    setTotalBounces(bounces);
    setMaxCombo(peakCombo);
    setStatus("GAMEOVER");
    setShowGameOver(true);

    // Save Telemetry
    const t = ProgressionManager.getTelemetry();
    t.score = finalScore;
    if (finalScore > (t.highScore || 0)) {
      t.highScore = finalScore;
    }
    t.totalBounces += bounces;
    t.runsCompleted = (t.runsCompleted || 0) + 1;
    if (sector > (t.maxSectorReached || 1)) {
      t.maxSectorReached = sector;
    }
    t.quantumShardsRun = shardsRun;
    ProgressionManager.saveTelemetry(t);
  };

  const handleRestart = () => {
    setScore(0);
    setSector(1);
    const modeConfig = GAME_MODES.find((m) => m.mode === currentMode);
    setLaunchesLeft(modeConfig ? modeConfig.startingLaunches : 5);
    setCombo(0);
    setMaxCombo(0);
    setShardsRun(0);
    setOverdriveCharge(0);
    setEquippedAugments([]);
    setDraftLevel(1);
    setTimeRemaining(60);
    setIsNewHighScore(false);
    setShowGameOver(false);
    setShowPause(false);
    setStatus("IDLE");
  };

  const handleRevive = () => {
    setLaunchesLeft((prev) => prev + 1);
    setShowGameOver(false);
    setStatus("IDLE");
  };

  const handleDoubleShardsClaim = () => {
    setTotalShards((prev) => {
      const updated = prev + shardsRun;
      const t = ProgressionManager.getTelemetry();
      t.totalQuantumShards = updated;
      ProgressionManager.saveTelemetry(t);
      return updated;
    });
  };

  return (
    <div className={styles.gameSuiteContainer}>
      {/* Game Mode Selector Strip */}
      <div className={styles.modeSelectorStrip}>
        {GAME_MODES.map((m) => (
          <button
            key={m.mode}
            onClick={() => handleSelectMode(m.mode)}
            className={`${styles.modeBtn} ${currentMode === m.mode ? styles.modeActive : ""}`}
          >
            <span className={styles.modeIcon}>{m.icon}</span>
            <div className={styles.modeCol}>
              <span className={styles.modeName}>{m.name}</span>
              <span className={styles.modeBadge}>{m.badge}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Top HUD Telemetry Ribbon */}
      <div className={`${styles.hudRibbon} glass`}>
        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>SCORE TELEMETRY</span>
          <span className={styles.hudValueScore}>{score.toLocaleString()}</span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>ORBITAL RECORD</span>
          <span className={styles.hudValueRecord}>{highScore.toLocaleString()}</span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>
            {currentMode === "TIME_ATTACK" ? "TIME REMAINING" : "SECTOR STAGE"}
          </span>
          <span className={styles.hudValueSector}>
            {currentMode === "TIME_ATTACK" ? `${timeRemaining}s` : `Sector ${sector}`}
          </span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>TRAJECTORY PROBES</span>
          <div className={styles.launchesPips}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <span
                key={idx}
                className={`${styles.launchPip} ${
                  idx < launchesLeft ? styles.pipActive : styles.pipEmpty
                }`}
              />
            ))}
          </div>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>KINETIC COMBO</span>
          <span className={styles.hudValueCombo}>{combo > 1 ? `${combo}x CHAIN` : "--"}</span>
        </div>

        <div className={styles.hudStatBlock}>
          <span className={styles.hudLabel}>QUANTUM SHARDS</span>
          <span className={styles.hudValueShards}>[+] {totalShards.toLocaleString()}</span>
        </div>

        <div className={styles.hudActionBlock}>
          <button
            onClick={() => setShowPause(true)}
            className={styles.hudPauseBtn}
            title="Pause Simulation"
          >
            [||] PAUSE
          </button>
        </div>
      </div>

      {/* Main Game Layout Grid (Game Canvas + Sidebar Telemetry & Ad) */}
      <div className={styles.gameArenaGrid}>
        {/* Left / Center: Interactive Canvas Arena */}
        <div className={styles.canvasWrapper}>
          <KineticCanvas
            status={status}
            sector={sector}
            gameMode={currentMode}
            customLevelData={customLevel}
            activeVessel={activeVessel}
            activeTrailColor={activeTrailColor}
            techUpgrades={techUpgrades}
            augments={equippedAugments}
            empFreezeActive={empFreezeActive}
            microSingularityTrigger={microSingularityTrigger}
            triCloneTrigger={triCloneTrigger}
            onScoreUpdate={handleScoreUpdate}
            onShardsCollected={handleShardsCollected}
            onComboChange={handleComboChange}
            onLaunchesChange={setLaunchesLeft}
            onOverdriveChargeChange={setOverdriveCharge}
            onTriggerDraft={handleTriggerDraft}
            onGameOver={handleGameOver}
            onBossDefeated={handleBossDefeated}
            onSectorComplete={handleSectorComplete}
          />

          {/* Canvas Floating Overdrive Trigger */}
          <div className={styles.canvasOverlayControls}>
            {/* Tactical Abilities Hotkey Strip */}
            <div className={styles.abilitiesStrip}>
              {abilities.map((ability) => {
                const isOnCooldown = ability.currentCooldown > 0;
                return (
                  <button
                    key={ability.id}
                    disabled={isOnCooldown}
                    onClick={() => triggerAbility(ability.id)}
                    className={`${styles.abilityBtn} ${
                      isOnCooldown ? styles.abilityCooldown : styles.abilityReady
                    }`}
                  >
                    <span className={styles.abilityHotkey}>[{ability.hotkey}]</span>
                    <span className={styles.abilityName}>{ability.name}</span>
                    {isOnCooldown && (
                      <span className={styles.cooldownTag}>{ability.currentCooldown}s</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles.overdriveGaugeContainer}>
              <div
                className={styles.overdriveGaugeFill}
                style={{ width: `${overdriveCharge}%` }}
              />
              <span className={styles.overdriveGaugeText}>
                OVERDRIVE REACTOR: {Math.round(overdriveCharge)}%
              </span>
            </div>

            <button
              disabled={overdriveCharge < 100}
              onClick={() => {
                const event = new KeyboardEvent("keydown", { code: "Space" });
                window.dispatchEvent(event);
              }}
              className={`${styles.overdriveBtn} ${
                overdriveCharge >= 100 ? styles.overdriveReady : ""
              }`}
            >
              {overdriveCharge >= 100
                ? "[ACTIVATE SUPERNOVA (SPACEBAR)]"
                : "[CHARGING REACTOR]"}
            </button>
          </div>
        </div>

        {/* Right: Telemetry Deck & Navigation Matrix */}
        <div className={styles.sideTelemetryDeck}>
          <div className={`${styles.deckPanel} glass`}>
            <h3 className={styles.deckTitle}>PILOT COMMAND CONSOLE</h3>
            <p className={styles.deckSub}>Active Vessel: {activeVessel.name}</p>

            <div className={styles.deckButtonsGrid}>
              <button
                onClick={() => setShowTechMatrix(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[+]</span>
                <span>Tech Matrix</span>
              </button>

              <button
                onClick={() => setShowHangar(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[#]</span>
                <span>Fleet Hangar</span>
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[^]</span>
                <span>Leaderboard</span>
              </button>

              <button
                onClick={() => setShowLevelEditor(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[!]</span>
                <span>Level Editor</span>
              </button>

              <button
                onClick={() => setShowAchievements(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[*]</span>
                <span>Achievements</span>
              </button>

              <button
                onClick={() => setShowSupplyDrop(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[$]</span>
                <span>Daily Crate</span>
              </button>

              <button
                onClick={() => setShowSeasonPass(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[S]</span>
                <span>Season Pass</span>
              </button>

              <button
                onClick={() => setShowBenchmark(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[B]</span>
                <span>Diagnostics</span>
              </button>

              <button
                onClick={() => setShowStepSequencer(true)}
                className={styles.deckNavBtn}
              >
                <span className={styles.deckBtnIcon}>[M]</span>
                <span>Synth Lab</span>
              </button>
            </div>
          </div>

          {/* Active Augments Equipped List */}
          <div className={`${styles.deckPanel} glass`}>
            <h4 className={styles.deckSectionTitle}>INSTALLED AUGMENTS ({equippedAugments.length})</h4>
            {equippedAugments.length === 0 ? (
              <p className={styles.emptyAugmentsText}>
                No augments installed. Clear bumpers to trigger tactical drafts!
              </p>
            ) : (
              <div className={styles.augmentsMiniList}>
                {equippedAugments.map((aug, i) => (
                  <div key={i} className={styles.augMiniItem}>
                    <span className={styles.augMiniIcon}>{aug.icon}</span>
                    <div className={styles.augMiniCol}>
                      <span className={styles.augMiniName}>{aug.name}</span>
                      <span className={styles.augMiniTag}>{aug.tagline}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Architectural Sidebar Ad Unit */}
          <div className={styles.sidebarAdContainer}>
            <AdSlot type="sidebar" />
          </div>
        </div>
      </div>

      {/* Modals Rendering */}
      {showDraft && (
        <AugmentDraftModal
          cards={draftCards}
          onSelect={handleSelectAugment}
          level={draftLevel}
        />
      )}

      {showTechMatrix && (
        <TechMatrixModal
          totalShards={totalShards}
          onClose={() => {
            setShowTechMatrix(false);
            setTechUpgrades(ProgressionManager.getTechUpgrades());
          }}
          onUpdateShards={(updated) => setTotalShards(updated)}
        />
      )}

      {showHangar && (
        <HangarModal
          totalShards={totalShards}
          onClose={() => setShowHangar(false)}
          onSelectVessel={(id) => {
            const v = ProgressionManager.getVessels().find((x) => x.id === id);
            if (v) setActiveVessel(v);
          }}
          onSelectTrail={(id) => {
            const t = COSMETIC_TRAILS.find((x) => x.id === id);
            if (t) setActiveTrailColor(t.color);
          }}
          onUpdateShards={(updated) => setTotalShards(updated)}
        />
      )}

      {showGameOver && (
        <GameOverModal
          score={score}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
          shardsEarned={shardsRun}
          comboCount={maxCombo}
          sector={sector}
          totalBounces={totalBounces}
          onRestart={handleRestart}
          onRevive={handleRevive}
          onOpenTech={() => {
            setShowGameOver(false);
            setShowTechMatrix(true);
          }}
          onOpenHangar={() => {
            setShowGameOver(false);
            setShowHangar(true);
          }}
          onClaimDoubleShards={handleDoubleShardsClaim}
          canRevive={true}
        />
      )}

      {showSupplyDrop && (
        <SupplyDropModal
          onClose={() => setShowSupplyDrop(false)}
          onRewardClaimed={(amount) => {
            setTotalShards((prev) => {
              const updated = prev + amount;
              const t = ProgressionManager.getTelemetry();
              t.totalQuantumShards = updated;
              ProgressionManager.saveTelemetry(t);
              return updated;
            });
          }}
        />
      )}

      {showAchievements && (
        <AchievementsModal
          onClose={() => setShowAchievements(false)}
          onRewardClaimed={(amount) => {
            setTotalShards((prev) => {
              const updated = prev + amount;
              const t = ProgressionManager.getTelemetry();
              t.totalQuantumShards = updated;
              ProgressionManager.saveTelemetry(t);
              return updated;
            });
          }}
        />
      )}

      {showLevelEditor && (
        <LevelEditorModal
          onClose={() => setShowLevelEditor(false)}
          onPlayCustomLevel={handlePlayCustomLevel}
        />
      )}

      {showLeaderboard && (
        <LeaderboardAndQuestsModal
          onClose={() => setShowLeaderboard(false)}
          onRewardClaimed={(amount) => {
            setTotalShards((prev) => {
              const updated = prev + amount;
              const t = ProgressionManager.getTelemetry();
              t.totalQuantumShards = updated;
              ProgressionManager.saveTelemetry(t);
              return updated;
            });
          }}
        />
      )}

      {showSeasonPass && (
        <SeasonPassModal
          onClose={() => setShowSeasonPass(false)}
          onClaimReward={(amount) => {
            setTotalShards((prev) => {
              const updated = prev + amount;
              const t = ProgressionManager.getTelemetry();
              t.totalQuantumShards = updated;
              ProgressionManager.saveTelemetry(t);
              return updated;
            });
          }}
        />
      )}

      {showBenchmark && (
        <BenchmarkModal onClose={() => setShowBenchmark(false)} />
      )}

      {showStepSequencer && (
        <StepSequencerModal onClose={() => setShowStepSequencer(false)} />
      )}

      {showPause && (
        <PauseMenuModal
          onResume={() => setShowPause(false)}
          onRestart={handleRestart}
          onOpenTech={() => {
            setShowPause(false);
            setShowTechMatrix(true);
          }}
          onOpenHangar={() => {
            setShowPause(false);
            setShowHangar(true);
          }}
        />
      )}
    </div>
  );
}
