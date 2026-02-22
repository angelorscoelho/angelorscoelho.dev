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
    // We use gemini-3-flash-preview for speed and efficiency as requested.
    // It is capable enough for this RAG-like context task.
    const modelId = 'gemini-3-flash-preview';

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
    // Return user-friendly message
    return "I'm currently experiencing high traffic. Please reach out to me directly via Email or LinkedIn!";
  }
};
