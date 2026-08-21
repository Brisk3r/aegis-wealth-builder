'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Moon, 
  Sun, 
  ShieldAlert, 
  RefreshCw, 
  User, 
  Pill, 
  Sparkles, 
  Droplet, 
  RotateCcw, 
  Activity, 
  FileText, 
  PhoneCall, 
  Settings, 
  Clock, 
  Mic, 
  Utensils, 
  Bath, 
  Backpack, 
  SlidersHorizontal,
  Smartphone,
  Play,
  Zap,
  Plus,
  LayoutDashboard
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, CarePodMember, SyncQueueItem } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import { CareSyncBus } from '@/utils/careSyncBus';
import PodSwitcherBar from './PodSwitcherBar';

interface PalliativeLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenQuickLog: (category?: string) => void;
  onOpenWidgetCustomizer: () => void;
  onOpenPhoneConnect: () => void;
  children: React.ReactNode;
}

export default function PalliativeLayout({
  activeTab,
  onTabChange,
  onOpenQuickLog,
  onOpenWidgetCustomizer,
  onOpenPhoneConnect,
  children
}: PalliativeLayoutProps) {
  const [pods, setPods] = useState<CarePod[]>([]);
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [members, setMembers] = useState<CarePodMember[]>([]);
  const [activeMember, setActiveMember] = useState<CarePodMember | null>(null);
  const [themeMode, setThemeMode] = useState<'default' | 'amber_night' | 'dim_red'>('default');
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFlash, setSyncFlash] = useState<string | null>(null);

  const loadState = () => {
    const allPods = PalliativeDb.getAllPods();
    const currentPod = PalliativeDb.getCarePod();
    setPods(allPods);
    setCarePod(currentPod);
    setMembers(PalliativeDb.getMembers(currentPod.id));
    setActiveMember(PalliativeDb.getActiveMember(currentPod.id));
    setThemeMode(PalliativeDb.getThemeMode());
    setSyncQueue(PalliativeDb.getSyncQueue());
  };

  useEffect(() => {
    PalliativeDb.initialize();
    loadState();

    // Subscribe to cross-device sync bus
    const unsubscribe = CareSyncBus.subscribe((msg) => {
      loadState();
      const actionName = msg.type.replace('_', ' ').toLowerCase();
      setSyncFlash(`Synced: ${actionName} from ${msg.senderName}`);
      setTimeout(() => setSyncFlash(null), 3000);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPod = (podId: string) => {
    PalliativeDb.setActivePodId(podId);
    loadState();
  };

  const handleCarerChange = (memberId: string) => {
    if (!carePod) return;
    PalliativeDb.setActiveMember(memberId, carePod.id);
    setActiveMember(PalliativeDb.getActiveMember(carePod.id));
    PalliativeSpeech.triggerHaptic('light');
  };

  const handleCycleTheme = () => {
    PalliativeSpeech.triggerHaptic('medium');
    let nextTheme: 'default' | 'amber_night' | 'dim_red' = 'amber_night';
    if (themeMode === 'default') nextTheme = 'amber_night';
    else if (themeMode === 'amber_night') nextTheme = 'dim_red';
    else nextTheme = 'default';

    setThemeMode(nextTheme);
    PalliativeDb.setThemeMode(nextTheme);
  };

  const handleTriggerManualSync = async () => {
    PalliativeSpeech.triggerHaptic('success');
    setIsSyncing(true);
    await CareSyncBus.pollServerEvents();
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const themeClass = 
    themeMode === 'amber_night' ? styles.themeAmberNight :
    themeMode === 'dim_red' ? styles.themeDimRed :
    styles.themeDefault;

  const archetype = carePod?.archetype || 'palliative';

  return (
    <div className={`${styles.container} ${themeClass}`}>
      
      {/* Real-time Sync Alert Pill */}
      {syncFlash && (
        <div style={{
          background: 'rgba(107, 144, 128, 0.15)',
          color: '#6B9080',
          border: '1px solid rgba(107, 144, 128, 0.3)',
          padding: '0.5rem 1rem',
          borderRadius: '24px',
          marginBottom: '1rem',
          fontSize: '0.825rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Zap size={15} />
          <span>{syncFlash}</span>
        </div>
      )}

      {/* Universal Multi-Pod Switcher Bar */}
      <PodSwitcherBar
        pods={pods}
        activePodId={carePod?.id || ''}
        onSelectPod={handleSelectPod}
        onPodCreated={loadState}
        onOpenWidgetCustomizer={onOpenWidgetCustomizer}
      />

      {/* Active Care Profile Header Banner */}
      <header className={styles.podBanner} style={{ borderTop: `4px solid ${carePod?.theme_color || '#2A9D8F'}` }}>
        <div className={styles.podBannerTop}>
          {/* Subject Details */}
          <div className={styles.patientInfo}>
            <div className={styles.patientAvatar} style={{ background: 'var(--p-pill-bg)', border: `1.5px solid ${carePod?.theme_color || 'var(--p-border)'}` }}>
              {carePod?.avatar_emoji || '[SENIOR]'}
            </div>
            <div className={styles.patientDetails}>
              <h1>
                {carePod?.patient_display_name || 'Care Profile'}
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  padding: '0.2rem 0.65rem', 
                  borderRadius: '20px', 
                  background: 'var(--p-pill-bg)', 
                  color: carePod?.theme_color || 'var(--p-accent)', 
                  border: '1px solid var(--p-border)' 
                }}>
                  {archetype.charAt(0).toUpperCase() + archetype.slice(1).replace('_', ' ')}
                </span>
              </h1>
              <div className={styles.patientSub}>
                {carePod?.subtitle || carePod?.primary_diagnosis || 'Active Care Coordination Profile'}
              </div>
            </div>
          </div>

          {/* Carer, Theme & Sync Controls */}
          <div className={styles.headerControls}>
            {/* Active Carer Switcher */}
            <div className={styles.carerSelectWrapper}>
              <User size={15} style={{ color: carePod?.theme_color || '#2A9D8F' }} />
              <select
                aria-label="Active Carer On Duty"
                className={styles.carerSelect}
                value={activeMember?.id || ''}
                onChange={(e) => handleCarerChange(e.target.value)}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Night Light Toggle */}
            <button
              onClick={handleCycleTheme}
              className={styles.themeToggleBtn}
              title="Toggle Bedside Night Light"
            >
              {themeMode === 'default' ? <Moon size={15} /> : themeMode === 'amber_night' ? <Sun size={15} style={{ color: '#E9C46A' }} /> : <ShieldAlert size={15} style={{ color: '#D64545' }} />}
              <span>{themeMode === 'default' ? 'Day' : themeMode === 'amber_night' ? 'Night light' : 'Rest mode'}</span>
            </button>

            {/* Live Sync Status Button */}
            <button
              onClick={handleTriggerManualSync}
              className={styles.syncBadge}
              style={{ cursor: 'pointer', border: 'none' }}
              title="Click to sync with other devices"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>Live Synced</span>
            </button>
          </div>
        </div>

        {/* Rapid Bedside Action Presets */}
        <div style={{ borderTop: '1px solid var(--p-border)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--p-text-secondary)' }}>
              Quick 1-Tap Bedside Actions
            </span>
          </div>

          <div className={styles.quickActionGrid}>
            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenQuickLog('medication'); }}
              className={styles.quickLogBtn}
            >
              <Pill size={18} style={{ color: '#E76F51' }} />
              <span>{archetype === 'pet_care' ? 'Med / Flea' : 'Log Medication'}</span>
            </button>

            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenQuickLog('fluid_food'); }}
              className={styles.quickLogBtn}
            >
              <Utensils size={18} style={{ color: '#2A9D8F' }} />
              <span>{archetype === 'pet_care' ? 'Feed / Water' : 'Meal / Hydration'}</span>
            </button>

            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenQuickLog(archetype === 'palliative' ? 'reposition' : 'activity_walk'); }}
              className={styles.quickLogBtn}
            >
              <RotateCcw size={18} style={{ color: '#6B9080' }} />
              <span>{archetype === 'pet_care' ? 'Walk' : archetype === 'palliative' ? '30 deg Turn' : 'Exercise / Physio'}</span>
            </button>

            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenQuickLog('comfort'); }}
              className={styles.quickLogBtn}
            >
              <Sparkles size={18} style={{ color: '#E9C46A' }} />
              <span>{archetype === 'pet_care' ? 'Groom / Bath' : 'Comfort / Hygiene'}</span>
            </button>

            {archetype === 'child_custody' && (
              <button
                onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenQuickLog('custody'); }}
                className={styles.quickLogBtn}
              >
                <Backpack size={18} style={{ color: '#60A5FA' }} />
                <span>Pack / Handover</span>
              </button>
            )}

            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenQuickLog('bowel_bladder'); }}
              className={styles.quickLogBtn}
            >
              <Activity size={18} style={{ color: '#94A3B8' }} />
              <span>{archetype === 'pet_care' ? 'Pee / Poop' : 'Elimination'}</span>
            </button>

            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenQuickLog('note'); }}
              className={styles.quickLogBtn}
            >
              <Mic size={18} style={{ color: '#2A9D8F' }} />
              <span>Voice Note</span>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop & Tablet Navigation Tabs */}
      <nav className={`${styles.navTabs} noPrint`}>
        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('overview'); }}
          className={`${styles.navTabBtn} ${activeTab === 'overview' ? styles.activeNavTab : ''}`}
        >
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('meds'); }}
          className={`${styles.navTabBtn} ${activeTab === 'meds' ? styles.activeNavTab : ''}`}
        >
          <Pill size={16} />
          <span>Medications</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('handover'); }}
          className={`${styles.navTabBtn} ${activeTab === 'handover' ? styles.activeNavTab : ''}`}
        >
          <Clock size={16} />
          <span>Handover</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('timeline'); }}
          className={`${styles.navTabBtn} ${activeTab === 'timeline' ? styles.activeNavTab : ''}`}
        >
          <Activity size={16} />
          <span>Activity</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('gp-report'); }}
          className={`${styles.navTabBtn} ${activeTab === 'gp-report' ? styles.activeNavTab : ''}`}
        >
          <FileText size={16} />
          <span>{archetype === 'pet_care' ? 'Vet Dossier' : archetype === 'child_custody' ? 'Pediatrician Dossier' : 'Clinical Dossier'}</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('escalation'); }}
          className={`${styles.navTabBtn} ${activeTab === 'escalation' ? styles.activeNavTab : ''}`}
        >
          <PhoneCall size={16} />
          <span>Contacts</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('simulator'); }}
          className={`${styles.navTabBtn} ${activeTab === 'simulator' ? styles.activeNavTab : ''}`}
        >
          <Play size={16} />
          <span>Practice Studio</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onOpenPhoneConnect(); }}
          className={styles.navTabBtn}
        >
          <Smartphone size={16} />
          <span>Pair Phone</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('settings'); }}
          className={`${styles.navTabBtn} ${activeTab === 'settings' ? styles.activeNavTab : ''}`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <main>
        {children}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Appears on screens <= 768px) */}
      <div className={`${styles.mobileBottomNav} noPrint`}>
        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('overview'); }}
          className={`${styles.mobileBottomNavItem} ${activeTab === 'overview' ? styles.mobileBottomNavActive : ''}`}
          aria-label="Dashboard"
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('meds'); }}
          className={`${styles.mobileBottomNavItem} ${activeTab === 'meds' ? styles.mobileBottomNavActive : ''}`}
          aria-label="Medications"
        >
          <Pill size={20} />
          <span>Meds</span>
        </button>

        {/* Center Quick Log FAB Button */}
        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('medium'); onOpenQuickLog('medication'); }}
          className={styles.mobileFabLog}
          aria-label="Quick Log Entry"
          title="Quick Log Care Event"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('handover'); }}
          className={`${styles.mobileBottomNavItem} ${activeTab === 'handover' ? styles.mobileBottomNavActive : ''}`}
          aria-label="Handover"
        >
          <Clock size={20} />
          <span>Handover</span>
        </button>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); onTabChange('timeline'); }}
          className={`${styles.mobileBottomNavItem} ${activeTab === 'timeline' ? styles.mobileBottomNavActive : ''}`}
          aria-label="Activity"
        >
          <Activity size={20} />
          <span>Activity</span>
        </button>
      </div>
    </div>
  );
}
