import { GoogleGenAI } from "@google/genai";

(async () => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.API_KEY || process.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("No API key in environment");
      process.exit(1);
    }
    const ai = new GoogleGenAI({ apiKey });
    const models = await ai.models.list();
    console.log(JSON.stringify(models, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
