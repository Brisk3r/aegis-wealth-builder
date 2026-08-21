'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  Smartphone, 
  Tablet, 
  Pill, 
  Clock, 
  RotateCcw, 
  Volume2, 
  FileText, 
  Moon, 
  ShieldAlert, 
  Users, 
  Check, 
  Play, 
  Radio, 
  SlidersHorizontal, 
  Database,
  ArrowRight,
  Utensils,
  Backpack,
  Bath,
  PhoneCall
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, CarePodArchetype } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import MultiDeviceSimulator from './MultiDeviceSimulator';

interface PracticeStudioSandboxProps {
  onOpenQuickLog: (category: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenPhoneConnect: () => void;
  onOpenWidgetCustomizer: () => void;
  onPodSelected: () => void;
}

export default function PracticeStudioSandbox({
  onOpenQuickLog,
  onNavigateTab,
  onOpenPhoneConnect,
  onOpenWidgetCustomizer,
  onPodSelected,
}: PracticeStudioSandboxProps) {
  const [activeFeatureView, setActiveFeatureView] = useState<'simulator' | 'tour' | 'scenarios'>('simulator');
  const [scenarioSuccess, setScenarioSuccess] = useState<string | null>(null);

  const carePod = PalliativeDb.getCarePod();
  const allPods = PalliativeDb.getAllPods();

  const handleSelectPod = (podId: string) => {
    PalliativeSpeech.triggerHaptic('medium');
    PalliativeDb.setActivePodId(podId);
    onPodSelected();
  };

  const handleRunScenario = (name: string, description: string, execute: () => void) => {
    PalliativeSpeech.triggerHaptic('success');
    execute();
    setScenarioSuccess(`Executed: ${name} (${description})`);
    setTimeout(() => setScenarioSuccess(null), 4000);
  };

  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Studio Header Banner */}
      <div style={{
        background: 'rgba(42, 157, 143, 0.08)',
        border: '1px solid rgba(42, 157, 143, 0.2)',
        borderRadius: '20px',
        padding: '1.75rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <Sparkles size={22} style={{ color: '#2A9D8F' }} />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--p-text-primary)', margin: 0 }}>
                Care Practice Studio & Sandbox
              </h1>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--p-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Test and explore care workflows: 1-tap logging, medication lockout safety, audio handovers, and multi-device live sync.
            </p>
          </div>

          <button
            onClick={onOpenPhoneConnect}
            style={{ 
              minHeight: '42px', 
              padding: '0 1.25rem', 
              borderRadius: '24px', 
              border: 'none', 
              background: '#2A9D8F', 
              color: '#ffffff', 
              fontSize: '0.85rem', 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              cursor: 'pointer' 
            }}
          >
            <Smartphone size={16} /> Pair Real Phone (QR)
          </button>
        </div>

        {/* Studio View Selector Chips */}
        <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid var(--p-border)', paddingTop: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => { PalliativeSpeech.triggerHaptic('light'); setActiveFeatureView('simulator'); }}
            className={`${styles.chipBtn} ${activeFeatureView === 'simulator' ? styles.chipBtnActive : ''}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Smartphone size={15} /> Dual-Device Simulator
          </button>

          <button
            onClick={() => { PalliativeSpeech.triggerHaptic('light'); setActiveFeatureView('scenarios'); }}
            className={`${styles.chipBtn} ${activeFeatureView === 'scenarios' ? styles.chipBtnActive : ''}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Play size={15} /> Practice Scenarios
          </button>

          <button
            onClick={() => { PalliativeSpeech.triggerHaptic('light'); setActiveFeatureView('tour'); }}
            className={`${styles.chipBtn} ${activeFeatureView === 'tour' ? styles.chipBtnActive : ''}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Zap size={15} /> Feature Tour
          </button>
        </div>
      </div>

      {/* Real-time Scenario Banner */}
      {scenarioSuccess && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '16px',
          background: 'rgba(107, 144, 128, 0.15)',
          border: '1px solid rgba(107, 144, 128, 0.3)',
          color: '#6B9080',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Check size={18} />
          <span>{scenarioSuccess}</span>
        </div>
      )}

      {/* VIEW 1: DUAL DEVICE MULTI-USER SIMULATOR */}
      {activeFeatureView === 'simulator' && (
        <MultiDeviceSimulator />
      )}

      {/* VIEW 2: 1-CLICK INTERACTIVE PRACTICE SCENARIOS */}
      {activeFeatureView === 'scenarios' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* Scenario 1: Palliative Acute Breakthrough */}
          <div className={styles.card} style={{ margin: 0, borderTop: '4px solid #E76F51' }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Pill size={18} style={{ color: '#E76F51' }} />
                <span>1. Breakthrough Pain & Safety Lockout</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Simulate administering 5mg Morphine. Watch how the safety watchdog locks out further doses for 4 hours to prevent accidental double-dosing.
            </p>
            <button
              onClick={() => handleRunScenario('Morphine Breakthrough Administered', 'PRN Locked for 4h', () => {
                PalliativeDb.updateMedicationAdministered('med-morphine', '5mg / 0.5ml', 'Acute breakthrough pain 6/10');
                onPodSelected();
              })}
              style={{
                width: '100%',
                minHeight: '42px',
                borderRadius: '12px',
                border: 'none',
                background: '#E76F51',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Run Scenario: Give PRN Morphine
            </button>
          </div>

          {/* Scenario 2: SBAR Audio Synthesis */}
          <div className={styles.card} style={{ margin: 0, borderTop: '4px solid #2A9D8F' }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <Volume2 size={18} style={{ color: '#2A9D8F' }} />
                <span>2. Shift Handover Audio Read-Aloud</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Synthesize a clinical SBAR briefing and listen to the voice read-aloud designed for incoming shift carers.
            </p>
            <button
              onClick={() => handleRunScenario('Audio Handover Synthesized', 'Speech started', () => {
                const logs = PalliativeDb.getCareLogs(carePod.id);
                const summary = PalliativeSpeech.speak(`Bedside handover for ${carePod.patient_display_name}. Last shift recorded ${logs.length} care events. Patient stable.`);
              })}
              style={{
                width: '100%',
                minHeight: '42px',
                borderRadius: '12px',
                border: 'none',
                background: '#2A9D8F',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Run Scenario: Play Audio Briefing
            </button>
          </div>

          {/* Scenario 3: Reposition Turn */}
          <div className={styles.card} style={{ margin: 0, borderTop: '4px solid #6B9080' }}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>
                <RotateCcw size={18} style={{ color: '#6B9080' }} />
                <span>3. 30 deg Pressure Care Turn</span>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              Log a 30-degree position shift with skin check note and barrier cream application.
            </p>
            <button
              onClick={() => handleRunScenario('30 deg Turn Logged', 'Left to Right side', () => {
                PalliativeDb.addCareLog({
                  category: 'reposition',
                  position: 'Right Side (30 deg)',
                  skin_check_notes: 'Sacrum clear, barrier cream applied.',
                });
                onPodSelected();
              })}
              style={{
                width: '100%',
                minHeight: '42px',
                borderRadius: '12px',
                border: 'none',
                background: '#6B9080',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Run Scenario: Log 30 deg Turn
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: FEATURE TOUR */}
      {activeFeatureView === 'tour' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className={styles.card}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--p-text-primary)', marginBottom: '0.4rem' }}>
              [EPIC] 5-Second Rapid Logging
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', lineHeight: 1.5 }}>
              Engineered with 48dp+ touch targets and predefined clinical presets so exhausted family carers can record events in the middle of the night without typing.
            </p>
          </div>

          <div className={styles.card}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--p-text-primary)', marginBottom: '0.4rem' }}>
              [AEGIS] Medication Interval Watchdog
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', lineHeight: 1.5 }}>
              Enforces strict minimum interval lockouts (e.g. 4 hours for PRN Morphine) across all connected co-carer devices with live countdown timers.
            </p>
          </div>

          <div className={styles.card}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--p-text-primary)', marginBottom: '0.4rem' }}>
              ** Clinical & Veterinary Dossiers
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', lineHeight: 1.5 }}>
              Generates structured clinical summaries with trend charts and PRN administration timelines ready for visiting nurses, GPs, or veterinarians.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
