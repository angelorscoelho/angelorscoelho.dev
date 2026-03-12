// Vercel serverless function — Siemens Energy AI Maintenance Assistant
// Same architecture as angelorscoelho.dev/api/chat.ts
// GOOGLE_API_KEY is read exclusively server-side; the key is never exposed to the browser.

// ── Mock Knowledge Base ────────────────────────────────────────────────────────
const MAINTENANCE_MANUAL_EXCERPT = `
SIEMENS ENERGY SGT-SERIES GAS TURBINE — MAINTENANCE MANUAL (EXCERPT)
Document Ref: SE-GT-MM-4200 | Revision 7 | Confidential — PoC Demonstration Only

=== SECTION 4: INSPECTION INTERVALS ===
Hot Gas Path (HGP) Inspection: Every 8,000 Equivalent Operating Hours (EOH) or 900 starts.
  Components inspected: combustion liners, transition pieces, first-stage nozzles and blades,
  turbine shrouds.
Major Overhaul: Every 24,000 EOH or 2,400 starts (whichever comes first).
Combustion Inspection: Every 4,000 EOH or 450 starts.
  Includes: fuel nozzle cleaning, cross-fire tube inspection, liner replacement if wear > 20%.

=== SECTION 7: VIBRATION THRESHOLDS ===
Bearing Vibration Alert Levels (peak-to-peak, mm/s RMS):
  • Normal operation : < 2.5 mm/s
  • Warning (reduce load)  : 2.5 – 5.0 mm/s
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

FAULT: Rapid load loss with alarm
  Likely cause: Fuel supply interruption, inlet pressure drop, or control system fault.
  Action: Check fuel header pressure. Review control system logs. Restart only after root cause identified.

=== SECTION 22: RAG ACTION PLAN TEMPLATES ===

ACTION PLAN TEMPLATE — NOK (Critical) STATUS:
This template applies when turbine parameters exceed critical thresholds.
Required inputs: user_technical_manual (unit-specific procedures), past_maintenance_history_notes (recent work history).
Step 1 [IMMEDIATE — 0–15 min]: Reduce load to 50% rated capacity. Notify shift supervisor and OEM hotline.
Step 2 [IMMEDIATE — 15–30 min]: Cross-check critical reading against redundant sensors. If confirmed, initiate controlled shutdown.
Step 3 [SHORT-TERM — 0–24 h]: Review past_maintenance_history_notes for recent maintenance that may have introduced the fault.
Step 4 [SHORT-TERM — 24–48 h]: Perform visual and borescope inspection per user_technical_manual Section 7 (vibration) or Section 9 (temperature).
Step 5 [MEDIUM-TERM — 2–7 days]: Complete root cause analysis. Apply corrective maintenance. Update past_maintenance_history_notes with findings.
Step 6 [RETURN-TO-SERVICE]: Verify repair quality through graduated load test per user_technical_manual startup and commissioning section.

ACTION PLAN TEMPLATE — RISK (Warning) STATUS:
This template applies when parameters are in the warning zone but below critical thresholds.
Required inputs: user_technical_manual, past_maintenance_history_notes.
Step 1 [MONITOR — Immediate]: Increase monitoring frequency (every 15 min readings). Set additional alarm at 80% of critical threshold.
Step 2 [REVIEW — Within 4 h]: Review past_maintenance_history_notes for parameter trends over last 30 days.
Step 3 [INVESTIGATE — Within 24 h]: Perform non-invasive diagnostics per user_technical_manual.
Step 4 [PLAN — Within 48 h]: Schedule planned maintenance outage if trend is degrading.
Step 5 [CORRECTIVE — At planned outage]: Perform targeted inspection. Update past_maintenance_history_notes.

=== SECTION 25: PAST MAINTENANCE HISTORY INTEGRATION ===
When reviewing past_maintenance_history_notes, check for:
  - Recent bearing replacements or adjustments (correlate with vibration changes)
  - Compressor wash history (correlate with efficiency and exhaust temperature trends)
  - Fuel nozzle replacements (correlate with combustion temperature spread)
  - Blade repairs or coatings (correlate with exhaust temperature and efficiency)
  - Seal replacements (correlate with shaft speed and efficiency)
  - Any near-miss events or previous alarms of the same parameter
  - Hours since last major overhaul vs. recommended interval
`;

