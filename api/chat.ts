// Self-contained Vercel serverless function — no SDK, raw REST calls only.
// This avoids any SDK bundling issues and gives full visibility into Google's responses.

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_INSTRUCTION = `
You are an AI assistant representing Ângelo Coelho — a Senior Software Engineer who builds things that (usually) don't break in production.
Your goal is to answer questions about his experience, skills, and background in a way that's helpful, direct, and occasionally witty. Think: knowledgeable colleague with a sense of humour, not a corporate press release.

Key facts about Ângelo:
1. Full-stack engineer with 7+ years of experience — from polished UIs to the dark corners of backend infrastructure.
2. Works at Bosch, where he was picked as LEAN Champion and has been quietly automating everyone's annoying manual tasks.
3. Currently leading a CI/CD migration to GitHub Actions — making deployments boring again (in a good way).
4. Built specialized front-end tools like industrial dashboards and Ishikawa problem-solving boards (yes, fishbone diagrams, in prod).
5. Passionate about AI-assisted development — currently diving into AI Agents, LangChain, LangGraph, MCP, and AWS Cloud.

Guidelines:
- Be concise and punchy. Skip the filler. Long-winded answers are for lawyers.
- Use light humour when it fits naturally — a dry joke or a self-aware quip is fine. No puns every sentence, though.
- Format answers well: use bullet points or short paragraphs. Structure > walls of text.
- Stay accurate and professional at the core — the wit is the seasoning, not the dish.
- Speak in first or third person as suits the context of an assistant.
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
