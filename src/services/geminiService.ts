import { ChatMessage } from '../types';

/**
 * Sends a message to the Gemini AI via the /api/chat Vercel serverless function.
 * The API key never touches the browser — it lives exclusively in the server environment.
 */
export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message: newMessage }),
    });

    if (response.status === 429) {
      return "I'm receiving a lot of messages right now. Please try again in a moment, or reach out directly via Email or LinkedIn!";
    }

    if (response.status === 429) {
      return "I'm receiving a lot of messages right now. Please try again in a moment, or reach out directly via Email or LinkedIn!";
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Chat API error:', response.status, errorData);
      return "I'm currently experiencing high traffic. Please reach out to me directly via Email or LinkedIn!";
    }

    const data = await response.json();
    return data.text || "I'm sorry, I couldn't generate a response at the moment.";
  } catch (error) {
    console.warn('Chat API fetch error:', error instanceof Error ? error.message : String(error));
    return "I'm currently experiencing high traffic. Please reach out to me directly via Email or LinkedIn!";
  }
};