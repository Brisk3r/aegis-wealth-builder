"use client";

import React, { useState } from "react";
import { soundManager } from "@/lib/gameEngine/audio";
import styles from "./KineticGame.module.css";

interface PauseMenuModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenTech: () => void;
  onOpenHangar: () => void;
}

export default function PauseMenuModal({
  onResume,
  onRestart,
  onOpenTech,
  onOpenHangar,
}: PauseMenuModalProps) {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundManager.getMuted());
  const [sfxVol, setSfxVol] = useState<number>(0.8);
  const [musicVol, setMusicVol] = useState<number>(0.4);

  const handleMuteToggle = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundManager.setSfxVolume(val);
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    soundManager.setMusicVolume(val);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={`${styles.pauseModalContainer} glass`}>
        <div className={styles.modalHeaderRow}>
          <div>
            <div className={styles.categoryBadge}>TACTICAL SUSPENSION</div>
            <h2 className={styles.modalTitle}>SYSTEM PAUSED // CONTROL ARRAY</h2>
          </div>
        </div>

        <div className={styles.pauseAudioControls}>
          <h4 className={styles.pauseSectionTitle}>AUDIO SYNTHESIS CONTROLS</h4>

          <div className={styles.volumeRow}>
            <span>SFX Synthesizer</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={sfxVol}
              onChange={handleSfxChange}
              className={styles.volumeSlider}
            />
            <span>{Math.round(sfxVol * 100)}%</span>
          </div>

          <div className={styles.volumeRow}>
            <span>Music Pad Loop</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={musicVol}
              onChange={handleMusicChange}
              className={styles.volumeSlider}
            />
            <span>{Math.round(musicVol * 100)}%</span>
          </div>

          <button onClick={handleMuteToggle} className={styles.muteToggleBtn}>
            {isMuted ? "[AUDIO MUTED - CLICK TO UNMUTE]" : "[AUDIO ACTIVE - CLICK TO MUTE]"}
          </button>

          {/* Interactive Procedural Audio Soundboard */}
          <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#39FF14" }}>PROCEDURAL FM SYNTH SOUNDBOARD</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.4rem" }}>
              <button onClick={() => soundManager.playBumperHit(1, "STANDARD")} className={styles.deckNavBtn} style={{ padding: "0.4rem", fontSize: "0.72rem" }}>
                [C4 Bell Ping]
              </button>
              <button onClick={() => soundManager.playBumperHit(5, "BOUNCE_SUPER")} className={styles.deckNavBtn} style={{ padding: "0.4rem", fontSize: "0.72rem" }}>
                [A4 Super Chord]
              </button>
              <button onClick={() => soundManager.playBumperHit(10, "GOLDEN_CORE")} className={styles.deckNavBtn} style={{ padding: "0.4rem", fontSize: "0.72rem" }}>
                [C6 Apex Chime]
              </button>
              <button onClick={() => soundManager.playExplosion("MASSIVE")} className={styles.deckNavBtn} style={{ padding: "0.4rem", fontSize: "0.72rem" }}>
                [Sub-Bass Boom]
              </button>
              <button onClick={() => soundManager.playShieldDeflect()} className={styles.deckNavBtn} style={{ padding: "0.4rem", fontSize: "0.72rem" }}>
                [Shield Deflect]
              </button>
              <button onClick={() => soundManager.playOverdriveActivate()} className={styles.deckNavBtn} style={{ padding: "0.4rem", fontSize: "0.72rem" }}>
                [Hyperdrive Ramp]
              </button>
              <button onClick={() => soundManager.playDraftSelect()} className={styles.deckNavBtn} style={{ padding: "0.4rem", fontSize: "0.72rem" }}>
                [Triad Arpeggio]
              </button>
            </div>
          </div>
        </div>

        <div className={styles.pauseControlsGuide}>
          <h4 className={styles.pauseSectionTitle}>PILOT CONTROLS GUIDE</h4>
          <div className={styles.controlGrid}>
            <div className={styles.controlItem}>
              <span className={styles.ctrlKey}>DRAG & RELEASE</span>
              <span className={styles.ctrlAction}>Aim Slingshot Trajectory</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.ctrlKey}>SPACEBAR / [OVERDRIVE]</span>
              <span className={styles.ctrlAction}>Trigger Supernova Blast</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.ctrlKey}>[ESC] / [P]</span>
              <span className={styles.ctrlAction}>Pause / Resume Simulation</span>
            </div>
          </div>
        </div>

        <div className={styles.pauseActionsGrid}>
          <button onClick={onResume} className={styles.btnRestartPrimary}>
            [RESUME TRAJECTORY]
          </button>
          <button onClick={onRestart} className={styles.btnSecondaryNav}>
            [RESTART MISSION]
          </button>
          <button onClick={onOpenTech} className={styles.btnSecondaryNav}>
            [TECH MATRIX]
          </button>
          <button onClick={onOpenHangar} className={styles.btnSecondaryNav}>
            [FLEET HANGAR]
          </button>
        </div>
      </div>
    </div>
  );
}
