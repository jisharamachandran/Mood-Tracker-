
import React, { useState, useEffect, useCallback } from 'react';
import { MoodSection } from './components/MoodSection';
import { GoalSection } from './components/GoalSection';
import { JournalSection } from './components/JournalSection';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { MoodEntry, Goal, MoodValue, AIInsight, JournalEntry } from './types';
import { getAIInsights } from './services/geminiService';

const App: React.FC = () => {
  const [moods, setMoods] = useState<MoodEntry[]>(() => {
    const saved = localStorage.getItem('moods');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('journal');
    return saved ? JSON.parse(saved) : [];
  });

  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'moods' | 'goals' | 'journal'>('dashboard');

  useEffect(() => {
    localStorage.setItem('moods', JSON.stringify(moods));
  }, [moods]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('journal', JSON.stringify(journal));
  }, [journal]);

  const refreshInsights = useCallback(async () => {
    setLoadingInsights(true);
    const data = await getAIInsights(moods, goals, journal);
    setInsights(data);
    setLoadingInsights(false);
  }, [moods, goals, journal]);

  useEffect(() => {
    if (moods.length > 0 || goals.length > 0 || journal.length > 0) {
      refreshInsights();
    }
  }, []);

  const addMood = (value: MoodValue, note: string) => {
    const newEntry: MoodEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      value,
      note
    };
    setMoods(prev => [newEntry, ...prev]);
  };

  const addJournalEntry = (content: string) => {
    const newEntry: JournalEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      content
    };
    setJournal(prev => [newEntry, ...prev]);
  };

  const deleteJournalEntry = (id: string) => {
    setJournal(prev => prev.filter(j => j.id !== id));
  };

  const addGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Daily Spark ✨" className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          {insights ? (
            <div className="space-y-4">
              <p className="text-xl font-medium italic leading-relaxed">"{insights.dailyQuote}"</p>
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">Deep Reflection</h4>
                <p className="text-sm text-white/70 leading-relaxed">{insights.moodAnalysis}</p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-white/10 rounded w-3/4"></div>
              <div className="h-20 bg-white/5 rounded"></div>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4" 
            onClick={refreshInsights} 
            loading={loadingInsights}
          >
            Regenerate Insights
          </Button>
        </Card>

        <Card title="Pulse Check">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Completed</p>
              <p className="text-3xl font-bold">{goals.filter(g => g.status === 'Completed').length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Total Active</p>
              <p className="text-3xl font-bold">{goals.filter(g => g.status !== 'Completed').length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl col-span-2">
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mb-2">AI Coaching</p>
              <p className="text-sm italic text-white/70">
                {insights?.goalAdvice || "Keep tracking to unlock personalized advice."}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Current Vibe" className="h-full">
            {moods.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-7xl mb-4 float">
                  {moods[0].value === 'Ecstatic' && '🤩'}
                  {moods[0].value === 'Happy' && '😊'}
                  {moods[0].value === 'Neutral' && '😐'}
                  {moods[0].value === 'Stressed' && '😫'}
                  {moods[0].value === 'Sad' && '😢'}
                  {moods[0].value === 'Angry' && '😡'}
                  {moods[0].value === 'Tired' && '😴'}
                </span>
                <p className="text-xl font-bold">{moods[0].value}</p>
                <p className="text-white/30 text-[10px] uppercase font-bold mt-1 tracking-tighter">
                  Last Logged {new Date(moods[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ) : (
              <p className="text-white/20 text-center italic py-8">No mood logged yet.</p>
            )}
            <Button className="w-full mt-4" variant="secondary" onClick={() => setActiveTab('moods')}>Update Mood</Button>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Recent Thought" className="h-full">
            {journal.length > 0 ? (
              <div className="space-y-4">
                <p className="text-lg text-white/80 line-clamp-3 italic">"{journal[0].content}"</p>
                <p className="text-white/30 text-[10px] font-bold uppercase">Captured {new Date(journal[0].timestamp).toLocaleDateString()}</p>
                <Button variant="ghost" onClick={() => setActiveTab('journal')}>Read Full Stream</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-white/20 italic">
                Any quick thoughts or brain dumps?
                <Button className="mt-4" onClick={() => setActiveTab('journal')}>Start Journaling</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Growth Suite
          </h1>
          <p className="text-white/50 mt-2 font-medium">A space for your mind and your mission.</p>
        </div>
        
        <nav className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-xl">
          {(['dashboard', 'journal', 'moods', 'goals'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-white text-black shadow-lg' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="min-h-[60vh]">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'moods' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MoodSection entries={moods} onAddEntry={addMood} />
          </div>
        )}
        {activeTab === 'journal' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <JournalSection 
              entries={journal} 
              onAddEntry={addJournalEntry} 
              onDeleteEntry={deleteJournalEntry} 
            />
          </div>
        )}
        {activeTab === 'goals' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GoalSection 
              goals={goals} 
              onAddGoal={addGoal} 
              onUpdateGoal={updateGoal} 
              onDeleteGoal={deleteGoal} 
            />
          </div>
        )}
      </main>

      <footer className="fixed bottom-8 left-0 right-0 p-4 pointer-events-none z-50">
        <div className="max-w-lg mx-auto flex justify-center">
          <div className="glass px-8 py-3 rounded-full pointer-events-auto border border-white/20 shadow-2xl flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Gemini Active</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <span className="text-[10px] text-white/40 font-medium italic">Mindset is everything.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
