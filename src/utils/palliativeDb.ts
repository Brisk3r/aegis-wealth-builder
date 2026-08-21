// Universal Multi-Pod Offline Database Engine & Local Sync Queue for Aegis Care OS
import { 
  CarePod, 
  CarePodMember, 
  Medication, 
  CareLog, 
  EscalationContact, 
  SyncQueueItem,
  CarePodArchetype,
  CareWidgetType 
} from '@/types/palliative';
import { CareSyncBus, SyncMessage } from './careSyncBus';

const STORAGE_KEYS = {
  PODS_LIST: 'aegis_care_pods_list',
  ACTIVE_POD_ID: 'aegis_active_pod_id',
  MEMBERS_PREFIX: 'aegis_care_members_',
  ACTIVE_MEMBER_ID: 'aegis_care_active_member_id_',
  MEDS_PREFIX: 'aegis_care_meds_',
  LOGS_PREFIX: 'aegis_care_logs_',
  CONTACTS_PREFIX: 'aegis_care_contacts_',
  SYNC_QUEUE: 'aegis_care_sync_queue',
  THEME_MODE: 'aegis_comfort_theme_mode',
};

// Seed Realistic Care Pods across multiple archetypes with soft, warm care palette
export function getInitialSeedPods(): {
  pods: CarePod[];
  membersMap: Record<string, CarePodMember[]>;
  medsMap: Record<string, Medication[]>;
  logsMap: Record<string, CareLog[]>;
  contactsMap: Record<string, EscalationContact[]>;
} {
  const now = new Date();
  const formatTimeAgo = (minutesAgo: number) => {
    return new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
  };

  // POD 1: Palliative Care (Margaret Smith) - Soft Teal
  const pod1: CarePod = {
    id: 'pod-margaret-smith',
    patient_display_name: 'Margaret Smith',
    archetype: 'palliative',
    avatar_emoji: '[SENIOR]',
    theme_color: '#2A9D8F',
    subtitle: '78yo * End-of-Life Comfort Care',
    date_of_birth: '1948-03-12',
    created_at: formatTimeAgo(1440 * 10),
    primary_diagnosis: 'Stage IV Pancreatic Adenocarcinoma (Palliative Intent)',
    advance_care_plan_notes: 'Advance Care Directive in place. Goals: Strict Home Comfort & Dignity. NFR/DNR. Reposition every 2-3h, proactive oral mouth swabs.',
    enabled_widgets: [
      'medication_safety',
      'feeding_nutrition',
      'hygiene_grooming',
      'activity_turns_walks',
      'elimination_diapers',
      'vitals_symptoms',
      'sbar_handover',
      'syringe_driver',
      'emergency_contacts',
      'clinical_dossier'
    ],
    syringe_driver_active: true,
    syringe_driver_medication: 'Morphine 30mg + Midazolam 10mg + Buscopan 60mg / 24hr',
    syringe_driver_rate_ml_hr: 1.0,
    syringe_driver_volume_remaining_ml: 11.5,
    syringe_driver_next_change_time: new Date(now.getTime() + 11.5 * 60 * 60 * 1000).toISOString(),
  };

  // POD 2: Shared Pet Care (Barnaby the Golden Retriever) - Warm Amber
  const pod2: CarePod = {
    id: 'pod-barnaby-dog',
    patient_display_name: 'Barnaby',
    archetype: 'pet_care',
    avatar_emoji: '[PET]',
    theme_color: '#E9C46A',
    subtitle: '4yo Golden Retriever * Shared Pet Parenting',
    date_of_birth: '2022-05-14',
    created_at: formatTimeAgo(1440 * 14),
    primary_diagnosis: 'Mild Grass Pollen Allergies',
    advance_care_plan_notes: 'Feed 1.5 cups kibble morning (8am) and evening (6pm). Needs minimum 2x 30min walks daily. Flea/Tick chew on 1st of month. Allergic to chicken treats.',
    enabled_widgets: [
      'feeding_nutrition',
      'activity_turns_walks',
      'hygiene_grooming',
      'medication_safety',
      'elimination_diapers',
      'sbar_handover',
      'emergency_contacts',
      'clinical_dossier'
    ],
    school_or_vet_info: 'Metropolitan 24/7 Animal Hospital & Vet Clinic (Dr. Chloe Barnes)',
  };

  // POD 3: Joint Child Custody (Leo Miller) - Soft Periwinkle Blue
  const pod3: CarePod = {
    id: 'pod-leo-custody',
    patient_display_name: 'Leo Miller',
    archetype: 'child_custody',
    avatar_emoji: '[CHILD]',
    theme_color: '#60A5FA',
    subtitle: '8yo * Grade 3 * Shared Custody Schedule',
    date_of_birth: '2018-09-22',
    created_at: formatTimeAgo(1440 * 30),
    primary_diagnosis: 'Mild Exercise-Induced Asthma',
    advance_care_plan_notes: 'Alternate weeks (Mon 3pm handover at school gate). Swimming on Thursdays 4pm. Pack Ventolin inhaler in school bag daily.',
    enabled_widgets: [
      'custody_checklist',
      'medication_safety',
      'feeding_nutrition',
      'sbar_handover',
      'vitals_symptoms',
      'emergency_contacts',
      'clinical_dossier'
    ],
    school_or_vet_info: 'Oakridge Primary School (Room 14 - Mrs. Henderson)',
  };

  // POD 4: Post-Operative Knee Rehab (James Wilson) - Sage Green
  const pod4: CarePod = {
    id: 'pod-james-postop',
    patient_display_name: 'James Wilson',
    archetype: 'post_op',
    avatar_emoji: '[RECOVERY]',
    theme_color: '#6B9080',
    subtitle: '54yo * Day 4 Post-Total Knee Replacement (Left)',
    date_of_birth: '1972-11-04',
    created_at: formatTimeAgo(1440 * 5),
    primary_diagnosis: 'Left Total Knee Arthroplasty (TKA)',
    advance_care_plan_notes: 'Weight-bearing as tolerated with crutches. Cryotherapy ice machine 20min every 2h. Range of motion target: 0-90 degrees by day 7.',
    enabled_widgets: [
      'medication_safety',
      'activity_turns_walks',
      'hygiene_grooming',
      'vitals_symptoms',
      'sbar_handover',
      'emergency_contacts',
      'clinical_dossier'
    ],
    school_or_vet_info: 'St. Jude Orthopaedic Surgery Ward (Dr. Marcus Thorne)',
  };

  const pods = [pod1, pod2, pod3, pod4];

  // Members Map
  const membersMap: Record<string, CarePodMember[]> = {
    [pod1.id]: [
      { id: 'mem-sarah', care_pod_id: pod1.id, user_id: 'u-sarah', display_name: 'Sarah (Daughter)', role: 'primary_carer', phone_number: '+1 (555) 234-5678', avatar_color: '#2A9D8F', created_at: formatTimeAgo(1440 * 10) },
      { id: 'mem-david', care_pod_id: pod1.id, user_id: 'u-david', display_name: 'David (Son)', role: 'support_carer', phone_number: '+1 (555) 876-5432', avatar_color: '#60A5FA', created_at: formatTimeAgo(1440 * 10) },
      { id: 'mem-nurse-elena', care_pod_id: pod1.id, user_id: 'u-elena', display_name: 'Elena RN (Visiting Nurse)', role: 'clinician', phone_number: '+1 (555) 990-1122', avatar_color: '#6B9080', created_at: formatTimeAgo(1440 * 10) }
    ],
    [pod2.id]: [
      { id: 'mem-alex', care_pod_id: pod2.id, user_id: 'u-alex', display_name: 'Alex (Co-Owner)', role: 'pet_parent', phone_number: '+1 (555) 441-2299', avatar_color: '#E9C46A', created_at: formatTimeAgo(1440 * 14) },
      { id: 'mem-sam', care_pod_id: pod2.id, user_id: 'u-sam', display_name: 'Sam (Partner/Walker)', role: 'pet_parent', phone_number: '+1 (555) 882-3311', avatar_color: '#38bdf8', created_at: formatTimeAgo(1440 * 14) }
    ],
    [pod3.id]: [
      { id: 'mem-emma', care_pod_id: pod3.id, user_id: 'u-emma', display_name: 'Emma (Mom)', role: 'parent', phone_number: '+1 (555) 771-4400', avatar_color: '#ec4899', created_at: formatTimeAgo(1440 * 30) },
      { id: 'mem-mark', care_pod_id: pod3.id, user_id: 'u-mark', display_name: 'Mark (Dad)', role: 'parent', phone_number: '+1 (555) 662-5511', avatar_color: '#6366f1', created_at: formatTimeAgo(1440 * 30) }
    ],
    [pod4.id]: [
      { id: 'mem-james', care_pod_id: pod4.id, user_id: 'u-james', display_name: 'James (Patient)', role: 'primary_carer', phone_number: '+1 (555) 112-9900', avatar_color: '#6B9080', created_at: formatTimeAgo(1440 * 5) },
      { id: 'mem-lisa', care_pod_id: pod4.id, user_id: 'u-lisa', display_name: 'Physio Lisa', role: 'physio', phone_number: '+1 (555) 334-7788', avatar_color: '#2A9D8F', created_at: formatTimeAgo(1440 * 5) }
    ]
  };

  // Meds Map
  const medsMap: Record<string, Medication[]> = {
    [pod1.id]: [
      { id: 'med-morphine', care_pod_id: pod1.id, name: 'Morphine Oral Solution', dosage: '5mg / 0.5ml', route: 'Sublingual', is_prn: true, indication: 'Breakthrough pain or dyspnea', min_interval_minutes: 240, max_doses_per_24h: 6, is_active: true, created_at: formatTimeAgo(1440 * 10) },
      { id: 'med-midazolam', care_pod_id: pod1.id, name: 'Midazolam Subcutaneous', dosage: '2.5mg / 0.5ml', route: 'Subcutaneous', is_prn: true, indication: 'Severe agitation or acute distress', min_interval_minutes: 120, max_doses_per_24h: 4, is_active: true, created_at: formatTimeAgo(1440 * 10) },
      { id: 'med-buscopan', care_pod_id: pod1.id, name: 'Buscopan (Hyoscine)', dosage: '20mg / 1ml', route: 'Subcutaneous', is_prn: true, indication: 'Respiratory secretions', min_interval_minutes: 240, max_doses_per_24h: 4, is_active: true, created_at: formatTimeAgo(1440 * 10) }
    ],
    [pod2.id]: [
      { id: 'med-nexgard', care_pod_id: pod2.id, name: 'NexGard Spectra Chewable', dosage: '1 Chewable Tablet', route: 'Treat / Food Mix', is_prn: false, indication: 'Flea, tick and heartworm prevention', min_interval_minutes: 43200, max_doses_per_24h: 1, is_active: true, created_at: formatTimeAgo(1440 * 14) },
      { id: 'med-apoquel', care_pod_id: pod2.id, name: 'Apoquel Allergy Tablets', dosage: '16mg (1 tablet)', route: 'Oral', is_prn: true, indication: 'Acute paw chewing or skin itching', min_interval_minutes: 720, max_doses_per_24h: 2, is_active: true, created_at: formatTimeAgo(1440 * 14) }
    ],
    [pod3.id]: [
      { id: 'med-ventolin', care_pod_id: pod3.id, name: 'Ventolin (Salbutamol Inhaler)', dosage: '2 Puffs (100mcg/puff)', route: 'Inhaler', is_prn: true, indication: 'Wheezing, asthma cough, pre-sports', min_interval_minutes: 240, max_doses_per_24h: 8, is_active: true, created_at: formatTimeAgo(1440 * 30) },
      { id: 'med-children-zyrtec', care_pod_id: pod3.id, name: "Children's Zyrtec Syrup", dosage: '5ml', route: 'Oral', is_prn: true, indication: 'Hay fever and pollen sneeze', min_interval_minutes: 1440, max_doses_per_24h: 1, is_active: true, created_at: formatTimeAgo(1440 * 30) }
    ],
    [pod4.id]: [
      { id: 'med-endone', care_pod_id: pod4.id, name: 'Oxycodone (Endone)', dosage: '5mg (1 tablet)', route: 'Oral', is_prn: true, indication: 'Post-op breakthrough knee pain', min_interval_minutes: 360, max_doses_per_24h: 4, is_active: true, created_at: formatTimeAgo(1440 * 5) },
      { id: 'med-celebrex', care_pod_id: pod4.id, name: 'Celecoxib (Celebrex)', dosage: '200mg', route: 'Oral', is_prn: false, indication: 'Anti-inflammatory knee swelling', min_interval_minutes: 720, max_doses_per_24h: 2, is_active: true, created_at: formatTimeAgo(1440 * 5) }
    ]
  };

  // Logs Map
  const logsMap: Record<string, CareLog[]> = {
    [pod1.id]: [
      { id: 'log-p1', care_pod_id: pod1.id, logged_by_member_id: 'mem-sarah', logged_by_name: 'Sarah Smith', logged_at: formatTimeAgo(90), category: 'comfort', comfort_action: 'Mouth swab/care', free_text_note: 'Moistened lips with hydration gel swab. Resting quietly.' },
      { id: 'log-p2', care_pod_id: pod1.id, logged_by_member_id: 'mem-david', logged_by_name: 'David Smith', logged_at: formatTimeAgo(240), category: 'medication', medication_id: 'med-morphine', medication_name: 'Morphine Oral Solution', dose_administered: '5mg / 0.5ml', is_prn: true, prn_reason: 'Breakthrough pain (5/10)', pain_score: 5, is_handover_flagged: true },
      { id: 'log-p3', care_pod_id: pod1.id, logged_by_member_id: 'mem-sarah', logged_by_name: 'Sarah Smith', logged_at: formatTimeAgo(320), category: 'reposition', position: 'Left Side (30 deg)', skin_check_notes: 'Sacrum and left hip clear, barrier cream applied.' }
    ],
    [pod2.id]: [
      { id: 'log-b1', care_pod_id: pod2.id, logged_by_member_id: 'mem-alex', logged_by_name: 'Alex (Co-Owner)', logged_at: formatTimeAgo(60), category: 'activity_walk', activity_type: '30m Leash Walk', activity_duration_minutes: 30, bowel_movement: true, urine_output: 'Normal Pee on Walk', free_text_note: 'Great energy at park! Did 1 poop and 3 pees.' },
      { id: 'log-b2', care_pod_id: pod2.id, logged_by_member_id: 'mem-alex', logged_by_name: 'Alex (Co-Owner)', logged_at: formatTimeAgo(180), category: 'fluid_food', food_description: '1.5 cups Salmon & Rice Kibble + fresh water bowl', appetite_level: 'Ate All' },
      { id: 'log-b3', care_pod_id: pod2.id, logged_by_member_id: 'mem-sam', logged_by_name: 'Sam (Partner/Walker)', logged_at: formatTimeAgo(420), category: 'comfort', comfort_action: 'Bath / Wash & Fur Brushed', free_text_note: 'Washed muddy paws and gave thorough 15m fur brush. Fur dry and shiny.' }
    ],
    [pod3.id]: [
      { id: 'log-l1', care_pod_id: pod3.id, logged_by_member_id: 'mem-emma', logged_by_name: 'Emma (Mom)', logged_at: formatTimeAgo(75), category: 'custody', custody_event: 'School Bag Packed', custody_checklist_items: ['Ventolin Inhaler Packed', 'Math Homework Signed', 'Library Book in Bag', 'Drink Bottle Filled'], free_text_note: 'Packed ready for Wednesday handover at front gate!' },
      { id: 'log-l2', care_pod_id: pod3.id, logged_by_member_id: 'mem-emma', logged_by_name: 'Emma (Mom)', logged_at: formatTimeAgo(180), category: 'fluid_food', food_description: 'Grilled Cheese Sandwich, Apple slices & 200ml milk', appetite_level: 'Ate All' },
      { id: 'log-l3', care_pod_id: pod3.id, logged_by_member_id: 'mem-emma', logged_by_name: 'Emma (Mom)', logged_at: formatTimeAgo(300), category: 'medication', medication_id: 'med-ventolin', medication_name: 'Ventolin (Salbutamol Inhaler)', dose_administered: '2 Puffs (100mcg/puff)', is_prn: true, prn_reason: 'Mild cough after playground sprint', breathlessness_score: 2 }
    ],
    [pod4.id]: [
      { id: 'log-j1', care_pod_id: pod4.id, logged_by_member_id: 'mem-james', logged_by_name: 'James (Patient)', logged_at: formatTimeAgo(45), category: 'activity_walk', activity_type: 'Quad Sets & Heel Slides (3x10 reps)', activity_duration_minutes: 20, free_text_note: 'Knee extension achieved 0 degrees! Mild tight feeling in hamstring.' },
      { id: 'log-j2', care_pod_id: pod4.id, logged_by_member_id: 'mem-james', logged_by_name: 'James (Patient)', logged_at: formatTimeAgo(150), category: 'comfort', comfort_action: 'Cryotherapy Ice Compression (20 min)', free_text_note: 'Swelling reduced noticeably after ice session.' }
    ]
  };

  // Contacts Map
  const contactsMap: Record<string, EscalationContact[]> = {
    [pod1.id]: [
      { id: 'c-1', care_pod_id: pod1.id, name: '24/7 Community Palliative Triage Line', role_title: 'Emergency Triage Nurse', phone_number: '1800-555-PALL', display_order: 1, is_24_7: true },
      { id: 'c-2', care_pod_id: pod1.id, name: 'Dr. Alistair Vance', role_title: 'Visiting GP / Palliative Medical Officer', phone_number: '+1 (555) 712-9930', display_order: 2 }
    ],
    [pod2.id]: [
      { id: 'c-3', care_pod_id: pod2.id, name: 'Metro 24/7 Emergency Vet Hospital', role_title: 'Emergency Veterinary Triage', phone_number: '+1 (555) 991-PETS', display_order: 1, is_24_7: true, notes: '24-hour emergency surgery and toxic ingestion triage.' },
      { id: 'c-4', care_pod_id: pod2.id, name: 'Dr. Chloe Barnes (Primary Vet)', role_title: 'Family Veterinarian', phone_number: '+1 (555) 443-8822', display_order: 2 }
    ],
    [pod3.id]: [
      { id: 'c-5', care_pod_id: pod3.id, name: 'Oakridge Pediatric Clinic (Dr. Patel)', role_title: 'Primary Pediatrician', phone_number: '+1 (555) 332-9911', display_order: 1 },
      { id: 'c-6', care_pod_id: pod3.id, name: 'Oakridge Primary School Reception', role_title: 'School Front Office', phone_number: '+1 (555) 887-1122', display_order: 2 }
    ],
    [pod4.id]: [
      { id: 'c-7', care_pod_id: pod4.id, name: 'Orthopaedic Surgical Clinic (Dr. Thorne)', role_title: 'Consultant Orthopaedic Surgeon', phone_number: '+1 (555) 554-3322', display_order: 1 },
      { id: 'c-8', care_pod_id: pod4.id, name: 'Sports Physio Rehab Hub', role_title: 'Physiotherapist', phone_number: '+1 (555) 776-8899', display_order: 2 }
    ]
  };

  return { pods, membersMap, medsMap, logsMap, contactsMap };
}

