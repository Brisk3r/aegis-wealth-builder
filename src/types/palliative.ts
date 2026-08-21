// Universal Multi-Pod & Modular Widget Care OS Type Definitions

export type CarerRole = 'primary_carer' | 'support_carer' | 'clinician' | 'parent' | 'pet_parent' | 'co_owner' | 'physio';

export type CarePodArchetype = 
  | 'palliative' 
  | 'pet_care' 
  | 'child_custody' 
  | 'post_op' 
  | 'infant_care' 
  | 'custom';

export type CareWidgetType = 
  | 'medication_safety' 
  | 'feeding_nutrition' 
  | 'hygiene_grooming' 
  | 'activity_turns_walks' 
  | 'elimination_diapers' 
  | 'vitals_symptoms' 
  | 'sbar_handover' 
  | 'custody_checklist' 
  | 'emergency_contacts' 
  | 'audio_notes' 
  | 'syringe_driver' 
  | 'clinical_dossier';

export interface QuickActionPreset {
  id: string;
  label: string;
  category: LogCategory;
  iconName: string;
  color: string;
  defaultPayload: Partial<CareLog>;
}

export interface CarePod {
  id: string;
  patient_display_name: string;
  archetype: CarePodArchetype;
  avatar_emoji: string;
  theme_color: string;
  subtitle?: string;
  date_of_birth?: string;
  created_at: string;
  primary_diagnosis?: string;
  advance_care_plan_notes?: string;
  enabled_widgets: CareWidgetType[];
  custom_quick_actions?: QuickActionPreset[];
  
  // Clinical specific
  syringe_driver_active?: boolean;
  syringe_driver_medication?: string;
  syringe_driver_rate_ml_hr?: number;
  syringe_driver_volume_remaining_ml?: number;
  syringe_driver_next_change_time?: string;

  // Custody / Routine specific
  custody_routine_notes?: string;
  school_or_vet_info?: string;
}

export interface CarePodMember {
  id: string;
  care_pod_id: string;
  user_id: string;
  display_name: string;
  role: CarerRole;
  phone_number?: string;
  avatar_color?: string;
  created_at: string;
}

export type MedicationRoute = 'Oral' | 'Sublingual' | 'Subcutaneous' | 'Patch' | 'Syringe Driver' | 'Rectal' | 'Topical' | 'Inhaler' | 'Eye Drops' | 'Treat / Food Mix';

export interface Medication {
  id: string;
  care_pod_id: string;
  name: string;
  dosage: string;
  route: MedicationRoute;
  is_prn: boolean;
  indication?: string;
  min_interval_minutes: number;
  max_doses_per_24h?: number;
  instructions?: string;
  is_active: boolean;
  created_at: string;
}

export type LogCategory = 
  | 'medication' 
  | 'comfort' 
  | 'fluid_food' 
  | 'reposition' 
  | 'activity_walk'
  | 'bowel_bladder' 
  | 'symptom' 
  | 'custody'
  | 'note' 
  | 'syringe_driver';

export type SecretionsLevel = 'None' | 'Mild' | 'Moderate' | 'Severe/Rattling';
export type BodyPosition = 'Back' | 'Left Side (30 deg)' | 'Right Side (30 deg)' | 'Head Elevated (45 deg)' | 'High Fowler' | 'Comfortable in Armchair';
export type UrineOutputLevel = 'Normal' | 'Low' | 'Incontinence Pad Changed' | 'Catheter Emptied' | 'None (Oliguria)' | 'Wet Diaper' | 'Normal Pee on Walk';

export interface CareLog {
  id: string;
  care_pod_id: string;
  logged_by_member_id: string;
  logged_by_name: string;
  logged_at: string;
  category: LogCategory;
  
  // Medication specific
  medication_id?: string;
  medication_name?: string;
  dose_administered?: string;
  prn_reason?: string;
  is_prn?: boolean;
  
  // Symptom & Comfort specific
  pain_score?: number;
  breathlessness_score?: number;
  agitation_score?: number;
  nausea_score?: number;
  drowsiness_score?: number;
  secretions_level?: SecretionsLevel;
  mood_rating?: 'Happy & Energetic' | 'Calm & Rested' | 'Tired / Sleepy' | 'Fussy / Irritable' | 'Distressed / In Pain';
  
