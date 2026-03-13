// Vercel serverless function — Siemens Energy AI Maintenance Assistant
// Same architecture as angelorscoelho.dev/api/chat.ts
// GOOGLE_API_KEY is read exclusively server-side; the key is never exposed to the browser.

// ── Equipment-Specific Knowledge Base ─────────────────────────────────────────

// Gas Turbine Manual (SGT-series)
const GAS_TURBINE_MANUAL = `
SIEMENS ENERGY SGT-SERIES GAS TURBINE — MAINTENANCE MANUAL (EXCERPT)
Document Ref: SE-GT-MM-4200 | Revision 7 | Applies to: SGT-100, SGT-300, SGT-400, SGT-600, SGT-700, SGT-750, SGT-800, SGT-A65, SGT5-4000F, SGT5-8000H, SGT6-5000F, SGT6-8000H

=== SECTION 4: INSPECTION INTERVALS ===
Hot Gas Path (HGP) Inspection: Every 8,000 Equivalent Operating Hours (EOH) or 900 starts.
  Components inspected: combustion liners, transition pieces, first-stage nozzles and blades, turbine shrouds.
Major Overhaul: Every 24,000 EOH or 2,400 starts (whichever comes first).
Combustion Inspection: Every 4,000 EOH or 450 starts.
  Includes: fuel nozzle cleaning, cross-fire tube inspection, liner replacement if wear > 20%.

=== SECTION 7: VIBRATION THRESHOLDS ===
Bearing Vibration Alert Levels (peak-to-peak, mm/s RMS):
  • Normal operation : < 2.5 mm/s
  • Warning (reduce load) : 2.5 – 5.0 mm/s
  • Trip / Emergency shutdown : > 5.0 mm/s
Common causes of high vibration:
  - Rotor imbalance (often after blade replacement)
  - Bearing wear or lubrication failure
  - Thermal bow (transient at startup — typically resolves within 10 minutes)
  - Foreign object ingestion (FOD)
  - Seal rub from differential thermal expansion
  - Coupling misalignment
Corrective actions:
  1. Reduce load to < 70% rated capacity.
  2. Monitor trend for 15 minutes; if declining, continue at reduced load.
  3. If stable or increasing above 4.0 mm/s, initiate planned shutdown.
  4. Inspect bearings 1–4 and perform rotor balancing.
  5. Check lube oil supply pressure and temperature at each bearing.
  6. Perform vibration spectrum analysis to identify frequency signature (imbalance vs. misalignment).

=== SECTION 9: EXHAUST TEMPERATURE ===
Rated exhaust temperature range: 520°C – 580°C (model-dependent).
Warning threshold: > 600°C sustained for > 5 minutes.
Emergency shutdown threshold: > 650°C.
Common causes of elevated exhaust temperature:
  - Fuel system malfunction (excessive fuel flow)
  - Turbine blade oxidation / thermal barrier coating degradation
  - Compressor fouling (reduces airflow, increases flame temperature)
  - Thermocouple calibration drift (verify with redundant sensor)
  - Combustion liner damage allowing hot gas bypass
  - Inlet guide vane position error
Corrective actions:
  1. Verify thermocouple reading against adjacent sensors.
  2. Check fuel control valve position and fuel flow meter.
  3. Schedule compressor offline water wash if fouling index > 0.95.
  4. Reduce load by 10–15% and monitor temperature trend for 20 minutes.
  5. If temperature does not decrease, initiate controlled shutdown.

=== SECTION 12: COMPRESSOR MAINTENANCE ===
Online water wash: every 500 EOH or when compressor efficiency drops > 1.5%.
Offline water wash (higher effectiveness): every 2,000 EOH.
Blade inspection for erosion/corrosion: at every combustion inspection.
Inlet filter replacement: per OEM schedule or ΔP > 25 mbar across filter bank.

=== SECTION 15: LUBRICATION SYSTEM ===
Lube oil specification: ISO VG 32 turbine oil, ash-free, anti-oxidant additive.
Oil change interval: 4,000 EOH or annually (whichever comes first).
Oil temperature limits: 45°C minimum at bearing inlet; 90°C maximum at bearing outlet.
Low oil pressure trip: < 1.2 bar (abs) at main header.

=== SECTION 18: COMMON FAULT PATTERNS & REMEDIATION ===
FAULT: Sudden vibration spike (> 2 mm/s increase within 30 minutes)
  Likely cause: Foreign object damage, blade liberation, or bearing failure.
  Immediate action: Reduce load to 50%, notify operations. If > 6 mm/s, trip immediately.
  Follow-up: Borescope inspection of compressor and turbine stages within 24 hours.

FAULT: Gradual vibration increase (< 0.5 mm/s per day)
  Likely cause: Progressive bearing wear, rotor deposit build-up, or coupling degradation.
  Action: Schedule vibration analysis. Increase monitoring frequency to hourly readings.
  Planned corrective: Bearing inspection and rotor dynamic balance at next outage.

FAULT: Exhaust temperature spread > 30°C between thermocouples
  Likely cause: Combustion liner damage, fuel nozzle blockage, or hot streak.
  Immediate action: Reduce load to 70%. Identify worst sector from thermocouple pattern.
  Follow-up: Combustion borescope inspection at first opportunity.

FAULT: High exhaust temperature with normal vibration
  Likely cause: Compressor fouling, fuel valve malfunction, or blade coating loss.
  Action: Perform online compressor wash. Verify fuel flow meter accuracy.

FAULT: High vibration with high exhaust temperature (dual exceedance)
  Likely cause: Hot-section distress, advanced blade damage, or rotor thermal distortion.
  CRITICAL ACTION: Initiate controlled shutdown immediately.
  Emergency response: Do not trip; execute controlled coast-down to protect bearings.
  Post-shutdown: Full borescope inspection + NDT of all hot-section components.

=== SECTION 22: ACTION PLAN TEMPLATES ===

ACTION PLAN — NOK (Critical) STATUS:
Step 1 [0–15 min]: Reduce load to 50% rated capacity. Notify shift supervisor and OEM hotline.
Step 2 [15–30 min]: Cross-check critical reading against redundant sensors. If confirmed, initiate controlled shutdown.
Step 3 [0–24 h]: Review past_maintenance_history_notes for recent maintenance that may have introduced the fault.
Step 4 [24–48 h]: Perform visual and borescope inspection per user_technical_manual Section 7 (vibration) or Section 9 (temperature).
Step 5 [2–7 days]: Complete root cause analysis. Apply corrective maintenance.
Step 6 [Return-to-service]: Verify repair quality through graduated load test.

ACTION PLAN — RISK (Warning) STATUS:
Step 1 [Immediate]: Increase monitoring frequency (every 15 min readings).
Step 2 [Within 4 h]: Review past_maintenance_history_notes for parameter trends over last 30 days.
Step 3 [Within 24 h]: Perform non-invasive diagnostics per user_technical_manual.
Step 4 [Within 48 h]: Schedule planned maintenance outage if trend is degrading.
Step 5 [At planned outage]: Perform targeted inspection. Update maintenance records.
`;

