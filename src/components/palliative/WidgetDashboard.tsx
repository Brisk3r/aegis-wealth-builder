'use client';

import React, { useState } from 'react';
import { 
  Pill, 
  Utensils, 
  RotateCcw, 
  Dog, 
  Bath, 
  Activity, 
  Smile, 
  Backpack, 
  PhoneCall, 
  Clock, 
  FileText, 
  Syringe, 
  SlidersHorizontal, 
  Check, 
  X, 
  Plus, 
  Volume2, 
  Copy, 
  AlertCircle,
  ShieldAlert,
  Moon,
  Sparkles,
  Mic
} from 'lucide-react';
import styles from './palliative.module.css';
import { 
  CarePod, 
  CareLog, 
  Medication, 
  MedicationLockoutStatus, 
  CareWidgetType 
} from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import LovedOneHeroCard from './LovedOneHeroCard';
import NightBedsideSheet from './NightBedsideSheet';
import SymptomAssessmentCard from './SymptomAssessmentCard';
import VoiceMemoStudio from './VoiceMemoStudio';
import RepositionTrackerCard from './RepositionTrackerCard';
import HydrationNutritionCard from './HydrationNutritionCard';

interface WidgetDashboardProps {
  carePod: CarePod;
  logs: CareLog[];
  medications: Medication[];
  lockouts: MedicationLockoutStatus[];
  onOpenQuickLog: (category: string) => void;
  onNavigateTab: (tab: string) => void;
  showCustomizer: boolean;
  onCloseCustomizer: () => void;
  onWidgetsUpdated: () => void;
}

