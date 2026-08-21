'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  Clock, 
  ShieldCheck, 
  Check, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, BodyPosition } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface RepositionTrackerCardProps {
  carePod: CarePod;
  onTurnLogged: () => void;
}

export default function RepositionTrackerCard({ carePod, onTurnLogged }: RepositionTrackerCardProps) {
  const [selectedPosition, setSelectedPosition] = useState<BodyPosition>('Left Side (30 deg)');
  const [skinNotes, setSkinNotes] = useState<string>('Sacrum and heels inspected - clear, barrier cream applied.');
  const [barrierCreamApplied, setBarrierCreamApplied] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);

  const positions: Array<{ id: BodyPosition; label: string; iconEmoji: string }> = [
    { id: 'Left Side (30 deg)', label: 'Left 30 deg Tilt', iconEmoji: '***' },
    { id: 'Right Side (30 deg)', label: 'Right 30 deg Tilt', iconEmoji: '***' },
    { id: 'Back', label: 'Supine (Back)', iconEmoji: '**' },
    { id: 'Head Elevated (45 deg)', label: 'Semi-Fowler 45 deg', iconEmoji: '***' },
  ];

  const handleLogTurn = (pos: BodyPosition) => {
    PalliativeSpeech.triggerHaptic('success');
    setSelectedPosition(pos);

    PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category: 'reposition',
      position: pos,
      skin_check_notes: `${skinNotes} ${barrierCreamApplied ? '(Barrier cream applied)' : ''}`,
      free_text_note: `Turned patient to ${pos}.`
    });

    setSuccess(true);
    onTurnLogged();
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className={styles.card} style={{ borderTop: '4px solid #6B9080' }}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>
            <RotateCcw size={20} style={{ color: '#6B9080' }} />
            <span>30 deg Pressure Injury Prevention & Tilt Scheduler</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Rotate positions every 2 hours to relieve sacrum, hip, and heel pressure
          </span>
        </div>

        {success && (
          <span style={{
            background: 'rgba(107, 144, 128, 0.2)',
            color: '#6B9080',
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            <Check size={14} /> Turn Logged & Timer Reset
          </span>
        )}
      </div>

      {/* 4 Position Selection Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {positions.map((p) => {
          const isSelected = selectedPosition === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleLogTurn(p.id)}
              style={{
                minHeight: '80px',
                padding: '0.75rem 0.5rem',
                borderRadius: '16px',
                border: `1.5px solid ${isSelected ? '#6B9080' : 'var(--p-border)'}`,
                background: isSelected ? 'rgba(107, 144, 128, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                color: isSelected ? '#6B9080' : '#F0EDE8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                touchAction: 'manipulation'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{p.iconEmoji}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{p.label}</span>
            </button>
          );
        })}
      </div>

      {/* Skin Care & Barrier Cream Options */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.2)',
        padding: '0.85rem 1rem',
        borderRadius: '14px',
        border: '1px solid var(--p-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} style={{ color: '#6B9080' }} />
          <span style={{ fontSize: '0.85rem', color: '#F0EDE8' }}>
            Barrier Cream applied to sacrum & pressure points
          </span>
        </div>

        <button
          onClick={() => setBarrierCreamApplied(!barrierCreamApplied)}
          style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '20px',
            border: `1px solid ${barrierCreamApplied ? '#6B9080' : 'var(--p-border)'}`,
            background: barrierCreamApplied ? 'rgba(107, 144, 128, 0.2)' : 'transparent',
            color: barrierCreamApplied ? '#6B9080' : '#94A3B8',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {barrierCreamApplied ? '[OK] Applied' : '+ Not Applied'}
        </button>
      </div>
    </div>
  );
}