// Steam Turbine Manual (SST-series)
const STEAM_TURBINE_MANUAL = `
SIEMENS ENERGY SST-SERIES STEAM TURBINE — MAINTENANCE MANUAL (EXCERPT)
Document Ref: SE-ST-MM-3100 | Revision 5 | Applies to: SST-300, SST-400, SST-600, SST-800

=== SECTION 3: INSPECTION INTERVALS ===
Hot Section Inspection (HSI): Every 8,000 EOH or annually (whichever comes first).
  Components: HP turbine blades, nozzles, seals, stop/control valves.
Major Overhaul: Every 20,000 EOH or every 4 years (whichever comes first).
Steam System Inspection: Annually — main steam stop valves, reheat valves, extraction valves.
Governor & Overspeed Protection: Calibration and trip test annually.

=== SECTION 6: VIBRATION THRESHOLDS ===
Shaft Vibration Alert Levels (mm/s RMS, measured at bearing housings):
  • Normal operation : < 2.3 mm/s
  • Warning (increased monitoring) : 2.3 – 4.5 mm/s
  • Alarm (reduce load) : 4.5 – 7.1 mm/s
  • Trip / Emergency shutdown : > 7.1 mm/s
Common causes of high vibration in steam turbines:
  - Journal bearing wear or oil film instability (oil whirl / oil whip)
  - Rotor bow due to uneven thermal expansion at startup
  - Blade deposit build-up causing rotor imbalance
  - Seal rub from differential thermal growth
  - Coupling misalignment or gear defects
  - Steam quality issues (carry-over, water ingestion)
Corrective actions:
  1. Reduce steam admission gradually to < 70% of rated load.
  2. Monitor vibration trend over 30 minutes. If declining, maintain reduced load.
  3. If stable or increasing above 5.0 mm/s, initiate a controlled coast-down.
  4. Inspect journal bearings 1–4 for oil supply and clearance.
  5. Perform rotor dynamic balance check at next outage.
  6. Verify steam quality (carry-over, condensate chemistry).

=== SECTION 8: STEAM INLET TEMPERATURE & PRESSURE ===
Normal steam inlet temperature range: varies by model (see nameplate data).
  SST-300: HP steam 70–160 bar / 430–540°C backpressure design.
  SST-400: HP steam 40–140 bar / 420–530°C extraction/condensing.
  SST-600: HP steam 120–160 bar / 540–560°C extraction/condensing.
  SST-800: HP steam 160–165 bar / 560–565°C high-pressure design.
Warning threshold: Inlet temperature > 10°C above rated; sustained > 5 minutes.
Emergency trip: Inlet temperature > 20°C above rated nameplate value.
Common causes of elevated steam temperature:
  - Boiler superheat control valve malfunction
  - Attemperation (desuperheater) spray system failure
  - Boiler control loop deviation or DCS fault
  - Increased furnace heat load
Corrective actions:
  1. Check boiler superheat control valve position and DCS setpoint.
  2. Verify attemperation spray water flow and control valve operation.
  3. Reduce steam generation by 10% and monitor temperature recovery.
  4. If temperature remains elevated, coordinate with boiler operators for load reduction.
  5. Initiate controlled shutdown if temperature exceeds emergency trip level.

=== SECTION 11: LUBRICATION SYSTEM ===
Lube oil specification: ISO VG 46 turbine oil (some models VG 32 — see nameplate).
Oil change interval: 4,000 EOH or annually.
Bearing inlet temperature limits: 40°C minimum, 85°C maximum.
Low oil pressure trip: < 0.8 bar (abs) at main header.
Oil analysis: Sample quarterly for viscosity, acid number, and metal content.

=== SECTION 14: STEAM QUALITY REQUIREMENTS ===
Cation conductivity: < 0.15 μS/cm (alarm > 0.20 μS/cm).
Sodium: < 5 ppb (alarm > 10 ppb).
Silica: < 20 ppb.
Dissolved oxygen: < 10 ppb in feedwater.
Poor steam quality causes: blade erosion, deposit formation, stress corrosion cracking.

=== SECTION 17: COMMON FAULT PATTERNS ===
FAULT: Elevated steam temperature (> 10°C above rated)
  Likely cause: Boiler control deviation, attemperation failure.
  Immediate action: Notify boiler operators. Reduce load 10–15%. Check DCS setpoints.
  Follow-up: Verify superheat control valve calibration and attemperation spray.

FAULT: Gradual vibration increase
  Likely cause: Blade deposit, bearing wear, or rotor thermal bow.
  Action: Schedule offline deposit removal. Increase monitoring to hourly.

FAULT: Sudden vibration increase
  Likely cause: Blade liberation, bearing failure, water ingestion.
  Immediate action: Trip turbine if > 7 mm/s. Inspect for water carry-over.

FAULT: Low shaft speed / load loss
  Likely cause: Steam supply interruption, governor fault, extraction valve trip.
  Action: Check steam header pressure, governor control, and valve positions.

=== SECTION 20: ACTION PLAN TEMPLATES ===

ACTION PLAN — NOK (Critical) STATUS:
Step 1 [0–15 min]: Reduce steam load to 50%. Notify shift supervisor.
Step 2 [15–30 min]: Cross-check with redundant sensors. Initiate controlled coast-down if confirmed.
Step 3 [0–24 h]: Review maintenance history for recent work on affected systems.
Step 4 [24–48 h]: Borescope/visual inspection of hot section and bearings.
Step 5 [2–7 days]: Root cause analysis and corrective action.
Step 6 [Return-to-service]: Steam run-up test with staged load increase.

ACTION PLAN — RISK (Warning) STATUS:
Step 1 [Immediate]: Increase parameter monitoring to every 15 min.
Step 2 [Within 4 h]: Review maintenance history for recent work and trends.
Step 3 [Within 24 h]: Non-invasive diagnostics (oil analysis, vibration analysis).
Step 4 [Within 48 h]: Schedule outage if trend is degrading.
Step 5 [At planned outage]: Targeted inspection and maintenance record update.
`;

