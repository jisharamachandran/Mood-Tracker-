
import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { MOOD_CONFIG } from '../constants';
import { MoodEntry, MoodValue } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface MoodSectionProps {
  entries: MoodEntry[];
  onAddEntry: (value: MoodValue, note: string) => void;
}

export const MoodSection: React.FC<MoodSectionProps> = ({ entries, onAddEntry }) => {
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (selectedMood) {
      onAddEntry(selectedMood, note);
      setSelectedMood(null);
      setNote('');
    }
  };

  const chartData = entries.slice(-10).map(entry => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mood: entry.value,
    score: Object.keys(MOOD_CONFIG).indexOf(entry.value)
  }));

  return (
    <div className="space-y-6">
      <Card title="How are you feeling?">
        <div className="flex flex-wrap gap-4 mb-6">
          {(Object.keys(MOOD_CONFIG) as MoodValue[]).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                selectedMood === m ? 'bg-white/20 scale-105 border-white/30' : 'bg-white/5 hover:bg-white/10'
              } border border-transparent`}
            >
              <span className="text-4xl mb-2">{MOOD_CONFIG[m].emoji}</span>
              <span className="text-xs font-medium">{m}</span>
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          <textarea
            placeholder="Any specific thoughts? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[100px]"
          />
          <Button 
            disabled={!selectedMood} 
            onClick={handleSubmit}
            className="w-full"
          >
            Log Mood
          </Button>
        </div>
      </Card>

      <Card title="Mood Trends" className="h-[300px]">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/30 italic">
            Log some moods to see your emotional journey!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(23, 23, 23, 0.9)', border: 'none', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#a855f7" 
                strokeWidth={3} 
                dot={{ r: 6, fill: '#a855f7' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
};
