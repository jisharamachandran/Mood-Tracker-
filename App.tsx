
import React, { useState, useEffect, useCallback } from 'react';
import { MoodSection } from './components/MoodSection';
import { GoalSection } from './components/GoalSection';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { MoodEntry, Goal, MoodValue, AIInsight } from './types';
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

  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'moods' | 'goals'>('dashboard');

  useEffect(() => {
    localStorage.setItem('moods', JSON.stringify(moods));
  }, [moods]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const refreshInsights = useCallback(async () => {
    setLoadingInsights(true);
    const data = await getAIInsights(moods, goals);
    setInsights(data);
    setLoadingInsights(false);
  }, [moods, goals]);

  useEffect(() => {
    if (moods.length > 0 || goals.length > 0) {
      refreshInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Daily Spark ✨" className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
          {insights ? (
            <div className="space-y-4">
              <p className="text-xl font-medium italic">"{insights.dailyQuote}"</p>
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-bold uppercase text-purple-400 mb-2">Reflections</h4>
                <p className="text-sm text-white/80">{insights.moodAnalysis}</p>
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
            Refresh AI Insights
          </Button>
        </Card>

        <Card title="Quick Stats">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl">
              <p className="text-white/40 text-xs uppercase font-bold">Goals Completed</p>
              <p className="text-3xl font-bold">{goals.filter(g => g.status === 'Completed').length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl">
              <p className="text-white/40 text-xs uppercase font-bold">In Progress</p>
              <p className="text-3xl font-bold">{goals.filter(g => g.status === 'In Progress').length}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl col-span-2">
              <p className="text-white/40 text-xs uppercase font-bold mb-2">AI Goal Coaching</p>
              <p className="text-sm italic text-white/70">
                {insights?.goalAdvice || "Enter your goals to get tailored coaching."}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card title="Latest Mood" className="h-full">
            {moods.length > 0 ? (
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-7xl mb-4 float">
                  {Object.entries(moods[0].value ? moods[0].value : 'Neutral').map(([k, v]) => moods[0].value === k ? '' : '')}
                  {/* Just hardcode current since lookup is easy */}
                  {moods[0].value === 'Ecstatic' && '🤩'}
                  {moods[0].value === 'Happy' && '😊'}
                  {moods[0].value === 'Neutral' && '😐'}
                  {moods[0].value === 'Stressed' && '😫'}
                  {moods[0].value === 'Sad' && '😢'}
                  {moods[0].value === 'Angry' && '😡'}
                  {moods[0].value === 'Tired' && '😴'}
                </span>
                <p className="text-xl font-bold">{moods[0].value}</p>
                <p className="text-white/40 text-xs">Logged {new Date(moods[0].timestamp).toLocaleTimeString()}</p>
              </div>
            ) : (
              <p className="text-white/30 text-center italic">No logs yet today.</p>
            )}
            <Button className="w-full mt-4" variant="secondary" onClick={() => setActiveTab('moods')}>Track Mood</Button>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card title="Top Priority" className="h-full">
            {goals.filter(g => g.status !== 'Completed').slice(0, 1).map(g => (
              <div key={g.id} className="space-y-4">
                <h4 className="text-2xl font-bold">{g.title}</h4>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/60">Overall Progress</span>
                  <span className="font-bold">{g.progress}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" 
                    style={{ width: `${g.progress}%` }}
                  />
                </div>
                <Button variant="ghost" onClick={() => setActiveTab('goals')}>Manage All Goals</Button>
              </div>
            ))}
            {goals.filter(g => g.status !== 'Completed').length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-white/30 italic">
                All caught up! Time for a new challenge?
                <Button className="mt-4" onClick={() => setActiveTab('goals')}>Set New Goal</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-heading bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Growth Suite
          </h1>
          <p className="text-white/60 mt-2">Elevate your mind. Master your mission.</p>
        </div>
        
        <nav className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 self-start md:self-end">
          {(['dashboard', 'moods', 'goals'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
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

      <footer className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="glass px-8 py-4 rounded-full pointer-events-auto border border-white/20 shadow-2xl flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-white/60">AI Sync Active</span>
            </div>
            <div className="w-[1px] h-4 bg-white/10" />
            <span className="text-xs text-white/40 italic">Stay focused, stay present.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
