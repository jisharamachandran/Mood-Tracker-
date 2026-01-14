
import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { JournalEntry } from '../types';

interface JournalSectionProps {
  entries: JournalEntry[];
  onAddEntry: (content: string) => void;
  onDeleteEntry: (id: string) => void;
}

export const JournalSection: React.FC<JournalSectionProps> = ({ entries, onAddEntry, onDeleteEntry }) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onAddEntry(content);
      setContent('');
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Brain Dump">
        <p className="text-white/60 text-sm mb-4">Write whatever is on your mind. No structure needed, just let it flow.</p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I'm feeling like... Today I realized... Tomorrow I want to..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[200px] text-lg leading-relaxed"
        />
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} disabled={!content.trim()}>
            Save Reflection
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold font-heading px-2">Thought Stream</h3>
        {entries.map(entry => (
          <Card key={entry.id} className="group border-l-4 border-purple-500/40">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-xs font-bold text-white/40">
                  {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDeleteEntry(entry.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          </Card>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-12 text-white/20 italic">
            Your stream is empty. Start writing to see your thoughts here.
          </div>
        )}
      </div>
    </div>
  );
};
