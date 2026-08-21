'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Pill, 
  RotateCcw, 
  Droplet, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, CareLog, MedicationLockoutStatus } from '@/types/palliative';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface LovedOneHeroCardProps {
  carePod: CarePod;
  logs: CareLog[];
  lockouts: MedicationLockoutStatus[];
  onOpenQuickLog: (category: string) => void;
  onNavigateTab: (tab: string) => void;
}

export default function LovedOneHeroCard({
  carePod,
  logs,
  lockouts,
  onOpenQuickLog,
  onNavigateTab
}: LovedOneHeroCardProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Compute Last Repositioning
  const lastTurnLog = logs.find(l => l.category === 'reposition');
  let turnMinutesAgo = 0;
  let turnOverdue = false;
  if (lastTurnLog) {
    turnMinutesAgo = Math.floor((now.getTime() - new Date(lastTurnLog.logged_at).getTime()) / 60000);
    if (turnMinutesAgo > 120) turnOverdue = true; // 2 hours threshold
  } else {
    turnOverdue = true;
  }

  // Compute Last Medication
  const lastMedLog = logs.find(l => l.category === 'medication');
  let medMinutesAgo = 0;
  if (lastMedLog) {
    medMinutesAgo = Math.floor((now.getTime() - new Date(lastMedLog.logged_at).getTime()) / 60000);
  }

  // Compute Today's Hydration
  const todayLogs = logs.filter(l => {
    const d = new Date(l.logged_at);
    return d.toDateString() === now.toDateString() && l.category === 'fluid_food';
  });
  const totalFluidMl = todayLogs.reduce((acc, l) => acc + (l.fluid_ml || 0), 0);
  const targetFluidMl = 1500;
  const fluidPercentage = Math.min(100, Math.round((totalFluidMl / targetFluidMl) * 100));

  // Compute Active PRN Lockout
  const activeLockout = lockouts.find(l => l.isLocked);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(42, 157, 143, 0.12) 0%, rgba(20, 26, 38, 0.95) 100%)',
      border: '1px solid rgba(42, 157, 143, 0.25)',
      borderRadius: '24px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Profile Summary Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'rgba(42, 157, 143, 0.18)',
            border: `2px solid ${carePod.theme_color || '#2A9D8F'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            flexShrink: 0
          }}>
            {carePod.avatar_emoji || '[SENIOR]'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F0EDE8', margin: 0 }}>
                {carePod.patient_display_name}
              </h2>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                background: 'rgba(42, 157, 143, 0.15)',
                color: '#2A9D8F',
                border: '1px solid rgba(42, 157, 143, 0.3)'
              }}>
                Comfort First
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.2rem' }}>
              {carePod.subtitle || carePod.primary_diagnosis || 'Active Care Profile'}
            </div>
          </div>
        </div>

        {/* Rapid Status Pill */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigateTab('handover')}
            style={{
              background: 'rgba(42, 157, 143, 0.15)',
              border: '1px solid rgba(42, 157, 143, 0.3)',
              color: '#2A9D8F',
              padding: '0.45rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <Clock size={14} /> View Shift Summary <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* 3 Core Care Vital Indicators (Reposition, PRN Lockout, Hydration) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Metric 1: 30 deg Pressure Injury Prevention Turn */}
        <div 
          onClick={() => onOpenQuickLog('reposition')}
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: `1px solid ${turnOverdue ? 'rgba(231, 111, 81, 0.4)' : 'rgba(107, 144, 128, 0.3)'}`,
            borderRadius: '16px',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RotateCcw size={14} style={{ color: turnOverdue ? '#E76F51' : '#6B9080' }} />
              Position Turn (30 deg)
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '10px',
              background: turnOverdue ? 'rgba(231, 111, 81, 0.2)' : 'rgba(107, 144, 128, 0.2)',
              color: turnOverdue ? '#E76F51' : '#6B9080'
            }}>
              {turnOverdue ? 'Turn Due' : 'On Schedule'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F0EDE8' }}>
            {lastTurnLog ? lastTurnLog.position : 'No turn recorded'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            {lastTurnLog ? `Last turned ${turnMinutesAgo}m ago` : 'Tap to log first turn'}
          </div>
        </div>

        {/* Metric 2: PRN Medication Safety Lockout */}
        <div 
          onClick={() => onNavigateTab('meds')}
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: `1px solid ${activeLockout ? 'rgba(233, 196, 106, 0.4)' : 'rgba(42, 157, 143, 0.3)'}`,
            borderRadius: '16px',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Pill size={14} style={{ color: activeLockout ? '#E9C46A' : '#2A9D8F' }} />
              PRN Breakthrough Meds
            </span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '10px',
              background: activeLockout ? 'rgba(233, 196, 106, 0.2)' : 'rgba(42, 157, 143, 0.2)',
              color: activeLockout ? '#E9C46A' : '#2A9D8F'
            }}>
              {activeLockout ? `Lockout (${activeLockout.remainingMinutes}m)` : 'All Eligible'}
            </span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#F0EDE8' }}>
            {lastMedLog ? lastMedLog.medication_name : 'No meds logged today'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>
            {lastMedLog ? `Given ${medMinutesAgo}m ago (${lastMedLog.dose_administered})` : 'Tap to administer'}
          </div>
        </div>

        {/* Metric 3: Daily Hydration & Fluid Target */}
        <div 
          onClick={() => onOpenQuickLog('fluid_food')}
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Droplet size={14} style={{ color: '#38BDF8' }} />
              Hydration Balance
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8' }}>
              {totalFluidMl} / {targetFluidMl} ml ({fluidPercentage}%)
            </span>
          </div>
          
          {/* Visual Hydration Progress Bar */}
          <div style={{
            height: '8px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
            margin: '0.5rem 0'
          }}>
            <div style={{
              height: '100%',
              width: `${fluidPercentage}%`,
              background: 'linear-gradient(90deg, #38BDF8, #2A9D8F)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            {todayLogs.length} hydration & meal records today
          </div>
        </div>
      </div>

      {/* Advance Care Goals Notice */}
      {carePod.advance_care_plan_notes && (
        <div style={{
          background: 'rgba(42, 157, 143, 0.08)',
          border: '1px solid rgba(42, 157, 143, 0.2)',
          borderRadius: '14px',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          color: '#CBD5E1',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <ShieldCheck size={18} style={{ color: '#2A9D8F', flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#F0EDE8' }}>Care Intent & Directive:</strong> {carePod.advance_care_plan_notes}
          </span>
        </div>
      )}
    </div>
  );
}
