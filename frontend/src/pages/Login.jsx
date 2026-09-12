import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-panel/80 p-8 shadow-glow"
      >
        <h1 className="mb-1 text-2xl font-bold text-white">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-400">Continue your journey.</p>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              className="w-full rounded-lg border border-white/10 bg-void/60 px-3 py-2 text-white focus:border-arcane"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={update('password')}
              className="w-full rounded-lg border border-white/10 bg-void/60 px-3 py-2 text-white focus:border-arcane"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-arcane to-purple-500 py-3 font-semibold text-white shadow-glow transition disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          New here?{' '}
          <Link to="/signup" className="text-arcane hover:underline">
            Create a character
          </Link>
        </p>
      </motion.form>
    </div>
  );
}
