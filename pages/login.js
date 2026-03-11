import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      router.push(router.query.redirect || '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 canvas-grid opacity-20" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8" style={{ border: '1px solid var(--border-color)' }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center font-display font-black text-xl"
              style={{ background: 'var(--neon-blue)', color: '#000' }}>IG</div>
            <h1 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Login to your IDE Game account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" className="cyber-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <input type="password" className="cyber-input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="cyber-btn cyber-btn-primary w-full text-sm py-3">
              {loading ? 'Logging in...' : 'Login →'}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--neon-blue)' }} className="font-semibold hover:underline">Sign Up Free</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
