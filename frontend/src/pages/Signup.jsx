import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(form);
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
        <h1 className="mb-1 text-2xl font-bold text-white">Create your character</h1>
        <p className="mb-6 text-sm text-slate-400">Begin your Aether Drift journey.</p>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Field label="Name" id="name" type="text" value={form.name} onChange={update('name')} autoComplete="name" />
          <Field label="Email" id="email" type="email" value={form.email} onChange={update('email')} autoComplete="email" />
          <Field
            label="Password"
            id="password"
            type="password"
            value={form.password}
            onChange={update('password')}
            autoComplete="new-password"
          />
          <Field
            label="Confirm password"
            id="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-arcane to-purple-500 py-3 font-semibold text-white shadow-glow transition disabled:opacity-60"
        >
          {submitting ? 'Creating character…' : 'Start Your Journey'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-arcane hover:underline">
            Log in
          </Link>
        </p>
      </motion.form>
    </div>
  );
}

function Field({ label, id, ...rest }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        id={id}
        name={id}
        required
        className="w-full rounded-lg border border-white/10 bg-void/60 px-3 py-2 text-white placeholder-slate-500 focus:border-arcane"
        {...rest}
      />
    </div>
  );
}
