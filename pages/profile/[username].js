import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import GameCard from '../../components/ui/GameCard';
import { useRouter } from 'next/router';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function UserProfile() {
  const router = useRouter();
  const { username } = router.query;
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      Promise.all([
        axios.get(`${API}/api/user/profile/${username}`),
        axios.get(`${API}/api/games?creator=${username}`),
      ]).then(([profileRes, gamesRes]) => {
        setProfile(profileRes.data.user);
        setGames(gamesRes.data.games || []);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [username]);

  if (loading) return (
    <Layout><div className="min-h-screen flex items-center justify-center">
      <p className="font-display animate-pulse neon-text">Loading...</p>
    </div></Layout>
  );

  if (!profile) return (
    <Layout><div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <p className="text-4xl mb-3">👤</p>
      <p className="font-display text-xl" style={{ color: 'var(--text-primary)' }}>User not found</p>
    </div></Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="glass-card p-8 mb-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center font-display font-black text-3xl flex-shrink-0"
              style={{ background: 'var(--neon-blue)', color: '#000' }}>
              {profile.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text-primary)' }}>
                {profile.fullName || profile.username}
              </h1>
              <p className="font-display" style={{ color: 'var(--neon-blue)' }}>@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                ['Games', games.length],
                ['Total Plays', games.reduce((a, g) => a + (g.plays || 0), 0).toLocaleString()],
                ['Joined', new Date(profile.createdAt).getFullYear()],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="font-display font-black text-xl" style={{ color: 'var(--neon-blue)' }}>{value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Games */}
          <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
            🎮 Games by @{profile.username}
          </h2>
          {games.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {games.map((game, i) => <GameCard key={game._id} game={game} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🎮</p>
              <p style={{ color: 'var(--text-secondary)' }}>No published games yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
