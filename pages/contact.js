import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/api/contact`, form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch { toast.error('Failed to send message. Try again.'); } finally { setSending(false); }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display font-black text-4xl mb-2" style={{ color: 'var(--text-primary)' }}>
            📬 <span className="neon-text">Contact Us</span>
          </h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>We'd love to hear from you.</p>
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <input type="text" className="cyber-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <input type="email" className="cyber-input" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Subject</label>
                <input type="text" className="cyber-input" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Message</label>
                <textarea className="cyber-input" rows={6} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button type="submit" disabled={sending} className="cyber-btn cyber-btn-primary w-full text-sm py-3">
                {sending ? 'Sending...' : '📤 Send Message'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
