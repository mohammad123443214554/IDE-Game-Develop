// =============================================
// FILE 20: pages/games/[id].js
// FOLDER: pages/games/
// PURPOSE: Single game detail + play page
// URL: http://localhost:3000/games/abc123
// =============================================

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';
import AdBanner from '../../components/ui/AdBanner';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function GameDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`${API}/api/games/${id}`)
        .then(res => {
          setGame(res.data.game);
          setLikes(res.data.game.likes || 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handlePlay = async () => {
    setPlaying(true);
    try {
      await axios.post(`${API}/api/games/${id}/play`);
    } catch {}
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`${API}/api/games/${id}/like`);
      setLikes(res.data.likes);
      setLiked(!liked);
    } catch {}
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display animate-pulse neon-text text-xl">Loading Game...</p>
      </div>
    </Layout>
  );

  if (!game) return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-6xl mb-4">🎮</p>
        <h2 className="font-display font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Game Not Found</h2>
        <Link href="/games" className="cyber-btn text-sm">← Back to Games</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Top Ad */}
        <AdBanner slot="game-detail-top" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Game Canvas or Thumbnail */}
          <div className="lg:col-span-2">
            {playing ? (
              <GameCanvas game={game} />
            ) : (
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ aspectRatio: '16/10', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              >
                {game.thumbnail ? (
                  <img src={game.thumbnail} alt={game.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">🎮</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <button
                    onClick={handlePlay}
                    className="cyber-btn cyber-btn-primary text-xl px-16 py-5"
                    style={{ fontSize: '18px' }}
                  >
                    ▶ PLAY NOW
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Game Info */}
          <div className="glass-card p-6 h-fit" style={{ border: '1px solid var(--border-color)' }}>
            <h1 className="font-display font-black text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>
              {game.title}
            </h1>

            <Link
              href={`/profile/${game.creator?.username}`}
              className="flex items-center gap-2 mb-4 hover:text-[var(--neon-blue)] transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'var(--neon-blue)', color: '#000' }}
              >
                {game.creator?.username?.charAt(0).toUpperCase()}
              </div>
              @{game.creator?.username}
            </Link>

            {game.description && (
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {game.description}
              </p>
            )}

            {/* Stats */}
            <div className="space-y-2 text-sm mb-5" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>👁 Total Plays</span>
                <strong style={{ color: 'var(--text-primary)' }}>{(game.plays || 0).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>🏷 Genre</span>
                <strong style={{ color: 'var(--text-primary)' }}>{game.genre || 'Game'}</strong>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>📅 Published</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {new Date(game.createdAt).toLocaleDateString()}
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handlePlay} className="cyber-btn cyber-btn-primary flex-1 text-sm py-2">
                ▶ Play
              </button>
              <button
                onClick={handleLike}
                className="cyber-btn text-sm px-4 py-2"
                style={{
                  color: liked ? '#ff0080' : 'var(--neon-blue)',
                  borderColor: liked ? '#ff0080' : 'var(--neon-blue)',
                }}
              >
                {liked ? '♥' : '♡'} {likes}
              </button>
            </div>

            {/* Controls hint */}
            {playing && (
              <div
                className="mt-4 p-3 rounded text-xs"
                style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid var(--border-color)' }}
              >
                <p style={{ color: 'var(--text-secondary)' }}>
                  🎮 <strong>Arrow Keys / WASD</strong> — Move<br />
                  🚀 <strong>Space</strong> — Jump / Shoot<br />
                  Click the game first to focus it!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Ad */}
        <AdBanner slot="game-detail-bottom" className="mt-10" />

      </div>
    </Layout>
  );
}

// ─────────────────────────────────────────────
// GameCanvas Component - runs the actual game
// ─────────────────────────────────────────────
function GameCanvas({ game }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ running: true, keys: {}, objects: [], score: 0 });
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    // Clone game objects with physics properties
    state.objects = (game.objects || []).map(o => ({
      ...o,
      velX: 0,
      velY: 0,
      onGround: false,
    }));

    const events = game.events || [];

    const keyDown = e => { state.keys[e.code] = true; };
    const keyUp = e => { state.keys[e.code] = false; };
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    const loop = () => {
      if (!state.running) return;

      // Clear canvas
      ctx.clearRect(0, 0, 800, 500);
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, 800, 500);

      // Draw grid
      ctx.strokeStyle = 'rgba(0,212,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += 32) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 500); ctx.stroke();
      }
      for (let y = 0; y < 500; y += 32) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke();
      }

      // Process events
      events.forEach(ev => {
        const target = state.objects.find(o => o.id === ev.targetId);
        if (!target) return;
        const left = state.keys['ArrowLeft'] || state.keys['KeyA'];
        const right = state.keys['ArrowRight'] || state.keys['KeyD'];
        const jump = state.keys['Space'] || state.keys['ArrowUp'] || state.keys['KeyW'];

        if (ev.trigger === 'key_left' && left) target.velX = -(target.speed || 3);
        if (ev.trigger === 'key_right' && right) target.velX = (target.speed || 3);
        if (ev.trigger === 'key_space' && jump) {
          if (ev.action === 'jump' && target.onGround) {
            target.velY = -12;
            target.onGround = false;
          }
          if (ev.action === 'shoot') {
            state.objects.push({
              id: 'bullet_' + Date.now(),
              x: target.x + target.w / 2 - 4,
              y: target.y - 12,
              w: 8, h: 16,
              color: '#ffdd00',
              velX: 0, velY: -10,
              gravity: 0, speed: 0, onGround: false,
            });
          }
        }
      });

      // Physics update and draw
      state.objects = state.objects.filter(o => o.y < 600 && o.y > -300);
      state.objects.forEach(obj => {
        // Apply gravity
        if (obj.gravity) obj.velY += obj.gravity;

        // Move
        obj.x += obj.velX || 0;
        obj.y += obj.velY || 0;

        // Friction
        obj.velX = (obj.velX || 0) * 0.82;

        // Collision with platforms
        if (obj.gravity) {
          state.objects.forEach(platform => {
            if (platform.id !== obj.id && !platform.gravity && (platform.w || 0) > 50) {
              const overlapX = obj.x < platform.x + platform.w && obj.x + obj.w > platform.x;
              const falling = obj.velY >= 0;
              const wasAbove = obj.y + obj.h >= platform.y && obj.y + obj.h <= platform.y + platform.h + 8;
              if (overlapX && falling && wasAbove) {
                obj.y = platform.y - obj.h;
                obj.velY = 0;
                obj.onGround = true;
              }
            }
          });
          // Floor & wall bounds
          if (obj.y + obj.h >= 500) { obj.y = 500 - obj.h; obj.velY = 0; obj.onGround = true; }
          if (obj.x < 0) obj.x = 0;
          if (obj.x + obj.w > 800) obj.x = 800 - obj.w;
        }

        // Draw object
        if (obj.image) {
          const img = new Image();
          img.src = obj.image;
          ctx.drawImage(img, obj.x, obj.y, obj.w, obj.h);
        } else {
          ctx.globalAlpha = obj.opacity !== undefined ? obj.opacity : 1;
          ctx.fillStyle = obj.color || '#00d4ff';
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
          ctx.globalAlpha = 1;
        }
      });

      // HUD
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 14px Orbitron, monospace';
      ctx.fillText(`Score: ${state.score}`, 12, 26);
      ctx.fillStyle = 'rgba(0,212,255,0.35)';
      ctx.font = '11px Orbitron, monospace';
      ctx.fillText('Arrow Keys / WASD  |  Space = Jump / Shoot', 12, 490);

      frameRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      state.running = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={500}
      tabIndex={0}
      className="w-full rounded-xl outline-none block"
      style={{
        border: '2px solid var(--neon-blue)',
        boxShadow: '0 0 30px rgba(0,212,255,0.25)',
        cursor: 'default',
      }}
      onClick={e => e.currentTarget.focus()}
    />
  );
}