const PAST_MAINTENANCE_HISTORY_NOTES = `
FLEET MAINTENANCE HISTORY — SUMMARY NOTES (Last 90 Days)
Generated: Auto-updated by CMMS | Use with: user_technical_manual SE-GT-MM-4200

Common recent findings across fleet:
  - 3 units: Compressor blade tip erosion found during inspections; accelerated by dusty inlet conditions.
  - 2 units: Bearing #3 oil supply restrictor partially blocked; cleared during planned maintenance.
  - 4 units: Fuel nozzle coking on units operating on natural gas with high aromatic content; nozzles cleaned.
  - 1 unit: Exhaust thermocouple #7 replaced due to calibration drift of +18°C.
  - 2 units: Inlet filter differential pressure elevated; filters replaced ahead of schedule.

Trending observations:
  - Fleet-wide exhaust temperature creeping +5°C above baseline over last 60 days; attributed to seasonal ambient temperature increase.
  - Bearing vibration on units with > 20,000 EOH showing gradual upward trend; proactive bearing inspection scheduled.

Spare parts availability:
  - Combustion liners (Type A/B): 8 sets in regional warehouse (Houston).
  - Bearing assemblies (journal type): 12 sets available.
  - Fuel nozzle assemblies: 24 sets (all models).

OEM service bulletins active:
  - SB-SGT-2024-07: Inspect transition piece cooling holes at next combustion inspection on units > 8,000 EOH.
  - SB-SGT-2025-03: Lubrication system filter bypass valve check on SGT-series with > 15,000 EOH.
`;

const SYSTEM_PROMPT =
  'You are an expert gas turbine and steam turbine maintenance engineer at Siemens Energy. ' +
  'You have access to the Siemens Energy maintenance manual (user_technical_manual) and ' +
  'recent fleet maintenance history notes (past_maintenance_history_notes), both of which ' +
  'are provided in the context below. ' +
  'When the question involves a RISK or NOK status alert, always produce a structured action plan ' +
  'that explicitly references both the user_technical_manual procedures and the past_maintenance_history_notes. ' +
  'Answer using ONLY the information in the provided context. If additional information is needed, ' +
  'state clearly what should be checked in the user_technical_manual or CMMS. ' +
  'Be concise, precise, and use engineering terminology appropriate for a field maintenance technician. ' +
  'Format action plans as numbered steps with estimated timeframes.';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const ALERT_KEYWORDS = [
  'nok', 'risk', 'critical', 'emergency', 'alarm', 'alert', 'action plan',
  'vibration', 'temperature', 'exhaust', 'bearing', 'shutdown', 'diagnostic',
];

const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-pro',
  'gemini-1.5-pro',
];

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

  const { query }: { query: string } = req.body;
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

  const isAlertQuery = ALERT_KEYWORDS.some((kw) => query.toLowerCase().includes(kw));
  const prompt = isAlertQuery
    ? `[user_technical_manual]\n${MAINTENANCE_MANUAL_EXCERPT}\n\n[past_maintenance_history_notes]\n${PAST_MAINTENANCE_HISTORY_NOTES}\n\nQUESTION (requires action plan using both user_technical_manual and past_maintenance_history_notes): ${query}`
    : `[user_technical_manual]\n${MAINTENANCE_MANUAL_EXCERPT}\n\nQUESTION: ${query}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 800, candidateCount: 1 },
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

  for (const modelId of candidates) {
    const url = `${GEMINI_API_BASE}/${modelId}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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

      const answer =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't generate a response.";
      const context = isAlertQuery
        ? `${MAINTENANCE_MANUAL_EXCERPT.trim()}\n\n${PAST_MAINTENANCE_HISTORY_NOTES.trim()}`
        : MAINTENANCE_MANUAL_EXCERPT.trim();

      res.status(200).json({ answer, context, model: modelId });
      return;
    } catch (fetchErr: any) {
      console.error(`[api/ask-assistant] Fetch error for ${modelId}:`, fetchErr.message);
      lastError = fetchErr;
      continue;
    }
  }

  res.status(503).json({ error: 'all_models_failed', details: lastError });
}
