import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Sparkles, Trophy } from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = ['coding', 'study', 'fitness', 'reading', 'health', 'personal', 'creativity', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'epic'];
const ATTRIBUTES = ['strength', 'intellect', 'agility', 'vitality'];

const emptyForm = { title: '', description: '', category: 'other', difficulty: 'medium', attribute: 'intellect' };

// `onCompleted` lets the parent Dashboard refresh the character card
// (XP/level/gold/attributes) right after a quest reward is applied,
// without this component needing to know how character state works.
export default function QuestList({ onCompleted }) {
  const [quests, setQuests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [lastReward, setLastReward] = useState(null);
  const [unlocked, setUnlocked] = useState([]);

  function loadQuests() {
    api
      .getQuests(false)
      .then(setQuests)
      .catch((err) => setError(err.message));
  }

  useEffect(loadQuests, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Give your Waypoint a title.');
      return;
    }
    try {
      await api.createQuest(form);
      setForm(emptyForm);
      setShowForm(false);
      loadQuests();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComplete(id) {
    setBusyId(id);
    setError('');
    try {
      const result = await api.completeQuest(id);
      setLastReward(result);
      setTimeout(() => setLastReward(null), 3000);
      if (result.unlockedAchievements?.length) {
        setUnlocked(result.unlockedAchievements);
        setTimeout(() => setUnlocked([]), 4500);
      }
      loadQuests();
      onCompleted?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id) {
    setBusyId(id);
    try {
      await api.deleteQuest(id);
      loadQuests();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">Waypoints</h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 rounded-lg bg-arcane px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} /> New Waypoint
        </button>
      </div>

      <AnimatePresence>
        {lastReward && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg border border-glimmer/40 bg-glimmer/10 px-4 py-3 text-sm text-glimmer"
          >
            <Sparkles size={16} />
            +{lastReward.xpEarned} XP · +{lastReward.goldEarned} Glimmer · {lastReward.attribute} +1
            {lastReward.currentStreak > 1 && ` · ${lastReward.currentStreak} day streak`}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {unlocked.map((a) => (
          <motion.div
            key={a.code}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 rounded-lg border border-arcane/40 bg-arcane/10 px-4 py-3 text-sm text-arcane"
          >
            <Trophy size={16} /> Achievement unlocked: {a.name}
          </motion.div>
        ))}
      </AnimatePresence>

      {error && (
        <div className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </div>
      )}

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleCreate}
          className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-panel/70 p-4"
        >
          <input
            type="text"
            placeholder="Title (e.g. Finish React chapter)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-void px-3 py-2 text-sm text-white placeholder:text-slate-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-void px-3 py-2 text-sm text-white placeholder:text-slate-500"
            rows={2}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-white/10 bg-void px-3 py-2 text-sm text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="rounded-lg border border-white/10 bg-void px-3 py-2 text-sm text-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={form.attribute}
              onChange={(e) => setForm({ ...form, attribute: e.target.value })}
              className="rounded-lg border border-white/10 bg-void px-3 py-2 text-sm text-white"
            >
              {ATTRIBUTES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-glimmer py-2 text-sm font-semibold text-void hover:opacity-90"
          >
            Create Waypoint
          </button>
        </motion.form>
      )}

      {quests.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
          No active Waypoints yet. Create one to start earning XP.
        </div>
      )}

      <ul className="space-y-2">
        <AnimatePresence>
          {quests.map((q) => (
            <motion.li
              key={q.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-panel/60 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{q.title}</p>
                <p className="text-xs capitalize text-slate-400">
                  {q.category} · {q.difficulty} · +{q.xp_reward} XP · +{q.gold_reward} Glimmer
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleComplete(q.id)}
                  disabled={busyId === q.id}
                  aria-label={`Complete ${q.title}`}
                  className="rounded-lg bg-arcane/80 p-2 text-white hover:bg-arcane disabled:opacity-50"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  disabled={busyId === q.id}
                  aria-label={`Delete ${q.title}`}
                  className="rounded-lg border border-white/10 p-2 text-slate-400 hover:border-ember hover:text-ember disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