// Generator Manual (SGen-series)
const GENERATOR_MANUAL = `
SIEMENS ENERGY SGEN-SERIES SYNCHRONOUS GENERATOR — MAINTENANCE MANUAL (EXCERPT)
Document Ref: SE-GEN-MM-2800 | Revision 4 | Applies to: SGen-100A, SGen-1000A

=== SECTION 3: INSPECTION INTERVALS ===
Annual Inspection: Stator winding, rotor, cooling system, exciter diodes.
Major Overhaul: Every 5–6 years or 40,000 EOH (whichever comes first).
  Includes: Stator re-wedging, rotor balance, insulation system assessment.
Bearing Service: Every 2–3 years — vibration analysis, oil change, clearance check.
Hydrogen System: Annual purity and pressure test; gas dryer replacement every 2 years (H₂-cooled models).

=== SECTION 6: VIBRATION THRESHOLDS ===
Generator Bearing Vibration Alert Levels (mm/s RMS):
  • Normal operation : < 1.5 mm/s
  • Warning (investigate) : 1.5 – 3.0 mm/s
  • Alarm (reduce load) : 3.0 – 5.0 mm/s
  • Trip / Emergency shutdown : > 5.0 mm/s
Common causes of generator vibration:
  - Rotor imbalance (often from partial conductor loss or rotor deposits)
  - Journal bearing wear or misalignment
  - Coupling misalignment with prime mover
  - Electrical unbalance (negative sequence current)
  - Stator core looseness
Corrective actions:
  1. Check bearing temperature and lube oil flow immediately.
  2. Reduce excitation if electrical unbalance is suspected.
  3. Perform vibration spectrum analysis to distinguish mechanical vs. electrical cause.
  4. If bearing temperature is rising, trip generator and inspect bearing.
  5. Schedule offline rotor balance and bearing clearance check.

=== SECTION 8: THERMAL MONITORING ===
Stator winding temperature: Normal < 105°C (Class F insulation — alarm 120°C, trip 130°C).
Rotor winding temperature (by resistance): Normal < 100°C, alarm 115°C.
Hydrogen cooler outlet temperature (H₂-cooled): Normal 35–45°C, alarm > 55°C.
Air cooler outlet temperature (air-cooled): Normal 40–60°C, alarm > 80°C.
Bearing oil outlet temperature: Normal 60–75°C, alarm > 85°C.
Elevated winding temperature causes:
  - Cooling system failure (H₂ pressure loss, cooler fouling)
  - Overload operation
  - Insulation degradation
  - Stator ventilation blockage

=== SECTION 11: INSULATION MONITORING ===
Insulation resistance (IR): Measure annually at 1,000 V DC (stator winding).
  Acceptable IR: > 200 MΩ (new limit), > 100 MΩ (service limit at 40°C).
  Polarization Index (PI = IR₁₀/IR₁): > 2.0 acceptable, < 1.5 indicates moisture/contamination.
Partial Discharge (PD): Annual PD test. Trending increase > 50% year-on-year warrants investigation.
  Elevated PD causes: End-winding delamination, slot discharge, contamination.

=== SECTION 14: HYDROGEN SYSTEM (H₂-COOLED MODELS) ===
Normal H₂ pressure: 3.0–4.5 bar (model-dependent — check nameplate).
H₂ purity: > 98% (alarm < 96%, trip < 94%).
H₂ leak rate: < 3 m³/day acceptable; > 10 m³/day investigate seal integrity.
Seal oil differential pressure: 0.3–0.5 bar above H₂ pressure.
Annual H₂ system test: Pressure test, purity verification, seal oil pump check.

=== SECTION 17: COMMON FAULT PATTERNS ===
FAULT: Gradual insulation resistance decrease
  Likely cause: Moisture ingress, contamination, or thermal aging.
  Action: Dry-out procedure (see Section 11.3). Partial discharge test.

FAULT: Elevated winding temperature
  Likely cause: Cooling system fault or overload.
  Immediate action: Verify cooling system flow. Reduce load 10–15% if temperature > alarm.

FAULT: Generator vibration increase
  Likely cause: Rotor imbalance or bearing wear.
  Action: Vibration spectrum analysis. Check bearing temperatures.

FAULT: H₂ purity decreasing (H₂-cooled models)
  Likely cause: Air ingress through shaft seals or cooler leaks.
  Action: Verify seal oil differential pressure. Locate and repair leak.

=== SECTION 20: ACTION PLAN TEMPLATES ===

ACTION PLAN — NOK (Critical) STATUS:
Step 1 [0–15 min]: Reduce generator output. Notify shift supervisor.
Step 2 [15–30 min]: Confirm with redundant monitoring. Trip if winding or bearing temp at limit.
Step 3 [0–24 h]: Review maintenance history for recent work on affected systems.
Step 4 [24–48 h]: Thermal/vibration analysis; insulation resistance test if winding issue.
Step 5 [2–7 days]: Root cause analysis and corrective maintenance.
Step 6 [Return-to-service]: Insulation check, air/H₂ leak test, graduated load test.

ACTION PLAN — RISK (Warning) STATUS:
Step 1 [Immediate]: Increase monitoring frequency for affected parameters.
Step 2 [Within 4 h]: Review maintenance records and trends.
Step 3 [Within 24 h]: Diagnostic tests (insulation resistance, vibration spectrum, oil analysis).
Step 4 [Within 48 h]: Schedule planned outage if trend is degrading.
`;

