'use client';

import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Syringe, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Lock, 
  Unlock,
  Sparkles,
  Zap,
  Check,
  X
} from 'lucide-react';
import styles from './palliative.module.css';
import { Medication, CareLog, MedicationLockoutStatus, CarePod, MedicationRoute } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { calculateMedicationLockouts } from '@/utils/palliativeHandover';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

interface MedicationSafetyBoardProps {
  onAdministerMed: (medId: string) => void;
}

export default function MedicationSafetyBoard({ onAdministerMed }: MedicationSafetyBoardProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [careLogs, setCareLogs] = useState<CareLog[]>([]);
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [lockouts, setLockouts] = useState<MedicationLockoutStatus[]>([]);
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [administeringMed, setAdministeringMed] = useState<Medication | null>(null);
  const [administerDose, setAdministerDose] = useState('');
  const [administerReason, setAdministerReason] = useState('Breakthrough discomfort');
  const [administerSuccess, setAdministerSuccess] = useState<string | null>(null);

  // Add Med Form State
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedRoute, setNewMedRoute] = useState<MedicationRoute>('Oral');
  const [newMedIndication, setNewMedIndication] = useState('');
  const [newMedInterval, setNewMedInterval] = useState(240);
  const [newMedMax24h, setNewMedMax24h] = useState(4);
  const [newMedInstructions, setNewMedInstructions] = useState('');

  const refreshData = () => {
    const meds = PalliativeDb.getMedications();
    const logs = PalliativeDb.getCareLogs();
    const pod = PalliativeDb.getCarePod();
    setMedications(meds);
    setCareLogs(logs);
    setCarePod(pod);
    setLockouts(calculateMedicationLockouts(meds, logs));
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName || !newMedDosage) return;

    PalliativeSpeech.triggerHaptic('success');
    PalliativeDb.addMedication({
      care_pod_id: carePod?.id || 'pod-01',
      name: newMedName,
      dosage: newMedDosage,
      route: newMedRoute,
      is_prn: true,
      indication: newMedIndication,
      min_interval_minutes: Number(newMedInterval),
      max_doses_per_24h: Number(newMedMax24h),
      instructions: newMedInstructions,
      is_active: true,
    });

    setShowAddMedModal(false);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedIndication('');
    setNewMedInstructions('');
    refreshData();
  };

  const handleConfirmAdminister = () => {
    if (!administeringMed || !carePod) return;
    PalliativeSpeech.triggerHaptic('success');

    PalliativeDb.updateMedicationAdministered(
      administeringMed.id,
      administerDose || administeringMed.dosage,
      administerReason,
      carePod.id
    );

    setAdministerSuccess(`[OK] Administered ${administeringMed.name} (${administerDose || administeringMed.dosage})`);
    refreshData();

    setTimeout(() => {
      setAdministerSuccess(null);
      setAdministeringMed(null);
    }, 1200);
  };

  return (
    <div>
      {/* Top Banner Alert / Success Notice */}
      {administerSuccess && (
        <div style={{
          background: 'rgba(107, 144, 128, 0.2)',
          border: '1px solid #6B9080',
          color: '#6B9080',
          padding: '1rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Check size={20} />
          <span>{administerSuccess}</span>
        </div>
      )}

      {/* Syringe Driver Continuous Infusion Telemetry Banner (Update 5) */}
      {carePod && carePod.syringe_driver_active && (
        <section className={styles.card} style={{ borderTop: '4px solid #2A9D8F' }}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>
              <Syringe size={20} style={{ color: '#2A9D8F' }} />
              <span>Syringe Driver Continuous Infusion</span>
            </div>
            <span style={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              padding: '0.25rem 0.75rem', 
              borderRadius: '20px', 
              background: 'rgba(107, 144, 128, 0.15)', 
              color: '#6B9080', 
              border: '1px solid rgba(107, 144, 128, 0.3)' 
            }}>
              Infusing Normally
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.2rem' }}>Medication Mix</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F0EDE8' }}>
                {carePod.syringe_driver_medication || 'Morphine + Midazolam'}
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.2rem' }}>Infusion Rate</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2A9D8F' }}>
                {carePod.syringe_driver_rate_ml_hr || 1.0} ml / hour
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--p-border)' }}>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.2rem' }}>Remaining Volume</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#F0EDE8' }}>
                {carePod.syringe_driver_volume_remaining_ml || 11.5} ml remaining
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Medication Safety Board Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--p-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} style={{ color: '#2A9D8F' }} />
            Medication Safety & PRN Lockout Watchdog
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
            Strict double-dose prevention with countdown timers synced across all family devices
          </span>
        </div>

        <button
          onClick={() => setShowAddMedModal(true)}
          style={{
            background: 'rgba(42, 157, 143, 0.15)',
            border: '1px solid rgba(42, 157, 143, 0.3)',
            color: '#2A9D8F',
            padding: '0.5rem 1rem',
            borderRadius: '24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Add Medication
        </button>
      </div>

      {/* Medication Grid with Visual Countdown Rings (Update 4) */}
      <div className={styles.medCardGrid}>
        {lockouts.map(status => {
          const med = status;
          const isLocked = status.isLocked;
          const progressPct = isLocked 
            ? Math.round(((status.minIntervalMinutes - status.remainingMinutes) / status.minIntervalMinutes) * 100) 
            : 100;

          return (
            <div 
              key={status.medicationId} 
              className={styles.medCard}
              style={{
                borderTop: `4px solid ${isLocked ? '#E9C46A' : '#6B9080'}`
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F0EDE8', margin: '0 0 0.2rem 0' }}>
                      {status.medicationName}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                      {status.dosage} * {status.route}
                    </div>
                  </div>

                  {/* Lockout Badge */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: isLocked ? 'rgba(233, 196, 106, 0.15)' : 'rgba(107, 144, 128, 0.15)',
                    color: isLocked ? '#E9C46A' : '#6B9080',
                    border: `1px solid ${isLocked ? 'rgba(233, 196, 106, 0.3)' : 'rgba(107, 144, 128, 0.3)'}`
                  }}>
                    {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                    {isLocked ? `Locked (${status.remainingMinutes}m)` : 'Eligible to Give'}
                  </span>
                </div>

                {/* Indication */}
                {status.indication && (
                  <div style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.75rem', borderRadius: '10px' }}>
                    <strong>Indication:</strong> {status.indication}
                  </div>
                )}

                {/* Visual Interval Progress Bar */}
                {isLocked && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                      <span>Safety Interval Countdown</span>
                      <span>{status.remainingMinutes} min remaining</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progressPct}%`, background: '#E9C46A', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                )}

                {/* Dosage History */}
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Min interval: {status.minIntervalMinutes / 60}h</span>
                  <span>24h Doses: {status.dosesInLast24h} / {status.maxDosesPer24h || 6}</span>
                </div>
              </div>

              {/* 1-Tap Administer Button */}
              <button
                onClick={() => {
                  const originalMed = medications.find(m => m.id === status.medicationId);
                  if (originalMed) {
                    setAdministeringMed(originalMed);
                    setAdministerDose(originalMed.dosage);
                  }
                }}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: '14px',
                  border: 'none',
                  background: isLocked ? 'rgba(233, 196, 106, 0.2)' : '#2A9D8F',
                  color: isLocked ? '#E9C46A' : '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Pill size={16} />
                {isLocked ? 'Give Early (Requires Override)' : `Administer ${status.dosage}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Administer Medication Modal */}
      {administeringMed && (
        <div className={styles.modalOverlay} onClick={() => setAdministeringMed(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--p-text-primary)' }}>
                Confirm Administration: {administeringMed.name}
              </h3>
              <button onClick={() => setAdministeringMed(null)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                Dose Administered
              </label>
              <input
                type="text"
                className={styles.inputField}
                value={administerDose}
                onChange={(e) => setAdministerDose(e.target.value)}
                placeholder="e.g. 5mg / 0.5ml"
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                Reason for Administration
              </label>
              <input
                type="text"
                className={styles.inputField}
                value={administerReason}
                onChange={(e) => setAdministerReason(e.target.value)}
                placeholder="e.g. Breakthrough pain 6/10"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setAdministeringMed(null)}
                style={{ minHeight: '42px', padding: '0 1.25rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#CBD5E1', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdminister}
                style={{ minHeight: '42px', padding: '0 1.5rem', borderRadius: '24px', border: 'none', background: '#2A9D8F', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm Dose Given
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddMedModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--p-text-primary)' }}>
                Add New Medication
              </h3>
              <button onClick={() => setShowAddMedModal(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMedication}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  className={styles.inputField}
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Morphine Oral Liquid"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.inputField}
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="e.g. 5mg / 0.5ml"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Route
                  </label>
                  <select
                    className={styles.selectField}
                    value={newMedRoute}
                    onChange={(e) => setNewMedRoute(e.target.value as MedicationRoute)}
                  >
                    <option value="Oral">Oral</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                    <option value="Patch">Patch</option>
                    <option value="Inhaler">Inhaler</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Lockout Interval (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    className={styles.inputField}
                    value={newMedInterval}
                    onChange={(e) => setNewMedInterval(Number(e.target.value))}
                    placeholder="240 (4 hours)"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Max 24h Doses
                  </label>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={newMedMax24h}
                    onChange={(e) => setNewMedMax24h(Number(e.target.value))}
                    placeholder="4"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  style={{ minHeight: '42px', padding: '0 1.25rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#CBD5E1', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ minHeight: '42px', padding: '0 1.5rem', borderRadius: '24px', border: 'none', background: '#2A9D8F', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
