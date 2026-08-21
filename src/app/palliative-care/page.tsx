'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Pill, 
  RotateCcw, 
  Droplet, 
  Activity, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Syringe,
  Smile,
  Mic,
  SlidersHorizontal,
  Play,
  Smartphone
} from 'lucide-react';
import AdSlot from '@/components/layout/AdSlot';
import styles from '@/components/palliative/palliative.module.css';
import PalliativeLayout from '@/components/palliative/PalliativeLayout';
import QuickLogModal from '@/components/palliative/QuickLogModal';
import WidgetDashboard from '@/components/palliative/WidgetDashboard';
import PracticeStudioSandbox from '@/components/palliative/PracticeStudioSandbox';
import LocalPhoneConnectModal from '@/components/palliative/LocalPhoneConnectModal';
import MedicationSafetyBoard from '@/components/palliative/MedicationSafetyBoard';
import ShiftHandoverView from '@/components/palliative/ShiftHandoverView';
import ClinicalReportExporter from '@/components/palliative/ClinicalReportExporter';
import TimelineFeed from '@/components/palliative/TimelineFeed';
import EscalationDirectory from '@/components/palliative/EscalationDirectory';
import CarePodSettings from '@/components/palliative/CarePodSettings';

import { CarePod, CareLog, Medication, MedicationLockoutStatus } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { calculateMedicationLockouts } from '@/utils/palliativeHandover';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import { CareSyncBus } from '@/utils/careSyncBus';