// Per-equipment-type maintenance history summaries
const GAS_TURBINE_MAINTENANCE_HISTORY = `
GAS TURBINE FLEET — MAINTENANCE HISTORY SUMMARY (Last 90 Days)
Applies to: SGT-series gas turbines

Common recent findings:
  - 3 units: Compressor blade tip erosion found during HGP inspections; accelerated by dusty inlet conditions.
  - 2 units: Bearing #3 oil supply restrictor partially blocked; cleared during planned maintenance.
  - 4 units: Fuel nozzle coking on units operating on high-aromatic natural gas; nozzles cleaned.
  - 1 unit: Exhaust thermocouple replaced due to calibration drift of +18°C.
  - 2 units: Inlet filter differential pressure elevated; filters replaced ahead of schedule.
  - 1 unit (GT-04): Bearing #2 severe oil film failure at 31,200 h. Emergency shutdown. Full overhaul initiated.
  - 1 unit (GT-12): Simultaneous vibration (7.9 mm/s) and exhaust temp (642°C) exceedance. Emergency shutdown.

Trending observations:
  - Fleet-wide exhaust temperature trending +5°C above baseline over last 60 days (seasonal ambient).
  - Bearing vibration on units > 20,000 EOH showing gradual upward trend; proactive inspections scheduled.
  - Compressor efficiency declining on units operating in dusty environments; online wash intervals reduced.

Spare parts availability:
  - Combustion liners (Type A/B): 8 sets — regional warehouse (Houston).
  - Bearing assemblies (journal type): 12 sets available.
  - Fuel nozzle assemblies: 24 sets (all SGT models).

OEM service bulletins:
  - SB-SGT-2024-07: Inspect transition piece cooling holes at next CI on units > 8,000 EOH.
  - SB-SGT-2025-03: Lubrication system filter bypass valve check on SGT-series > 15,000 EOH.
`;

