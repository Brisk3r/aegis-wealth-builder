'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  UserPlus, 
  QrCode, 
  Database, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  Save, 
  Users, 
  Syringe, 
  FileCode 
} from 'lucide-react';
import styles from './palliative.module.css';
import { CarePod, CarePodMember, CarerRole } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import CareBackupSyncManager from './CareBackupSyncManager';

const POSTGRESQL_DDL = `-- PALLIATIVE CARE SHIFT-HANDOVER & COMFORT OS (SUPABASE / POSTGRESQL DDL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PATIENTS / CARE PODS
CREATE TABLE care_pods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_display_name TEXT NOT NULL,
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    primary_diagnosis TEXT,
    advance_care_plan_notes TEXT,
    syringe_driver_active BOOLEAN DEFAULT FALSE,
    syringe_driver_medication TEXT,
    syringe_driver_rate_ml_hr NUMERIC(4,2),
    syringe_driver_volume_remaining_ml NUMERIC(5,2)
);

-- CAREGIVERS / POD MEMBERS
CREATE TABLE care_pod_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_pod_id UUID REFERENCES care_pods(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- Supabase Auth ID
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'primary_carer', -- 'primary_carer', 'support_carer', 'clinician'
    phone_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MEDICATION CATALOG (SCHEDULED & PRN)
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_pod_id UUID REFERENCES care_pods(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g. "Morphine Oral Solution"
    dosage TEXT NOT NULL, -- e.g. "5mg / 0.5ml"
    route TEXT NOT NULL, -- "Oral", "Sublingual", "Subcutaneous", "Patch", "Syringe Driver"
    is_prn BOOLEAN NOT NULL DEFAULT TRUE,
    indication TEXT, -- e.g. "Breakthrough pain", "Severe breathlessness"
    min_interval_minutes INT DEFAULT 240, -- 4 hours lockout
    max_doses_per_24h INT,
    instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ACTIVITY & CLINICAL LOGS (SINGLE TIMELINE)
CREATE TABLE care_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_pod_id UUID REFERENCES care_pods(id) ON DELETE CASCADE,
    logged_by_member_id UUID REFERENCES care_pod_members(id),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    category TEXT NOT NULL,
    medication_id UUID REFERENCES medications(id),
    medication_name TEXT,
    dose_administered TEXT,
    prn_reason TEXT,
    pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
    breathlessness_score INT CHECK (breathlessness_score BETWEEN 0 AND 10),
    agitation_score INT CHECK (agitation_score BETWEEN 0 AND 10),
    nausea_score INT CHECK (nausea_score BETWEEN 0 AND 10),
    secretions_level TEXT,
    comfort_action TEXT,
    fluid_ml INT,
    food_description TEXT,
    swallow_difficulty BOOLEAN DEFAULT FALSE,
    position TEXT,
    skin_check_notes TEXT,
    bowel_movement BOOLEAN DEFAULT FALSE,
    bristol_stool_type INT CHECK (bristol_stool_type BETWEEN 1 AND 7),
    urine_output TEXT,
    urine_ml INT,
    free_text_note TEXT,
    audio_memo_url TEXT,
    is_handover_flagged BOOLEAN DEFAULT FALSE
);

-- EMERGENCY & CLINICAL ESCALATION DIRECTORY
CREATE TABLE escalation_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_pod_id UUID REFERENCES care_pods(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    after_hours_phone TEXT,
    display_order INT DEFAULT 0,
    notes TEXT
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE care_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members access to their care pod data"
ON care_pods FOR ALL USING (
    id IN (SELECT care_pod_id FROM care_pod_members WHERE user_id = auth.uid())
);

CREATE POLICY "Allow members access to care logs"
ON care_logs FOR ALL USING (
    care_pod_id IN (SELECT care_pod_id FROM care_pod_members WHERE user_id = auth.uid())
);`;

