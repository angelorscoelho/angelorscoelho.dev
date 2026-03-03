import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { SYSTEM_INSTRUCTION } from '../src/constants';
import type { ChatMessage } from '../src/types';

const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Parse body — Vercel provides it already parsed for JSON content-type
  const { history, message }: { history: ChatMessage[]; message: string } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Missing or invalid message field.' });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_API_KEY is not set in environment variables.');
    res.status(500).json({ error: 'Server configuration error: API key not set.' });
    return;
  }

  const ai = new GoogleGenAI({ apiKey });

  let lastError: unknown = null;

  for (const modelId of CANDIDATE_MODELS) {
    try {
      const chat = ai.chats.create({
        model: modelId,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
        history: (history ?? []).map((msg: ChatMessage) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        })),
      });

      const result: GenerateContentResponse = await chat.sendMessage({ message });
      const text = result.text ?? "I'm sorry, I couldn't generate a response at the moment.";
      res.status(200).json({ text });
      return;
    } catch (err: any) {
      // Roll forward on 404 (model not found)
      if (err?.error?.code === 404 || err?.status === 404) {
        console.warn(`Model ${modelId} not available, trying next…`);
        lastError = err;
        continue;
      }
      // For rate-limiting surface a clear error so the client can show the right message
      if (err?.error?.code === 429 || err?.status === 429) {
        res.status(429).json({ error: 'rate_limited' });
        return;
      }
      // Any other error — rethrow to outer catch
      throw err;
    }
  }

  // All models failed with 404
  console.error('All candidate models returned 404:', lastError);
  res.status(503).json({ error: 'No available model found.' });
}