const STEAM_TURBINE_MAINTENANCE_HISTORY = `
STEAM TURBINE FLEET — MAINTENANCE HISTORY SUMMARY (Last 90 Days)
Applies to: SST-series steam turbines

Common recent findings:
  - 1 unit (ST-01 / SST-400): Bearing #3 oil film breakdown at 23,810 h. Elevated metal particles. 48-h replacement window.
  - 1 unit (ST-04 / SST-300): Steam inlet temperature elevated 16°C above normal. Boiler superheat valve deviation detected.
  - 2 units: Annual steam system inspections completed — stop valve seat wear acceptable; strainer mesh cleaned.
  - 1 unit: Annual governor calibration and overspeed trip test — all parameters in spec.
  - 1 unit (ST-02 / SST-600): Hot section inspection at 12,000 h — blades within creep limits; journal bearing inserts replaced.

Trending observations:
  - Steam turbine bearing vibration stable fleet-wide; no upward trend detected.
  - Steam quality (cation conductivity) within IAPWS limits across all units.
  - Units in CHP (combined heat & power) mode showing extraction valve wear — schedule calibration.

Spare parts availability:
  - Journal bearing inserts: 6 sets available.
  - HP turbine sealing strips: 4 sets — regional warehouse.
  - Steam stop valve packing sets: 3 sets available.

OEM service bulletins:
  - SB-SST-2024-04: Inspect condensate pump seals on SST-400 and SST-600 units > 10,000 EOH.
  - SB-SST-2025-01: Gland seal strip inspection on SST-series at next planned outage.
`;

