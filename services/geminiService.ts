
import { GoogleGenAI, Type } from "@google/genai";
import { MoodEntry, Goal, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getAIInsights(moods: MoodEntry[], goals: Goal[]): Promise<AIInsight> {
  const moodContext = moods.slice(-7).map(m => `${new Date(m.timestamp).toLocaleDateString()}: ${m.value}`).join(", ");
  const goalContext = goals.map(g => `${g.title} (${g.category} - ${g.status} ${g.progress}%)`).join(", ");

  const prompt = `
    Analyze the following mood entries and goals to provide personalized insights.
    Mood History (last 7): ${moodContext}
    Current Goals: ${goalContext}
    
    Provide a JSON response with:
    1. moodAnalysis: A short, empathetic analysis of the user's emotional trend.
    2. goalAdvice: Actionable advice for the most critical or lagging goals.
    3. dailyQuote: An inspiring, non-cliché quote tailored to their current state.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moodAnalysis: { type: Type.STRING },
            goalAdvice: { type: Type.STRING },
            dailyQuote: { type: Type.STRING }
          },
          required: ["moodAnalysis", "goalAdvice", "dailyQuote"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AIInsight;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      moodAnalysis: "Your mood seems to be fluctuating. Remember to take small breaks!",
      goalAdvice: "Try breaking down your largest goal into 15-minute tasks.",
      dailyQuote: "The only way to do great work is to love what you do. - Steve Jobs"
    };
  }
}

export async function refineGoal(goalTitle: string): Promise<string> {
  const prompt = `Refine this goal title to be more specific, measurable, and motivating (SMART): "${goalTitle}". Just return the refined title text.`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || goalTitle;
  } catch (error) {
    return goalTitle;
  }
}
