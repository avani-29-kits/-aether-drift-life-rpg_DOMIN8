import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Sword, Flame, Trophy } from 'lucide-react';

const features = [
  {
    icon: Sword,
    title: 'Turn tasks into quests',
    body: 'Study sessions, workouts, and habits become Waypoints with real XP and Glimmer rewards.',
  },
  {
    icon: Flame,
    title: 'Build a streak',
    body: 'Show up daily and watch your streak — and your bonus rewards — grow.',
  },
  {
    icon: Trophy,
    title: 'Unlock achievements',
    body: 'Hit milestones and earn badges that mark your journey.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-xl font-bold tracking-wide text-glimmer">
          Aether Drift
        </span>
        <Link
          to="/login"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-arcane hover:text-white"
        >
          Login
        </Link>
      </nav>

      <header className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 flex items-center gap-2 rounded-full border border-arcane/40 bg-panel/60 px-4 py-1.5 text-xs uppercase tracking-widest text-arcane"
        >
          <Sparkles size={14} />
          Gamified productivity
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl font-bold leading-tight sm:text-6xl"
        >
          Turn your real life
          <br />
          into an <span className="text-glimmer">adventure</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-slate-400"
        >
          Aether Drift turns your to-do list into RPG quests. Complete Waypoints,
          earn XP and Glimmer, level up your character, and build streaks that
          keep you coming back.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            to="/signup"
            className="rounded-xl bg-gradient-to-r from-arcane to-purple-500 px-8 py-3 font-semibold text-white shadow-glow transition hover:brightness-110"
          >
            Start Your Journey
          </Link>
          <Link
            to="/login"
            className="rounded-xl border border-white/15 px-8 py-3 font-semibold text-slate-200 transition hover:border-white/30"
          >
            Login
          </Link>
        </motion.div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-white/10 bg-panel/70 p-6"
          >
            <Icon className="mb-3 text-glimmer" size={22} />
            <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{body}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
