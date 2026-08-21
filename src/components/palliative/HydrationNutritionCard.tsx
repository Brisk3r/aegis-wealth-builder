'use client';

import React, { useState } from 'react';
import { 
  Droplet, 
  Utensils, 
  Check, 
  AlertTriangle,
  Plus,
  ShieldAlert
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface HydrationNutritionCardProps {
  carePod: CarePod;
  onLogged: () => void;
}

export default function HydrationNutritionCard({ carePod, onLogged }: HydrationNutritionCardProps) {
  const [fluidAmount, setFluidAmount] = useState<number>(100);
  const [mealDescription, setMealDescription] = useState<string>('Pureed pumpkin soup & apple juice');
  const [appetite, setAppetite] = useState<'Ate All' | 'Ate Most' | 'Picked At Food' | 'Refused Food'>('Ate Most');
  const [swallowDiff, setSwallowDiff] = useState<boolean>(false);
  const [thickenedFluidLevel, setThickenedFluidLevel] = useState<string>('Standard Thin Fluids');
  const [success, setSuccess] = useState<boolean>(false);

  const handleQuickAddFluid = (ml: number) => {
    PalliativeSpeech.triggerHaptic('success');

    PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category: 'fluid_food',
      fluid_ml: ml,
      food_description: `${ml}ml fluid intake (${thickenedFluidLevel})`,
      swallow_difficulty: swallowDiff,
      is_handover_flagged: swallowDiff
    });

    setSuccess(true);
    onLogged();
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleSaveMeal = () => {
    PalliativeSpeech.triggerHaptic('success');

    PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category: 'fluid_food',
      fluid_ml: fluidAmount,
      food_description: mealDescription,
      appetite_level: appetite,
      swallow_difficulty: swallowDiff,
      is_handover_flagged: swallowDiff
    });

    setSuccess(true);
    onLogged();
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className={styles.card} style={{ borderTop: '4px solid #38BDF8' }}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>
            <Droplet size={20} style={{ color: '#38BDF8' }} />
            <span>Hydration & Nutrition Tracker</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Monitor daily fluid intake, thickened liquid levels, and aspiration risk
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
            <Check size={14} /> Recorded Intake
          </span>
        )}
      </div>

      {/* 1-Tap Quick Fluid Buttons */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.5rem' }}>
          1-Tap Quick Fluid Intake
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.6rem' }}>
          {[30, 60, 120, 200, 250].map((ml) => (
            <button
              key={ml}
              onClick={() => handleQuickAddFluid(ml)}
              style={{
                minHeight: '46px',
                padding: '0.4rem',
                borderRadius: '14px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                background: 'rgba(56, 189, 248, 0.1)',
                color: '#38BDF8',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                touchAction: 'manipulation'
              }}
            >
              <Plus size={14} /> {ml}ml
            </button>
          ))}
        </div>
      </div>

      {/* Swallowing Alert Checkbox */}
      <div style={{
        background: swallowDiff ? 'rgba(231, 111, 81, 0.15)' : 'rgba(0, 0, 0, 0.2)',
        border: `1px solid ${swallowDiff ? '#E76F51' : 'var(--p-border)'}`,
        padding: '0.75rem 1rem',
        borderRadius: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        cursor: 'pointer'
      }} onClick={() => setSwallowDiff(!swallowDiff)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} style={{ color: swallowDiff ? '#E76F51' : '#94A3B8' }} />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: swallowDiff ? '#E76F51' : '#F0EDE8' }}>
              Swallowing Difficulty / Coughing on Liquids
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Flags incoming shift carers and speech pathologist
            </div>
          </div>
        </div>

        <button
          type="button"
          style={{
            padding: '0.25rem 0.65rem',
            borderRadius: '20px',
            border: 'none',
            background: swallowDiff ? '#E76F51' : 'rgba(255,255,255,0.1)',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {swallowDiff ? 'Flagged Alert' : 'No Coughing'}
        </button>
      </div>

      {/* Meal Entry Form */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Meal description (e.g. Scrambled eggs + 100ml tea)"
          value={mealDescription}
          onChange={(e) => setMealDescription(e.target.value)}
          style={{ flex: 1, margin: 0, minWidth: '200px' }}
        />
        <button
          onClick={handleSaveMeal}
          style={{
            minHeight: '48px',
            padding: '0 1.25rem',
            borderRadius: '12px',
            border: 'none',
            background: '#2A9D8F',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <Utensils size={16} /> Log Meal
        </button>
      </div>
    </div>
  );
}