  // Comfort, Grooming & Hygiene
  comfort_action?: string; // 'Mouth swab', 'Bath / Wash', 'Fur brushed', 'Eye drops', 'Nails clipped', 'Heat pack'
  
  // Fluids / Nutrition / Meals
  fluid_ml?: number;
  food_description?: string; // e.g. "1.5 cups dry kibble", "Spaghetti & Apple juice", "Breastfeed 20min"
  food_amount_grams?: number;
  appetite_level?: 'Ate All' | 'Ate Most' | 'Picked At Food' | 'Refused Food';
  swallow_difficulty?: boolean;
  
  // Activity / Repositioning / Walks / Physio
  position?: BodyPosition;
  activity_type?: string; // '30m Leash Walk', 'Knee Extension ROM (3x10)', 'Tummy Time (15m)', 'Park Play', '30 deg Tilt'
  activity_duration_minutes?: number;
  skin_check_notes?: string;
  
  // Elimination / Diaper / Litter / Bowel
  bowel_movement?: boolean;
  bristol_stool_type?: number;
  urine_output?: UrineOutputLevel;
  urine_ml?: number;
  
  // Joint Custody / School Handover specific
  custody_event?: 'Drop-off' | 'Pick-up' | 'Homework Finished' | 'School Bag Packed' | 'Doctor Visit';
  custody_checklist_items?: string[]; // ['Medication Inhaler Packed', 'Homework in Bag', 'Sports Shoes']
  
  // Voice / Notes
  free_text_note?: string;
  audio_memo_url?: string;
  is_handover_flagged?: boolean;
}

export interface EscalationContact {
  id: string;
  care_pod_id: string;
  name: string;
  role_title: string; // e.g. "Emergency Vet Clinic", "Pediatrician", "Palliative Triage"
  phone_number: string;
  after_hours_phone?: string;
  display_order: number;
  notes?: string;
  is_24_7?: boolean;
}

export interface SyncQueueItem {
  id: string;
  table: 'care_pods' | 'care_pod_members' | 'medications' | 'care_logs' | 'escalation_contacts';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: unknown;
  timestamp: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retry_count: number;
}

export interface MedicationLockoutStatus {
  medicationId: string;
  medicationName: string;
  dosage: string;
  route: MedicationRoute;
  indication?: string;
  isPRN: boolean;
  minIntervalMinutes: number;
  maxDosesPer24h?: number;
  lastDoseTime?: string;
  lastDoseMinutesAgo?: number;
  isLocked: boolean;
  remainingMinutes: number;
  nextEligibleTime?: string;
  dosesInLast24h: number;
  isMaxDosesReached: boolean;
}

export interface ShiftHandoverSummary {
  timeframeHours: number;
  startTime: string;
  endTime: string;
  patientName: string;
  archetype: CarePodArchetype;
  activeCarersCount: number;
  totalLogsCount: number;
  
  prnDosesAdministered: Array<{
    medName: string;
    dose: string;
    time: string;
    loggedBy: string;
    reason?: string;
  }>;
  
  symptomSummary: {
    maxPain: number | null;
    avgPain: number | null;
    maxAgitation: number | null;
    maxBreathlessness: number | null;
    secretionsTrend: SecretionsLevel;
    overallStability: string;
  };
  
  activitySummary: {
    totalWalksOrTurns: number;
    lastActivityTime: string | null;
    lastActivityDescription: string;
    activityOverdue: boolean;
    overdueNotice: string;
  };
  
  hydrationAndOutput: {
    totalFluidMl: number;
    mealsLogged: number;
    lastMealSummary: string;
    bowelMovementsCount: number;
    lastBowelMovementTime: string | null;
    urineOutputSummary: string;
  };
  
  custodySummary?: {
    lastCustodyEvent?: string;
    checklistCompleted: boolean;
    pendingChecklistItems: string[];
  };
  
  flaggedNotes: Array<{
    id: string;
    loggedAt: string;
    loggedBy: string;
    category: LogCategory;
    note: string;
  }>;
  
  urgentRecommendations: string[];
  rawSbarBriefing: string;
}
