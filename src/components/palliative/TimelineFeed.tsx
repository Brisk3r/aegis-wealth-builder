'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Pill, 
  Sparkles, 
  Droplet, 
  RotateCcw, 
  Smile, 
  Mic, 
  Search, 
  Flag, 
  Trash2, 
  Clock, 
  User, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import styles from './palliative.module.css';
import { CareLog, LogCategory } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

export default function TimelineFeed() {
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refreshLogs = () => {
    setLogs(PalliativeDb.getCareLogs());
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const handleToggleFlag = (logId: string) => {
    PalliativeSpeech.triggerHaptic('medium');
    PalliativeDb.toggleLogHandoverFlag(logId);
    refreshLogs();
  };

  const handleDelete = (logId: string) => {
    if (confirm('Are you sure you want to remove this log entry?')) {
      PalliativeSpeech.triggerHaptic('warning');
      PalliativeDb.deleteCareLog(logId);
      refreshLogs();
    }
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (selectedCategory !== 'all' && log.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = [
        log.medication_name,
        log.dose_administered,
        log.prn_reason,
        log.comfort_action,
        log.food_description,
        log.position,
        log.skin_check_notes,
        log.free_text_note,
        log.logged_by_name,
      ].filter(Boolean).join(' ').toLowerCase();

      return matchText.includes(q);
    }
    return true;
  });

  const getCategoryIcon = (cat: LogCategory) => {
    switch (cat) {
      case 'medication': return <Pill size={16} style={{ color: 'var(--p-accent-orange)' }} />;
      case 'comfort': return <Sparkles size={16} style={{ color: 'var(--p-accent)' }} />;
      case 'fluid_food': return <Droplet size={16} style={{ color: '#38bdf8' }} />;
      case 'reposition': return <RotateCcw size={16} style={{ color: 'var(--p-accent-green)' }} />;
      case 'bowel_bladder': return <Activity size={16} style={{ color: '#c084fc' }} />;
      case 'symptom': return <Smile size={16} style={{ color: 'var(--p-accent-red)' }} />;
      case 'syringe_driver': return <Activity size={16} style={{ color: 'var(--p-accent)' }} />;
      default: return <Mic size={16} style={{ color: 'var(--p-text-secondary)' }} />;
    }
  };

  return (
    <div>
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} style={{ color: 'var(--p-accent)' }} />
            Single Timeline Care Stream
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
            Real-time chronological feed of bedside actions, symptoms, and observations.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '16px', color: 'var(--p-text-muted)' }} />
          <input
            type="text"
            className={styles.inputField}
            style={{ paddingLeft: '2.4rem', margin: 0 }}
            placeholder="Search logs, meds, carers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className={styles.btnGroup} style={{ marginBottom: '1.5rem' }}>
        {[
          { id: 'all', label: 'All Logs' },
          { id: 'medication', label: 'Medications' },
          { id: 'comfort', label: 'Comfort Care' },
          { id: 'reposition', label: 'Turns & Skin' },
          { id: 'fluid_food', label: 'Fluids / Food' },
          { id: 'bowel_bladder', label: 'Elimination' },
          { id: 'symptom', label: 'ESAS-r Scores' },
          { id: 'note', label: 'Notes & Voice' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => { PalliativeSpeech.triggerHaptic('light'); setSelectedCategory(cat.id); }}
            className={`${styles.chipBtn} ${selectedCategory === cat.id ? styles.chipBtnActive : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Log Feed Items */}
      {filteredLogs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredLogs.map(log => {
            const dateObj = new Date(log.logged_at);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={log.id}
                className={styles.card}
                style={{
                  margin: 0,
                  borderLeft: log.is_handover_flagged ? '4px solid var(--p-accent-red)' : undefined,
                  background: log.is_handover_flagged ? 'rgba(239, 68, 68, 0.05)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {/* Category & Carer Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--p-pill-bg)', padding: '0.4rem 0.65rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700 }}>
                      {getCategoryIcon(log.category)}
                      <span style={{ textTransform: 'capitalize' }}>{log.category.replace('_', ' ')}</span>
                    </div>

                    <span style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <User size={14} /> {log.logged_by_name}
                    </span>
                  </div>

                  {/* Timestamp & Flag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--p-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> {timeStr} ({dateStr})
                    </span>

                    {/* Flag Handover Button */}
                    <button
                      onClick={() => handleToggleFlag(log.id)}
                      title={log.is_handover_flagged ? 'Unflag handover' : 'Flag for Handover Briefing'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: log.is_handover_flagged ? 'var(--p-accent-red)' : 'var(--p-text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <Flag size={18} fill={log.is_handover_flagged ? 'var(--p-accent-red)' : 'none'} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(log.id)}
                      title="Delete log"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--p-text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Log Details Content */}
                <div style={{ fontSize: '0.9rem', color: 'var(--p-text-primary)', lineHeight: 1.5 }}>
                  {/* Medication */}
                  {log.category === 'medication' && (
                    <div>
                      <strong>{log.medication_name}</strong> ({log.dose_administered})
                      {log.prn_reason && <span style={{ color: 'var(--p-text-secondary)' }}> * Reason: {log.prn_reason}</span>}
                    </div>
                  )}

                  {/* Comfort */}
                  {log.category === 'comfort' && (
                    <div>
                      <strong>Comfort Action:</strong> {log.comfort_action}
                    </div>
                  )}

                  {/* Repositioning */}
                  {log.category === 'reposition' && (
                    <div>
                      <strong>Turned to:</strong> {log.position}
                      {log.skin_check_notes && <div style={{ color: 'var(--p-text-secondary)', fontSize: '0.85rem' }}>Skin check: {log.skin_check_notes}</div>}
                    </div>
                  )}

                  {/* Fluids & Food */}
                  {log.category === 'fluid_food' && (
                    <div>
                      <strong>Fluid:</strong> {log.fluid_ml} ml {log.food_description ? `* ${log.food_description}` : ''}
                      {log.swallow_difficulty && <span style={{ color: 'var(--p-accent-red)', fontWeight: 700 }}> [!] Swallowing difficulty</span>}
                    </div>
                  )}

                  {/* Bowel / Bladder */}
                  {log.category === 'bowel_bladder' && (
                    <div>
                      {log.bowel_movement && <div>[BM] <strong>Bowel Movement</strong> {log.bristol_stool_type ? `(Bristol Type ${log.bristol_stool_type})` : ''}</div>}
                      {log.urine_output && <div>Urine: {log.urine_output} {log.urine_ml ? `(~${log.urine_ml}ml)` : ''}</div>}
                    </div>
                  )}

                  {/* Symptoms */}
                  {log.category === 'symptom' && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: 'var(--p-text-secondary)' }}>
                      {typeof log.pain_score === 'number' && <div>Pain: <strong style={{ color: log.pain_score >= 5 ? 'var(--p-accent-red)' : 'var(--p-accent)' }}>{log.pain_score}/10</strong></div>}
                      {typeof log.breathlessness_score === 'number' && <div>Breathlessness: <strong>{log.breathlessness_score}/10</strong></div>}
                      {typeof log.agitation_score === 'number' && <div>Agitation: <strong>{log.agitation_score}/10</strong></div>}
                      {log.secretions_level && <div>Secretions: <strong>{log.secretions_level}</strong></div>}
                    </div>
                  )}

                  {/* Free Text Note */}
                  {log.free_text_note && (
                    <div style={{ marginTop: '0.4rem', color: 'var(--p-text-primary)', fontStyle: 'italic' }}>
                      &ldquo;{log.free_text_note}&rdquo;
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
          <Activity size={36} style={{ color: 'var(--p-text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--p-text-secondary)', marginBottom: '0.25rem' }}>
            No Matching Care Logs Found
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--p-text-muted)' }}>
            Use the 5-second quick log buttons at the top to record your first bedside observation.
          </p>
        </div>
      )}
    </div>
  );
}
