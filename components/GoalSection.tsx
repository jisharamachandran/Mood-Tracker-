
import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Goal, GoalCategory, GoalStatus } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { refineGoal } from '../services/geminiService';

interface GoalSectionProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalSection: React.FC<GoalSectionProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', category: 'Personal' as GoalCategory });
  const [refining, setRefining] = useState(false);

  const handleRefine = async () => {
    if (!newGoal.title) return;
    setRefining(true);
    const refined = await refineGoal(newGoal.title);
    setNewGoal(prev => ({ ...prev, title: refined }));
    setRefining(false);
  };

  const handleAdd = () => {
    if (newGoal.title) {
      onAddGoal({
        title: newGoal.title,
        description: '',
        category: newGoal.category,
        status: 'Pending',
        progress: 0,
      });
      setNewGoal({ title: '', category: 'Personal' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-heading">Active Goals</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'primary'}>
          {isAdding ? 'Cancel' : 'Add New Goal'}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-purple-500/30">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Goal Title</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Master React"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <Button onClick={handleRefine} loading={refining} size="sm" variant="secondary" title="Refine with AI">
                  ✨ AI Polish
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Category</label>
              <div className="flex gap-2">
                {(['Personal', 'Professional'] as GoalCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewGoal(prev => ({ ...prev, category: cat }))}
                    className={`flex-1 py-2 rounded-xl transition-all border ${
                      newGoal.category === cat ? 'bg-purple-500 border-purple-400' : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleAdd}>Confirm Goal</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {goals.map(goal => (
          <Card key={goal.id} className="group transition-all hover:translate-x-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[goal.category]}`}>
                    {goal.category}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70`}>
                    {goal.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{goal.title}</h3>
              </div>
              <Button onClick={() => onDeleteGoal(goal.id)} variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40">Progress</span>
                <span className="text-white/80 font-bold">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" 
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={goal.progress}
                onChange={(e) => onUpdateGoal(goal.id, { progress: Number(e.target.value), status: Number(e.target.value) === 100 ? 'Completed' : 'In Progress' })}
                className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <select
                value={goal.status}
                onChange={(e) => onUpdateGoal(goal.id, { status: e.target.value as GoalStatus })}
                className="bg-white/5 border border-white/10 rounded-lg text-xs p-1 focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </Card>
        ))}
        {goals.length === 0 && !isAdding && (
          <div className="text-center py-12 text-white/20 italic">
            No goals yet. Dream big and start tracking!
          </div>
        )}
      </div>
    </div>
  );
};
