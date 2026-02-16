import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { ChatMessage } from '../types';

// Initialize the client
// NOTE: process.env.API_KEY is handled by the build/runtime environment securely.
let ai: GoogleGenAI | null = null;

try {
    // Safely access API key from either Vite's import.meta.env or process.env (for Vercel/Node)
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || (typeof process !== 'undefined' ? (process.env.GOOGLE_API_KEY || process.env.API_KEY) : undefined);

    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        console.warn("API_KEY is not set. Gemini features will be disabled.");
    }
} catch (error) {
    console.error("Failed to initialize Gemini client:", error);
}

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  if (!ai) {
      return "I'm sorry, the AI service is not configured correctly (missing API Key). Please contact the administrator.";
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
    console.error("Error communicating with Gemini:", error);
    return "I'm currently experiencing high traffic. Please reach out to me directly via Email or LinkedIn!";
  }
};