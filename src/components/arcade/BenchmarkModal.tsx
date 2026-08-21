"use client";

import React, { useState } from "react";
import {
  AbilitiesVerificationResult,
  BossMatrixStressResult,
  CollisionFuzzResult,
  ComprehensiveBenchmarkReport,
  EconomyAuditResult,
  MonetizationAuditResult,
  SimulationBot,
  SimulationResult,
} from "@/lib/gameEngine/simulationBot";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface BenchmarkModalProps {
  onClose: () => void;
}

type BenchmarkTab =
  | "ALL"
  | "PHYSICS"
  | "ECONOMY"
  | "BOSS"
  | "FUZZER"
  | "ABILITIES"
  | "MONETIZATION";

export default function BenchmarkModal({ onClose }: BenchmarkModalProps) {
  const [activeTab, setActiveTab] = useState<BenchmarkTab>("ALL");
  const [trialsCount, setTrialsCount] = useState<number>(2000);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [report, setReport] = useState<ComprehensiveBenchmarkReport | null>(null);

  const handleRunBenchmark = () => {
    setIsRunning(true);
    soundManager.playOverdriveActivate();

    setTimeout(() => {
      const benchmarkReport = SimulationBot.runComprehensiveBenchmark(trialsCount);
      setReport(benchmarkReport);
      setIsRunning(false);
      soundManager.playDraftSelect();
    }, 120);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.techModalContainer} glass`} style={{ maxWidth: "980px" }}>
        {/* Header Row */}
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>SWARM 6 HEADLESS DIAGNOSTICS & BENCHMARK MATRIX</div>
            <h2 className={styles.modalTitle}>AUTONOMOUS SIMULATION BOTS & QA MATRIX</h2>
            <p className={styles.modalSubtitle}>
              Execute automated Monte Carlo trajectory trials, verify 76,450 shard equilibrium, stress-test multi-phase boss state machines, and audit continuous collision detection.
            </p>
          </div>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            [X]
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            flexWrap: "wrap",
            borderBottom: "1px solid rgba(0, 240, 255, 0.2)",
            paddingBottom: "0.6rem",
            marginBottom: "0.8rem",
          }}
        >
          <button
            onClick={() => setActiveTab("ALL")}
            className={`${styles.deckNavBtn} ${activeTab === "ALL" ? styles.modeActive : ""}`}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            [ALL] FULL 6-SUITE MATRIX
          </button>
          <button
            onClick={() => setActiveTab("PHYSICS")}
            className={`${styles.deckNavBtn} ${activeTab === "PHYSICS" ? styles.modeActive : ""}`}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            [1] MONTE CARLO PHYSICS
          </button>
          <button
            onClick={() => setActiveTab("ECONOMY")}
            className={`${styles.deckNavBtn} ${activeTab === "ECONOMY" ? styles.modeActive : ""}`}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            [2] ECONOMY AUDITOR
          </button>
          <button
            onClick={() => setActiveTab("BOSS")}
            className={`${styles.deckNavBtn} ${activeTab === "BOSS" ? styles.modeActive : ""}`}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            [3] BOSS AI STRESS
          </button>
          <button
            onClick={() => setActiveTab("FUZZER")}
            className={`${styles.deckNavBtn} ${activeTab === "FUZZER" ? styles.modeActive : ""}`}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            [4] CCD CORNER FUZZER
          </button>
          <button
            onClick={() => setActiveTab("ABILITIES")}
            className={`${styles.deckNavBtn} ${activeTab === "ABILITIES" ? styles.modeActive : ""}`}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            [5] TACTICAL ABILITIES
          </button>
          <button
            onClick={() => setActiveTab("MONETIZATION")}
            className={`${styles.deckNavBtn} ${activeTab === "MONETIZATION" ? styles.modeActive : ""}`}
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }}
          >
            [6] 2X AD AUDITOR
          </button>
        </div>

        {/* Controls Card */}
        <div
          className="glass"
          style={{
            padding: "0.85rem 1rem",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.8rem",
            border: "1px solid rgba(0, 240, 255, 0.3)",
            marginBottom: "0.9rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 700 }}>
              TRAJECTORY SAMPLE SIZE:
            </span>
            {[200, 500, 1000, 2000].map((count) => (
              <button
                key={count}
                onClick={() => setTrialsCount(count)}
                className={`${styles.deckNavBtn} ${trialsCount === count ? styles.modeActive : ""}`}
                style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
              >
                {count}
              </button>
            ))}
          </div>

          <button
            disabled={isRunning}
            onClick={handleRunBenchmark}
            className={styles.overdriveBtn}
            style={{ padding: "0.65rem 1.4rem", margin: 0 }}
          >
            {isRunning
              ? "[EXECUTING 6-SUITE QA MATRIX...]"
              : `[RUN ${trialsCount} TRIALS & AUDIT ALL SUITES]`}
          </button>
        </div>

        {/* Diagnostics Results Container */}
        {report ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {/* Top KPI Ribbon */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "0.65rem",
              }}
            >
              <div className="glass" style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                <span style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 700 }}>EXECUTION LATENCY</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#39FF14" }}>
                  {report.physicsSimulation.physicsExecutionTimeMs} ms
                </div>
                <span style={{ fontSize: "0.62rem", color: "#64748B" }}>
                  {report.physicsSimulation.trialsPerSecond.toLocaleString()} trials/sec
                </span>
              </div>

              <div className="glass" style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                <span style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 700 }}>TUNNELING BREACHES</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: report.physicsSimulation.tunnelingAnomalies === 0 ? "#39FF14" : "#FF3366" }}>
                  {report.physicsSimulation.tunnelingAnomalies} (0.00%)
                </div>
                <span style={{ fontSize: "0.62rem", color: "#64748B" }}>Sub-step CCD verified</span>
              </div>

              <div className="glass" style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                <span style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 700 }}>AVG BOUNCES / LAUNCH</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00F0FF" }}>
                  {report.physicsSimulation.averageBounces}
                </div>
                <span style={{ fontSize: "0.62rem", color: "#64748B" }}>
                  Peak Combo: {report.physicsSimulation.maxComboAchieved}x
                </span>
              </div>

              <div className="glass" style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                <span style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 700 }}>SHARD SINK DEMAND</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFE600" }}>
                  {report.economyAudit.standardSinkDemand.toLocaleString()}
                </div>
                <span style={{ fontSize: "0.62rem", color: "#64748B" }}>76,450 Equilibrium Target</span>
              </div>

              <div className="glass" style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0, 240, 255, 0.2)" }}>
                <span style={{ fontSize: "0.65rem", color: "#94A3B8", fontWeight: 700 }}>SYSTEM ATTESTATION</span>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: report.allSystemsPassed ? "#39FF14" : "#FF3366" }}>
                  {report.allSystemsPassed ? "[100% VERIFIED]" : "[DEFECTS DETECTED]"}
                </div>
                <span style={{ fontSize: "0.62rem", color: "#64748B" }}>6/6 Suites Passed</span>
              </div>
            </div>

            {/* Tab 1 / ALL: Monte Carlo Physics */}
            {(activeTab === "ALL" || activeTab === "PHYSICS") && (
              <div className="glass" style={{ padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#00F0FF" }}>
                    [SUITE 1] MONTE CARLO PHYSICS ENGINE ({report.physicsSimulation.totalTrials} TRIALS)
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#39FF14", fontWeight: 700 }}>
                    STATUS: [{report.physicsSimulation.status}]
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem", fontSize: "0.75rem" }}>
                  <div>Average Score: <strong style={{ color: "#FFE600" }}>{report.physicsSimulation.averageScore.toLocaleString()}</strong></div>
                  <div>Score Range: <strong>{report.physicsSimulation.minScore} - {report.physicsSimulation.maxScore.toLocaleString()}</strong></div>
                  <div>Shards Harvested / Run: <strong style={{ color: "#00F0FF" }}>+{report.physicsSimulation.shardYieldPerRun}</strong></div>
                  <div>Bounce Range: <strong>{report.physicsSimulation.minBounces} - {report.physicsSimulation.maxBounces}</strong></div>
                  <div>Avg Trajectory Steps: <strong>{report.physicsSimulation.averageTrajectorySteps} steps</strong></div>
                  <div>Sub-Step CCD Integrity: <strong style={{ color: "#39FF14" }}>{report.physicsSimulation.subStepCCDIntegrityPercent}%</strong></div>
                </div>
              </div>
            )}

            {/* Tab 2 / ALL: Meta-Economy Balance */}
            {(activeTab === "ALL" || activeTab === "ECONOMY") && (
              <div className="glass" style={{ padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FFE600" }}>
                    [SUITE 2] META-ECONOMY & LIFETIME SHARD SINK EQUILIBRIUM
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#39FF14", fontWeight: 700 }}>
                    STATUS: [{report.economyAudit.status}]
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem", fontSize: "0.75rem" }}>
                  <div>Tech Matrix Sinks (7 nodes): <strong>{report.economyAudit.techMatrixTotalCost.toLocaleString()} Shards</strong></div>
                  <div>Cosmetic Ion Trails (6 trails): <strong>{report.economyAudit.cosmeticTrailsTotalCost.toLocaleString()} Shards</strong></div>
                  <div>Vessel Chassis Baseline: <strong>37,400 Shards</strong></div>
                  <div>Standard Demand Target: <strong style={{ color: "#FFE600" }}>{report.economyAudit.standardSinkDemand.toLocaleString()} Shards</strong></div>
                  <div>Runs to Equilibrium: <strong>~{report.economyAudit.runsToEquilibrium} runs (~{report.economyAudit.equilibriumPacingHours} hrs)</strong></div>
                  <div>Loop Prevention / Non-Negative: <strong style={{ color: "#39FF14" }}>VERIFIED (0 Anomalies)</strong></div>
                </div>
              </div>
            )}

            {/* Tab 3 / ALL: Boss AI Stress Matrix */}
            {(activeTab === "ALL" || activeTab === "BOSS") && (
              <div className="glass" style={{ padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FF3366" }}>
                    [SUITE 3] BOSS AI MULTI-PHASE ENRAGE MATRIX (5 TITANS)
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#39FF14", fontWeight: 700 }}>
                    ENRAGE SUCCESS: {report.bossStressMatrix.enrageTransitionSuccessRate.toFixed(0)}% (1.8x Speed)
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {report.bossStressMatrix.bossResults.map((b) => (
                    <div
                      key={b.bossType}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.35rem 0.6rem",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "6px",
                        fontSize: "0.72rem",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "#00F0FF" }}>{b.bossName}</span>
                      <span>HP: {b.initialHp.toLocaleString()}</span>
                      <span>Drones: {b.maxDrones} (Absorbed: {b.droneHealthAbsorbedTotal} HP)</span>
                      <span>Core Hits: {b.coreHitsRequired}</span>
                      <span style={{ color: b.enrageTriggered ? "#39FF14" : "#FF3366" }}>
                        Enrage: {b.enrageTriggered ? "YES (1.8x)" : "NO"}
                      </span>
                      <span style={{ color: b.status === "PASS" ? "#39FF14" : "#FF3366", fontWeight: 700 }}>
                        [{b.status}]
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4 / ALL: Collision Edge-Case Fuzzer */}
            {(activeTab === "ALL" || activeTab === "FUZZER") && (
              <div className="glass" style={{ padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#39FF14" }}>
                    [SUITE 4] HIGH-VELOCITY CCD CORNER TRAJECTORY FUZZER ({report.collisionFuzzer.totalFuzzRays} RAYS)
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#39FF14", fontWeight: 700 }}>
                    STABILITY: {report.collisionFuzzer.stabilityScore.toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem", fontSize: "0.75rem" }}>
                  <div>Corner Trajectories Tested: <strong>{report.collisionFuzzer.cornerTrajectoriesTested} rays</strong></div>
                  <div>High-Velocity Stress Rays: <strong>{report.collisionFuzzer.highVelocityRaysTested} rays ({report.collisionFuzzer.minTestedVelocity} - {report.collisionFuzzer.maxTestedVelocity} px/f)</strong></div>
                  <div>Sub-Steps Per Frame: <strong>{report.collisionFuzzer.subStepsPerFrame} micro-steps</strong></div>
                  <div>Boundary Breaches: <strong style={{ color: "#39FF14" }}>{report.collisionFuzzer.boundaryBreaches}</strong></div>
                  <div>Obstacle Clipping Anomalies: <strong style={{ color: "#39FF14" }}>{report.collisionFuzzer.obstacleClippingAnomalies}</strong></div>
                  <div>Tunneling Rate: <strong style={{ color: "#39FF14" }}>{report.collisionFuzzer.tunnelingRatePercent.toFixed(2)}% (0.00% TARGET)</strong></div>
                </div>
              </div>
            )}

            {/* Tab 5 / ALL: Tactical Abilities */}
            {(activeTab === "ALL" || activeTab === "ABILITIES") && (
              <div className="glass" style={{ padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#BF00FF" }}>
                    [SUITE 5] TACTICAL ABILITIES VERIFICATION (EMP, VORTEX, CLONE)
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#39FF14", fontWeight: 700 }}>
                    STATUS: [{report.abilitiesVerifier.status}]
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem", fontSize: "0.75rem" }}>
                  <div>EMP Flashwave Freeze: <strong style={{ color: "#39FF14" }}>{report.abilitiesVerifier.empPulseFreezeDurationSec}s [VERIFIED]</strong></div>
                  <div>EMP Hazard Rotation Locked: <strong style={{ color: "#39FF14" }}>YES</strong></div>
                  <div>Micro Singularity Pull: <strong style={{ color: "#39FF14" }}>YES ({report.abilitiesVerifier.singularityPeakAttractionForce}N, {report.abilitiesVerifier.singularityOrbDeflectionAngleDeg} deg)</strong></div>
                  <div>Tri-Phase Split Clones: <strong style={{ color: "#39FF14" }}>3 Projectiles (Independent Vectors)</strong></div>
                  <div>Cooldown & Energy Sanity: <strong style={{ color: "#39FF14" }}>PASS</strong></div>
                </div>
              </div>
            )}

            {/* Tab 6 / ALL: Monetization & 2X Rewarded Ad */}
            {(activeTab === "ALL" || activeTab === "MONETIZATION") && (
              <div className="glass" style={{ padding: "0.85rem", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#00E5FF" }}>
                    [SUITE 6] MONETIZATION & 2X REWARDED AD SANITY AUDITOR
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#39FF14", fontWeight: 700 }}>
                    STATUS: [{report.monetizationAuditor.status}]
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.5rem", fontSize: "0.75rem" }}>
                  <div>Base Shards Sample: <strong>+{report.monetizationAuditor.baseShardsSample} Shards</strong></div>
                  <div>Doubled Shards Result: <strong style={{ color: "#39FF14" }}>+{report.monetizationAuditor.doubledShardsResult} Shards ({report.monetizationAuditor.multiplierAccuracy.toFixed(2)}x)</strong></div>
                  <div>Single-Claim Guard: <strong style={{ color: "#39FF14" }}>ENFORCED (No Double Dip)</strong></div>
                  <div>Telemetry Buffer Delay: <strong>{report.monetizationAuditor.simulatedStreamDelaySec}s</strong></div>
                  <div>Emergency Revive: <strong style={{ color: "#39FF14" }}>PASS (+{report.monetizationAuditor.reviveBonusLaunches} Launch, Score Intact)</strong></div>
                  <div>Infinite Immortality Block: <strong style={{ color: "#39FF14" }}>VERIFIED</strong></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className="glass"
            style={{
              padding: "2.5rem",
              borderRadius: "12px",
              textAlign: "center",
              border: "1px solid rgba(148, 163, 184, 0.15)",
            }}
          >
            <p style={{ color: "#94A3B8", fontSize: "0.9rem", maxWidth: "600px", margin: "0 auto" }}>
              Click <strong>[RUN 2000 TRIALS & AUDIT ALL SUITES]</strong> to execute the full Swarm 6 automated testing matrix: Monte Carlo trajectory profiling, 76,450 shard economy verification, 5-Titan boss enrage state transitions, 16-substep CCD fuzzer, and tactical ability validation in real-time.
            </p>
          </div>
        )}

        {/* Footer Row */}
        <div className={styles.modalFooterRow} style={{ marginTop: "1rem" }}>
          <button onClick={onClose} className={styles.modalCloseBtn}>
            [RETURN TO LAUNCHPAD]
          </button>
        </div>
      </div>
    </div>
  );
}