const GENERATOR_MAINTENANCE_HISTORY = `
GENERATOR FLEET — MAINTENANCE HISTORY SUMMARY (Last 90 Days)
Applies to: SGen-series synchronous generators

Common recent findings:
  - 1 unit (GEN-01 / SGen-1000A): Stator winding insulation resistance 1,200 MΩ — excellent. PD activity nil.
  - 1 unit (GEN-02 / SGen-100A): Stator re-wedging at 7,200 h. Rotor balance verified. Exciter diodes replaced.
  - All units: Annual bearing vibration trending within normal limits (0.45–0.61 mm/s).
  - All units: H₂ purity 99.8% (GEN-01) — well above 98% minimum.

Trending observations:
  - No insulation degradation trends detected on any generator in fleet.
  - Lube oil temperatures stable; no cooler fouling observed.

Spare parts availability:
  - Exciter diode sets: 4 complete sets in stock.
  - Journal bearing inserts (generator): 4 sets available.
  - H₂ shaft seal assemblies: 2 sets available (SGen-1000A compatible).

OEM service bulletins:
  - SB-SGEN-2024-02: Annual H₂ seal oil differential pressure verification on SGen-1000A units.
`;

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Detect equipment type from query and turbine context
function detectEquipmentType(query: string, turbineType?: string): 'gas_turbine' | 'steam_turbine' | 'generator' {
  const combined = `${query} ${turbineType || ''}`.toLowerCase();
  if (
    combined.includes('sst') ||
    combined.includes('steam turbine') ||
    combined.includes('steam') ||
    /\bst-\d/.test(combined)
  ) return 'steam_turbine';
  if (
    combined.includes('sgen') ||
    combined.includes('generator') ||
    combined.includes('synchronous') ||
    /\bgen-\d/.test(combined)
  ) return 'generator';
  // Default: gas turbine (covers SGT, GT-xx, and general turbine questions)
  return 'gas_turbine';
}

