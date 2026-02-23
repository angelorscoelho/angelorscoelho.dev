import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { ChatMessage } from '../types';

// Initialize the client
// NOTE: process.env.API_KEY is handled by the build/runtime environment securely.
let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

try {
    // Safely access API key from either Vite's import.meta.env or process.env (for Vercel/Node)
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || 
                   (typeof process !== 'undefined' ? (process.env.GOOGLE_API_KEY || process.env.API_KEY) : undefined);

    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        initializationError = 'VITE_GOOGLE_API_KEY';
        // Strict console warning for developers
        console.warn(
            '%c⚠️ Gemini AI Service Initialization Failed',
            'color: #ff6b6b; font-size: 14px; font-weight: bold;'
        );
        console.warn(
            '%cMissing Environment Variable: VITE_GOOGLE_API_KEY',
            'color: #ff6b6b; font-size: 12px;'
        );
        console.warn(
            '%cAction Required: Set the VITE_GOOGLE_API_KEY environment variable in your deployment settings.\n' +
            'For Vercel: Add VITE_GOOGLE_API_KEY to your project Environment Variables in the Vercel dashboard.\n' +
            'For Local Development: Add VITE_GOOGLE_API_KEY=your_key to your .env file.',
            'color: #ffa500; font-size: 11px; font-family: monospace;'
        );
    }
} catch (error) {
    initializationError = error instanceof Error ? error.message : String(error);
    console.error(
        '%c❌ Failed to initialize Gemini client',
        'color: #ff0000; font-size: 12px;',
        error
    );
}

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  if (!ai) {
      // Graceful degradation message for end users
      if (initializationError === 'VITE_GOOGLE_API_KEY') {
          return "The AI chat service is not currently available. Please feel free to reach out via Email or LinkedIn if you'd like to connect!";
      }
      return "The AI chat service encountered a configuration error. Please reach out via Email or LinkedIn to connect.";
  }

  try {
    // The previous model (`gemini-1.5-flash-latest`) was returning 404
    // because it isn't available for the v1beta `generateContent` endpoint. The
    // 404 caused our catch block to resolve with the "high traffic" message.
    //
    // Use a safer default that supports chat/generateContent. Allow an
    // environment variable so you can swap models without rebuilding.
    //
    // Valid options (as of Feb 2026) include things like:
    //   - gemini-1.5
    //   - gemini-1.5-mini
    //   - gemini-1.5-latest
    //   - gpt-4o-mini (also works with this client)
    //
    // The `models.list()` API can be used (server‑side) to discover current
    // names, but for our static SPA we'll just pick a known-good default.
    const modelId =
      import.meta.env.VITE_GEMINI_MODEL ||
      // fallback to a broad, chat-compatible model
      'gemini-1.5';

    // Construct the history for the API (converting our internal type to Gemini's format if needed,
    // but here we will just concatenate the context for a single-turn-like strong prompt
    // or use chat session if we wanted full state. For simplicity and robustness in a static SPA,
    // we will use generateContent with the system instruction).
    
    // Create a chat session
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result: GenerateContentResponse = await chat.sendMessage({
      message: newMessage
    });

    return result.text || "I'm sorry, I couldn't generate a response at the moment.";
  } catch (error) {
    // Log detailed error for developers without exposing to user
    console.warn(
        'Gemini API Error:',
        error instanceof Error ? error.message : String(error)
    );

    // If the error indicates the selected model isn't available we can
    // provide a slightly different message during dev so the issue is easier
    // to diagnose (but still keep it generic for end users).
    const errMsg =
      error && typeof error === 'object' &&
      'error' in error &&
      (error as any).error;

    if (errMsg && errMsg.code === 404) {
      console.warn('Gemini model not found - check VITE_GEMINI_MODEL setting');
      return "The AI chat service is temporarily unavailable. I'm working on a fix!";
    }

    // Generic fallback message
    return "I'm currently experiencing high traffic. Please reach out to me directly via Email or LinkedIn!";
  }
};
