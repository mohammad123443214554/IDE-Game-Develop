import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import GameCard from '../components/ui/GameCard';
import AdBanner from '../components/ui/AdBanner';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const features = [
  { icon: '🎮', title: 'No-Code Game Engine', desc: 'Build games visually with drag & drop. No programming required.' },
  { icon: '💰', title: 'Earn Real Money', desc: '200 plays = $1. Withdraw via PayPal, UPI or Bank Transfer.' },
  { icon: '🚀', title: 'One-Click Publish', desc: 'Publish your game to the world instantly with one click.' },
  { icon: '🎨', title: 'Rich Asset Library', desc: 'Upload sprites, backgrounds, characters and sounds.' },
  { icon: '⚡', title: 'Visual Scripting', desc: 'Add behaviors with IF/THEN event blocks. No code needed.' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Track plays, earnings, and growth in real time.' },
];

const stats = [
  { value: '10K+', label: 'Games Created' },
  { value: '500K+', label: 'Total Plays' },
  { value: '$25K+', label: 'Paid to Creators' },
  { value: '8K+', label: 'Active Creators' },
];

export default function Home() {
  const [featuredGames, setFeaturedGames] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/games?limit=6&sort=newest`)
      .then(res => setFeaturedGames(res.data.games || []))
      .catch(() => setFeaturedGames([]));
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 canvas-grid opacity-30" />
        <div className="absolute inset-0" style={{ background: 'var(--bg-hero-gradient)', backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.12) 0%, transparent 70%)' }} />
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full animate-float"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: 'var(--neon-blue)',
              opacity: Math.random() * 0.5 + 0.1,
              animationDelay: Math.random() * 3 + 's',
              animationDuration: (Math.random() * 2 + 2) + 's',
            }} />
        ))}

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--neon-blue)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse-fast" style={{ background: 'var(--neon-blue)' }} />
              🚀 Version 1.0 — Build, Publish, Earn
            </div>

            <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
              <span style={{ color: 'var(--text-primary)' }}>Create Games</span>
              <br />
              <span className="neon-text">Without Code</span>
            </h1>

            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 font-body" style={{ color: 'var(--text-secondary)' }}>
              The professional no-code game development platform. Build, publish and monetize your games. 
              <strong style={{ color: 'var(--neon-blue)' }}> 200 plays = $1 earned.</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="cyber-btn cyber-btn-primary text-sm px-8 py-3">
                🎮 Start Creating Free
              </Link>
              <Link href="/games" className="cyber-btn text-sm px-8 py-3">
                🔥 Explore Games
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 flex items-start justify-center pt-2"
            style={{ borderColor: 'rgba(0,212,255,0.4)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--neon-blue)' }} />
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <AdBanner slot="homepage-top" />
      </div>

      {/* Stats */}
      <section className="py-16 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="text-center p-6 glass-card">
              <div className="font-display font-black text-3xl md:text-4xl mb-1" style={{ color: 'var(--neon-blue)' }}>{stat.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-black text-4xl md:text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
              Everything You Need to <span className="neon-text">Succeed</span>
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>Professional tools, zero coding required</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="glass-card p-6 group hover:scale-105 transition-transform duration-300"
                style={{ border: '1px solid var(--border-color)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-blue)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-20 px-6" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display font-black text-3xl" style={{ color: 'var(--text-primary)' }}>
              🔥 Featured <span className="neon-text">Games</span>
            </h2>
            <Link href="/games" className="cyber-btn text-xs">View All →</Link>
          </div>
          {featuredGames.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredGames.map((game, i) => <GameCard key={game._id} game={game} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎮</p>
              <p style={{ color: 'var(--text-secondary)' }}>No games yet. Be the first to create one!</p>
              <Link href="/lab" className="cyber-btn cyber-btn-primary text-xs mt-4 inline-block">Create Game</Link>
            </div>
          )}
        </div>
      </section>

      {/* Earn CTA */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="font-display font-black text-4xl md:text-5xl mb-6" style={{ color: 'var(--text-primary)' }}>
            Turn Your Creativity Into <span className="neon-text">Cash</span>
          </h2>
          <p className="text-xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            Every 200 plays earns you $1. Withdraw via PayPal, UPI, or Bank Transfer.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            {[['🎮', 'Create', 'Build your game in Lab'], ['📤', 'Publish', 'Share with the world'], ['💵', 'Earn', '200 plays = $1']].map(([icon, step, desc]) => (
              <div key={step} className="glass-card p-4">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-display font-bold text-sm" style={{ color: 'var(--neon-blue)' }}>{step}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{desc}</div>
              </div>
            ))}
          </div>
          <Link href="/signup" className="cyber-btn cyber-btn-primary text-sm px-10 py-3">
            Start Earning Today →
          </Link>
        </div>
      </section>

      {/* Bottom Ad */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <AdBanner slot="homepage-bottom" />
      </div>
    </Layout>
  );
}