function selectManualAndHistory(equipmentType: string): { manual: string; history: string; docRef: string } {
  if (equipmentType === 'steam_turbine') return {
    manual: STEAM_TURBINE_MANUAL,
    history: STEAM_TURBINE_MAINTENANCE_HISTORY,
    docRef: 'SE-ST-MM-3100',
  };
  if (equipmentType === 'generator') return {
    manual: GENERATOR_MANUAL,
    history: GENERATOR_MAINTENANCE_HISTORY,
    docRef: 'SE-GEN-MM-2800',
  };
  return {
    manual: GAS_TURBINE_MANUAL,
    history: GAS_TURBINE_MAINTENANCE_HISTORY,
    docRef: 'SE-GT-MM-4200',
  };
}

const SYSTEM_PROMPT =
  'You are an expert Siemens Energy equipment maintenance engineer specializing in gas turbines, steam turbines, and generators. ' +
  'You are provided with the correct unit-specific maintenance manual (user_technical_manual) and the maintenance history notes ' +
  '(past_maintenance_history_notes) that match the equipment type referenced in the question. ' +
  'Use ONLY the provided context to answer. Always reference the specific manual section numbers and history findings in your response. ' +
  'When the question involves a RISK or NOK status alert, produce a structured numbered action plan ' +
  'that explicitly cites both the user_technical_manual and the past_maintenance_history_notes. ' +
  'If additional information would be needed for a complete answer, state clearly what to look up in the user_technical_manual or CMMS. ' +
  'Be precise, engineering-accurate, and use terminology appropriate for a field maintenance technician. ' +
  'Format responses with clear sections and numbered steps where applicable. Do not truncate your response.';

const PREFERRED_MODELS = [
  'gemini-2.5-pro-preview-06-05',
  'gemini-2.5-pro-preview-05-06',
  'gemini-2.5-pro-preview-03-25',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro',
];

// Models that support thinkingConfig (Gemini 2.5+ family)
const THINKING_MODEL_PREFIXES = ['gemini-2.5'];
const supportsThinkingConfig = (modelId: string) =>
  THINKING_MODEL_PREFIXES.some((prefix) => modelId.startsWith(prefix));

const listAvailableModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`);
    if (!response.ok) {
      console.error('[api/ask-assistant] Failed to list models, status:', response.status);
      return [];
    }
    const data = await response.json();
    const models = Array.isArray(data?.models) ? data.models : [];
    return models
      .filter((model: any) =>
        Array.isArray(model?.supportedGenerationMethods) &&
        model.supportedGenerationMethods.includes('generateContent')
      )
      .map((model: any) => String(model?.name || '').replace(/^models\//, ''))
      .filter((name: string) => Boolean(name));
  } catch (error) {
    console.error('[api/ask-assistant] Failed to list models:', error);
    return [];
  }
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { query, turbineContext }: {
    query: string;
    turbineContext?: {
      id?: string;
      name?: string;
      type?: string;
      location?: string;
      manualUrl?: string;
      maintenanceHistory?: any[];
    };
  } = req.body;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: "Missing or invalid 'query' field in request body." });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('[api/ask-assistant] GOOGLE_API_KEY is not set.');
    res.status(500).json({ error: 'Server configuration error: API key not set.' });
    return;
  }

  // Select the correct manual and history for the equipment type mentioned in the query
  const equipmentType = detectEquipmentType(query, turbineContext?.type);
  const { manual, history, docRef } = selectManualAndHistory(equipmentType);

  // Build per-equipment maintenance history section if frontend supplies records
  let specificHistorySection = '';
  if (turbineContext?.maintenanceHistory && turbineContext.maintenanceHistory.length > 0) {
    const records = turbineContext.maintenanceHistory.slice(0, 6).map((r: any) => {
      const date = (r.timestamp || '').slice(0, 10);
      return `  [${date}] WO: ${r.orderNumber || '—'} | Type: ${r.type || '—'}\n    Findings: ${r.findings || '—'}\n    Result: ${r.result || '—'} | Service hours: ${r.hoursAtService?.toLocaleString() || '—'}h`;
    }).join('\n');
    specificHistorySection = `\n\n[specific_unit_maintenance_history — ${turbineContext.name || ''} / Unit ${turbineContext.id || ''}]\n${records}`;
  }

  // Enrich query with turbine context so the AI has full situational awareness
  const contextHeader = turbineContext
    ? `[EQUIPMENT CONTEXT]\nUnit ID: ${turbineContext.id || 'unknown'} | Model: ${turbineContext.name || 'unknown'} | Type: ${turbineContext.type || 'unknown'} | Location: ${turbineContext.location || 'unknown'}\nEquipment Manual Reference: ${docRef}\n\n`
    : '';

  const prompt =
    `${contextHeader}[user_technical_manual — ${docRef}]\n${manual}\n\n` +
    `[past_maintenance_history_notes]\n${history}${specificHistorySection}\n\n` +
    `QUESTION (provide a complete, well-structured answer referencing the user_technical_manual and past_maintenance_history_notes above): ${query}`;

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      candidateCount: 1,
      thinkingConfig: { thinkingBudget: 2048 },
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  const availableModels = await listAvailableModels(apiKey);
  const preferred = PREFERRED_MODELS.filter((m) => availableModels.includes(m));
  const fallback = availableModels.filter((m) => !PREFERRED_MODELS.includes(m));
  const candidates = [...preferred, ...fallback].slice(0, 12);

  if (candidates.length === 0) {
    res.status(503).json({
      error: 'no_supported_models',
      details: 'No model with generateContent support was returned for this API key/project.',
    });
    return;
  }

  let lastError: any = null;

  // Per-model fetch timeout: 28 s leaves buffer before the 60 s Vercel limit
  const PER_MODEL_TIMEOUT_MS = 28_000;

  for (const modelId of candidates) {
    const url = `${GEMINI_API_BASE}/${modelId}:generateContent?key=${apiKey}`;
    // Non-thinking models don't support thinkingConfig — strip it for those
    const { thinkingConfig: _tc, ...baseGenerationConfig } = body.generationConfig;
    const requestBody = supportsThinkingConfig(modelId)
      ? body
      : { ...body, generationConfig: baseGenerationConfig };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PER_MODEL_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      console.log(`[api/ask-assistant] model=${modelId} status=${response.status}`);

      if (response.status === 404) {
        console.warn(`Model ${modelId} not found, trying next…`);
        lastError = data;
        continue;
      }

      const isLimitZero = JSON.stringify(data).includes('limit: 0');
      if (response.status === 429 && isLimitZero) {
        console.warn(`Model ${modelId} has limit: 0 quota, trying next…`);
        lastError = data;
        continue;
      }

      if (!response.ok) {
        console.error(`[api/ask-assistant] Google error:`, JSON.stringify(data));
        res.status(response.status).json({ error: 'google_api_error', details: data.error || data });
        return;
      }

      const parts: Array<{ text?: string; thought?: boolean }> =
        data?.candidates?.[0]?.content?.parts ?? [];
      const answer = parts.find((p) => !p.thought && p.text)?.text?.trim() ?? '';
      if (!answer) {
        const finishReason = data?.candidates?.[0]?.finishReason ?? 'unknown';
        console.warn(
          `[api/ask-assistant] Model ${modelId} returned empty content (finishReason: ${finishReason}), trying next…`,
        );
        lastError = data;
        continue;
      }

      res.status(200).json({
        answer,
        context: `${manual.trim()}\n\n${history.trim()}`,
        equipmentType,
        docRef,
        model: modelId,
      });
      return;
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      if (fetchErr.name === 'AbortError') {
        console.warn(`[api/ask-assistant] Model ${modelId} timed out after ${PER_MODEL_TIMEOUT_MS}ms, trying next…`);
      } else {
        console.error(`[api/ask-assistant] Fetch error for ${modelId}:`, fetchErr.message);
      }
      lastError = fetchErr;
      continue;
    }
  }

  res.status(503).json({ error: 'all_models_failed', details: lastError });
}
