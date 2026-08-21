'use client';

import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneForwarded, 
  MessageSquare, 
  ShieldAlert, 
  Plus, 
  User, 
  Clock, 
  Copy, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import styles from './palliative.module.css';
import { EscalationContact, CarePod, CarePodMember } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

export default function EscalationDirectory() {
  const [contacts, setContacts] = useState<EscalationContact[]>([]);
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [activeCarer, setActiveCarer] = useState<CarePodMember | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState<boolean>(false);
  const [selectedEmergencyContact, setSelectedEmergencyContact] = useState<EscalationContact | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // New Contact Form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAfterHours, setNewAfterHours] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newIs247, setNewIs247] = useState(false);

  const refreshData = () => {
    setContacts(PalliativeDb.getContacts());
    setCarePod(PalliativeDb.getCarePod());
    setActiveCarer(PalliativeDb.getActiveMember());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    PalliativeSpeech.triggerHaptic('success');
    PalliativeDb.addContact({
      care_pod_id: carePod?.id || 'pod-01',
      name: newName,
      role_title: newRole || 'Support Contact',
      phone_number: newPhone,
      after_hours_phone: newAfterHours,
      display_order: contacts.length + 1,
      notes: newNotes,
      is_24_7: newIs247,
    });

    setShowAddContactModal(false);
    setNewName('');
    setNewRole('');
    setNewPhone('');
    setNewAfterHours('');
    setNewNotes('');
    refreshData();
  };

  const getEmergencySmsText = (contact: EscalationContact) => {
    const patientName = carePod?.patient_display_name || 'Patient';
    const carerName = activeCarer?.display_name || 'Family Carer';
    const carerPhone = activeCarer?.phone_number || '';

    return `URGENT PALLIATIVE ADVICE REQUEST:
Patient: ${patientName} (Home Palliative Care)
From: ${carerName} ${carerPhone ? `(${carerPhone})` : ''}
To: ${contact.name} (${contact.role_title})
Message: Patient experiencing acute breakthrough symptoms. Please contact family carer immediately for clinical triage guidance.`;
  };

  const handleCopySms = (contact: EscalationContact) => {
    PalliativeSpeech.triggerHaptic('success');
    navigator.clipboard.writeText(getEmergencySmsText(contact));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header & Add Contact */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PhoneCall size={24} style={{ color: 'var(--p-accent-red)' }} />
            24/7 Clinical & Emergency Escalation Directory
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
            Direct 1-tap call & dispatch for triage nurses, visiting GPs, and after-hours pharmacies.
          </p>
        </div>

        <button
          onClick={() => { PalliativeSpeech.triggerHaptic('light'); setShowAddContactModal(true); }}
          className="btn-secondary"
          style={{ minHeight: '44px' }}
        >
          <Plus size={16} /> Add Clinical Contact
        </button>
      </div>

      {/* Emergency Guidance Alert */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <ShieldAlert size={28} style={{ color: 'var(--p-accent-red)', flexShrink: 0 }} />
        <div style={{ fontSize: '0.85rem', color: 'var(--p-text-primary)', lineHeight: 1.5 }}>
          <strong>When to escalate:</strong> Call Palliative Triage if breakthrough pain or severe breathlessness persists &gt;20 minutes after PRN dose, if acute severe agitation occurs, or if syringe driver alarms sound.
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {contacts.map(contact => (
          <div
            key={contact.id}
            className={styles.card}
            style={{
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: contact.is_24_7 ? '4px solid var(--p-accent-red)' : '4px solid var(--p-accent)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--p-text-primary)' }}>
                  {contact.name}
                </h3>
                {contact.is_24_7 && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--p-accent-red)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    24/7 TRIAGE
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--p-accent)', marginBottom: '0.75rem' }}>
                {contact.role_title}
              </div>

              {contact.notes && (
                <p style={{ fontSize: '0.8rem', color: 'var(--p-text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {contact.notes}
                </p>
              )}
            </div>

            {/* 1-Tap Action Buttons (Touch Target >= 48dp) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <a
                href={`tel:${contact.phone_number.replace(/\s+/g, '')}`}
                onClick={() => PalliativeSpeech.triggerHaptic('medium')}
                className="btn-primary"
                style={{
                  minHeight: '48px',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <PhoneCall size={16} /> Call {contact.phone_number}
              </a>

              <button
                onClick={() => {
                  setSelectedEmergencyContact(contact);
                  handleCopySms(contact);
                }}
                className="btn-secondary"
                style={{
                  minHeight: '48px',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                <MessageSquare size={16} /> Urgent SMS
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Urgent SMS Modal / Toast */}
      {selectedEmergencyContact && (
        <div className={styles.modalOverlay} onClick={() => setSelectedEmergencyContact(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--p-text-primary)', marginBottom: '0.75rem' }}>
              Urgent Clinical SMS Dispatch
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)', marginBottom: '1rem' }}>
              Pre-filled triage SMS for <strong>{selectedEmergencyContact.name}</strong> ({selectedEmergencyContact.phone_number}):
            </p>

            <div className={styles.sbarContainer} style={{ marginBottom: '1.25rem' }}>
              {getEmergencySmsText(selectedEmergencyContact)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <a
                href={`sms:${selectedEmergencyContact.phone_number}?body=${encodeURIComponent(getEmergencySmsText(selectedEmergencyContact))}`}
                className="btn-primary"
                style={{ minHeight: '48px', justifyContent: 'center', fontWeight: 700, textDecoration: 'none' }}
              >
                Open SMS App
              </a>
              <button
                onClick={() => handleCopySms(selectedEmergencyContact)}
                className="btn-secondary"
                style={{ minHeight: '48px', justifyContent: 'center' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContactModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddContactModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--p-text-primary)' }}>
              Add Escalation Contact
            </h2>

            <form onSubmit={handleAddContact}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                CONTACT / SERVICE NAME
              </label>
              <input
                type="text"
                required
                className={styles.inputField}
                placeholder="e.g. Hospice After-Hours Triage"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                ROLE TITLE
              </label>
              <input
                type="text"
                required
                className={styles.inputField}
                placeholder="e.g. Palliative Care Nurse Coordinator / Visiting GP"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                    PRIMARY PHONE NUMBER
                  </label>
                  <input
                    type="text"
                    required
                    className={styles.inputField}
                    placeholder="e.g. 1800-555-725"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                    AFTER HOURS PHONE (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. +1 (555) 999-0000"
                    value={newAfterHours}
                    onChange={(e) => setNewAfterHours(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  id="is247Check"
                  checked={newIs247}
                  onChange={(e) => setNewIs247(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="is247Check" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--p-text-primary)' }}>
                  This is an emergency 24/7 Triage Line
                </label>
              </div>

              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
                CLINICAL NOTES / AVAILABILITY
              </label>
              <textarea
                className={styles.textareaField}
                rows={2}
                placeholder="e.g. Available 24/7 for urgent medication advice or acute pain crisis."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddContactModal(false)}
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
