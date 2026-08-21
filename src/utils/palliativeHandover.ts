// Universal Multi-Archetype Handover & Safety Calculation Engine
import { 
  CarePod, 
  CareLog, 
  Medication, 
  MedicationLockoutStatus, 
  ShiftHandoverSummary,
  SecretionsLevel,
  BodyPosition 
} from '@/types/palliative';

// Compute real-time lockout status for active medications
export function calculateMedicationLockouts(
  medications: Medication[], 
  logs: CareLog[],
  referenceTime: Date = new Date()
): MedicationLockoutStatus[] {
  const oneDayAgoMs = referenceTime.getTime() - 24 * 60 * 60 * 1000;

  return medications.map(med => {
    const medLogs = logs.filter(l => 
      l.category === 'medication' && 
      (l.medication_id === med.id || l.medication_name === med.name)
    ).sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());

    const doses24h = medLogs.filter(l => new Date(l.logged_at).getTime() >= oneDayAgoMs);
    const dosesCount24h = doses24h.length;
    const isMaxDosesReached = med.max_doses_per_24h 
      ? dosesCount24h >= med.max_doses_per_24h 
      : false;

    if (medLogs.length === 0) {
      return {
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        route: med.route,
        indication: med.indication,
        isPRN: med.is_prn,
        minIntervalMinutes: med.min_interval_minutes,
        maxDosesPer24h: med.max_doses_per_24h,
        lastDoseTime: undefined,
        lastDoseMinutesAgo: undefined,
        isLocked: false,
        remainingMinutes: 0,
        nextEligibleTime: 'Immediately (No recent logs)',
        dosesInLast24h: 0,
        isMaxDosesReached: false,
      };
    }

    const lastLog = medLogs[0];
    const lastDoseTimeMs = new Date(lastLog.logged_at).getTime();
    const elapsedMinutes = Math.floor((referenceTime.getTime() - lastDoseTimeMs) / (60 * 1000));
    const lockoutMinutes = med.min_interval_minutes || 0;
    const remainingMinutes = Math.max(0, lockoutMinutes - elapsedMinutes);
    const isLocked = remainingMinutes > 0 || isMaxDosesReached;

    const nextEligibleDate = new Date(lastDoseTimeMs + lockoutMinutes * 60 * 1000);
    const nextEligibleTimeStr = remainingMinutes > 0 
      ? nextEligibleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Eligible Now';

    return {
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      route: med.route,
      indication: med.indication,
      isPRN: med.is_prn,
      minIntervalMinutes: lockoutMinutes,
      maxDosesPer24h: med.max_doses_per_24h,
      lastDoseTime: lastLog.logged_at,
      lastDoseMinutesAgo: elapsedMinutes,
      isLocked,
      remainingMinutes,
      nextEligibleTime: nextEligibleTimeStr,
      dosesInLast24h: dosesCount24h,
      isMaxDosesReached,
    };
  });
}