export default function PalliativeCareAppPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showQuickLogModal, setShowQuickLogModal] = useState<boolean>(false);
  const [quickLogCategory, setQuickLogCategory] = useState<string>('medication');
  const [showWidgetCustomizer, setShowWidgetCustomizer] = useState<boolean>(false);
  const [showPhoneConnectModal, setShowPhoneConnectModal] = useState<boolean>(false);

  // Overview State
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [lockouts, setLockouts] = useState<MedicationLockoutStatus[]>([]);

  const refreshAllData = () => {
    PalliativeDb.initialize();
    const pod = PalliativeDb.getCarePod();
    const logs = PalliativeDb.getCareLogs(pod.id);
    const meds = PalliativeDb.getMedications(pod.id);
    setCarePod(pod);
    setCareLogs(logs);
    setMedications(meds);
    setLockouts(calculateMedicationLockouts(meds, logs));
  };

  useEffect(() => {
    refreshAllData();

    // Subscribe to cross-device and server sync bus
    const unsubscribe = CareSyncBus.subscribe((msg) => {
      refreshAllData();
    });

    const interval = setInterval(refreshAllData, 10000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleOpenQuickLog = (category: string = 'medication') => {
    setQuickLogCategory(category);
    setShowQuickLogModal(true);
  };

  const recentLogs = careLogs.slice(0, 5);

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto' }}>
      <PalliativeLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickLog={handleOpenQuickLog}
        onOpenWidgetCustomizer={() => setShowWidgetCustomizer(true)}
        onOpenPhoneConnect={() => setShowPhoneConnectModal(true)}
      >
        {/* TAB 1: MODULAR WIDGET DASHBOARD (DEFAULT OVERVIEW) */}
        {activeTab === 'overview' && carePod && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
            {/* Main Column */}
            <div style={{ gridColumn: 'span 2' }}>
              {/* Modular Widget Grid Engine */}
              <WidgetDashboard
                carePod={carePod}
                logs={careLogs}
                medications={medications}
                lockouts={lockouts}
                onOpenQuickLog={handleOpenQuickLog}
                onNavigateTab={setActiveTab}
                showCustomizer={showWidgetCustomizer}
                onCloseCustomizer={() => setShowWidgetCustomizer(false)}
                onWidgetsUpdated={refreshAllData}
              />

              {/* Recent Activity Stream Card */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>
                    <Activity size={20} style={{ color: '#2A9D8F' }} />
                    <span>Recent Care Events ({carePod.patient_display_name})</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('timeline')}
                    style={{ 
                      background: 'rgba(42, 157, 143, 0.1)', 
                      border: '1px solid rgba(42, 157, 143, 0.25)', 
                      color: '#2A9D8F',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    View All Activity <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentLogs.length > 0 ? (
                    recentLogs.map(log => (
                      <div
                        key={log.id}
                        style={{
                          background: 'rgba(0, 0, 0, 0.25)',
                          padding: '0.85rem 1.1rem',
                          borderRadius: '14px',
                          border: '1px solid var(--p-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>
                            {log.category === 'medication' ? '**' :
                             log.category === 'reposition' ? '[SYNC]' :
                             log.category === 'fluid_food' ? '**' :
                             log.category === 'comfort' ? '*' :
                             log.category === 'activity_walk' ? '[PET]' :
                             log.category === 'custody' ? '[CHILD]' : '**'}
                          </span>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--p-text-primary)' }}>
                              {log.category === 'medication' ? `${log.medication_name} (${log.dose_administered})` :
                               log.category === 'reposition' ? `Turn: ${log.position}` :
                               log.category === 'fluid_food' ? (log.food_description || `${log.fluid_ml || 0}ml fluid`) :
                               log.category === 'comfort' ? log.comfort_action :
                               log.category === 'activity_walk' ? log.activity_type :
                               log.category === 'custody' ? log.custody_event : 'Care Note'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--p-text-secondary)' }}>
                              Logged by {log.logged_by_name} * {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        {log.is_prn && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '20px', 
                            background: 'rgba(233, 196, 106, 0.15)', 
                            color: '#E9C46A',
                            border: '1px solid rgba(233, 196, 106, 0.3)',
                            fontWeight: 600
                          }}>
                            PRN Given
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--p-text-muted)', fontSize: '0.9rem' }}>
                      No care entries logged yet for this shift. Tap an action above to create the first record.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar Column with Architectural Sidebar Ad */}
            <aside className="noPrint" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <AdSlot type="sidebar" />

              {/* Handover SBAR / Custody Quick Action */}
              <div className={styles.card}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--p-text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} style={{ color: '#2A9D8F' }} />
                  <span>Shift Handover Brief</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--p-text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
                  Synthesize an automated handover summary with voice read-aloud and 1-tap WhatsApp sharing for incoming carers.
                </p>
                <button
                  onClick={() => setActiveTab('handover')}
                  style={{
                    width: '100%',
                    minHeight: '44px',
                    borderRadius: '24px',
                    background: '#2A9D8F',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <FileText size={16} /> Open Handover Briefing
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* TAB 0: LIVE PRACTICE STUDIO & MULTIPLAYER SIMULATOR */}
        {activeTab === 'simulator' && (
          <PracticeStudioSandbox
            onOpenQuickLog={handleOpenQuickLog}
            onNavigateTab={setActiveTab}
            onOpenPhoneConnect={() => setShowPhoneConnectModal(true)}
            onOpenWidgetCustomizer={() => setShowWidgetCustomizer(true)}
            onPodSelected={refreshAllData}
          />
        )}

        {/* TAB 2: MEDICATION SAFETY BOARD */}
        {activeTab === 'meds' && (
          <MedicationSafetyBoard
            onAdministerMed={(medId) => {
              setQuickLogCategory('medication');
              setShowQuickLogModal(true);
            }}
          />
        )}

        {/* TAB 3: SHIFT HANDOVER (SBAR / PET CARE / CUSTODY) */}
        {activeTab === 'handover' && (
          <ShiftHandoverView />
        )}

        {/* TAB 4: CLINICAL DOSSIER EXPORTER (GP / SPECIALIST / VET) */}
        {activeTab === 'gp-report' && (
          <ClinicalReportExporter />
        )}

        {/* TAB 5: EVENT TIMELINE FEED */}
        {activeTab === 'timeline' && (
          <TimelineFeed />
        )}

        {/* TAB 6: ESCALATION & EMERGENCY CONTACTS */}
        {activeTab === 'escalation' && (
          <EscalationDirectory />
        )}

        {/* TAB 7: CARE POD SETTINGS & DDL MANAGER */}
        {activeTab === 'settings' && (
          <CarePodSettings />
        )}
      </PalliativeLayout>

      {/* 5-Second Bedside Rapid Logging Modal */}
      {showQuickLogModal && (
        <QuickLogModal
          initialCategory={quickLogCategory}
          onClose={() => setShowQuickLogModal(false)}
          onLogSaved={() => {
            refreshAllData();
          }}
        />
      )}

      {/* Connect Real Phone on Localhost Modal */}
      {showPhoneConnectModal && (
        <LocalPhoneConnectModal
          onClose={() => setShowPhoneConnectModal(false)}
        />
      )}
    </div>
  );
}