export default function CarePodSettings() {
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [members, setMembers] = useState<CarePodMember[]>([]);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [showAddCarerModal, setShowAddCarerModal] = useState<boolean>(false);

  // New Carer Form
  const [newCarerName, setNewCarerName] = useState('');
  const [newCarerRole, setNewCarerRole] = useState<CarerRole>('support_carer');
  const [newCarerPhone, setNewCarerPhone] = useState('');

  // Editable Care Pod Fields
  const [patientName, setPatientName] = useState('');
  const [dob, setDob] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [advanceCarePlan, setAdvanceCarePlan] = useState('');
  const [syringeActive, setSyringeActive] = useState(false);
  const [syringeMed, setSyringeMed] = useState('');
  const [syringeRate, setSyringeRate] = useState(1.0);
  const [syringeVolume, setSyringeVolume] = useState(12.0);

  const refreshData = () => {
    const pod = PalliativeDb.getCarePod();
    const mems = PalliativeDb.getMembers();
    setCarePod(pod);
    setMembers(mems);
    if (pod) {
      setPatientName(pod.patient_display_name);
      setDob(pod.date_of_birth || '');
      setDiagnosis(pod.primary_diagnosis || '');
      setAdvanceCarePlan(pod.advance_care_plan_notes || '');
      setSyringeActive(!!pod.syringe_driver_active);
      setSyringeMed(pod.syringe_driver_medication || '');
      setSyringeRate(pod.syringe_driver_rate_ml_hr || 1.0);
      setSyringeVolume(pod.syringe_driver_volume_remaining_ml || 12.0);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleSavePodDetails = (e: React.FormEvent) => {
    e.preventDefault();
    PalliativeSpeech.triggerHaptic('success');
    PalliativeDb.updateCarePod({
      patient_display_name: patientName,
      date_of_birth: dob,
      primary_diagnosis: diagnosis,
      advance_care_plan_notes: advanceCarePlan,
      syringe_driver_active: syringeActive,
      syringe_driver_medication: syringeMed,
      syringe_driver_rate_ml_hr: Number(syringeRate),
      syringe_driver_volume_remaining_ml: Number(syringeVolume),
    });
    refreshData();
    alert('Care Pod settings updated successfully.');
  };

  const handleAddCarer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarerName) return;

    PalliativeSpeech.triggerHaptic('success');
    PalliativeDb.addMember({
      care_pod_id: carePod?.id || 'pod-01',
      user_id: `user-${Date.now()}`,
      display_name: newCarerName,
      role: newCarerRole,
      phone_number: newCarerPhone,
      avatar_color: newCarerRole === 'clinician' ? '#10b981' : '#a855f7',
    });

    setShowAddCarerModal(false);
    setNewCarerName('');
    setNewCarerPhone('');
    refreshData();
  };

  const handleCopySql = () => {
    PalliativeSpeech.triggerHaptic('light');
    navigator.clipboard.writeText(POSTGRESQL_DDL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyInvite = () => {
    PalliativeSpeech.triggerHaptic('success');
    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/palliative-care?podId=${carePod?.id}`;
    navigator.clipboard.writeText(`You have been invited to join the Palliative Care Pod for ${carePod?.patient_display_name}.\nAccess link: ${inviteUrl}`);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleResetData = () => {
    if (confirm('Reset demo care pod data back to default baseline? All local changes will be refreshed.')) {
      PalliativeSpeech.triggerHaptic('warning');
      PalliativeDb.resetToSeed();
      refreshData();
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={24} style={{ color: 'var(--p-accent)' }} />
            Care Pod Settings & Multi-Carer Collaboration
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
            Manage patient profile, advance care directives, carer team, and Supabase database schema.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="btn-secondary"
          style={{ minHeight: '44px', gap: '0.4rem', color: 'var(--p-accent-orange)' }}
        >
          <RotateCcw size={16} /> Reset Demo Data
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* 1. Patient Profile & Advance Care Directive */}
        <section className={styles.card} style={{ margin: 0 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--p-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: 'var(--p-accent)' }} />
            Patient Profile & Goals of Care
          </h3>

          <form onSubmit={handleSavePodDetails}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
              PATIENT DISPLAY NAME
            </label>
            <input
              type="text"
              required
              className={styles.inputField}
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                  DATE OF BIRTH
                </label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                  PRIMARY DIAGNOSIS
                </label>
                <input
                  type="text"
                  className={styles.inputField}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
              ADVANCE CARE PLAN / DIRECTIVE NOTES
            </label>
            <textarea
              className={styles.textareaField}
              rows={3}
              value={advanceCarePlan}
              onChange={(e) => setAdvanceCarePlan(e.target.value)}
              placeholder="e.g. Goals of Care: Strict Home Comfort, NFR/DNR, mouth care every 2h..."
            />

            {/* Syringe Driver Configuration */}
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid var(--p-border)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <input
                  type="checkbox"
                  id="syringeToggle"
                  checked={syringeActive}
                  onChange={(e) => setSyringeActive(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="syringeToggle" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--p-accent)' }}>
                  Continuous Syringe Driver Active
                </label>
              </div>

              {syringeActive && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                    MEDICATION MIX (24H)
                  </label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={syringeMed}
                    onChange={(e) => setSyringeMed(e.target.value)}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                        RATE (ML/HR)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className={styles.inputField}
                        value={syringeRate}
                        onChange={(e) => setSyringeRate(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                        VOLUME REMAINING (ML)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className={styles.inputField}
                        value={syringeVolume}
                        onChange={(e) => setSyringeVolume(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ minHeight: '48px', width: '100%', justifyContent: 'center', fontWeight: 700 }}
            >
              <Save size={16} /> Save Patient Profile
            </button>
          </form>
        </section>

        {/* 2. Multi-Carer Pod Management & QR Join */}
        <section className={styles.card} style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: 'var(--p-accent-secondary)' }} />
              Family Caregivers & Clinicians ({members.length})
            </h3>
            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); setShowAddCarerModal(true); }}
              className="btn-secondary"
              style={{ minHeight: '38px', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
            >
              <UserPlus size={14} /> Add Carer
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {members.map(member => (
              <div
                key={member.id}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid var(--p-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--p-text-primary)' }}>
                    {member.display_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--p-text-secondary)' }}>
                    Role: <strong style={{ textTransform: 'capitalize', color: 'var(--p-accent)' }}>{member.role.replace('_', ' ')}</strong> {member.phone_number ? `* ${member.phone_number}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* QR Code & Mobile Invite */}
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)', textAlign: 'center' }}>
            <QrCode size={40} style={{ color: 'var(--p-accent-secondary)', margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--p-text-primary)', marginBottom: '0.25rem' }}>
              Invite Family Co-Carers
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--p-text-secondary)', marginBottom: '1rem' }}>
              Family members can join this Care Pod on their phone to access offline logging and shift handovers.
            </p>

            <button
              onClick={handleCopyInvite}
              className="btn-primary"
              style={{ minHeight: '44px', width: '100%', justifyContent: 'center' }}
            >
              {copiedInvite ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedInvite ? 'Invite Copied!' : 'Copy Mobile Pod Invite Link'}</span>
            </button>
          </div>
        </section>
      </div>

      {/* 3. PostgreSQL DDL & Supabase Migration Export */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>
            <Database size={20} style={{ color: 'var(--p-accent)' }} />
            <span>PostgreSQL Database Schema & Row-Level Security (RLS)</span>
          </div>

          <button
            onClick={handleCopySql}
            className="btn-secondary"
            style={{ minHeight: '40px', fontSize: '0.8rem' }}
          >
            {copiedSql ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedSql ? 'Copied SQL' : 'Copy PostgreSQL DDL'}</span>
          </button>
        </div>

        <div className={styles.sbarContainer} style={{ maxHeight: '280px' }}>
          {POSTGRESQL_DDL}
        </div>
      </section>

      {/* 4. Offline Data Backup, Privacy & Wi-Fi Sync Hub (Update 15) */}
      {carePod && (
        <CareBackupSyncManager
          carePod={carePod}
          onDataRestored={refreshData}
        />
      )}

      {/* Add Carer Modal */}
      {showAddCarerModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddCarerModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--p-text-primary)' }}>
              Add Family Co-Carer or Clinician
            </h2>

            <form onSubmit={handleAddCarer}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                CARER DISPLAY NAME
              </label>
              <input
                type="text"
                required
                className={styles.inputField}
                placeholder="e.g. John Smith (Brother) / Nurse James"
                value={newCarerName}
                onChange={(e) => setNewCarerName(e.target.value)}
              />

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                ROLE
              </label>
              <select
                className={styles.selectField}
                value={newCarerRole}
                onChange={(e) => setNewCarerRole(e.target.value as CarerRole)}
              >
                <option value="primary_carer">Primary Family Carer</option>
                <option value="support_carer">Support Carer (Night / Relief)</option>
                <option value="clinician">Visiting Clinician / Community Nurse</option>
              </select>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                PHONE NUMBER (FOR HANDOVER ALERTS)
              </label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g. +1 (555) 000-1122"
                value={newCarerPhone}
                onChange={(e) => setNewCarerPhone(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCarerModal(false)}
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
                  Save Carer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
