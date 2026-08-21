'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Smile, 
  Frown, 
  Meh, 
  Check, 
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface SymptomAssessmentCardProps {
  carePod: CarePod;
  onSaved: () => void;
}

export default function SymptomAssessmentCard({ carePod, onSaved }: SymptomAssessmentCardProps) {
  const [pain, setPain] = useState<number>(2);
  const [tiredness, setTiredness] = useState<number>(3);
  const [drowsiness, setDrowsiness] = useState<number>(2);
  const [nausea, setNausea] = useState<number>(0);
  const [appetite, setAppetite] = useState<number>(4);
  const [breathlessness, setBreathlessness] = useState<number>(1);
  const [anxiety, setAnxiety] = useState<number>(1);
  const [wellbeing, setWellbeing] = useState<number>(3);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveAssessment = () => {
    PalliativeSpeech.triggerHaptic('success');

    PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category: 'symptom',
      pain_score: pain,
      breathlessness_score: breathlessness,
      agitation_score: anxiety,
      nausea_score: nausea,
      drowsiness_score: drowsiness,
      free_text_note: `ESAS-r Comfort Assessment: Pain ${pain}/10, Breathlessness ${breathlessness}/10, Nausea ${nausea}/10, Anxiety ${anxiety}/10, Overall Wellbeing ${wellbeing}/10`,
      is_handover_flagged: pain >= 5 || breathlessness >= 4
    });

    setSavedSuccess(true);
    onSaved();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return '#6B9080';
    if (score <= 6) return '#E9C46A';
    return '#E76F51';
  };

  return (
    <div className={styles.card} style={{ borderTop: '4px solid #2A9D8F' }}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>
            <Activity size={20} style={{ color: '#2A9D8F' }} />
            <span>ESAS-r Clinical Comfort & Symptom Assessment</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Validated Edmonton Symptom Assessment System * 0 (None) to 10 (Worst Possible)
          </span>
        </div>

        {savedSuccess && (
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
            <Check size={14} /> Recorded to Patient Chart
          </span>
        )}
      </div>

      {/* Symptom Sliders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Pain */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: '#F0EDE8' }}>Pain Discomfort</span>
            <span style={{ color: getScoreColor(pain), fontWeight: 700 }}>{pain} / 10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={pain}
            onChange={(e) => setPain(Number(e.target.value))}
            style={{ width: '100%', accentColor: getScoreColor(pain) }}
          />
        </div>

        {/* Shortness of Breath */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: '#F0EDE8' }}>Shortness of Breath (Dyspnea)</span>
            <span style={{ color: getScoreColor(breathlessness), fontWeight: 700 }}>{breathlessness} / 10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={breathlessness}
            onChange={(e) => setBreathlessness(Number(e.target.value))}
            style={{ width: '100%', accentColor: getScoreColor(breathlessness) }}
          />
        </div>

        {/* Nausea */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: '#F0EDE8' }}>Nausea / Sickness</span>
            <span style={{ color: getScoreColor(nausea), fontWeight: 700 }}>{nausea} / 10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={nausea}
            onChange={(e) => setNausea(Number(e.target.value))}
            style={{ width: '100%', accentColor: getScoreColor(nausea) }}
          />
        </div>

        {/* Anxiety / Restlessness */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: '#F0EDE8' }}>Anxiety / Agitation</span>
            <span style={{ color: getScoreColor(anxiety), fontWeight: 700 }}>{anxiety} / 10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={anxiety}
            onChange={(e) => setAnxiety(Number(e.target.value))}
            style={{ width: '100%', accentColor: getScoreColor(anxiety) }}
          />
        </div>

        {/* Tiredness */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: '#F0EDE8' }}>Tiredness / Fatigue</span>
            <span style={{ color: getScoreColor(tiredness), fontWeight: 700 }}>{tiredness} / 10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={tiredness}
            onChange={(e) => setTiredness(Number(e.target.value))}
            style={{ width: '100%', accentColor: getScoreColor(tiredness) }}
          />
        </div>

        {/* Overall Well-being */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ color: '#F0EDE8' }}>Overall Well-being</span>
            <span style={{ color: getScoreColor(wellbeing), fontWeight: 700 }}>{wellbeing} / 10</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={wellbeing}
            onChange={(e) => setWellbeing(Number(e.target.value))}
            style={{ width: '100%', accentColor: getScoreColor(wellbeing) }}
          />
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSaveAssessment}
          style={{
            minHeight: '44px',
            padding: '0 1.5rem',
            borderRadius: '24px',
            border: 'none',
            background: '#2A9D8F',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <Check size={16} /> Record ESAS-r Assessment
        </button>
      </div>
    </div>
  );
}
