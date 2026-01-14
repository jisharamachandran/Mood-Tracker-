
export type MoodValue = 'Ecstatic' | 'Happy' | 'Neutral' | 'Stressed' | 'Sad' | 'Angry' | 'Tired';

export interface MoodEntry {
  id: string;
  timestamp: number;
  value: MoodValue;
  note: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  content: string;
}

export type GoalCategory = 'Personal' | 'Professional';
export type GoalStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  deadline?: string;
}

export interface AIInsight {
  moodAnalysis: string;
  goalAdvice: string;
  dailyQuote: string;
}
