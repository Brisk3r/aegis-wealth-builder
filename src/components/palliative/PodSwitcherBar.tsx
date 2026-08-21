'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Users, 
  Heart, 
  Dog, 
  Backpack, 
  Bandage, 
  Baby, 
  Settings, 
  Check, 
  ChevronRight, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, CarePodArchetype, CareWidgetType } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface PodSwitcherBarProps {
  pods: CarePod[];
  activePodId: string;
  onSelectPod: (podId: string) => void;
  onPodCreated: () => void;
  onOpenWidgetCustomizer: () => void;
}

export default function PodSwitcherBar({
  pods,
  activePodId,
  onSelectPod,
  onPodCreated,
  onOpenWidgetCustomizer,
}: PodSwitcherBarProps) {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Pod Form State
  const [newArchetype, setNewArchetype] = useState<CarePodArchetype>('pet_care');
  const [newName, setNewName] = useState<string>('');
  const [newSubtitle, setNewSubtitle] = useState<string>('');
  const [newEmoji, setNewEmoji] = useState<string>('[PET]');
  const [newNotes, setNewNotes] = useState<string>('');

  const archetypesList: Array<{
    id: CarePodArchetype;
    label: string;
    emoji: string;
    desc: string;
    defaultWidgets: CareWidgetType[];
  }> = [
    {
      id: 'palliative',
      label: 'Palliative & Elder Care',
      emoji: '[SENIOR]',
      desc: 'End-of-life comfort, PRN lockouts, 30 deg turn schedule, syringe driver, SBAR.',
      defaultWidgets: ['medication_safety', 'feeding_nutrition', 'hygiene_grooming', 'activity_turns_walks', 'elimination_diapers', 'vitals_symptoms', 'sbar_handover', 'syringe_driver', 'emergency_contacts', 'clinical_dossier']
    },
    {
      id: 'pet_care',
      label: 'Shared Pet & Animal Care',
      emoji: '[PET]',
      desc: 'Kibble feeding, dog walks, flea/tick meds, grooming baths, vet emergency.',
      defaultWidgets: ['feeding_nutrition', 'activity_turns_walks', 'hygiene_grooming', 'medication_safety', 'elimination_diapers', 'sbar_handover', 'emergency_contacts', 'clinical_dossier']
    },
    {
      id: 'child_custody',
      label: 'Joint Child Custody',
      emoji: '[CHILD]',
      desc: 'Co-parenting handover, school pickup, asthma/allergy meds, homework checklist.',
      defaultWidgets: ['custody_checklist', 'medication_safety', 'feeding_nutrition', 'activity_turns_walks', 'vitals_symptoms', 'sbar_handover', 'emergency_contacts']
    },
    {
      id: 'post_op',
      label: 'Post-Surgery / Rehab',
      emoji: '[RECOVERY]',
      desc: 'Post-op recovery, physical therapy exercises, ice compression, pain meds.',
      defaultWidgets: ['medication_safety', 'activity_turns_walks', 'hygiene_grooming', 'vitals_symptoms', 'sbar_handover', 'emergency_contacts']
    },
    {
      id: 'infant_care',
      label: 'Infant & Newborn Care',
      emoji: '**',
      desc: 'Nursing / formula ml, wet/dirty diapers, sleep intervals, tummy time.',
      defaultWidgets: ['feeding_nutrition', 'elimination_diapers', 'activity_turns_walks', 'hygiene_grooming', 'vitals_symptoms', 'sbar_handover', 'emergency_contacts']
    },
  ];

  const handleArchetypeSelect = (arch: CarePodArchetype) => {
    setNewArchetype(arch);
    const selected = archetypesList.find(a => a.id === arch);
    if (selected) {
      setNewEmoji(selected.emoji);
      if (arch === 'pet_care') {
        setNewName('Luna');
        setNewSubtitle('Senior Cat * Shared Pet Parenting');
        setNewNotes('Feed 1 can wet food morning and night. Insulin 2 units with dinner.');
      } else if (arch === 'child_custody') {
        setNewName('Oliver');
        setNewSubtitle('8yo * Joint Custody Handover');
        setNewNotes('Pickup from karate on Thursdays 4:30pm. Math workbook due Friday.');
      } else if (arch === 'post_op') {
        setNewName('Alex');
        setNewSubtitle('Shoulder Arthroscopy Rehab');
        setNewNotes('Sling on during day, pendulum swings 3x10 reps, ice 20 min.');
      } else if (arch === 'infant_care') {
        setNewName('Baby Noah');
        setNewSubtitle('2 Months Old * Feeding & Sleep');
        setNewNotes('90ml formula every 3 hours. Tummy time 10 mins after morning nap.');
      }
    }
  };

  const handleCreatePod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    PalliativeSpeech.triggerHaptic('success');
    const selectedArch = archetypesList.find(a => a.id === newArchetype);
    
    PalliativeDb.addCarePod({
      patient_display_name: newName,
      archetype: newArchetype,
      avatar_emoji: newEmoji,
      theme_color: newArchetype === 'pet_care' ? '#f59e0b' : newArchetype === 'child_custody' ? '#a855f7' : newArchetype === 'post_op' ? '#10b981' : '#00f0ff',
      subtitle: newSubtitle || `${newName} Care Pod`,
      advance_care_plan_notes: newNotes,
      enabled_widgets: selectedArch ? selectedArch.defaultWidgets : ['medication_safety', 'feeding_nutrition', 'sbar_handover', 'emergency_contacts'],
    });

    setShowCreateModal(false);
    onPodCreated();
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Pod Switcher Deck */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={18} style={{ color: 'var(--p-accent)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--p-text-secondary)' }}>
            ACTIVE CARE PODS ({pods.length})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenWidgetCustomizer(); }}
            className="btn-secondary"
            style={{ minHeight: '38px', padding: '0.35rem 0.8rem', fontSize: '0.8rem', gap: '0.4rem' }}
          >
            <SlidersHorizontal size={14} /> Customize Widgets
          </button>

          <button
            onClick={() => { PalliativeSpeech.triggerHaptic('light'); setShowCreateModal(true); }}
            className="btn-primary"
            style={{ minHeight: '38px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}
          >
            <Plus size={14} /> New Care Pod
          </button>
        </div>
      </div>

      {/* Pod Chips Carousel / Grid */}
      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
        {pods.map(pod => {
          const isActive = pod.id === activePodId;
          return (
            <button
              key={pod.id}
              onClick={() => {
                PalliativeSpeech.triggerHaptic('medium');
                PalliativeDb.setActivePodId(pod.id);
                onSelectPod(pod.id);
              }}
              style={{
                minHeight: '56px',
                minWidth: '220px',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: isActive ? `2px solid ${pod.theme_color || 'var(--p-accent)'}` : '1px solid var(--p-border)',
                background: isActive ? 'var(--p-pill-bg)' : 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isActive ? `0 0 15px rgba(0, 240, 255, 0.2)` : 'none'
              }}
            >
              <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>
                {pod.avatar_emoji || '**'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--p-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pod.patient_display_name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--p-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {pod.subtitle || pod.archetype.replace('_', ' ')}
                </div>
              </div>
              {isActive && <Check size={16} style={{ color: pod.theme_color || 'var(--p-accent)', flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      {/* Create New Pod Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--p-text-primary)' }}>
              Create New Care Pod
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', marginBottom: '1.25rem' }}>
              Set up a shared care hub for a family elder, pet, joint-custody child, or recovery plan.
            </p>

            {/* Archetype Selector Cards */}
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--p-text-secondary)' }}>
              SELECT CARE TEMPLATE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
              {archetypesList.map(arch => (
                <button
                  key={arch.id}
                  type="button"
                  onClick={() => handleArchetypeSelect(arch.id)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '10px',
                    border: newArchetype === arch.id ? '2px solid var(--p-accent)' : '1px solid var(--p-border)',
                    background: newArchetype === arch.id ? 'var(--p-pill-bg)' : 'rgba(0, 0, 0, 0.25)',
                    color: 'var(--p-text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{arch.emoji}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{arch.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCreatePod}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                    EMOJI
                  </label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    style={{ textAlign: 'center', fontSize: '1.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                    NAME / SUBJECT
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.inputField}
                    placeholder="e.g. Barnaby / Leo / Mom"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                SUBTITLE / ROLE DESCRIPTION
              </label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g. 4yo Golden Retriever * Shared Pet Care"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
              />

              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                CARE INSTRUCTIONS & ROUTINE NOTES
              </label>
              <textarea
                className={styles.textareaField}
                rows={2}
                placeholder="e.g. Feeding times, walk schedule, school pickup details, allergies..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={styles.chipBtn}
                  style={{ justifyContent: 'center', minHeight: '48px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ minHeight: '48px', justifyContent: 'center', fontWeight: 700 }}
                >
                  <Check size={18} /> Launch New Care Pod
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
