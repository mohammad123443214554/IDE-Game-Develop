import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ earnings: 0, plays: 0, games: 0, balance: 0 });
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ method: 'paypal', details: '', amount: 5 });

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/dashboard');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/api/user/stats`)
        .then(res => setStats(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/user/withdraw`, withdrawForm);
      toast.success('Withdrawal request submitted! Admin will review within 24h.');
      setWithdrawModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="font-display text-xl animate-pulse" style={{ color: 'var(--neon-blue)' }}>Loading<span className="loading-dots" /></div>
    </div>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display font-black text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
            Welcome back, <span className="neon-text">@{user.username}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's your creator dashboard</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Earnings', value: `$${stats.earnings?.toFixed(2) || '0.00'}`, icon: '💰', color: 'var(--neon-green)' },
            { label: 'Total Plays', value: (stats.plays || 0).toLocaleString(), icon: '👁', color: 'var(--neon-blue)' },
            { label: 'Published Games', value: stats.games || 0, icon: '🎮', color: 'var(--neon-purple)' },
            { label: 'Available Balance', value: `$${stats.balance?.toFixed(2) || '0.00'}`, icon: '💳', color: 'var(--neon-pink)' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass-card p-5">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="font-display font-black text-2xl" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass-card p-6">
            <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>⚡ Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/lab" className="cyber-btn w-full text-center text-xs block py-2">🎮 Open Lab</Link>
              <Link href="/your-games" className="cyber-btn w-full text-center text-xs block py-2">📁 Your Games</Link>
              <button onClick={() => setWithdrawModal(true)}
                disabled={stats.balance < 5}
                className="cyber-btn w-full text-xs py-2 disabled:opacity-40 disabled:cursor-not-allowed">
                💵 Withdraw Earnings
              </button>
              {stats.balance < 5 && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Min. withdrawal: $5 (need ${(5 - (stats.balance || 0)).toFixed(2)} more)
                </p>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>👤 Account</h3>
            <div className="space-y-3">
              <Link href="/settings" className="flex items-center gap-2 text-sm py-2 hover:text-[var(--neon-blue)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}>✏️ Edit Profile</Link>
              <Link href="/settings?tab=password" className="flex items-center gap-2 text-sm py-2 hover:text-[var(--neon-blue)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}>🔒 Change Password</Link>
              <button onClick={logout} className="flex items-center gap-2 text-sm py-2 text-red-400 hover:text-red-300 transition-colors w-full text-left">
                🚪 Logout
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>📈 Earnings Info</h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>• <strong style={{ color: 'var(--neon-blue)' }}>200 plays = $1</strong></p>
              <p>• Minimum withdrawal: $5</p>
              <p>• Maximum per request: $10</p>
              <p>• Methods: PayPal, UPI, Bank</p>
              <p>• Admin approval within 24h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-md">
            <h3 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>💵 Withdraw Earnings</h3>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Method</label>
                <select className="cyber-input" value={withdrawForm.method}
                  onChange={e => setWithdrawForm({ ...withdrawForm, method: e.target.value })}>
                  <option value="paypal">PayPal</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {withdrawForm.method === 'paypal' ? 'PayPal Email' : withdrawForm.method === 'upi' ? 'UPI ID' : 'Account Number / IBAN'}
                </label>
                <input type="text" className="cyber-input" placeholder="Enter details..."
                  value={withdrawForm.details} onChange={e => setWithdrawForm({ ...withdrawForm, details: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Amount ($5 - $10)</label>
                <input type="number" min="5" max={Math.min(10, stats.balance)} className="cyber-input"
                  value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: Number(e.target.value) })} required />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="cyber-btn cyber-btn-primary flex-1 text-xs">Submit Request</button>
                <button type="button" onClick={() => setWithdrawModal(false)} className="cyber-btn flex-1 text-xs">Cancel</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
