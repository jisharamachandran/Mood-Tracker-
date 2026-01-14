
import { GoogleGenAI, Type } from "@google/genai";
import { MoodEntry, Goal, AIInsight, JournalEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function getAIInsights(moods: MoodEntry[], goals: Goal[], journal: JournalEntry[]): Promise<AIInsight> {
  const moodContext = moods.slice(-5).map(m => `${new Date(m.timestamp).toLocaleDateString()}: ${m.value} (${m.note})`).join(", ");
  const goalContext = goals.map(g => `${g.title} (${g.category} - ${g.status} ${g.progress}%)`).join(", ");
  const journalContext = journal.slice(-3).map(j => j.content).join(" | ");

  const prompt = `
    Analyze the following data to provide personalized life coaching insights.
    Mood History: ${moodContext}
    Current Goals: ${goalContext}
    Recent Thoughts/Journaling: ${journalContext}
    
    Provide a JSON response with:
    1. moodAnalysis: A short, empathetic analysis of the user's emotional trend and how it relates to their thoughts.
    2. goalAdvice: Actionable advice for their goals based on their current mood/mindset.
    3. dailyQuote: An inspiring quote tailored specifically to their situation.
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
      moodAnalysis: "You've been reflecting a lot lately. Keep using this space to clear your head.",
      goalAdvice: "Break your top priority into three tiny steps you can do in 5 minutes.",
      dailyQuote: "The journey of a thousand miles begins with one step. - Lao Tzu"
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
