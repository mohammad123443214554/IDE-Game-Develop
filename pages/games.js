// =============================================
// FILE 19: pages/games.js
// FOLDER: pages/
// PURPOSE: The games BROWSE page that users see
// URL: http://localhost:3000/games
// =============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import GameCard from '../components/ui/GameCard';
import AdBanner from '../components/ui/AdBanner';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const GENRES = ['All', 'Platformer', 'Shooter', 'Runner', 'Puzzle', 'Racing', 'Other'];

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [profileSearch, setProfileSearch] = useState('');

  useEffect(() => {
    fetchGames();
  }, [search, genre, sort, page]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, sort, page, limit: 12 });
      if (genre !== 'All') params.append('genre', genre);
      const res = await axios.get(`${API}/api/games?${params}`);
      setGames(res.data.games || []);
      setTotal(res.data.total || 0);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const goToProfile = () => {
    if (profileSearch.trim()) window.location.href = `/profile/${profileSearch.trim()}`;
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display font-black text-5xl mb-2" style={{ color: 'var(--text-primary)' }}>
            🎮 <span className="neon-text">Games</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Discover games made by our community</p>
        </motion.div>

        {/* Top Ad */}
        <AdBanner slot="games-top" className="mb-8" />

        {/* Search Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            className="cyber-input flex-1"
            placeholder="🔍 Search games..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              className="cyber-input flex-1"
              placeholder="👤 Search creator profile..."
              value={profileSearch}
              onChange={e => setProfileSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && goToProfile()}
            />
            <button onClick={goToProfile} className="cyber-btn text-xs px-4">Go</button>
          </div>
          <select
            className="cyber-input"
            value={sort}
            onChange={e => { setSort(e.target.value); setPage(1); }}
            style={{ minWidth: '150px' }}
          >
            <option value="newest">🕐 Newest First</option>
            <option value="popular">🔥 Most Played</option>
          </select>
        </div>

        {/* Genre Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRES.map(g => (
            <button
              key={g}
              onClick={() => { setGenre(g); setPage(1); }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: genre === g ? 'var(--neon-blue)' : 'transparent',
                color: genre === g ? '#000' : 'var(--text-secondary)',
                border: `1px solid ${genre === g ? 'var(--neon-blue)' : 'var(--border-color)'}`,
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Found <strong style={{ color: 'var(--neon-blue)' }}>{total}</strong> games
            {search && ` matching "${search}"`}
          </p>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse" style={{ height: '180px' }} />
            ))}
          </div>
        ) : games.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {games.map((game, i) => (
                <GameCard key={game._id} game={game} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="cyber-btn text-xs px-4 disabled:opacity-30">← Prev</button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className="w-9 h-9 rounded font-display text-sm"
                    style={{
                      background: page === i + 1 ? 'var(--neon-blue)' : 'transparent',
                      color: page === i + 1 ? '#000' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >{i + 1}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="cyber-btn text-xs px-4 disabled:opacity-30">Next →</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🎮</p>
            <h3 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>No Games Found</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              {search ? `No results for "${search}"` : 'No games yet. Be the first to create one!'}
            </p>
            <a href="/lab" className="cyber-btn cyber-btn-primary text-sm px-8 py-3">🚀 Create a Game</a>
          </div>
        )}

        {/* Bottom Ad */}
        <AdBanner slot="games-bottom" className="mt-12" />
      </div>
    </Layout>
  );
}
