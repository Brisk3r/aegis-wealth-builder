"use client";

import React, { useState } from "react";
import KineticGameSuite from "./KineticGameSuite";
import GravityRunnerCanvas from "./GravityRunnerCanvas";
import QuantumTurretCanvas from "./QuantumTurretCanvas";
import PulseRhythmCanvas from "./PulseRhythmCanvas";
import DuelArenaCanvas from "./DuelArenaCanvas";
import GameOverModal from "./GameOverModal";
import AdSlot from "@/components/layout/AdSlot";
import { ProgressionManager } from "@/lib/gameEngine/progression";
import styles from "./KineticGame.module.css";

export default function ArcadeMasterHub() {
  const [activeGame, setActiveGame] = useState<
    "KINETIC_SURGE" | "GRAVITY_RUNNER" | "QUANTUM_TURRET" | "PULSE_RHYTHM" | "DUEL_ARENA"
  >("KINETIC_SURGE");

  // Duel state
  const [duelP1Score, setDuelP1Score] = useState<number>(0);
  const [duelP2Score, setDuelP2Score] = useState<number>(0);
  const [duelWinner, setDuelWinner] = useState<string | null>(null);
  const [duelKey, setDuelKey] = useState<number>(0);

  // Runner state
  const [runnerScore, setRunnerScore] = useState<number>(0);
  const [runnerHighScore, setRunnerHighScore] = useState<number>(0);
  const [runnerShards, setRunnerShards] = useState<number>(0);
  const [runnerGameOver, setRunnerGameOver] = useState<boolean>(false);
  const [runnerDistance, setRunnerDistance] = useState<number>(0);
  const [runnerKey, setRunnerKey] = useState<number>(0);

  // Turret state
  const [turretScore, setTurretScore] = useState<number>(0);
  const [turretHighScore, setTurretHighScore] = useState<number>(0);
  const [turretShards, setTurretShards] = useState<number>(0);
  const [turretGameOver, setTurretGameOver] = useState<boolean>(false);
  const [turretWave, setTurretWave] = useState<number>(1);
  const [turretKey, setTurretKey] = useState<number>(0);

  // Rhythm state
  const [rhythmScore, setRhythmScore] = useState<number>(0);
  const [rhythmHighScore, setRhythmHighScore] = useState<number>(0);
  const [rhythmShards, setRhythmShards] = useState<number>(0);
  const [rhythmGameOver, setRhythmGameOver] = useState<boolean>(false);
  const [rhythmCombo, setRhythmCombo] = useState<number>(0);
  const [rhythmKey, setRhythmKey] = useState<number>(0);

  // Unified currency handler
  const handleAddShards = (amount: number) => {
    const t = ProgressionManager.getTelemetry();
    t.totalQuantumShards = (t.totalQuantumShards || 0) + amount;
    ProgressionManager.saveTelemetry(t);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* Top Arcade Cabinet Switcher Bar */}
      <div
        className="glass"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.25rem",
          borderRadius: "12px",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#39FF14" }}>
            [AEGIS ARCADE UNIVERSE]
          </span>
          <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            SELECT ACTIVE ARCADE CABINET:
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem" }}>
          <button
            onClick={() => setActiveGame("KINETIC_SURGE")}
            className={`${styles.modeBtn} ${activeGame === "KINETIC_SURGE" ? styles.modeActive : ""}`}
            style={{ padding: "0.45rem 0.75rem" }}
          >
            <span className={styles.modeIcon}>[*]</span>
            <div className={styles.modeCol}>
              <span className={styles.modeName}>Kinetic Surge</span>
              <span className={styles.modeBadge}>Slingshot</span>
            </div>
          </button>

          <button
            onClick={() => setActiveGame("GRAVITY_RUNNER")}
            className={`${styles.modeBtn} ${activeGame === "GRAVITY_RUNNER" ? styles.modeActive : ""}`}
            style={{ padding: "0.45rem 0.75rem" }}
          >
            <span className={styles.modeIcon}>[^]</span>
            <div className={styles.modeCol}>
              <span className={styles.modeName}>Gravity Runner</span>
              <span className={styles.modeBadge}>Reflex Inverter</span>
            </div>
          </button>

          <button
            onClick={() => setActiveGame("QUANTUM_TURRET")}
            className={`${styles.modeBtn} ${activeGame === "QUANTUM_TURRET" ? styles.modeActive : ""}`}
            style={{ padding: "0.45rem 0.75rem" }}
          >
            <span className={styles.modeIcon}>[+]</span>
            <div className={styles.modeCol}>
              <span className={styles.modeName}>Quantum Turret</span>
              <span className={styles.modeBadge}>360 Defense</span>
            </div>
          </button>

          <button
            onClick={() => setActiveGame("PULSE_RHYTHM")}
            className={`${styles.modeBtn} ${activeGame === "PULSE_RHYTHM" ? styles.modeActive : ""}`}
            style={{ padding: "0.45rem 0.75rem" }}
          >
            <span className={styles.modeIcon}>[~]</span>
            <div className={styles.modeCol}>
              <span className={styles.modeName}>Pulse Rhythm</span>
              <span className={styles.modeBadge}>Beat Matrix</span>
            </div>
          </button>

          <button
            onClick={() => setActiveGame("DUEL_ARENA")}
            className={`${styles.modeBtn} ${activeGame === "DUEL_ARENA" ? styles.modeActive : ""}`}
            style={{ padding: "0.45rem 0.75rem" }}
          >
            <span className={styles.modeIcon}>[X]</span>
            <div className={styles.modeCol}>
              <span className={styles.modeName}>Neon Duel</span>
              <span className={styles.modeBadge}>2P Local Versus</span>
            </div>
          </button>
        </div>
      </div>

      {/* Render Active Cabinet */}
      {activeGame === "KINETIC_SURGE" && <KineticGameSuite />}

      {activeGame === "GRAVITY_RUNNER" && (
        <div className={styles.gameSuiteContainer}>
          <div className={`${styles.hudRibbon} glass`}>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>DISTANCE TRAVELED</span>
              <span className={styles.hudValueScore}>{runnerScore} M</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>BEST DISTANCE</span>
              <span className={styles.hudValueRecord}>{runnerHighScore} M</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>CONTROLS</span>
              <span className={styles.hudValueSector}>TAP / SPACE TO FLIP GRAVITY</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>SHARDS EXTRACTED</span>
              <span className={styles.hudValueShards}>+{runnerShards} SHARDS</span>
            </div>
          </div>

          <div className={styles.gameArenaGrid}>
            <div className={styles.canvasWrapper} style={{ height: "480px" }}>
              <GravityRunnerCanvas
                key={runnerKey}
                onScoreUpdate={setRunnerScore}
                onShardsCollected={(s) => {
                  setRunnerShards((prev) => prev + s);
                  handleAddShards(s);
                }}
                onGameOver={(score, dist) => {
                  setRunnerGameOver(true);
                  setRunnerDistance(dist);
                  if (score > runnerHighScore) setRunnerHighScore(score);
                }}
              />
            </div>

            <div className={styles.sideTelemetryDeck}>
              <div className={`${styles.deckPanel} glass`}>
                <h3 className={styles.deckTitle}>GRAVITY FLUX PROTOCOL</h3>
                <p className={styles.deckSub}>High-speed sub-space runner</p>
                <div style={{ fontSize: "0.8rem", color: "#CBD5E1", lineHeight: 1.5 }}>
                  <p>Invert gravitational polarity to avoid floor spikes and ceiling laser barriers.</p>
                  <p>Collect glowing cyan Quantum Shards and pass through green warp rings for supersonic acceleration boosts!</p>
                </div>
              </div>

              <div className={styles.sidebarAdContainer}>
                <AdSlot type="sidebar" />
              </div>
            </div>
          </div>

          {runnerGameOver && (
            <GameOverModal
              score={runnerScore}
              highScore={runnerHighScore}
              isNewHighScore={runnerScore >= runnerHighScore && runnerScore > 0}
              shardsEarned={runnerShards}
              comboCount={1}
              sector={1}
              totalBounces={runnerDistance}
              onRestart={() => {
                setRunnerScore(0);
                setRunnerShards(0);
                setRunnerGameOver(false);
                setRunnerKey((prev) => prev + 1);
              }}
              onRevive={() => setRunnerGameOver(false)}
              onOpenTech={() => {}}
              onOpenHangar={() => {}}
              onClaimDoubleShards={() => {}}
              canRevive={false}
            />
          )}
        </div>
      )}

      {activeGame === "QUANTUM_TURRET" && (
        <div className={styles.gameSuiteContainer}>
          <div className={`${styles.hudRibbon} glass`}>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>DEFENSE SCORE</span>
              <span className={styles.hudValueScore}>{turretScore.toLocaleString()}</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>BEST DEFENSE</span>
              <span className={styles.hudValueRecord}>{turretHighScore.toLocaleString()}</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>CONTROLS</span>
              <span className={styles.hudValueSector}>AIM / CLICK TO FIRE // [1-3] WEAPONS</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>SHARDS EXTRACTED</span>
              <span className={styles.hudValueShards}>+{turretShards} SHARDS</span>
            </div>
          </div>

          <div className={styles.gameArenaGrid}>
            <div className={styles.canvasWrapper} style={{ height: "560px" }}>
              <QuantumTurretCanvas
                key={turretKey}
                onScoreUpdate={setTurretScore}
                onShardsCollected={(s) => {
                  setTurretShards((prev) => prev + s);
                  handleAddShards(s);
                }}
                onGameOver={(score, wave) => {
                  setTurretGameOver(true);
                  setTurretWave(wave);
                  if (score > turretHighScore) setTurretHighScore(score);
                }}
              />
            </div>

            <div className={styles.sideTelemetryDeck}>
              <div className={`${styles.deckPanel} glass`}>
                <h3 className={styles.deckTitle}>TURRET STATION PROTOCOL</h3>
                <p className={styles.deckSub}>360 Orbital Turret Defense</p>
                <div style={{ fontSize: "0.8rem", color: "#CBD5E1", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <p><strong>[1] Plasma Vulcan</strong>: Rapid fire kinetic bolts.</p>
                  <p><strong>[2] Tesla Piercer</strong>: High-damage beam cutting through swarms.</p>
                  <p><strong>[3] Cluster Flak</strong>: Explosive triple-spread fragmentation.</p>
                </div>
              </div>

              <div className={styles.sidebarAdContainer}>
                <AdSlot type="sidebar" />
              </div>
            </div>
          </div>

          {turretGameOver && (
            <GameOverModal
              score={turretScore}
              highScore={turretHighScore}
              isNewHighScore={turretScore >= turretHighScore && turretScore > 0}
              shardsEarned={turretShards}
              comboCount={turretWave}
              sector={turretWave}
              totalBounces={turretWave * 15}
              onRestart={() => {
                setTurretScore(0);
                setTurretShards(0);
                setTurretGameOver(false);
                setTurretKey((prev) => prev + 1);
              }}
              onRevive={() => setTurretGameOver(false)}
              onOpenTech={() => {}}
              onOpenHangar={() => {}}
              onClaimDoubleShards={() => {}}
              canRevive={false}
            />
          )}
        </div>
      )}

      {activeGame === "PULSE_RHYTHM" && (
        <div className={styles.gameSuiteContainer}>
          <div className={`${styles.hudRibbon} glass`}>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>GROOVE SCORE</span>
              <span className={styles.hudValueScore}>{rhythmScore.toLocaleString()}</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>BEST GROOVE</span>
              <span className={styles.hudValueRecord}>{rhythmHighScore.toLocaleString()}</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>CONTROLS</span>
              <span className={styles.hudValueSector}>KEYS [D] [F] [J] [K] OR TOUCH PADS</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>SHARDS EXTRACTED</span>
              <span className={styles.hudValueShards}>+{rhythmShards} SHARDS</span>
            </div>
          </div>

          <div className={styles.gameArenaGrid}>
            <div className={styles.canvasWrapper} style={{ height: "520px" }}>
              <PulseRhythmCanvas
                key={rhythmKey}
                onScoreUpdate={setRhythmScore}
                onShardsCollected={(s) => {
                  setRhythmShards((prev) => prev + s);
                  handleAddShards(s);
                }}
                onGameOver={(score, maxCombo) => {
                  setRhythmGameOver(true);
                  setRhythmCombo(maxCombo);
                  if (score > rhythmHighScore) setRhythmHighScore(score);
                }}
              />
            </div>

            <div className={styles.sideTelemetryDeck}>
              <div className={`${styles.deckPanel} glass`}>
                <h3 className={styles.deckTitle}>BEAT SLASHER PROTOCOL</h3>
                <p className={styles.deckSub}>Pulse Matrix Beat Sync</p>
                <div style={{ fontSize: "0.8rem", color: "#CBD5E1", lineHeight: 1.5 }}>
                  <p>Strike the 4 key lanes [D, F, J, K] exactly when glowing pulses cross the white judgment bar.</p>
                  <p>Build 10x, 20x, 30x combo streaks to multiply score acceleration by 4x!</p>
                </div>
              </div>

              <div className={styles.sidebarAdContainer}>
                <AdSlot type="sidebar" />
              </div>
            </div>
          </div>

          {rhythmGameOver && (
            <GameOverModal
              score={rhythmScore}
              highScore={rhythmHighScore}
              isNewHighScore={rhythmScore >= rhythmHighScore && rhythmScore > 0}
              shardsEarned={rhythmShards}
              comboCount={rhythmCombo}
              sector={1}
              totalBounces={rhythmCombo * 5}
              onRestart={() => {
                setRhythmScore(0);
                setRhythmShards(0);
                setRhythmGameOver(false);
                setRhythmKey((prev) => prev + 1);
              }}
              onRevive={() => setRhythmGameOver(false)}
              onOpenTech={() => {}}
              onOpenHangar={() => {}}
              onClaimDoubleShards={() => {}}
              canRevive={false}
            />
          )}
        </div>
      )}

      {activeGame === "DUEL_ARENA" && (
        <div className={styles.gameSuiteContainer}>
          <div className={`${styles.hudRibbon} glass`}>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel} style={{ color: "#00F0FF" }}>PLAYER 1 (CYAN)</span>
              <span className={styles.hudValueScore} style={{ color: "#00F0FF" }}>{duelP1Score} GOALS</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel} style={{ color: "#FF3366" }}>PLAYER 2 (MAGENTA)</span>
              <span className={styles.hudValueScore} style={{ color: "#FF3366" }}>{duelP2Score} GOALS</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>CONTROLS</span>
              <span className={styles.hudValueSector}>P1: [W/S] // P2: [UP/DOWN ARROWS]</span>
            </div>
            <div className={styles.hudStatBlock}>
              <span className={styles.hudLabel}>MATCH FORMAT</span>
              <span className={styles.hudValueRecord}>FIRST TO 5 GOALS</span>
            </div>
          </div>

          <div className={styles.gameArenaGrid}>
            <div className={styles.canvasWrapper} style={{ height: "480px" }}>
              <DuelArenaCanvas
                key={duelKey}
                onScoreUpdate={(p1, p2) => {
                  setDuelP1Score(p1);
                  setDuelP2Score(p2);
                }}
                onMatchComplete={(winner, p1, p2) => {
                  setDuelWinner(winner);
                  handleAddShards(50);
                }}
              />
            </div>

            <div className={styles.sideTelemetryDeck}>
              <div className={`${styles.deckPanel} glass`}>
                <h3 className={styles.deckTitle}>LOCAL DUEL PROTOCOL</h3>
                <p className={styles.deckSub}>2-Player Split Screen Reflex Arena</p>
                <div style={{ fontSize: "0.8rem", color: "#CBD5E1", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <p><strong>Player 1 (Left - Cyan)</strong>: Steer kinetic paddle with <code>W</code> and <code>S</code> keys.</p>
                  <p><strong>Player 2 (Right - Magenta)</strong>: Steer kinetic paddle with <code>ArrowUp</code> and <code>ArrowDown</code> keys.</p>
                  <p>Deflect the accelerating energy disk past your opponent&apos;s goal threshold to score!</p>
                </div>
              </div>

              <div className={styles.sidebarAdContainer}>
                <AdSlot type="sidebar" />
              </div>
            </div>
          </div>

          {duelWinner && (
            <div className={styles.modalBackdrop}>
              <div className={`${styles.pauseModalContainer} glass`}>
                <div className={styles.modalHeaderRow}>
                  <div>
                    <div className={styles.categoryBadge}>MATCH VICTORY</div>
                    <h2 className={styles.modalTitle}>
                      {duelWinner === "PLAYER_1" ? "PLAYER 1 (CYAN) WINS!" : "PLAYER 2 (MAGENTA) WINS!"}
                    </h2>
                    <p style={{ color: "#94A3B8", marginTop: "0.4rem" }}>
                      Final Score: {duelP1Score} - {duelP2Score}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.2rem" }}>
                  <button
                    onClick={() => {
                      setDuelWinner(null);
                      setDuelP1Score(0);
                      setDuelP2Score(0);
                      setDuelKey((prev) => prev + 1);
                    }}
                    className={styles.overdriveBtn}
                    style={{ flex: 1, margin: 0 }}
                  >
                    [PLAY REMATCH]
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
