
import React from 'react';
import { MoodValue } from './types';

export const MOOD_CONFIG: Record<MoodValue, { emoji: string; color: string }> = {
  Ecstatic: { emoji: '🤩', color: 'text-yellow-400' },
  Happy: { emoji: '😊', color: 'text-green-400' },
  Neutral: { emoji: '😐', color: 'text-blue-300' },
  Stressed: { emoji: '😫', color: 'text-orange-400' },
  Sad: { emoji: '😢', color: 'text-indigo-400' },
  Angry: { emoji: '😡', color: 'text-red-500' },
  Tired: { emoji: '😴', color: 'text-purple-400' }
};

export const CATEGORY_COLORS = {
  Personal: 'bg-pink-500',
  Professional: 'bg-cyan-500'
};
