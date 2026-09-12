import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Coins, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api';
import QuestList from '../components/QuestList.jsx';
import Shop from '../components/Shop.jsx';

const ATTRIBUTES = ['strength', 'intellect', 'agility', 'vitality'];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [character, setCharacter] = useState(null);
  const [error, setError] = useState('');

  function loadCharacter() {
    api
      .getCharacter()
      .then(setCharacter)
      .catch((err) => setError(err.message));
  }

  useEffect(loadCharacter, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Welcome back,</p>
          <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:border-ember hover:text-ember"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-ember">
          {error}
        </div>
      )}

      {!character && !error && (
        <div className="rounded-2xl border border-white/10 bg-panel/60 p-8 text-slate-400">
          Loading your character…
        </div>
      )}

      {character && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-panel/70 p-6 shadow-glow"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-display text-lg font-bold text-glimmer">
              LEVEL {character.level}
            </span>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-ember">
                <Flame size={16} /> {character.currentStreak} day streak
              </span>
              <span className="flex items-center gap-1 text-glimmer">
                <Coins size={16} /> {character.gold} Glimmer
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>XP</span>
              <span>
                {character.xp} / {character.xpForNextLevel}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-void">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(character.xp / character.xpForNextLevel) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-arcane to-glimmer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {ATTRIBUTES.map((attr) => (
              <div key={attr}>
                <div className="mb-1 flex justify-between text-xs capitalize text-slate-400">
                  <span>{attr}</span>
                  <span>{character.attributes[attr]}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-void">
                  <div
                    className="h-full rounded-full bg-arcane"
                    style={{ width: `${Math.min(character.attributes[attr], 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <QuestList onCompleted={loadCharacter} />
      {character && <Shop gold={character.gold} onPurchase={loadCharacter} />}
    </div>
  );
}