// Universal Multi-Archetype Handover Synthesizer
export function generateShiftHandoverSummary(
  carePod: CarePod,
  logs: CareLog[],
  timeframeHours: number = 8,
  referenceTime: Date = new Date()
): ShiftHandoverSummary {
  const windowStartMs = referenceTime.getTime() - timeframeHours * 60 * 60 * 1000;
  const shiftLogs = logs.filter(l => new Date(l.logged_at).getTime() >= windowStartMs);
  const uniqueCarers = new Set(shiftLogs.map(l => l.logged_by_name));

  // 1. PRN / Scheduled Meds
  const prnLogs = shiftLogs.filter(l => l.category === 'medication');
  const prnDosesAdministered = prnLogs.map(l => ({
    medName: l.medication_name || 'Medication',
    dose: l.dose_administered || 'Dose Administered',
    time: new Date(l.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    loggedBy: l.logged_by_name,
    reason: l.prn_reason,
  }));

  // 2. Symptoms & Vitals
  const painScores = shiftLogs.map(l => l.pain_score).filter((s): s is number => typeof s === 'number');
  const agitationScores = shiftLogs.map(l => l.agitation_score).filter((s): s is number => typeof s === 'number');
  const breathlessnessScores = shiftLogs.map(l => l.breathlessness_score).filter((s): s is number => typeof s === 'number');

  const maxPain = painScores.length > 0 ? Math.max(...painScores) : null;
  const avgPain = painScores.length > 0 ? Number((painScores.reduce((a, b) => a + b, 0) / painScores.length).toFixed(1)) : null;
  const maxAgitation = agitationScores.length > 0 ? Math.max(...agitationScores) : null;
  const maxBreathlessness = breathlessnessScores.length > 0 ? Math.max(...breathlessnessScores) : null;

  const secretionsLogs = shiftLogs.filter(l => l.secretions_level);
  const latestSecretions = secretionsLogs.length > 0 ? secretionsLogs[0].secretions_level! : 'None' as SecretionsLevel;

  let overallStability = 'Comfortable & Stable';
  if (carePod.archetype === 'pet_care') {
    overallStability = 'Happy & Well Cared For';
  } else if (carePod.archetype === 'child_custody') {
    overallStability = 'Ready for Smooth Co-Parenting Handover';
  } else if (carePod.archetype === 'post_op') {
    overallStability = 'Rehab Exercises on Track';
  }

  if (maxPain && maxPain >= 6) {
    overallStability = 'Elevated Pain / Requires Monitoring';
  }

  // 3. Activity / Walks / Repositioning
  const activityLogs = shiftLogs.filter(l => l.category === 'activity_walk' || l.category === 'reposition');
  const latestActivity = activityLogs.length > 0 ? activityLogs[0] : null;

  let lastActivityDescription = 'No activity logged';
  let lastActivityTime: string | null = null;
  let activityOverdue = false;
  let overdueNotice = 'On Schedule';

  if (latestActivity) {
    lastActivityTime = latestActivity.logged_at;
    const minsAgo = Math.floor((referenceTime.getTime() - new Date(latestActivity.logged_at).getTime()) / (60 * 1000));
    if (latestActivity.category === 'activity_walk') {
      lastActivityDescription = `${latestActivity.activity_type || 'Walk/Exercise'} (${minsAgo}m ago)`;
      if (minsAgo > 480 && carePod.archetype === 'pet_care') {
        activityOverdue = true;
        overdueNotice = '[PET] Dog Walk Due (>8 hours since last walk)';
      }
    } else {
      lastActivityDescription = `Position: ${latestActivity.position || 'Turned'} (${minsAgo}m ago)`;
      if (minsAgo > 150 && carePod.archetype === 'palliative') {
        activityOverdue = true;
        overdueNotice = '[!] 30 deg Reposition Turn Overdue (>2.5 hours)';
      }
    }
  }

  // 4. Hydration, Meals & Elimination
  const fluidLogs = shiftLogs.filter(l => l.category === 'fluid_food' && typeof l.fluid_ml === 'number');
  const mealLogs = shiftLogs.filter(l => l.category === 'fluid_food');
  const totalFluidMl = fluidLogs.reduce((acc, l) => acc + (l.fluid_ml || 0), 0);
  const lastMeal = mealLogs.length > 0 ? (mealLogs[0].food_description || 'Meal recorded') : 'No meal in shift window';

  const bowelLogs = shiftLogs.filter(l => l.category === 'bowel_bladder' && l.bowel_movement);
  const allBowelLogs = logs.filter(l => l.category === 'bowel_bladder' && l.bowel_movement);
  const lastBowelMovementTime = allBowelLogs.length > 0 ? allBowelLogs[0].logged_at : null;

  const urineLogs = shiftLogs.filter(l => l.category === 'bowel_bladder' && (l.urine_output || l.urine_ml));
  let urineOutputSummary = 'No elimination logged';
  if (urineLogs.length > 0) {
    urineOutputSummary = `${urineLogs[0].urine_output || 'Recorded'}`;
  }

  // 5. Custody Specifics
  const custodyLogs = shiftLogs.filter(l => l.category === 'custody');
  const lastCustody = custodyLogs.length > 0 ? custodyLogs[0] : null;

  // 6. Flagged Notes
  const flaggedNotes = shiftLogs
    .filter(l => l.is_handover_flagged || (l.free_text_note && l.free_text_note.length > 10))
    .map(l => ({
      id: l.id,
      loggedAt: new Date(l.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      loggedBy: l.logged_by_name,
      category: l.category,
      note: l.free_text_note || l.skin_check_notes || l.food_description || l.activity_type || `${l.category} recorded`,
    }));

  // 7. Urgent Recommendations
  const urgentRecommendations: string[] = [];
  if (activityOverdue) {
    urgentRecommendations.push(overdueNotice);
  }
  if (carePod.archetype === 'pet_care') {
    if (mealLogs.length === 0) urgentRecommendations.push('Check evening meal/water bowl schedule.');
    if (urgentRecommendations.length === 0) urgentRecommendations.push('Barnaby is happy and fed. Ready for evening walk.');
  } else if (carePod.archetype === 'child_custody') {
    if (lastCustody?.custody_checklist_items) {
      urgentRecommendations.push(`Handover Checklist: ${lastCustody.custody_checklist_items.join(', ')}`);
    } else {
      urgentRecommendations.push('Check school bag for inhaler, signed homework, and lunchbox.');
    }
  } else if (carePod.archetype === 'post_op') {
    urgentRecommendations.push('Next cryotherapy ice compression recommended in 2 hours.');
  } else {
    // Palliative default
    if (maxPain && maxPain >= 5) urgentRecommendations.push(`Peak pain ${maxPain}/10 observed. Monitor for next PRN Morphine window.`);
    if (urgentRecommendations.length === 0) urgentRecommendations.push('Patient is resting comfortably. Continue 2-3h turn schedule and mouth care.');
  }

  // 8. Dynamic Archetype-Aware Plaintext Handover
  let rawSbarBriefing = '';

  if (carePod.archetype === 'pet_care') {
    rawSbarBriefing = [
      `=== AEGIS CARE OS: PET CARE HANDOVER BRIEFING ===`,
      `PET: ${carePod.patient_display_name} (${carePod.subtitle || 'Shared Pet Care'})`,
      `WINDOW: Last ${timeframeHours} hours * Generated: ${referenceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `STATUS: ${overallStability.toUpperCase()}`,
      ``,
      `[MEALS & WATER]`,
      `- Last Meal: ${lastMeal}`,
      `- Total Meals in Window: ${mealLogs.length}`,
      ``,
      `[WALKS & EXERCISE]`,
      `- Walks / Activity: ${activityLogs.length} logged`,
      `- Last Walk: ${lastActivityDescription}`,
      `- Status: ${overdueNotice}`,
      ``,
      `[MEDICATIONS & FLEA/TICK]`,
      prnDosesAdministered.length > 0 
        ? prnDosesAdministered.map(p => `- ${p.time} * ${p.medName} (${p.dose}) by ${p.loggedBy}`).join('\n')
        : '- No medication given this shift.',
      ``,
      `[BATHROOM & GROOMING]`,
      `- Bowel / Poop: ${bowelLogs.length} logged (Last: ${lastBowelMovementTime ? new Date(lastBowelMovementTime).toLocaleDateString() : 'None'})`,
      `- Urine Output: ${urineOutputSummary}`,
      ``,
      `[RECOMMENDATIONS FOR NEXT CO-OWNER / WALKER]`,
      ...urgentRecommendations.map(r => `* ${r}`),
      ``,
      flaggedNotes.length > 0 ? `[FLAGGED NOTES]\n` + flaggedNotes.map(n => `* ${n.loggedAt} (${n.loggedBy}): ${n.note}`).join('\n') : ''
    ].filter(Boolean).join('\n');
  } else if (carePod.archetype === 'child_custody') {
    rawSbarBriefing = [
      `=== AEGIS CARE OS: JOINT CUSTODY HANDOVER BRIEFING ===`,
      `CHILD: ${carePod.patient_display_name} (${carePod.subtitle || 'Shared Co-Parenting'})`,
      `WINDOW: Last ${timeframeHours} hours * Generated: ${referenceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `STATUS: ${overallStability.toUpperCase()}`,
      ``,
      `[MEALS & NUTRITION]`,
      `- Last Meal: ${lastMeal}`,
      `- Fluid / Drinks: ${totalFluidMl > 0 ? `${totalFluidMl}ml` : 'Normal hydration'}`,
      ``,
      `[HEALTH & MEDICATIONS (ASTHMA/ALLERGY)]`,
      prnDosesAdministered.length > 0 
        ? prnDosesAdministered.map(p => `- ${p.time} * ${p.medName} (${p.dose}) by ${p.loggedBy}${p.reason ? ` [Reason: ${p.reason}]` : ''}`).join('\n')
        : '- No PRN medication needed today.',
      ``,
      `[SCHOOL, HOMEWORK & ROUTINE]`,
      `- ${carePod.custody_routine_notes || 'Routine school schedule on track.'}`,
      `- Last Event: ${lastCustody?.custody_event || 'Normal daytime schedule'}`,
      ``,
      `[HANDOVER CHECKLIST FOR CO-PARENT]`,
      ...urgentRecommendations.map(r => `* ${r}`),
      ``,
      flaggedNotes.length > 0 ? `[PARENT OBSERVATIONS & NOTES]\n` + flaggedNotes.map(n => `* ${n.loggedAt} (${n.loggedBy}): ${n.note}`).join('\n') : ''
    ].filter(Boolean).join('\n');
  } else {
    // Palliative / Post-op / Clinical SBAR
    rawSbarBriefing = [
      `=== AEGIS CARE OS: SHIFT HANDOVER BRIEFING (SBAR) ===`,
      `SUBJECT: ${carePod.patient_display_name} (${timeframeHours}h Window)`,
      `GENERATED: ${referenceTime.toLocaleDateString()} at ${referenceTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `STATUS: ${overallStability.toUpperCase()}`,
      ``,
      `[S - SITUATION]`,
      `- Shift Window: Last ${timeframeHours} hours (${shiftLogs.length} events by ${Array.from(uniqueCarers).join(', ') || 'Carers'})`,
      carePod.syringe_driver_active ? `- Syringe Driver: ACTIVE (${carePod.syringe_driver_medication || 'Infusing'}) at ${carePod.syringe_driver_rate_ml_hr || 1} ml/hr` : '',
      ``,
      `[B - BACKGROUND & GOALS]`,
      `- ${carePod.advance_care_plan_notes || 'Comfort and recovery plan in place.'}`,
      ``,
      `[A - CLINICAL & CARE ASSESSMENT]`,
      `1. MEDICATIONS GIVEN (${prnDosesAdministered.length} doses):`,
      prnDosesAdministered.length > 0 
        ? prnDosesAdministered.map(p => `   * ${p.time} - ${p.medName} (${p.dose}) by ${p.loggedBy}${p.reason ? ` [Reason: ${p.reason}]` : ''}`).join('\n')
        : '   * No breakthrough medication doses administered.',
      `2. SYMPTOMS / RECOVERY:`,
      `   * Pain: ${maxPain !== null ? `Peak ${maxPain}/10` : 'None / Calm'}`,
      `   * Agitation / Distress: ${maxAgitation !== null ? `Peak ${maxAgitation}/10` : 'None'}`,
      `3. ACTIVITY / REPOSITIONING:`,
      `   * Last: ${lastActivityDescription}`,
      `   * Status: ${overdueNotice}`,
      `4. HYDRATION & MEALS:`,
      `   * Fluids: ${totalFluidMl} ml * Last meal: ${lastMeal}`,
      `   * Elimination: ${urineOutputSummary} (Bowel movements: ${bowelLogs.length})`,
      ``,
      `[R - RECOMMENDATIONS FOR INCOMING SHIFT]`,
      ...urgentRecommendations.map(r => `* ${r}`),
      ``,
      flaggedNotes.length > 0 ? `[FLAGGED CARER NOTES]\n` + flaggedNotes.map(n => `* ${n.loggedAt} (${n.loggedBy}): ${n.note}`).join('\n') : '',
    ].filter(Boolean).join('\n');
  }

  return {
    timeframeHours,
    startTime: new Date(windowStartMs).toISOString(),
    endTime: referenceTime.toISOString(),
    patientName: carePod.patient_display_name,
    archetype: carePod.archetype,
    activeCarersCount: uniqueCarers.size,
    totalLogsCount: shiftLogs.length,
    prnDosesAdministered,
    symptomSummary: {
      maxPain,
      avgPain,
      maxAgitation,
      maxBreathlessness,
      secretionsTrend: latestSecretions,
      overallStability,
    },
    activitySummary: {
      totalWalksOrTurns: activityLogs.length,
      lastActivityTime,
      lastActivityDescription,
      activityOverdue,
      overdueNotice,
    },
    hydrationAndOutput: {
      totalFluidMl,
      mealsLogged: mealLogs.length,
      lastMealSummary: lastMeal,
      bowelMovementsCount: bowelLogs.length,
      lastBowelMovementTime,
      urineOutputSummary,
    },
    custodySummary: {
      lastCustodyEvent: lastCustody?.custody_event,
      checklistCompleted: !!lastCustody?.custody_checklist_items && lastCustody.custody_checklist_items.length > 0,
      pendingChecklistItems: lastCustody?.custody_checklist_items || [],
    },
    flaggedNotes,
    urgentRecommendations,
    rawSbarBriefing,
  };
}
