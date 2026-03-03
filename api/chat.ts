import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

// Inlined to keep this serverless function fully self-contained (no cross-dir imports)
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
