'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Tablet, 
  RefreshCw, 
  Pill, 
  RotateCcw, 
  Utensils, 
  Activity, 
  Clock, 
  Volume2, 
  Check, 
  ShieldAlert, 
  Zap, 
  User, 
  Sparkles, 
  ArrowRight,
  Moon,
  Radio,
  SlidersHorizontal,
  Wifi
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, CareLog, Medication, MedicationLockoutStatus } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import { calculateMedicationLockouts, generateShiftHandoverSummary } from '@/utils/palliativeHandover';
import { CareSyncBus, SyncMessage } from '@/utils/careSyncBus';

export default function MultiDeviceSimulator() {
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [meds, setMeds] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [lockouts, setLockouts] = useState<MedicationLockoutStatus[]>([]);

  // Simulation State
  const [device1Carer, setDevice1Carer] = useState('Sarah Smith (Day Shift)');
  const [device2Carer, setDevice2Carer] = useState('David Smith (Night Shift)');
  const [device2NightMode, setDevice2NightMode] = useState(false);
  
  // Real-time flash indicators
  const [device1Flash, setDevice1Flash] = useState<string | null>(null);
  const [device2Flash, setDevice2Flash] = useState<string | null>(null);
  
  // Sync bus packet stream
  const [syncPackets, setSyncPackets] = useState<Array<{
    id: string;
    time: string;
    sender: string;
    event: string;
    detail: string;
  }>>([]);

  const refreshState = () => {
    const pod = PalliativeDb.getCarePod();
    const currentMeds = PalliativeDb.getMedications(pod.id);
    const currentLogs = PalliativeDb.getCareLogs(pod.id);
    setCarePod(pod);
    setMeds(currentMeds);
    setLogs(currentLogs);
    setLockouts(calculateMedicationLockouts(currentMeds, currentLogs));
  };

  useEffect(() => {
    refreshState();

    // Listen to real-time sync events from any tab or simulator action
    const unsubscribe = CareSyncBus.subscribe((msg: SyncMessage) => {
      refreshState();

      // Log packet
      const packet = {
        id: `pkt-${Date.now()}-${Math.random()}`,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sender: msg.senderName,
        event: msg.type,
        detail: msg.payload?.log?.medication_name 
          ? `Med: ${msg.payload.log.medication_name} (${msg.payload.log.dose_administered})` 
          : msg.payload?.log?.activity_type 
          ? `Activity: ${msg.payload.log.activity_type}`
          : msg.payload?.log?.food_description
          ? `Meal: ${msg.payload.log.food_description}`
          : `Event: ${msg.type}`,
      };

      setSyncPackets(prev => [packet, ...prev.slice(0, 7)]);
    });

    return () => unsubscribe();
  }, []);

  // Simulator Actions
  const handleDevice1LogMed = (medName: string, dose: string, reason: string) => {
    if (!carePod) return;
    PalliativeSpeech.triggerHaptic('medium');

    const newLog = PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category: 'medication',
      medication_name: medName,
      dose_administered: dose,
      is_prn: true,
      prn_reason: reason,
      pain_score: 5,
    });

    setDevice1Flash(`Logged ${medName} (${dose})`);
    setDevice2Flash(`SYNC: ${device1Carer} gave ${medName} -> Safety Lockout Active`);
    setTimeout(() => {
      setDevice1Flash(null);
      setDevice2Flash(null);
    }, 4000);
    refreshState();
  };

  const handleDevice1LogActivity = (activityType: string) => {
    if (!carePod) return;
    PalliativeSpeech.triggerHaptic('light');

    PalliativeDb.addCareLog({
      care_pod_id: carePod.id,
      category: 'activity_walk',
      activity_type: activityType,
      activity_duration_minutes: 30,
    });

    setDevice1Flash(`Logged ${activityType}`);
    setDevice2Flash(`SYNC: ${device1Carer} logged ${activityType}`);
    setTimeout(() => {
      setDevice1Flash(null);
      setDevice2Flash(null);
    }, 4000);
    refreshState();
  };

  const handleDevice2LogTurnOrComfort = (action: string) => {
    if (!carePod) return;
    PalliativeSpeech.triggerHaptic('light');

    if (carePod.archetype === 'palliative') {
      PalliativeDb.addCareLog({
        care_pod_id: carePod.id,
        category: 'reposition',
        position: 'Right Side (30 deg)',
        free_text_note: action,
      });
    } else {
      PalliativeDb.addCareLog({
        care_pod_id: carePod.id,
        category: 'comfort',
        comfort_action: action,
      });
    }

    setDevice2Flash(`Logged ${action}`);
    setDevice1Flash(`SYNC: ${device2Carer} completed ${action}`);
    setTimeout(() => {
      setDevice1Flash(null);
      setDevice2Flash(null);
    }, 4000);
    refreshState();
  };

  const handleDevice2ReadAloud = () => {
    if (!carePod) return;
    PalliativeSpeech.triggerHaptic('medium');
    const summary = generateShiftHandoverSummary(carePod, logs, 8);
    PalliativeSpeech.speak(`Simulated Bedside Handover for ${carePod.patient_display_name}. ${summary.symptomSummary.overallStability}. ${summary.urgentRecommendations.join('. ')}`);
  };

  if (!carePod) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Simulator Control Header */}
      <div style={{
        background: 'rgba(42, 157, 143, 0.06)',
        border: '1px solid rgba(42, 157, 143, 0.2)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <Zap size={20} style={{ color: '#2A9D8F' }} />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--p-text-primary)', margin: 0 }}>
                Dual-Device Live Practice Simulator
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', margin: 0 }}>
              Simulate 2+ simultaneous co-carers interacting with <strong>{carePod.patient_display_name} {carePod.avatar_emoji}</strong> in real time.
            </p>
          </div>

          {/* Broadcast Bus Status Pill */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.4rem 0.85rem', 
            borderRadius: '20px', 
            background: 'rgba(107, 144, 128, 0.15)', 
            border: '1px solid rgba(107, 144, 128, 0.3)', 
            color: '#6B9080', 
            fontSize: '0.8rem', 
            fontWeight: 600 
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6B9080', display: 'inline-block' }} />
            <span>Wi-Fi & Local Bus Active</span>
          </div>
        </div>

        {/* Rapid Simulation Preset Buttons */}
        <div style={{ borderTop: '1px solid var(--p-border)', paddingTop: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--p-text-secondary)', marginBottom: '0.6rem' }}>
            Quick 1-Click Practice Scenarios
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleDevice1LogMed('Morphine Oral Liquid', '2.5mg', 'Breakthrough Pain (Score 6/10)')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                minHeight: '38px',
                borderRadius: '20px',
                border: '1px solid rgba(231, 111, 81, 0.3)',
                background: 'rgba(231, 111, 81, 0.1)',
                color: '#E76F51',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Pill size={14} />
              Simulate Sarah Giving Morphine (Triggers Device 2 Lockout)
            </button>

            <button
              onClick={() => handleDevice1LogActivity('Dog Park Leash Walk (30m)')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                minHeight: '38px',
                borderRadius: '20px',
                border: '1px solid rgba(42, 157, 143, 0.3)',
                background: 'rgba(42, 157, 143, 0.1)',
                color: '#2A9D8F',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <Activity size={14} />
              Simulate Alex Logging Walk (Syncs to Sam)
            </button>

            <button
              onClick={() => handleDevice2LogTurnOrComfort('30 deg Back Tilt & Oral Mouth Swab')}
              style={{
                fontSize: '0.8rem',
                padding: '0.45rem 0.85rem',
                minHeight: '38px',
                borderRadius: '20px',
                border: '1px solid rgba(107, 144, 128, 0.3)',
                background: 'rgba(107, 144, 128, 0.1)',
                color: '#6B9080',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              Simulate David Night Reposition
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Device Frames */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* DEVICE 1: Mobile Phone (Carer 1 On-Duty) */}
        <div style={{
          background: 'rgba(20, 26, 38, 0.95)',
          border: '1.5px solid var(--p-border)',
          borderRadius: '24px',
          padding: '1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '520px'
        }}>
          <div>
            {/* Phone Screen Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--p-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={18} style={{ color: '#2A9D8F' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--p-text-primary)' }}>
                    Device A (iPhone 15 Pro)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--p-text-secondary)' }}>
                    {device1Carer}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', background: 'rgba(42, 157, 143, 0.15)', color: '#2A9D8F', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 600 }}>
                Live Active
              </div>
            </div>

            {/* Device 1 Real-time Flash Notification */}
            {device1Flash && (
              <div style={{ background: 'rgba(42, 157, 143, 0.2)', color: '#2A9D8F', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
                {device1Flash}
              </div>
            )}

            {/* Rapid Actions for Device 1 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--p-text-secondary)', marginBottom: '0.5rem' }}>
                1-Tap Carer 1 Actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => handleDevice1LogMed('Morphine Oral Liquid', '2.5mg', 'Pain')}
                  style={{
                    minHeight: '44px',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(231, 111, 81, 0.3)',
                    background: 'rgba(231, 111, 81, 0.1)',
                    color: '#E76F51',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Give PRN Med
                </button>
                <button
                  onClick={() => handleDevice1LogActivity('Physical Comfort Check')}
                  style={{
                    minHeight: '44px',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--p-border)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'var(--p-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Comfort Check
                </button>
              </div>
            </div>

            {/* Live PRN Safety Status on Device 1 */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--p-border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--p-text-secondary)', marginBottom: '0.4rem' }}>
                Active Medication Status
              </div>
              {lockouts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {lockouts.slice(0, 2).map(l => (
                    <div key={l.medicationId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--p-text-primary)' }}>{l.medicationName}</span>
                      <span style={{ 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '12px', 
                        fontSize: '0.7rem', 
                        fontWeight: 600, 
                        background: l.isLocked ? 'rgba(233, 196, 106, 0.15)' : 'rgba(107, 144, 128, 0.15)', 
                        color: l.isLocked ? '#E9C46A' : '#6B9080' 
                      }}>
                        {l.isLocked ? `Locked (${l.remainingMinutes}m)` : 'Eligible'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>No medications configured.</div>
              )}
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', textAlign: 'center', borderTop: '1px solid var(--p-border)', paddingTop: '0.5rem' }}>
            Simulated Handheld Client * Port 3000
          </div>
        </div>

        {/* DEVICE 2: Bedside Tablet (Carer 2 / Night Mode) */}
        <div style={{
          background: device2NightMode ? 'rgba(35, 28, 20, 0.95)' : 'rgba(20, 26, 38, 0.95)',
          border: `1.5px solid ${device2NightMode ? 'rgba(233, 196, 106, 0.3)' : 'var(--p-border)'}`,
          borderRadius: '24px',
          padding: '1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '520px'
        }}>
          <div>
            {/* Tablet Screen Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--p-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tablet size={18} style={{ color: device2NightMode ? '#E9C46A' : '#60A5FA' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--p-text-primary)' }}>
                    Device B (Bedside iPad)
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--p-text-secondary)' }}>
                    {device2Carer}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDevice2NightMode(!device2NightMode)}
                style={{ 
                  fontSize: '0.7rem', 
                  background: device2NightMode ? 'rgba(233, 196, 106, 0.2)' : 'rgba(255, 255, 255, 0.1)', 
                  color: device2NightMode ? '#E9C46A' : 'var(--p-text-primary)', 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: '12px', 
                  border: 'none',
                  cursor: 'pointer' 
                }}
              >
                {device2NightMode ? '** Night Light' : '** Day Light'}
              </button>
            </div>

            {/* Device 2 Real-time Flash Notification */}
            {device2Flash && (
              <div style={{ background: 'rgba(233, 196, 106, 0.2)', color: '#E9C46A', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>
                {device2Flash}
              </div>
            )}

            {/* Rapid Actions for Device 2 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--p-text-secondary)', marginBottom: '0.5rem' }}>
                1-Tap Carer 2 Actions
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  onClick={() => handleDevice2LogTurnOrComfort('30 deg Back Tilt & Skin Check')}
                  style={{
                    minHeight: '44px',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(107, 144, 128, 0.3)',
                    background: 'rgba(107, 144, 128, 0.1)',
                    color: '#6B9080',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Log 30 deg Turn
                </button>
                <button
                  onClick={handleDevice2ReadAloud}
                  style={{
                    minHeight: '44px',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--p-border)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'var(--p-text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Volume2 size={13} /> Play Audio Handover
                </button>
              </div>
            </div>

            {/* Live Handover Summary on Device 2 */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--p-border)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--p-text-secondary)', marginBottom: '0.4rem' }}>
                Recent Shift Timeline ({logs.length} total events)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--p-text-primary)', lineHeight: 1.4 }}>
                {logs[0] ? `Latest: ${logs[0].category} by ${logs[0].logged_by_name}` : 'No events logged yet.'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.7rem', color: 'var(--p-text-muted)', textAlign: 'center', borderTop: '1px solid var(--p-border)', paddingTop: '0.5rem' }}>
            Simulated Bedside Tablet * Live Subscribed
          </div>
        </div>
      </div>

      {/* Real-time Packet Inspector Stream */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--p-border)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2A9D8F', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Radio size={14} /> Live Sync Stream (Cross-Device Broadcasts)
        </div>
        {syncPackets.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {syncPackets.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--p-text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.25rem' }}>
                <span><strong style={{ color: 'var(--p-text-primary)' }}>{p.sender}</strong> ({p.time}): {p.detail}</span>
                <span style={{ fontSize: '0.7rem', color: '#6B9080' }}>Synced 0ms</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>
            Waiting for live sync events... tap any action on your phone or in the simulator to see packets stream in real time.
          </div>
        )}
      </div>
    </div>
  );
}