export default function WidgetDashboard({
  carePod,
  logs,
  medications,
  lockouts,
  onOpenQuickLog,
  onNavigateTab,
  showCustomizer,
  onCloseCustomizer,
  onWidgetsUpdated,
}: WidgetDashboardProps) {
  const [selectedWidgets, setSelectedWidgets] = useState<CareWidgetType[]>(carePod.enabled_widgets || []);
  const [showNightSheet, setShowNightSheet] = useState(false);
  const [activeModuleView, setActiveModuleView] = useState<'symptoms' | 'reposition' | 'hydration' | 'voice' | 'all'>('all');

  // Custody checklist interactive state
  const [custodyItems, setCustodyItems] = useState([
    { id: 'c1', label: 'Ventolin / Asthma Inhaler in bag', checked: true },
    { id: 'c2', label: 'Math Homework signed by parent', checked: true },
    { id: 'c3', label: 'School lunchbox & filled water bottle', checked: false },
    { id: 'c4', label: 'Sports shoes & jacket packed', checked: true },
    { id: 'c5', label: 'Library reader book in folder', checked: false },
  ]);

  const allAvailableWidgets: Array<{
    id: CareWidgetType;
    label: string;
    icon: any;
    desc: string;
  }> = [
    { id: 'feeding_nutrition', label: 'Meals & Nutrition Tracker', icon: Utensils, desc: 'Tracks meals, dry/wet food, feeding times, appetite, and fluid ml.' },
    { id: 'activity_turns_walks', label: 'Activity, Walks & Turns', icon: RotateCcw, desc: 'Tracks dog walks, 30 deg body turns, physical therapy ROM, and play time.' },
    { id: 'medication_safety', label: 'PRN Medication Watchdog', icon: Pill, desc: 'Enforces interval lockouts, dosage limits, and countdown timers.' },
    { id: 'hygiene_grooming', label: 'Hygiene & Grooming Care', icon: Bath, desc: 'Logs baths, mouth care, fur brushing, nail trimming, and eye drops.' },
    { id: 'elimination_diapers', label: 'Elimination & Bathroom Log', icon: Activity, desc: 'Logs bowel movements (Bristol 1-7), wet/dirty diapers, and litter checks.' },
    { id: 'vitals_symptoms', label: 'Vitals, Mood & Symptoms', icon: Smile, desc: 'Monitors pain scores, energy level, temper, and breathlessness.' },
    { id: 'custody_checklist', label: 'Joint Custody Packing Checklist', icon: Backpack, desc: 'Interactive co-parenting checklist for school bags and custody handovers.' },
    { id: 'sbar_handover', label: 'Automated Handover Briefing', icon: Clock, desc: 'Synthesizes daily shift/custody/pet summaries with audio read-aloud & SMS.' },
    { id: 'syringe_driver', label: 'Continuous Syringe Driver', icon: Syringe, desc: 'Monitors continuous subcutaneous infusion flow rate and volume.' },
    { id: 'emergency_contacts', label: '24/7 Emergency & Escalation Directory', icon: PhoneCall, desc: 'Direct 1-tap dial for Emergency Vet, Palliative Triage, or Pediatrician.' },
    { id: 'clinical_dossier', label: 'Specialist Visit Report Exporter', icon: FileText, desc: 'Generates printable A4 dossier for GP, Vet, or Pediatrician reviews.' },
  ];

  const handleToggleWidget = (widgetId: CareWidgetType) => {
    PalliativeSpeech.triggerHaptic('light');
    let next: CareWidgetType[];
    if (selectedWidgets.includes(widgetId)) {
      next = selectedWidgets.filter(w => w !== widgetId);
    } else {
      next = [...selectedWidgets, widgetId];
    }
    setSelectedWidgets(next);
  };

  const handleSaveWidgetSettings = () => {
    PalliativeSpeech.triggerHaptic('success');
    PalliativeDb.updateCarePodWidgets(carePod.id, selectedWidgets);
    onWidgetsUpdated();
    onCloseCustomizer();
  };

  const handleToggleCustodyItem = (id: string) => {
    PalliativeSpeech.triggerHaptic('light');
    setCustodyItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const archetype = carePod.archetype;

  return (
    <div>
      {/* UPDATE 2: Loved One Status Hero Card (Hero Pulse) */}
      <LovedOneHeroCard
        carePod={carePod}
        logs={logs}
        lockouts={lockouts}
        onOpenQuickLog={onOpenQuickLog}
        onNavigateTab={onNavigateTab}
      />

      {/* Bedside Mode & Module Quick Filters Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        background: 'rgba(0,0,0,0.25)',
        padding: '0.65rem 1rem',
        borderRadius: '20px',
        border: '1px solid var(--p-border)'
      }}>
        {/* Module Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveModuleView('all')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              border: `1px solid ${activeModuleView === 'all' ? '#2A9D8F' : 'transparent'}`,
              background: activeModuleView === 'all' ? 'rgba(42, 157, 143, 0.15)' : 'transparent',
              color: activeModuleView === 'all' ? '#2A9D8F' : '#94A3B8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Modules
          </button>

          <button
            onClick={() => setActiveModuleView('symptoms')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              border: `1px solid ${activeModuleView === 'symptoms' ? '#2A9D8F' : 'transparent'}`,
              background: activeModuleView === 'symptoms' ? 'rgba(42, 157, 143, 0.15)' : 'transparent',
              color: activeModuleView === 'symptoms' ? '#2A9D8F' : '#94A3B8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ESAS-r Comfort
          </button>

          <button
            onClick={() => setActiveModuleView('reposition')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              border: `1px solid ${activeModuleView === 'reposition' ? '#6B9080' : 'transparent'}`,
              background: activeModuleView === 'reposition' ? 'rgba(107, 144, 128, 0.15)' : 'transparent',
              color: activeModuleView === 'reposition' ? '#6B9080' : '#94A3B8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            30 deg Pressure Turn
          </button>

          <button
            onClick={() => setActiveModuleView('hydration')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              border: `1px solid ${activeModuleView === 'hydration' ? '#38BDF8' : 'transparent'}`,
              background: activeModuleView === 'hydration' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeModuleView === 'hydration' ? '#38BDF8' : '#94A3B8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Hydration
          </button>

          <button
            onClick={() => setActiveModuleView('voice')}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '16px',
              border: `1px solid ${activeModuleView === 'voice' ? '#E9C46A' : 'transparent'}`,
              background: activeModuleView === 'voice' ? 'rgba(233, 196, 106, 0.15)' : 'transparent',
              color: activeModuleView === 'voice' ? '#E9C46A' : '#94A3B8',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Voice Memo
          </button>
        </div>

        {/* 3AM Bedside Mode Trigger Button (Update 3) */}
        <button
          onClick={() => {
            PalliativeSpeech.triggerHaptic('medium');
            setShowNightSheet(true);
          }}
          style={{
            background: 'rgba(233, 196, 106, 0.18)',
            border: '1px solid rgba(233, 196, 106, 0.4)',
            color: '#E9C46A',
            padding: '0.4rem 0.9rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <Moon size={15} /> 3AM Bedside Logger
        </button>
      </div>

      {/* RENDER ACTIVE MODULES ACCORDING TO FILTER */}
      {(activeModuleView === 'all' || activeModuleView === 'reposition') && archetype === 'palliative' && (
        <RepositionTrackerCard
          carePod={carePod}
          onTurnLogged={onWidgetsUpdated}
        />
      )}

      {(activeModuleView === 'all' || activeModuleView === 'symptoms') && (
        <SymptomAssessmentCard
          carePod={carePod}
          onSaved={onWidgetsUpdated}
        />
      )}

      {(activeModuleView === 'all' || activeModuleView === 'hydration') && (
        <HydrationNutritionCard
          carePod={carePod}
          onLogged={onWidgetsUpdated}
        />
      )}

      {(activeModuleView === 'all' || activeModuleView === 'voice') && (
        <VoiceMemoStudio
          carePod={carePod}
          onMemoSaved={onWidgetsUpdated}
        />
      )}

      {/* JOINT CUSTODY CHECKLIST WIDGET (for child_custody archetype) */}
      {archetype === 'child_custody' && (
        <div className={styles.card} style={{ borderTop: '4px solid #60A5FA' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Backpack size={20} style={{ color: '#60A5FA' }} />
              <span>Joint Custody & School Bag Handover Checklist</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Co-parenting checklist synced in real time
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {custodyItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleToggleCustodyItem(item.id)}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--p-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: `2px solid ${item.checked ? '#60A5FA' : 'var(--p-border)'}`,
                  background: item.checked ? '#60A5FA' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  {item.checked && <Check size={14} />}
                </div>
                <span style={{
                  fontSize: '0.9rem',
                  color: item.checked ? '#CBD5E1' : '#F0EDE8',
                  textDecoration: item.checked ? 'line-through' : 'none'
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3AM Bedside Modal */}
      {showNightSheet && (
        <NightBedsideSheet
          carePod={carePod}
          onClose={() => setShowNightSheet(false)}
          onLogSaved={onWidgetsUpdated}
        />
      )}

      {/* WIDGET CUSTOMIZER MODAL DRAWER */}
      {showCustomizer && (
        <div className={styles.modalOverlay} onClick={onCloseCustomizer}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--p-text-primary)' }}>
                  Customize Care Hub Dashboard
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--p-text-secondary)' }}>
                  Choose which care modules appear for {carePod.patient_display_name}
                </span>
              </div>
              <button onClick={onCloseCustomizer} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {allAvailableWidgets.map((w) => {
                const Icon = w.icon;
                const isChecked = selectedWidgets.includes(w.id);
                return (
                  <div
                    key={w.id}
                    onClick={() => handleToggleWidget(w.id)}
                    style={{
                      background: isChecked ? 'rgba(42, 157, 143, 0.12)' : 'rgba(0, 0, 0, 0.25)',
                      border: `1.5px solid ${isChecked ? '#2A9D8F' : 'var(--p-border)'}`,
                      borderRadius: '14px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isChecked ? 'rgba(42, 157, 143, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isChecked ? '#2A9D8F' : '#94A3B8'
                      }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F0EDE8' }}>
                          {w.label}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                          {w.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: `2px solid ${isChecked ? '#2A9D8F' : 'var(--p-border)'}`,
                      background: isChecked ? '#2A9D8F' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {isChecked && <Check size={14} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onCloseCustomizer}
                style={{ minHeight: '42px', padding: '0 1.25rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#CBD5E1', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWidgetSettings}
                style={{ minHeight: '42px', padding: '0 1.5rem', borderRadius: '24px', border: 'none', background: '#2A9D8F', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
              >
                Save Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
