import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme, themes } from '../context/ThemeContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Settings() {
  const { user, loading, updateUser, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState(router.query.tab || 'profile');
  const [profileForm, setProfileForm] = useState({ fullName: '', bio: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteStep, setDeleteStep] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (user) setProfileForm({ fullName: user.fullName || '', bio: user.bio || '' });
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${API}/api/user/profile`, profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); } finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPw.length < 8) return toast.error('Min 8 characters');
    setSaving(true);
    try {
      await axios.put(`${API}/api/user/password`, { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success('Password changed!');
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const requestDeleteOtp = async () => {
    try {
      await axios.post(`${API}/api/auth/request-delete-otp`);
      setDeleteStep(1);
      toast.success('OTP sent to your email');
    } catch { toast.error('Failed to send OTP'); }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API}/api/user/account`, { data: { otp: deleteOtp } });
      toast.success('Account deleted');
      logout();
      router.push('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading || !user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-display font-black text-3xl mb-8" style={{ color: 'var(--text-primary)' }}>
          ⚙️ <span className="neon-text">Settings</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="glass-card p-3 h-fit">
            {[['profile', '👤 Profile'], ['password', '🔒 Password'], ['themes', '🎨 Themes'], ['danger', '⚠️ Danger Zone']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className="w-full text-left p-3 rounded text-sm font-semibold mb-1 transition-all"
                style={{ background: tab === t ? 'rgba(0,212,255,0.15)' : 'transparent', color: tab === t ? 'var(--neon-blue)' : 'var(--text-secondary)' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="md:col-span-3 glass-card p-6">
            {tab === 'profile' && (
              <form onSubmit={saveProfile} className="space-y-4">
                <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Edit Profile</h2>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Username</label>
                  <input className="cyber-input opacity-50" value={user.username} disabled />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Username cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                  <input type="text" className="cyber-input" value={profileForm.fullName}
                    onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                  <textarea className="cyber-input" rows={3} placeholder="Tell us about yourself..."
                    value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                </div>
                <button type="submit" disabled={saving} className="cyber-btn cyber-btn-primary text-xs">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={changePassword} className="space-y-4">
                <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
                {[['Current Password', 'current'], ['New Password', 'newPw'], ['Confirm New Password', 'confirm']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                    <input type="password" className="cyber-input" value={pwForm[key]}
                      onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} required />
                  </div>
                ))}
                <button type="submit" disabled={saving} className="cyber-btn cyber-btn-primary text-xs">
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}

            {tab === 'themes' && (
              <div>
                <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>Choose Theme</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(themes).map(([key, t]) => (
                    <button key={key} onClick={() => changeTheme(key)}
                      className="p-4 rounded-xl transition-all text-left"
                      style={{
                        border: `2px solid ${theme === key ? 'var(--neon-blue)' : 'var(--border-color)'}`,
                        background: theme === key ? 'rgba(0,212,255,0.1)' : 'var(--bg-secondary)',
                        transform: theme === key ? 'scale(1.02)' : 'scale(1)',
                      }}>
                      <div className="text-2xl mb-2">{t.icon}</div>
                      <div className="font-display font-bold text-sm" style={{ color: theme === key ? 'var(--neon-blue)' : 'var(--text-primary)' }}>
                        {t.name}
                      </div>
                      {theme === key && <div className="text-xs mt-1" style={{ color: 'var(--neon-blue)' }}>✓ Active</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'danger' && (
              <div>
                <h2 className="font-display font-bold text-xl mb-4 text-red-400">⚠️ Danger Zone</h2>
                <div className="p-4 rounded-lg" style={{ border: '1px solid rgba(255,0,0,0.3)', background: 'rgba(255,0,0,0.05)' }}>
                  <h3 className="font-semibold text-red-400 mb-2">Delete Account</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    This will permanently delete your account, all projects, and earnings. This cannot be undone.
                  </p>
                  {deleteStep === 0 ? (
                    <button onClick={requestDeleteOtp} className="cyber-btn border-red-500 text-red-400 text-xs hover:bg-red-900">
                      Send Verification Code
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-red-400">Enter the 6-digit code sent to your email:</p>
                      <input type="text" maxLength={6} className="cyber-input" placeholder="000000"
                        value={deleteOtp} onChange={e => setDeleteOtp(e.target.value.replace(/\D/g, ''))} />
                      <button onClick={confirmDelete} className="cyber-btn border-red-500 text-red-400 text-xs hover:bg-red-900">
                        Permanently Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
