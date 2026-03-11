import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup, verifyOTP } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: form, 2: otp
  const [loading, setLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!/^[a-z0-9_.]{3,20}$/.test(form.username)) errs.username = 'Username: 3-20 chars, letters/numbers/. _ only';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email address';
    if (form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (!/[0-9]/.test(form.password)) errs.password = 'Must contain at least one number';
    if (!/[A-Z]/.test(form.password)) errs.password = 'Must contain at least one uppercase letter';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form);
      setOtpEmail(form.email);
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed';
      if (msg.includes('username')) setErrors({ username: 'Username is not available.' });
      else if (msg.includes('email')) setErrors({ email: 'Email already registered.' });
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      await verifyOTP(otpEmail, otp, 'signup');
      toast.success('Account created!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input type={type} className="cyber-input" placeholder={placeholder}
        value={form[name]} onChange={e => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); }} />
      {errors[name] && <p className="text-red-400 text-xs mt-1">⚠ {errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 canvas-grid opacity-20" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="glass-card p-8" style={{ border: '1px solid var(--border-color)' }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center font-display font-black text-xl"
              style={{ background: 'var(--neon-blue)', color: '#000' }}>IG</div>
            <h1 className="font-display font-black text-2xl" style={{ color: 'var(--text-primary)' }}>
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {step === 1 ? 'Join IDE Game Develop for free' : `Enter the 6-digit code sent to ${otpEmail}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field name="fullName" label="Full Name" placeholder="Mohammad Khan" />
              <Field name="username" label="Username" placeholder="mohammadkhan" />
              <Field name="email" label="Email Address" type="email" placeholder="you@example.com" />
              <Field name="password" label="Password" type="password" placeholder="••••••••" />
              <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {[
                  [/[A-Z]/.test(form.password), '1 uppercase letter'],
                  [/[0-9]/.test(form.password), '1 number'],
                  [form.password.length >= 8, 'Minimum 8 characters'],
                ].map(([valid, label]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ color: valid ? 'var(--neon-green)' : '#666' }}>{valid ? '✓' : '○'}</span>
                    <span style={{ color: valid ? 'var(--neon-green)' : 'var(--text-secondary)' }}>{label}</span>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={loading} className="cyber-btn cyber-btn-primary w-full text-sm py-3">
                {loading ? 'Creating Account...' : 'Create Account →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                  Enter 6-Digit OTP
                </label>
                <input type="text" maxLength={6} className="cyber-input text-center text-2xl font-display tracking-widest"
                  placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
              </div>
              <button type="submit" disabled={loading} className="cyber-btn cyber-btn-primary w-full text-sm py-3">
                {loading ? 'Verifying...' : '✓ Verify & Create Account'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                ← Back to signup
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--neon-blue)' }} className="font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
