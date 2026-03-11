import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function GameCard({ game, index = 0 }) {
  const [likes, setLikes] = useState(game.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/games/${game._id}/like`);
      setLikes(res.data.likes);
      setLiked(!liked);
    } catch {}
  };

  const isNew = new Date() - new Date(game.createdAt) < 10 * 24 * 60 * 60 * 1000;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link href={`/games/${game._id}`}>
        <div className="glass-card overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
          style={{ border: '1px solid var(--border-color)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-blue)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
          {/* Thumbnail */}
          <div className="relative h-40 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            {game.thumbnail ? (
              <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-5xl">🎮</div>
              </div>
            )}
            {isNew && (
              <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded font-display font-bold"
                style={{ background: 'var(--neon-green)', color: '#000' }}>NEW</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.6)' }}>
              <span className="cyber-btn cyber-btn-primary text-xs">▶ PLAY</span>
            </div>
          </div>
          {/* Info */}
          <div className="p-3">
            <h3 className="font-display font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{game.title}</h3>
            <Link href={`/profile/${game.creator?.username}`} onClick={e => e.stopPropagation()}
              className="text-xs hover:text-[var(--neon-blue)] transition-colors block"
              style={{ color: 'var(--text-secondary)' }}>
              @{game.creator?.username || 'unknown'}
            </Link>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>👁 {(game.plays || 0).toLocaleString()}</span>
              <button onClick={handleLike} className="flex items-center gap-1 text-xs transition-colors px-2 py-1 rounded"
                style={{ color: liked ? '#ff0080' : 'var(--text-secondary)', background: liked ? 'rgba(255,0,128,0.1)' : 'transparent' }}>
                {liked ? '♥' : '♡'} {likes}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
