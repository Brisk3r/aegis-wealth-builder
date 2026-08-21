'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pill, 
  Sparkles, 
  Droplet, 
  RotateCcw, 
  Activity, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  Check, 
  Clock, 
  ShieldAlert, 
  Smile, 
  Utensils, 
  Dog, 
  Bath, 
  Backpack, 
  Heart,
  Bandage
} from 'lucide-react';
import styles from './palliative.module.css';
import { 
  LogCategory, 
  Medication, 
  BodyPosition, 
  SecretionsLevel, 
  UrineOutputLevel,
  MedicationLockoutStatus,
  CarePod 
} from '@/types/palliative';
import { PalliativeDb } from '@/utils/palliativeDb';
import { PalliativeSpeech } from '@/utils/palliativeSpeech';
import { calculateMedicationLockouts } from '@/utils/palliativeHandover';

interface QuickLogModalProps {
  initialCategory?: string;
  onClose: () => void;
  onLogSaved: () => void;
}

export default function QuickLogModal({
  initialCategory = 'medication',
  onClose,
  onLogSaved
}: QuickLogModalProps) {
  const [carePod, setCarePod] = useState<CarePod | null>(null);
  const [activeCategory, setActiveCategory] = useState<LogCategory>(
    (initialCategory as LogCategory) || 'medication'
  );

  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [doseAdministered, setDoseAdministered] = useState<string>('');
  const [prnReason, setPrnReason] = useState<string>('');

  // Comfort / Grooming
  const [comfortAction, setComfortAction] = useState<string>('Mouth swab/care');

  // Fluids / Meals
  const [fluidMl, setFluidMl] = useState<number>(30);
  const [foodDesc, setFoodDesc] = useState<string>('');
  const [swallowDiff, setSwallowDiff] = useState<boolean>(false);

  // Activity / Reposition / Walks
  const [position, setPosition] = useState<BodyPosition>('Left Side (30 deg)');
  const [activityType, setActivityType] = useState<string>('30m Leash Walk');
  const [activityDuration, setActivityDuration] = useState<number>(30);
  const [skinNotes, setSkinNotes] = useState<string>('');

  // Bowel / Bladder / Diaper
  const [bowelMovement, setBowelMovement] = useState<boolean>(false);
  const [bristolStool, setBristolStool] = useState<number>(4);
  const [urineOutput, setUrineOutput] = useState<UrineOutputLevel>('Normal');
  const [urineMl, setUrineMl] = useState<number>(150);

  // Custody
  const [custodyEvent, setCustodyEvent] = useState<string>('School Bag Packed');

  // Symptoms & Mood
  const [painScore, setPainScore] = useState<number>(2);
  const [breathlessnessScore, setBreathlessnessScore] = useState<number>(1);
  const [agitationScore, setAgitationScore] = useState<number>(0);
  const [nauseaScore, setNauseaScore] = useState<number>(0);
  const [secretions, setSecretions] = useState<SecretionsLevel>('None');
  const [moodRating, setMoodRating] = useState<string>('Happy & Energetic');

  // Notes & Voice
  const [freeTextNote, setFreeTextNote] = useState<string>('');
  const [isHandoverFlagged, setIsHandoverFlagged] = useState<boolean>(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);

  // Lockout calculation for safety check
  const [lockoutStatuses, setLockoutStatuses] = useState<MedicationLockoutStatus[]>([]);
  const [overrideLockoutWarning, setOverrideLockoutWarning] = useState<boolean>(false);

  useEffect(() => {
    const pod = PalliativeDb.getCarePod();
    const meds = PalliativeDb.getMedications();
    const logs = PalliativeDb.getCareLogs();
    setCarePod(pod);
    setMedications(meds);
    if (meds.length > 0) {
      setSelectedMedId(meds[0].id);
      setDoseAdministered(meds[0].dosage);
    }
    const lockouts = calculateMedicationLockouts(meds, logs);
    setLockoutStatuses(lockouts);

    // Context-sensitive defaults
    if (pod.archetype === 'pet_care') {
      setFoodDesc('1.5 cups dry kibble + fresh water');
      setComfortAction('Bath / Wash & Fur Brushed');
      setActivityType('30m Leash Walk');
    } else if (pod.archetype === 'child_custody') {
      setFoodDesc('Dinner & fresh fruit snack');
      setActivityType('Soccer Practice (45m)');
    } else if (pod.archetype === 'post_op') {
      setComfortAction('Cryotherapy Ice Compression (20 min)');
      setActivityType('Quad Sets & Heel Slides (3x10 reps)');
    }
  }, []);

  const selectedLockout = lockoutStatuses.find(l => l.medicationId === selectedMedId);

  const handleMedChange = (medId: string) => {
    setSelectedMedId(medId);
    const med = medications.find(m => m.id === medId);
    if (med) {
      setDoseAdministered(med.dosage);
    }
    setOverrideLockoutWarning(false);
  };

  const handleSave = () => {
    PalliativeSpeech.triggerHaptic('success');
    const pod = carePod || PalliativeDb.getCarePod();

    if (activeCategory === 'medication') {
      const med = medications.find(m => m.id === selectedMedId);
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'medication',
        medication_id: selectedMedId,
        medication_name: med ? med.name : 'Medication',
        dose_administered: doseAdministered,
        is_prn: med ? med.is_prn : true,
        prn_reason: prnReason || (med ? med.indication : 'Routine dose'),
        pain_score: painScore,
        is_handover_flagged: isHandoverFlagged,
        free_text_note: freeTextNote,
      });
    } else if (activeCategory === 'comfort') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'comfort',
        comfort_action: comfortAction,
        free_text_note: freeTextNote || `${comfortAction} completed.`,
        is_handover_flagged: isHandoverFlagged,
      });
    } else if (activeCategory === 'fluid_food') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'fluid_food',
        fluid_ml: fluidMl,
        food_description: foodDesc,
        swallow_difficulty: swallowDiff,
        free_text_note: freeTextNote || `${foodDesc || `${fluidMl}ml fluid provided`}`,
        is_handover_flagged: isHandoverFlagged || swallowDiff,
      });
    } else if (activeCategory === 'reposition') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'reposition',
        position: position,
        skin_check_notes: skinNotes || 'Pillows adjusted for support.',
        free_text_note: freeTextNote,
        is_handover_flagged: isHandoverFlagged,
      });
    } else if (activeCategory === 'activity_walk') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'activity_walk',
        activity_type: activityType,
        activity_duration_minutes: activityDuration,
        bowel_movement: bowelMovement,
        free_text_note: freeTextNote || `${activityType} (${activityDuration} mins)`,
        is_handover_flagged: isHandoverFlagged,
      });
    } else if (activeCategory === 'bowel_bladder') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'bowel_bladder',
        bowel_movement: bowelMovement,
        bristol_stool_type: bowelMovement ? bristolStool : undefined,
        urine_output: urineOutput,
        urine_ml: urineMl,
        free_text_note: freeTextNote,
        is_handover_flagged: isHandoverFlagged,
      });
    } else if (activeCategory === 'custody') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'custody',
        custody_event: custodyEvent as any,
        free_text_note: freeTextNote || `${custodyEvent} completed successfully.`,
        is_handover_flagged: isHandoverFlagged,
      });
    } else if (activeCategory === 'symptom') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'symptom',
        pain_score: painScore,
        breathlessness_score: breathlessnessScore,
        agitation_score: agitationScore,
        nausea_score: nauseaScore,
        secretions_level: secretions,
        mood_rating: moodRating as any,
        free_text_note: freeTextNote,
        is_handover_flagged: isHandoverFlagged || painScore >= 5,
      });
    } else if (activeCategory === 'note') {
      PalliativeDb.addCareLog({
        care_pod_id: pod.id,
        category: 'note',
        free_text_note: freeTextNote || 'Observation recorded.',
        is_handover_flagged: isHandoverFlagged,
      });
    }

    onLogSaved();
    onClose();
  };

  const toggleVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      PalliativeSpeech.triggerHaptic('medium');
      const recognizer = PalliativeSpeech.createSpeechRecognizer((transcript) => {
        setFreeTextNote(prev => (prev ? `${prev} ${transcript}` : transcript));
      });
      if (recognizer.isSupported) {
        recognizer.start();
      } else {
        setTimeout(() => {
          setFreeTextNote(prev => prev ? `${prev} Logged successfully.` : 'Everything completed smoothly on schedule.');
          setIsRecordingVoice(false);
        }, 1800);
      }
    } else {
      setIsRecordingVoice(false);
      PalliativeSpeech.triggerHaptic('light');
    }
  };

  const archetype = carePod?.archetype || 'palliative';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--p-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              [EPIC] 5-Second Quick Log ({carePod?.patient_display_name || 'Care Pod'})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--p-text-secondary)' }}>
              1-tap logging tailored for {carePod?.subtitle || 'Care Pod'}
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{ minHeight: '44px', minWidth: '44px', background: 'transparent', border: 'none', color: 'var(--p-text-secondary)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Dynamic Category Selector Tabs */}
        <div className={styles.btnGroup} style={{ marginBottom: '1.25rem' }}>
          <button
            onClick={() => setActiveCategory('fluid_food')}
            className={`${styles.chipBtn} ${activeCategory === 'fluid_food' ? styles.chipBtnActive : ''}`}
          >
            <Utensils size={15} /> {archetype === 'pet_care' ? 'Feed / Water' : 'Meals / Fluids'}
          </button>

          <button
            onClick={() => setActiveCategory(archetype === 'palliative' ? 'reposition' : 'activity_walk')}
            className={`${styles.chipBtn} ${(activeCategory === 'activity_walk' || activeCategory === 'reposition') ? styles.chipBtnActive : ''}`}
          >
            <RotateCcw size={15} /> {archetype === 'pet_care' ? 'Dog Walk' : archetype === 'palliative' ? '30 deg Turn' : 'Activity / Physio'}
          </button>

          <button
            onClick={() => setActiveCategory('medication')}
            className={`${styles.chipBtn} ${activeCategory === 'medication' ? styles.chipBtnActive : ''}`}
          >
            <Pill size={15} /> {archetype === 'pet_care' ? 'Flea/Tick Med' : 'Med / PRN'}
          </button>

          <button
            onClick={() => setActiveCategory('comfort')}
            className={`${styles.chipBtn} ${activeCategory === 'comfort' ? styles.chipBtnActive : ''}`}
          >
            <Sparkles size={15} /> {archetype === 'pet_care' ? 'Grooming/Bath' : 'Hygiene/Comfort'}
          </button>

          {archetype === 'child_custody' && (
            <button
              onClick={() => setActiveCategory('custody')}
              className={`${styles.chipBtn} ${activeCategory === 'custody' ? styles.chipBtnActive : ''}`}
            >
              <Backpack size={15} /> School / Handover
            </button>
          )}

          <button
            onClick={() => setActiveCategory('bowel_bladder')}
            className={`${styles.chipBtn} ${activeCategory === 'bowel_bladder' ? styles.chipBtnActive : ''}`}
          >
            <Activity size={15} /> {archetype === 'pet_care' ? 'Pee / Poop' : 'Elimination'}
          </button>

          <button
            onClick={() => setActiveCategory('symptom')}
            className={`${styles.chipBtn} ${activeCategory === 'symptom' ? styles.chipBtnActive : ''}`}
          >
            <Smile size={15} /> {archetype === 'child_custody' ? 'Mood' : 'Symptoms'}
          </button>

          <button
            onClick={() => setActiveCategory('note')}
            className={`${styles.chipBtn} ${activeCategory === 'note' ? styles.chipBtnActive : ''}`}
          >
            <Mic size={15} /> Note
          </button>
        </div>

        {/* 1. FLUIDS / MEALS */}
        {activeCategory === 'fluid_food' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--p-text-secondary)' }}>
              1-TAP MEAL PRESETS
            </label>
            <div className={styles.btnGroup}>
              {(archetype === 'pet_care' ? [
                '1.5 cups dry kibble + water bowl',
                '1 can wet food (Salmon)',
                '1 dental chew stick',
                'Half portion kibble',
                'Fresh water bowl refilled'
              ] : archetype === 'child_custody' ? [
                'Breakfast: Cereal & 200ml milk',
                'School lunchbox packed',
                'Afternoon snack & juice box',
                'Dinner & fresh fruit',
                'Bedtime warm milk'
              ] : [
                'Mouth hydration sponge swab',
                '30ml thickened water sip',
                '50ml oral fluid sip',
                'Puree meal 3 teaspoons',
                'Ice chip on tongue'
              ]).map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFoodDesc(preset)}
                  className={`${styles.chipBtn} ${foodDesc === preset ? styles.chipBtnActive : ''}`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>
              CUSTOM MEAL DESCRIPTION (OPTIONAL)
            </label>
            <input
              type="text"
              className={styles.inputField}
              value={foodDesc}
              onChange={(e) => setFoodDesc(e.target.value)}
              placeholder="e.g. 1.5 cups kibble or Spaghetti dinner"
            />
          </div>
        )}

        {/* 2. ACTIVITY & WALKS / REPOSITION */}
        {(activeCategory === 'activity_walk' || activeCategory === 'reposition') && (
          <div>
            {archetype === 'palliative' ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--p-text-secondary)' }}>
                  BODY POSITION (30 deg TILT SCHEDULE)
                </label>
                <div className={styles.btnGroup}>
                  {['Left Side (30 deg)', 'Right Side (30 deg)', 'Back (Supine)', 'Head Elevated (45 deg)', 'High Fowler'].map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPosition(pos as BodyPosition)}
                      className={`${styles.chipBtn} ${position === pos ? styles.chipBtnActive : ''}`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--p-text-secondary)' }}>
                  ACTIVITY / EXERCISE PRESETS
                </label>
                <div className={styles.btnGroup}>
                  {(archetype === 'pet_care' ? [
                    '30m Leash Walk in neighborhood',
                    '45m Off-leash Dog Park play',
                    '15m Quick potty walk',
                    'Backyard fetch & play'
                  ] : [
                    'Quad sets & Heel slides (3x10)',
                    'Soccer practice & drills',
                    'Tummy time 15 minutes',
                    'Stretching & ROM exercises'
                  ]).map(act => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setActivityType(act)}
                      className={`${styles.chipBtn} ${activityType === act ? styles.chipBtnActive : ''}`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. MEDICATION & PRN */}
        {activeCategory === 'medication' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--p-text-secondary)' }}>
              SELECT MEDICATION
            </label>
            <select
              aria-label="Select Medication"
              className={styles.selectField}
              value={selectedMedId}
              onChange={(e) => handleMedChange(e.target.value)}
            >
              {medications.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.dosage} - {m.route})
                </option>
              ))}
            </select>

            {/* Lockout status */}
            {selectedLockout && (
              <div style={{
                padding: '0.85rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                background: selectedLockout.isLocked ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${selectedLockout.isLocked ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: selectedLockout.isLocked ? 'var(--p-accent-orange)' : 'var(--p-accent-green)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {selectedLockout.isLocked ? <Clock size={16} /> : <Check size={16} />}
                    {selectedLockout.isLocked ? `LOCKED: ${selectedLockout.remainingMinutes} min remaining` : 'ELIGIBLE TO ADMINISTER'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--p-text-secondary)' }}>
                    24h Doses: {selectedLockout.dosesInLast24h}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--p-text-primary)' }}>
                  Indication: {selectedLockout.indication || 'Scheduled / PRN'} * Route: {selectedLockout.route}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>DOSE GIVEN</label>
                <input type="text" className={styles.inputField} value={doseAdministered} onChange={(e) => setDoseAdministered(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--p-text-secondary)' }}>REASON / INDICATION</label>
                <input type="text" className={styles.inputField} value={prnReason} onChange={(e) => setPrnReason(e.target.value)} placeholder="e.g. Scheduled or symptom relief" />
              </div>
            </div>
          </div>
        )}

        {/* 4. COMFORT & GROOMING */}
        {activeCategory === 'comfort' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--p-text-secondary)' }}>
              1-TAP HYGIENE & GROOMING ACTIONS
            </label>
            <div className={styles.btnGroup}>
              {(archetype === 'pet_care' ? [
                'Full Bath with oatmeal shampoo',
                'Washed muddy paws & dried',
                'Fur brushing (15 mins)',
                'Ear cleaner drops applied',
                'Nail clipping session'
              ] : [
                'Mouth swab & lip balm',
                'Eye drops (saline)',
                'Cooling cloth on forehead',
                'Bed linen refreshed',
                'Cryotherapy Ice (20m)'
              ]).map(act => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setComfortAction(act)}
                  className={`${styles.chipBtn} ${comfortAction === act ? styles.chipBtnActive : ''}`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. CUSTODY HANDOVER */}
        {activeCategory === 'custody' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--p-text-secondary)' }}>
              CO-PARENTING HANDOVER EVENT
            </label>
            <div className={styles.btnGroup}>
              {[
                'School Pickup at front gate',
                'School Drop-off completed',
                'School Bag Packed & Verified',
                'Homework math sheet finished',
                'Doctor / Dentist visit done'
              ].map(event => (
                <button
                  key={event}
                  type="button"
                  onClick={() => setCustodyEvent(event)}
                  className={`${styles.chipBtn} ${custodyEvent === event ? styles.chipBtnActive : ''}`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 6. BOWEL / ELIMINATION */}
        {activeCategory === 'bowel_bladder' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--p-border)', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="bowelToggle"
                checked={bowelMovement}
                onChange={(e) => setBowelMovement(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <label htmlFor="bowelToggle" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--p-text-primary)' }}>
                [BM] {archetype === 'pet_care' ? 'Pooped on Walk / In Yard' : 'Bowel Movement / Poop'}
              </label>
            </div>

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--p-text-secondary)' }}>
              URINE / PEE STATUS
            </label>
            <div className={styles.btnGroup}>
              {[
                'Normal Pee on Walk',
                'Normal',
                'Wet Diaper Changed',
                'Incontinence Pad Changed',
                'None'
              ].map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUrineOutput(u as UrineOutputLevel)}
                  className={`${styles.chipBtn} ${urineOutput === u ? styles.chipBtnActive : ''}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 7. SYMPTOMS & MOOD */}
        {activeCategory === 'symptom' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--p-text-secondary)' }}>
              MOOD & ENERGY RATING
            </label>
            <div className={styles.btnGroup}>
              {[
                'Happy & Energetic',
                'Calm & Rested',
                'Tired / Sleepy',
                'Fussy / Irritable',
                'Distressed / In Pain'
              ].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMoodRating(m)}
                  className={`${styles.chipBtn} ${moodRating === m ? styles.chipBtnActive : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--p-text-secondary)', marginBottom: '0.3rem' }}>
                  <span>PAIN (0 - 10)</span>
                  <span style={{ color: painScore >= 5 ? 'var(--p-accent-red)' : 'var(--p-accent)' }}>{painScore}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScore}
                  onChange={(e) => setPainScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--p-accent)' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--p-text-secondary)', marginBottom: '0.3rem' }}>
                  <span>BREATHLESSNESS / WHEEZE</span>
                  <span>{breathlessnessScore}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={breathlessnessScore}
                  onChange={(e) => setBreathlessnessScore(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--p-accent)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Free Text Note & Voice Dictation */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--p-text-secondary)' }}>
              NOTES & VOICE MEMO
            </label>
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`${styles.chipBtn} ${isRecordingVoice ? styles.chipBtnActive : ''}`}
              style={{ minHeight: '36px', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
            >
              {isRecordingVoice ? <MicOff size={14} className="animate-pulse" style={{ color: 'var(--p-accent-red)' }} /> : <Mic size={14} />}
              <span>{isRecordingVoice ? 'Listening...' : 'Voice Dictate'}</span>
            </button>
          </div>

          <textarea
            className={styles.textareaField}
            rows={2}
            value={freeTextNote}
            onChange={(e) => setFreeTextNote(e.target.value)}
            placeholder="Add observations, behavior notes, or handover reminders..."
          />
        </div>

        {/* Flag for Handover */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <input
            type="checkbox"
            id="handoverFlagCheck"
            checked={isHandoverFlagged}
            onChange={(e) => setIsHandoverFlagged(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <label htmlFor="handoverFlagCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--p-text-primary)' }}>
            ** Pin this in next Handover Briefing
          </label>
        </div>

        {/* Save & Cancel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            className={styles.chipBtn}
            style={{ justifyContent: 'center', minHeight: '52px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn-primary"
            style={{ minHeight: '52px', fontSize: '1rem', fontWeight: 800, width: '100%', justifyContent: 'center' }}
          >
            <Check size={20} /> Save Quick Log
          </button>
        </div>
      </div>
    </div>
  );
}
