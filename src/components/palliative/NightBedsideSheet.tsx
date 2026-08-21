'use client';

import React, { useState } from 'react';
import { 
  Moon, 
  X, 
  Pill, 
  RotateCcw, 
  Droplet, 
  Sparkles, 
  Check, 
  ShieldAlert, 
  Activity, 
  Heart,
  Volume2
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, Medication } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface NightBedsideSheetProps {
  carePod: CarePod;
  onClose: () => void;
  onLogSaved: () => void;
}

export default function NightBedsideSheet({
  carePod,
  onClose,
  onLogSaved
}: NightBedsideSheetProps) {
  const [activeTheme, setActiveTheme] = useState<'amber' | 'dim_red'>('amber');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const medications = PalliativeDb.getMedications(carePod.id);

  const handleQuickLogAction = (
    category: any, 
    actionName: string, 
    extraPayload: any = {}
  ) => {
    PalliativeSpeech.triggerHaptic('success');

    PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category,
      ...extraPayload,
      free_text_note: `Night Bedside Log: ${actionName}`,
    });

    setSuccessMessage(`[OK] Recorded: ${actionName}`);
    onLogSaved();

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const bgStyle = activeTheme === 'amber' 
    ? 'rgba(28, 20, 10, 0.98)' 
    : 'rgba(28, 10, 10, 0.98)';
  const accentColor = activeTheme === 'amber' ? '#E9C46A' : '#E76F51';
  const textColor = activeTheme === 'amber' ? '#FEF3C7' : '#FEE2E2';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(16px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: bgStyle,
          border: `2px solid ${accentColor}`,
          borderRadius: '28px',
          width: '100%',
          maxWidth: '560px',
          padding: '1.75rem',
          boxShadow: `0 20px 50px rgba(0, 0, 0, 0.8)`,
          color: textColor
        }}
      >
        {/* Night Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: textColor }}>
              <Moon size={22} style={{ color: accentColor }} />
              3AM Bedside Rapid Logger
            </h2>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              Oversized 1-tap logging for {carePod.patient_display_name} * Zero typing needed
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTheme(activeTheme === 'amber' ? 'dim_red' : 'amber')}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${accentColor}`,
                color: textColor,
                borderRadius: '16px',
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {activeTheme === 'amber' ? '** Warm Amber' : '[LIVE] Low-Glare Red'}
            </button>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: textColor, cursor: 'pointer', padding: '0.25rem' }}
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage ? (
          <div style={{
            background: 'rgba(107, 144, 128, 0.25)',
            border: '1px solid #6B9080',
            color: '#6B9080',
            padding: '1.5rem',
            borderRadius: '20px',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <Check size={26} /> {successMessage}
          </div>
        ) : (
          /* Oversized 64px 1-Tap Bedside Action Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            
            {/* Action 1: Morphine / Primary PRN Med */}
            <button
              onClick={() => {
                const med = medications[0];
                handleQuickLogAction('medication', `${med ? med.name : 'PRN Med'} (Given)`, {
                  medication_name: med ? med.name : 'PRN Pain Medication',
                  dose_administered: med ? med.dosage : 'Standard Dose',
                  is_prn: true,
                  prn_reason: 'Night Breakthrough Discomfort'
                });
              }}
              style={{
                minHeight: '68px',
                background: 'rgba(231, 111, 81, 0.2)',
                border: '2px solid #E76F51',
                borderRadius: '18px',
                color: textColor,
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <Pill size={22} style={{ color: '#E76F51' }} />
              <span>Give PRN Med</span>
            </button>

            {/* Action 2: 30 deg Turn Right */}
            <button
              onClick={() => handleQuickLogAction('reposition', 'Turned to Right Side (30 deg)', {
                position: 'Right Side (30 deg)',
                skin_check_notes: 'Turned at bedside, comfortable.'
              })}
              style={{
                minHeight: '68px',
                background: 'rgba(107, 144, 128, 0.2)',
                border: '2px solid #6B9080',
                borderRadius: '18px',
                color: textColor,
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <RotateCcw size={22} style={{ color: '#6B9080' }} />
              <span>Turn Right (30 deg)</span>
            </button>

            {/* Action 3: 30 deg Turn Left */}
            <button
              onClick={() => handleQuickLogAction('reposition', 'Turned to Left Side (30 deg)', {
                position: 'Left Side (30 deg)',
                skin_check_notes: 'Turned at bedside, comfortable.'
              })}
              style={{
                minHeight: '68px',
                background: 'rgba(107, 144, 128, 0.2)',
                border: '2px solid #6B9080',
                borderRadius: '18px',
                color: textColor,
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <RotateCcw size={22} style={{ color: '#6B9080' }} />
              <span>Turn Left (30 deg)</span>
            </button>

            {/* Action 4: Oral Mouth Swab */}
            <button
              onClick={() => handleQuickLogAction('comfort', 'Oral Mouth Swab & Lips Moistened', {
                comfort_action: 'Mouth swab/care'
              })}
              style={{
                minHeight: '68px',
                background: 'rgba(42, 157, 143, 0.2)',
                border: '2px solid #2A9D8F',
                borderRadius: '18px',
                color: textColor,
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <Sparkles size={22} style={{ color: '#2A9D8F' }} />
              <span>Mouth Swab</span>
            </button>

            {/* Action 5: Small Sip Water (30ml) */}
            <button
              onClick={() => handleQuickLogAction('fluid_food', 'Sip of Water (30ml)', {
                fluid_ml: 30,
                food_description: '30ml water via sponge/straw'
              })}
              style={{
                minHeight: '68px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '2px solid #38BDF8',
                borderRadius: '18px',
                color: textColor,
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <Droplet size={22} style={{ color: '#38BDF8' }} />
              <span>Sip Water (30ml)</span>
            </button>

            {/* Action 6: Incontinence / Diaper Changed */}
            <button
              onClick={() => handleQuickLogAction('bowel_bladder', 'Pad Changed & Skin Cleaned', {
                urine_output: 'Incontinence Pad Changed',
                skin_check_notes: 'Skin dry and barrier cream applied.'
              })}
              style={{
                minHeight: '68px',
                background: 'rgba(148, 163, 184, 0.2)',
                border: '2px solid #94A3B8',
                borderRadius: '18px',
                color: textColor,
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}
            >
              <Activity size={22} style={{ color: '#94A3B8' }} />
              <span>Pad Changed</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', opacity: 0.7 }}>
          Syncs instantly to family co-carers * Closes automatically upon logging
        </div>
      </div>
    </div>
  );
}
