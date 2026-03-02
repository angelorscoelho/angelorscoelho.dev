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
    // We'll maintain a short ordered list of candidates.  The env var
    // (VITE_GEMINI_MODEL) sits at the front and can be used for quick testing
    // or swapping models without rebuilding the app.  If the API responds with
    // a 404 for a given model, we'll automatically roll forward to the next
    // candidate rather than immediately blowing up in the UI.  This removes the
    // need to "guess" a model name during development.
    //
    // Feel free to call `ai.models.list()` on the server or run
    // `scripts/list-models.js` (after setting an API key) to see the current
    // catalogue of supported models; our fallback chain uses well-known stable
    // Gemini model identifiers.
    const candidateModels = [
      import.meta.env.VITE_GEMINI_MODEL,
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ].filter(Boolean) as string[];  // drop undefined entries

    let lastError: any = null;
    let responseText: string | null | undefined = null;

    for (const modelId of candidateModels) {
      try {
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

        responseText = result.text;
        break;  // success, exit loop
      } catch (err) {
        // if it's a 404 model-not-found, try next candidate
        const errObj = err && typeof err === 'object' && 'error' in err && (err as any).error;
        if (errObj && errObj.code === 404) {
          console.warn(`model ${modelId} not available – trying next`);
          lastError = err;
          continue;
        }
        // non-404 error, rethrow to be handled by outer catch
        throw err;
      }
    }

    // If we fell out without a responseText we'll handle below
    if (responseText !== null) {
      return responseText || "I'm sorry, I couldn't generate a response at the moment.";
    }
    // otherwise fall through to error handling logic below
    throw lastError || new Error('no model succeeded');

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
