'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Share2, 
  AlertCircle, 
  Pill, 
  RotateCcw, 
  Droplet, 
  Activity, 
  Flag, 
  Sparkles,
  HeartPulse,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  FileText
} from 'lucide-react';
import styles from './palliative.module.css';
import { ShiftHandoverSummary } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { generateShiftHandoverSummary } from '@/utils/palliativeHandover';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

export default function ShiftHandoverView() {
  const [timeframeHours, setTimeframeHours] = useState<number>(8);
  const [handover, setHandover] = useState<ShiftHandoverSummary | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const refreshHandover = (hours: number) => {
    const pod = PalliativeDb.getCarePod();
    const logs = PalliativeDb.getCareLogs();
    const summary = generateShiftHandoverSummary(pod, logs, hours);
    setHandover(summary);
  };

  useEffect(() => {
    refreshHandover(timeframeHours);
  }, [timeframeHours]);

  const handleTimeframeChange = (hours: number) => {
    PalliativeSpeech.triggerHaptic('light');
    setTimeframeHours(hours);
    refreshHandover(hours);
    if (isSpeaking) {
      PalliativeSpeech.stop();
      setIsSpeaking(false);
    }
  };

  const handleToggleSpeak = () => {
    if (!handover) return;
    PalliativeSpeech.triggerHaptic('medium');

    if (isSpeaking) {
      PalliativeSpeech.stop();
      setIsSpeaking(false);
    } else {
      const speechText = `${handover.archetype === 'pet_care' ? 'Pet Care' : handover.archetype === 'child_custody' ? 'Joint Custody' : 'Palliative'} Handover Briefing for ${handover.patientName}. 
      Overall status: ${handover.symptomSummary.overallStability}. 
      During the last ${handover.timeframeHours} hours, ${handover.prnDosesAdministered.length} medications were logged. 
      Recent activity: ${handover.activitySummary.lastActivityDescription}. 
      ${handover.activitySummary.activityOverdue ? `Notice: ${handover.activitySummary.overdueNotice}` : 'Schedule is on track.'}
      Incoming carer recommendations: ${handover.urgentRecommendations.join('. ')}`;

      setIsSpeaking(true);
      PalliativeSpeech.speak(speechText, () => {
        setIsSpeaking(false);
      });
    }
  };

  const handleCopyText = () => {
    if (!handover) return;
    PalliativeSpeech.triggerHaptic('success');
    navigator.clipboard.writeText(handover.rawSbarBriefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!handover) return;
    PalliativeSpeech.triggerHaptic('light');
    const text = encodeURIComponent(`*Aegis Care Handover for ${handover.patientName}*\n\n${handover.rawSbarBriefing}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareSms = () => {
    if (!handover) return;
    PalliativeSpeech.triggerHaptic('light');
    const text = encodeURIComponent(`Aegis Care Handover for ${handover.patientName}:\n${handover.rawSbarBriefing.slice(0, 300)}...`);
    window.open(`sms:?body=${text}`, '_blank');
  };

  if (!handover) return null;

  return (
    <div>
      {/* Handover Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--p-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HeartPulse size={22} style={{ color: '#2A9D8F' }} />
            {handover.archetype === 'pet_care' ? 'Pet Care Handover Briefing' : 
             handover.archetype === 'child_custody' ? 'Joint Custody Handover Briefing' : 
             'SBAR Shift Handover Briefing'}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
            Synthesized handover report with audio read-aloud and 1-tap WhatsApp sharing
          </span>
        </div>

        {/* Action Buttons: Audio, WhatsApp, Copy */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleToggleSpeak}
            style={{
              background: isSpeaking ? 'rgba(231, 111, 81, 0.2)' : 'rgba(42, 157, 143, 0.15)',
              border: `1px solid ${isSpeaking ? '#E76F51' : 'rgba(42, 157, 143, 0.3)'}`,
              color: isSpeaking ? '#E76F51' : '#2A9D8F',
              padding: '0.45rem 1rem',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{isSpeaking ? 'Stop Audio' : 'Play Voice Handover'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            style={{
              background: 'rgba(37, 211, 102, 0.15)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              color: '#25D366',
              padding: '0.45rem 0.9rem',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <MessageCircle size={16} /> WhatsApp
          </button>

          <button
            onClick={handleShareSms}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38BDF8',
              padding: '0.45rem 0.9rem',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <Smartphone size={16} /> SMS
          </button>

          <button
            onClick={handleCopyText}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--p-border)',
              color: '#CBD5E1',
              padding: '0.45rem 0.9rem',
              borderRadius: '24px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={16} style={{ color: '#6B9080' }} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {[4, 8, 12, 24].map((hours) => (
          <button
            key={hours}
            onClick={() => handleTimeframeChange(hours)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              border: `1px solid ${timeframeHours === hours ? '#2A9D8F' : 'var(--p-border)'}`,
              background: timeframeHours === hours ? 'rgba(42, 157, 143, 0.15)' : 'rgba(0, 0, 0, 0.2)',
              color: timeframeHours === hours ? '#2A9D8F' : '#94A3B8',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Last {hours} Hours
          </button>
        ))}
      </div>

      {/* 4-Pillar SBAR Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Pillar 1: Situation */}
        <div className={styles.card} style={{ margin: 0, borderTop: '4px solid #2A9D8F' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2A9D8F', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Activity size={16} /> 1. SITUATION
          </div>
          <div style={{ fontSize: '0.9rem', color: '#F0EDE8', lineHeight: 1.5, marginBottom: '0.5rem' }}>
            <strong>{handover.patientName}</strong> * {handover.symptomSummary.overallStability}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            {handover.totalLogsCount} events recorded during the last {handover.timeframeHours}h by {handover.activeCarersCount} co-carers.
          </div>
        </div>

        {/* Pillar 2: Background */}
        <div className={styles.card} style={{ margin: 0, borderTop: '4px solid #38BDF8' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38BDF8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={16} /> 2. BACKGROUND & DIRECTIVES
          </div>
          <div style={{ fontSize: '0.85rem', color: '#F0EDE8', lineHeight: 1.5 }}>
            Advance Care Goals: Strict Comfort & Dignity in home environment. Reposition schedule: 2-3 hours.
          </div>
        </div>

        {/* Pillar 3: Assessment */}
        <div className={styles.card} style={{ margin: 0, borderTop: '4px solid #E9C46A' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E9C46A', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Pill size={16} /> 3. ASSESSMENT & MEDICATIONS
          </div>
          <div style={{ fontSize: '0.85rem', color: '#F0EDE8', lineHeight: 1.5, marginBottom: '0.4rem' }}>
            <strong>Medications Given:</strong> {handover.prnDosesAdministered.length > 0 
              ? handover.prnDosesAdministered.map(d => `${d.medName} (${d.dose}) at ${new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`).join(', ') 
              : 'No PRN breakthrough doses required.'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Hydration: {handover.hydrationAndOutput.totalFluidMl}ml fluid recorded.
          </div>
        </div>

        {/* Pillar 4: Recommendations */}
        <div className={styles.card} style={{ margin: 0, borderTop: '4px solid #E76F51' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E76F51', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={16} /> 4. INCOMING RECOMMENDATIONS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {handover.urgentRecommendations.map((rec, i) => (
              <div key={i} style={{ fontSize: '0.85rem', color: '#F0EDE8', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <span style={{ color: '#E76F51' }}>*</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raw SBAR Text Briefing Box */}
      <div className={styles.card}>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F0EDE8', marginBottom: '0.6rem' }}>
          Formatted Handover Briefing Output
        </div>
        <div className={styles.sbarContainer}>
          {handover.rawSbarBriefing}
        </div>
      </div>
    </div>
  );
}
