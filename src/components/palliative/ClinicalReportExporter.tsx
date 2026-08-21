'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Pill, 
  Activity, 
  Droplet, 
  RotateCcw, 
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import styles from './palliative.module.css';
import { CarePod, CareLog, Medication, CarePodMember } from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';

export default function ClinicalReportExporter() {
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [members, setMembers] = useState<CarePodMember[]>([]);
  const [timeframeDays, setTimeframeDays] = useState<number>(1); // 1 = 24h, 2 = 48h, 7 = 7 days
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setCarePod(PalliativeDb.getCarePod());
    setLogs(PalliativeDb.getCareLogs());
    setMedications(PalliativeDb.getMedications());
    setMembers(PalliativeDb.getMembers());
  }, []);

  const windowStartMs = Date.now() - timeframeDays * 24 * 60 * 60 * 1000;
  const filteredLogs = logs.filter(l => new Date(l.logged_at).getTime() >= windowStartMs);

  // Medication Logs
  const medLogs = filteredLogs.filter(l => l.category === 'medication');

  // Chart Data for ESAS-r Symptoms
  const symptomData = filteredLogs
    .filter(l => (typeof l.pain_score === 'number' || typeof l.breathlessness_score === 'number' || typeof l.agitation_score === 'number'))
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
    .map(l => ({
      time: new Date(l.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(l.logged_at).toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
      Pain: l.pain_score ?? null,
      Breathlessness: l.breathlessness_score ?? null,
      Agitation: l.agitation_score ?? null,
      Nausea: l.nausea_score ?? null,
    }));

  // Fluid Balance
  const fluidLogs = filteredLogs.filter(l => l.category === 'fluid_food' && typeof l.fluid_ml === 'number');
  const totalFluidMl = fluidLogs.reduce((acc, l) => acc + (l.fluid_ml || 0), 0);

  // Bowel movements
  const bowelLogs = filteredLogs.filter(l => l.category === 'bowel_bladder' && l.bowel_movement);

  // Turns
  const turnLogs = filteredLogs.filter(l => l.category === 'reposition');

  const handlePrint = () => {
    PalliativeSpeech.triggerHaptic('medium');
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportJSON = () => {
    PalliativeSpeech.triggerHaptic('success');
    const exportData = {
      patient: carePod,
      exportTimestamp: new Date().toISOString(),
      reportWindow: `${timeframeDays * 24} hours`,
      members,
      medications,
      logs: filteredLogs,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Palliative_Report_${carePod?.patient_display_name.replace(/\s+/g, '_')}_${timeframeDays}d.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    PalliativeSpeech.triggerHaptic('light');
    const summaryText = `VISITING CLINICIAN SUMMARY - ${carePod?.patient_display_name}
Window: Last ${timeframeDays * 24} Hours
Goals of Care: ${carePod?.advance_care_plan_notes}
Syringe Driver: ${carePod?.syringe_driver_active ? `Active (${carePod.syringe_driver_medication})` : 'Inactive'}
Total PRN Doses Administered: ${medLogs.length}
Total Fluid Intake: ${totalFluidMl}ml
Bowel Movements: ${bowelLogs.length}
Repositioning Turns: ${turnLogs.length}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!carePod) return null;

  return (
    <div>
      {/* Controls Bar (Hidden during Print) */}
      <div className="noPrint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={24} style={{ color: 'var(--p-accent)' }} />
            Visiting Clinician & GP Clinical Dossier
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
            Printable medical report formatted for visiting Community Palliative Nurses, General Practitioners, and Hospices.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {/* Timeframe selector */}
          <div className={styles.btnGroup} style={{ margin: 0 }}>
            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); setTimeframeDays(1); }}
              className={`${styles.chipBtn} ${timeframeDays === 1 ? styles.chipBtnActive : ''}`}
            >
              24 Hours
            </button>
            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); setTimeframeDays(2); }}
              className={`${styles.chipBtn} ${timeframeDays === 2 ? styles.chipBtnActive : ''}`}
            >
              48 Hours
            </button>
            <button
              onClick={() => { PalliativeSpeech.triggerHaptic('light'); setTimeframeDays(7); }}
              className={`${styles.chipBtn} ${timeframeDays === 7 ? styles.chipBtnActive : ''}`}
            >
              7 Days
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="btn-secondary"
            style={{ minHeight: '44px' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="btn-secondary"
            style={{ minHeight: '44px' }}
          >
            <Download size={16} /> JSON Export
          </button>

          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{ minHeight: '44px', fontWeight: 700 }}
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Clinical Dossier Container */}
      <div className={styles.printableReport} style={{ background: 'var(--p-bg-card)', border: '1px solid var(--p-border)', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid var(--p-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--p-accent)' }}>
              {carePod.archetype === 'pet_care' ? 'VETERINARY CLINICAL & WELLNESS DOSSIER' : 
               carePod.archetype === 'child_custody' ? 'CO-PARENTING & PEDIATRIC HEALTH DOSSIER' : 
               carePod.archetype === 'post_op' ? 'POST-OPERATIVE REHABILITATION PROGRESS DOSSIER' : 
               'HOME PALLIATIVE CARE * CLINICAL HANDOVER DOSSIER'}
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--p-text-primary)', margin: '0.2rem 0' }}>
              {carePod.patient_display_name} {carePod.avatar_emoji}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--p-text-secondary)' }}>
              {carePod.subtitle || `DOB: ${carePod.date_of_birth || 'N/A'}`} * {carePod.primary_diagnosis || 'Care Coordination'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--p-text-secondary)' }}>
              Report Window: <strong>Last {timeframeDays * 24} Hours</strong>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>
              Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
            <span style={{ display: 'inline-block', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: '6px', background: 'var(--p-pill-bg)', color: carePod.theme_color || 'var(--p-accent)', border: '1px solid var(--p-border)', textTransform: 'uppercase' }}>
              {carePod.archetype.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Instructions & Goals Banner */}
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--p-border)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--p-accent)', marginBottom: '0.3rem' }}>
            {carePod.archetype === 'pet_care' ? 'CARE INSTRUCTIONS & VET GUIDANCE' : 
             carePod.archetype === 'child_custody' ? 'CO-PARENTING ROUTINE & MEDICAL DIRECTIVES' : 
             'ADVANCE CARE DIRECTIVE & GOALS OF CARE'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--p-text-primary)', lineHeight: 1.5 }}>
            {carePod.advance_care_plan_notes || 'All care routines on track.'}
          </div>
        </div>

        {/* Syringe Driver Status */}
        {carePod.syringe_driver_active && (
          <div style={{ background: 'rgba(0, 240, 255, 0.08)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--p-border)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--p-accent)', marginBottom: '0.3rem' }}>
              CONTINUOUS SUBCUTANEOUS INFUSION (SYRINGE DRIVER)
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--p-text-primary)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
              <div><strong>Medication:</strong> {carePod.syringe_driver_medication}</div>
              <div><strong>Flow Rate:</strong> {carePod.syringe_driver_rate_ml_hr} ml/hr</div>
              <div><strong>Remaining:</strong> ~{carePod.syringe_driver_volume_remaining_ml} ml</div>
            </div>
          </div>
        )}

        {/* 1. ESAS-r Symptom Trajectory Chart */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--p-text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--p-accent)' }} />
            1. Edmonton Symptom Assessment System (ESAS-r) Trajectory
          </h3>

          {symptomData.length > 0 ? (
            <div style={{ width: '100%', height: 260, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--p-border)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={symptomData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="time" stroke="var(--p-text-muted)" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="var(--p-text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Pain" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Breathlessness" stroke="#00f0ff" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Agitation" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Nausea" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
              No quantitative ESAS-r scores logged in this timeframe.
            </div>
          )}
        </section>

        {/* 2. Medication Administration Record (MAR) */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--p-text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Pill size={18} style={{ color: 'var(--p-accent-orange)' }} />
            2. PRN Breakthrough Medication Administrations ({medLogs.length} Doses Given)
          </h3>

          {medLogs.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--p-border)', color: 'var(--p-text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem' }}>Medication & Dose</th>
                    <th style={{ padding: '0.6rem' }}>Carer</th>
                    <th style={{ padding: '0.6rem' }}>Clinical Indication / Reason</th>
                    <th style={{ padding: '0.6rem' }}>Pre-Dose Pain</th>
                  </tr>
                </thead>
                <tbody>
                  {medLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.6rem', color: 'var(--p-accent)', fontWeight: 600 }}>
                        {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(log.logged_at).toLocaleDateString()})
                      </td>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>
                        {log.medication_name} ({log.dose_administered})
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--p-text-secondary)' }}>
                        {log.logged_by_name}
                      </td>
                      <td style={{ padding: '0.6rem', color: 'var(--p-text-primary)' }}>
                        {log.prn_reason || 'Breakthrough symptom'}
                      </td>
                      <td style={{ padding: '0.6rem', color: typeof log.pain_score === 'number' ? 'var(--p-accent-red)' : 'var(--p-text-muted)' }}>
                        {typeof log.pain_score === 'number' ? `${log.pain_score}/10` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--p-text-secondary)' }}>
              No PRN breakthrough doses administered in the selected timeframe.
            </div>
          )}
        </section>

        {/* 3. Hydration, Bowel & Pressure Area Care */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Hydration & Bowel */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--p-border)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--p-accent)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Droplet size={16} /> Fluids, Nutrition & Bowels
            </h4>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--p-text-primary)' }}>
              <div>* Total Fluid Volume: <strong>{totalFluidMl} ml</strong></div>
              <div>* Bowel Movements: <strong>{bowelLogs.length}</strong></div>
              <div>* Swallowing Difficulties Flagged: <strong>{filteredLogs.some(l => l.swallow_difficulty) ? 'YES [!] (Aspiration precaution)' : 'No'}</strong></div>
            </div>
          </div>

          {/* Pressure Care */}
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--p-border)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--p-accent-green)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <RotateCcw size={16} /> Pressure Care & Repositioning
            </h4>
            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--p-text-primary)' }}>
              <div>* Total Turns Logged: <strong>{turnLogs.length}</strong></div>
              <div>* Latest Position: <strong>{turnLogs.length > 0 && turnLogs[0].position ? turnLogs[0].position : 'Supine'}</strong></div>
              <div>* Skin Integrity: <strong>{turnLogs.length > 0 && turnLogs[0].skin_check_notes ? turnLogs[0].skin_check_notes : 'Skin intact'}</strong></div>
            </div>
          </div>
        </section>

        {/* Visiting Clinician Sign-off & Notes Footer */}
        <div style={{ borderTop: '1px dashed var(--p-border)', paddingTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--p-text-secondary)', marginBottom: '1.5rem' }}>
              VISITING CLINICIAN / GP NOTES:
            </div>
            <div style={{ borderBottom: '1px solid var(--p-border)', height: '24px', marginBottom: '1rem' }}></div>
            <div style={{ borderBottom: '1px solid var(--p-border)', height: '24px' }}></div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--p-text-secondary)', marginBottom: '1.5rem' }}>
              CLINICIAN SIGNATURE & DATE:
            </div>
            <div style={{ borderBottom: '1px solid var(--p-border)', height: '24px', marginBottom: '1rem' }}></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--p-text-muted)' }}>Sign: ___________________________ Date: ____________</div>
          </div>
        </div>
      </div>
    </div>
  );
}
