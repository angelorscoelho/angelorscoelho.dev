// Self-contained Vercel serverless function — no SDK, raw REST calls only.
// This avoids any SDK bundling issues and gives full visibility into Google's responses.

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_INSTRUCTION = `
You are an AI assistant representing Ângelo Coelho. 
Your goal is to answer questions about his experience, skills, and background professionally.

Context about Ângelo:
1. He is a Software Engineer with a Full Stack history, having developed everything from end-to-end UI/UX workflows to high-performance backends.
2. He currently works at Bosch where his proactive vision for optimization led to him being chosen as the LEAN Champion. He analyzes work methods and implements automation to optimize team routines.
3. He is currently leading a major CI/CD infrastructure migration to GitHub to use the Actions and uniformizing deployment scripts.
4. He has developed specialized front-end components like industrial management boards and Ishikawa (Fishbone) problem-solving tools.
5. He is highly proactive in learning, currently specializing in AI Agents (DeepLearning.AI) and AWS Cloud Solutions (2025).
6. His background includes 7 years of professional experience, handling enterprise-scale APIs and industrial production systems.

Maintain a professional, helpful assistant tone. Use the first person or third person as appropriate for an assistant.
`;

const PREFERRED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-pro',
  'gemini-1.5-pro',
];

const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const listAvailableModels = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await fetch(`${GOOGLE_API_BASE}?key=${apiKey}`);
    if (!response.ok) {
      console.error('[api/chat] Failed to list models, status:', response.status);
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
    console.error('[api/chat] Failed to list models:', error);
    return [];
  }
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { history, message }: { history: ChatMessage[]; message: string } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing or invalid message field.' });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not set in environment variables.');
    res.status(500).json({ error: 'API key not configured.' });
    return;
  }

  // Build the Gemini-compatible contents array from history + new message
  const contents: any[] = [];
  for (const msg of (history ?? [])) {
    contents.push({ role: msg.role, parts: [{ text: msg.text }] });
  }
  contents.push({ role: 'user', parts: [{ text: message }] });

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents,
    generationConfig: { temperature: 0.7 },
  };

  const availableModels = await listAvailableModels(apiKey);
  const preferredAvailable = PREFERRED_MODELS.filter((model) => availableModels.includes(model));
  const discoveredFallback = availableModels.filter((model) => !PREFERRED_MODELS.includes(model));
  const candidateModels = [...preferredAvailable, ...discoveredFallback].slice(0, 12);

  if (candidateModels.length === 0) {
    res.status(503).json({
      error: 'no_supported_models',
      details: 'No model with generateContent support was returned for this API key/project.',
    });
    return;
  }

  let lastError: any = null;

  for (const modelId of candidateModels) {
    const url = `${GOOGLE_API_BASE}/${modelId}:generateContent?key=${apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Log everything for Vercel function logs
      console.log(`[api/chat] model=${modelId} status=${response.status}`);
      if (!response.ok) {
        console.error(`[api/chat] Google error:`, JSON.stringify(data));
      }

      if (response.status === 404) {
        console.warn(`Model ${modelId} not found, trying next…`);
        lastError = data;
        continue;
      }

      // limit: 0 means this model has no free-tier quota on this project — try next model
      const isLimitZero = JSON.stringify(data).includes('limit: 0');
      if (response.status === 429 && isLimitZero) {
        console.warn(`Model ${modelId} has limit: 0 quota, trying next…`);
        lastError = data;
        continue;
      }

      if (!response.ok) {
        res.status(response.status).json({
          error: 'google_api_error',
          status: response.status,
          details: data.error || data
        });
        return;
      }

      // Extract text from the response
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      res.status(200).json({ text: text || "I'm sorry, I couldn't generate a response." });
      return;

    } catch (fetchErr: any) {
      console.error(`[api/chat] Fetch error for ${modelId}:`, fetchErr.message);
      lastError = fetchErr;
      continue;
    }
  }

  // All models failed
  res.status(503).json({ error: 'all_models_failed', details: lastError });
}