// Multi-Pod Database Access Layer
export class PalliativeDb {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  // Initialize all pods if empty
  public static initialize(): void {
    if (!this.isClient()) return;

    if (!localStorage.getItem(STORAGE_KEYS.PODS_LIST)) {
      const seed = getInitialSeedPods();
      localStorage.setItem(STORAGE_KEYS.PODS_LIST, JSON.stringify(seed.pods));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_POD_ID, seed.pods[0].id);

      seed.pods.forEach(pod => {
        const mems = seed.membersMap[pod.id] || [];
        const meds = seed.medsMap[pod.id] || [];
        const logs = seed.logsMap[pod.id] || [];
        const contacts = seed.contactsMap[pod.id] || [];

        localStorage.setItem(STORAGE_KEYS.MEMBERS_PREFIX + pod.id, JSON.stringify(mems));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID + pod.id, mems[0]?.id || '');
        localStorage.setItem(STORAGE_KEYS.MEDS_PREFIX + pod.id, JSON.stringify(meds));
        localStorage.setItem(STORAGE_KEYS.LOGS_PREFIX + pod.id, JSON.stringify(logs));
        localStorage.setItem(STORAGE_KEYS.CONTACTS_PREFIX + pod.id, JSON.stringify(contacts));
      });

      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, 'default');
    }

    // Subscribe to remote sync events from CareSyncBus
    CareSyncBus.subscribe((msg) => {
      this.applyRemoteEvent(msg);
    });
  }

  // Apply real-time remote sync event from Phone or PC
  public static applyRemoteEvent(msg: SyncMessage): void {
    if (!this.isClient()) return;
    const podId = msg.podId || msg.payload?.care_pod_id || this.getActivePodId();

    if (msg.type === 'LOG_ADDED' || msg.type === 'MED_ADMINISTERED') {
      const incomingLog = msg.payload?.log || (msg.payload?.category ? msg.payload : null);
      if (incomingLog && incomingLog.id) {
        const logs = this.getCareLogs(podId);
        if (!logs.some(l => l.id === incomingLog.id)) {
          const updated = [incomingLog, ...logs];
          localStorage.setItem(STORAGE_KEYS.LOGS_PREFIX + podId, JSON.stringify(updated));
        }
      }
    } else if (msg.type === 'POD_SWITCHED' && msg.payload?.podId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_POD_ID, msg.payload.podId);
    } else if (msg.type === 'WIDGETS_UPDATED' && msg.payload?.podId && msg.payload?.widgets) {
      const pods = this.getAllPods().map(p => {
        if (p.id === msg.payload.podId) {
          return { ...p, enabled_widgets: msg.payload.widgets };
        }
        return p;
      });
      localStorage.setItem(STORAGE_KEYS.PODS_LIST, JSON.stringify(pods));
    }
  }

  // 1. Pod Management
  public static getAllPods(): CarePod[] {
    if (!this.isClient()) return getInitialSeedPods().pods;
    const data = localStorage.getItem(STORAGE_KEYS.PODS_LIST);
    return data ? JSON.parse(data) : getInitialSeedPods().pods;
  }

  public static getActivePodId(): string {
    if (!this.isClient()) return getInitialSeedPods().pods[0].id;
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_POD_ID);
    const pods = this.getAllPods();
    const found = pods.find(p => p.id === activeId);
    return found ? found.id : (pods[0]?.id || 'pod-01');
  }

  public static setActivePodId(podId: string): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_POD_ID, podId);
      CareSyncBus.broadcast('POD_SWITCHED', { podId }, 'Care Team Member', podId);
    }
  }

  public static getCarePod(): CarePod {
    const activeId = this.getActivePodId();
    const pods = this.getAllPods();
    const found = pods.find(p => p.id === activeId);
    return found || pods[0] || getInitialSeedPods().pods[0];
  }

  public static addCarePod(pod: Omit<CarePod, 'id' | 'created_at'>): CarePod {
    const pods = this.getAllPods();
    const newPod: CarePod = {
      ...pod,
      id: `pod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    const updated = [...pods, newPod];
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.PODS_LIST, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_POD_ID, newPod.id);
      
      const initialMember: CarePodMember = {
        id: `mem-${Date.now()}`,
        care_pod_id: newPod.id,
        user_id: `user-host`,
        display_name: 'Primary Caregiver',
        role: 'primary_carer',
        avatar_color: newPod.theme_color,
        created_at: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.MEMBERS_PREFIX + newPod.id, JSON.stringify([initialMember]));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID + newPod.id, initialMember.id);
      localStorage.setItem(STORAGE_KEYS.MEDS_PREFIX + newPod.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.LOGS_PREFIX + newPod.id, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CONTACTS_PREFIX + newPod.id, JSON.stringify([]));

      this.enqueueSync('care_pods', 'INSERT', newPod);
      CareSyncBus.broadcast('POD_SWITCHED', { podId: newPod.id }, 'Caregiver', newPod.id);
    }
    return newPod;
  }

  public static updateCarePod(podPatch: Partial<CarePod>): CarePod {
    const current = this.getCarePod();
    const updated = { ...current, ...podPatch };
    const pods = this.getAllPods().map(p => p.id === updated.id ? updated : p);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.PODS_LIST, JSON.stringify(pods));
      this.enqueueSync('care_pods', 'UPDATE', updated);
      CareSyncBus.broadcast('POD_SWITCHED', { podId: updated.id, podUpdate: updated }, 'Caregiver', updated.id);
    }
    return updated;
  }

  public static updateCarePodWidgets(podId: string, widgets: CareWidgetType[]): void {
    const pods = this.getAllPods().map(p => {
      if (p.id === podId) {
        return { ...p, enabled_widgets: widgets };
      }
      return p;
    });
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.PODS_LIST, JSON.stringify(pods));
      CareSyncBus.broadcast('WIDGETS_UPDATED', { podId, widgets }, 'Caregiver', podId);
    }
  }

  // 2. Members Management
  public static getMembers(podId: string = this.getActivePodId()): CarePodMember[] {
    if (!this.isClient()) return getInitialSeedPods().membersMap[podId] || [];
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS_PREFIX + podId);
    return data ? JSON.parse(data) : [];
  }

  public static getActiveMember(podId: string = this.getActivePodId()): CarePodMember {
    const members = this.getMembers(podId);
    if (!this.isClient()) return members[0];
    const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_MEMBER_ID + podId);
    const found = members.find(m => m.id === activeId);
    return found || members[0] || {
      id: 'default-host',
      care_pod_id: podId,
      user_id: 'u-host',
      display_name: 'Primary Caregiver',
      role: 'primary_carer',
      avatar_color: '#2A9D8F',
      created_at: new Date().toISOString()
    };
  }

  public static setActiveMember(memberId: string, podId: string = this.getActivePodId()): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_MEMBER_ID + podId, memberId);
      CareSyncBus.broadcast('CARER_SWITCHED', { memberId, podId }, 'Caregiver', podId);
    }
  }

  public static addMember(member: Omit<CarePodMember, 'id' | 'created_at' | 'care_pod_id'> & { care_pod_id?: string }): CarePodMember {
    const podId = member.care_pod_id || this.getActivePodId();
    const members = this.getMembers(podId);
    const newMember: CarePodMember = {
      ...member,
      care_pod_id: podId,
      id: `member-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [...members, newMember];
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.MEMBERS_PREFIX + podId, JSON.stringify(updated));
      this.enqueueSync('care_pod_members', 'INSERT', newMember);
    }
    return newMember;
  }

  // 3. Medications Management
  public static getMedications(podId: string = this.getActivePodId()): Medication[] {
    if (!this.isClient()) return getInitialSeedPods().medsMap[podId] || [];
    const data = localStorage.getItem(STORAGE_KEYS.MEDS_PREFIX + podId);
    return data ? JSON.parse(data) : [];
  }

  public static addMedication(med: Omit<Medication, 'id' | 'created_at' | 'care_pod_id'> & { care_pod_id?: string }): Medication {
    const podId = med.care_pod_id || this.getActivePodId();
    const meds = this.getMedications(podId);
    const newMed: Medication = {
      ...med,
      care_pod_id: podId,
      id: `med-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const updated = [...meds, newMed];
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.MEDS_PREFIX + podId, JSON.stringify(updated));
      this.enqueueSync('medications', 'INSERT', newMed);
    }
    return newMed;
  }

  // 4. Care Logs Management
  public static getCareLogs(podId: string = this.getActivePodId()): CareLog[] {
    if (!this.isClient()) return getInitialSeedPods().logsMap[podId] || [];
    const data = localStorage.getItem(STORAGE_KEYS.LOGS_PREFIX + podId);
    const logs: CareLog[] = data ? JSON.parse(data) : [];
    return logs.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
  }

  public static addCareLog(log: Omit<CareLog, 'id' | 'care_pod_id' | 'logged_at' | 'logged_by_member_id' | 'logged_by_name'> & { care_pod_id?: string; logged_at?: string }): CareLog {
    const podId = log.care_pod_id || this.getActivePodId();
    const logs = this.getCareLogs(podId);
    const activeMember = this.getActiveMember(podId);
    const newLog: CareLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      care_pod_id: podId,
      logged_by_member_id: activeMember.id,
      logged_by_name: activeMember.display_name,
      logged_at: log.logged_at || new Date().toISOString(),
    };
    const updated = [newLog, ...logs];
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.LOGS_PREFIX + podId, JSON.stringify(updated));
      this.enqueueSync('care_logs', 'INSERT', newLog);
      
      const eventType = newLog.category === 'medication' ? 'MED_ADMINISTERED' : 'LOG_ADDED';
      CareSyncBus.broadcast(eventType, { log: newLog }, activeMember.display_name, podId);
    }
    return newLog;
  }

  public static updateMedicationAdministered(
    medicationId: string, 
    doseGiven: string, 
    reason: string = 'Scheduled or PRN',
    podId: string = this.getActivePodId()
  ): CareLog {
    const meds = this.getMedications(podId);
    const med = meds.find(m => m.id === medicationId);
    const medName = med ? med.name : 'Medication';
    const isPrn = med ? med.is_prn : true;

    const log = this.addCareLog({
      care_pod_id: podId,
      category: 'medication',
      medication_id: medicationId,
      medication_name: medName,
      dose_administered: doseGiven,
      is_prn: isPrn,
      prn_reason: reason,
      is_handover_flagged: true,
      free_text_note: `Administered ${doseGiven} of ${medName}. Reason: ${reason}`
    });

    return log;
  }

  public static toggleLogHandoverFlag(logId: string, podId: string = this.getActivePodId()): void {
    const logs = this.getCareLogs(podId);
    const updated = logs.map(l => l.id === logId ? { ...l, is_handover_flagged: !l.is_handover_flagged } : l);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.LOGS_PREFIX + podId, JSON.stringify(updated));
      CareSyncBus.broadcast('LOG_ADDED', { logId, podId }, 'User', podId);
    }
  }

  public static deleteCareLog(logId: string, podId: string = this.getActivePodId()): void {
    const logs = this.getCareLogs(podId);
    const updated = logs.filter(l => l.id !== logId);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.LOGS_PREFIX + podId, JSON.stringify(updated));
      CareSyncBus.broadcast('LOG_ADDED', { logId, deleted: true, podId }, 'User', podId);
    }
  }

  // 5. Contacts Management
  public static getContacts(podId: string = this.getActivePodId()): EscalationContact[] {
    if (!this.isClient()) return getInitialSeedPods().contactsMap[podId] || [];
    const data = localStorage.getItem(STORAGE_KEYS.CONTACTS_PREFIX + podId);
    return data ? JSON.parse(data) : [];
  }

  public static addContact(contact: Omit<EscalationContact, 'id' | 'care_pod_id'> & { care_pod_id?: string }): EscalationContact {
    const podId = contact.care_pod_id || this.getActivePodId();
    const contacts = this.getContacts(podId);
    const newContact: EscalationContact = {
      ...contact,
      care_pod_id: podId,
      id: `contact-${Date.now()}`,
    };
    const updated = [...contacts, newContact];
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.CONTACTS_PREFIX + podId, JSON.stringify(updated));
      this.enqueueSync('escalation_contacts', 'INSERT', newContact);
    }
    return newContact;
  }

  // 6. Theme Mode
  public static getThemeMode(): 'default' | 'amber_night' | 'dim_red' {
    if (!this.isClient()) return 'default';
    return (localStorage.getItem(STORAGE_KEYS.THEME_MODE) as 'default' | 'amber_night' | 'dim_red') || 'default';
  }

  public static setThemeMode(mode: 'default' | 'amber_night' | 'dim_red'): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      CareSyncBus.broadcast('THEME_CHANGED', { mode }, 'User');
    }
  }

  // 7. Sync Queue
  private static enqueueSync(
    table: 'care_pods' | 'care_pod_members' | 'medications' | 'care_logs' | 'escalation_contacts', 
    action: 'INSERT' | 'UPDATE' | 'DELETE', 
    payload: any
  ): void {
    if (!this.isClient()) return;
    const queue = this.getSyncQueue();
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      table,
      action,
      payload,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retry_count: 0,
    };
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([...queue, item]));
  }

  public static getSyncQueue(): SyncQueueItem[] {
    if (!this.isClient()) return [];
    const data = localStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
    return data ? JSON.parse(data) : [];
  }

  public static clearSyncQueue(): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    }
  }

  public static resetToSeed(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.PODS_LIST);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_POD_ID);
    this.initialize();
    CareSyncBus.broadcast('STATE_HYDRATED', { reset: true }, 'System');
  }
}
