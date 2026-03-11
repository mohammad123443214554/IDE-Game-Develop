import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <h1 className="font-display font-black text-5xl mb-4" style={{ color: 'var(--text-primary)' }}>
              About <span className="neon-text">IDE Game Develop</span>
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>The future of no-code game development</p>
          </div>

          <div className="glass-card p-8 mb-6">
            <h2 className="font-display font-bold text-2xl mb-4" style={{ color: 'var(--neon-blue)' }}>What is IDE Game Develop?</h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              IDE Game Develop is a professional no-code game creation platform that allows anyone — regardless of programming experience — to create, publish, and monetize browser-based games. Our visual scripting system, intuitive canvas editor, and event-driven game engine put the power of game development in the hands of everyone.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Whether you're a student, artist, entrepreneur, or just someone with a creative vision, IDE Game Develop gives you all the tools you need to bring your game ideas to life without writing a single line of code.
            </p>
          </div>

          <div className="glass-card p-8 mb-6">
            <h2 className="font-display font-bold text-2xl mb-4" style={{ color: 'var(--neon-blue)' }}>How Does Earning Work?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                { icon: '🎮', step: '1. Create', desc: 'Build your game using our Lab editor' },
                { icon: '📤', step: '2. Publish', desc: 'Share your game to the platform' },
                { icon: '💵', step: '3. Earn', desc: 'Get paid when people play your game' },
              ].map(item => (
                <div key={item.step} className="text-center p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-display font-bold" style={{ color: 'var(--neon-blue)' }}>{item.step}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>
              ))}
            </div>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <li>• <strong style={{ color: 'var(--text-primary)' }}>200 plays = $1</strong> credited to your balance</li>
              <li>• Minimum withdrawal amount: $5</li>
              <li>• Maximum per request: $10</li>
              <li>• Withdrawal methods: PayPal, UPI, Bank Transfer</li>
              <li>• Admin reviews withdrawals within 24 hours</li>
            </ul>
          </div>

          <div className="glass-card p-8 mb-6">
            <h2 className="font-display font-bold text-2xl mb-4" style={{ color: 'var(--neon-blue)' }}>Platform Info</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ['Created by', 'Mohammad Khan'],
                ['Year', '2026'],
                ['Version', '1.0'],
                ['Platform', 'Web Browser'],
                ['Engine', 'HTML5 Canvas'],
                ['License', 'Commercial'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{k}</div>
                  <div className="font-semibold" style={{ color: 'var(--neon-blue)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/signup" className="cyber-btn cyber-btn-primary text-sm px-8 py-3">
              🚀 Start Creating Today
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
