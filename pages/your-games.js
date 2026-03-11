import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function YourGames() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/your-games');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/api/projects/folders`)
        .then(res => setFolders(res.data.folders || []))
        .catch(() => {});
    }
  }, [user]);

  const loadProjects = async (folderId) => {
    setActiveFolder(folderId);
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${API}/api/projects?folder=${folderId}`);
      setProjects(res.data.projects || []);
    } catch {} finally { setLoadingProjects(false); }
  };

  const deleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API}/api/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading || !user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-black text-3xl" style={{ color: 'var(--text-primary)' }}>
            📁 <span className="neon-text">Your Games</span>
          </h1>
          <Link href="/lab" className="cyber-btn cyber-btn-primary text-xs">+ New Game</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Folders */}
          <div className="glass-card p-4">
            <h3 className="font-display font-bold text-sm mb-3" style={{ color: 'var(--neon-blue)' }}>PROJECT FOLDERS</h3>
            {folders.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No folders yet.<br />Open Lab to create one.</p>
            ) : (
              <div className="space-y-2">
                {folders.map(f => (
                  <button key={f._id} onClick={() => loadProjects(f._id)}
                    className="w-full text-left p-3 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: activeFolder === f._id ? 'rgba(0,212,255,0.15)' : 'transparent',
                      border: `1px solid ${activeFolder === f._id ? 'var(--neon-blue)' : 'var(--border-color)'}`,
                      color: activeFolder === f._id ? 'var(--neon-blue)' : 'var(--text-secondary)',
                    }}>
                    📁 {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="md:col-span-3">
            {activeFolder ? (
              loadingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)}
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projects.map((p, i) => (
                    <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="glass-card p-4 group"
                      style={{ border: '1px solid var(--border-color)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-blue)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎮</span>
                        <h3 className="font-display font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</h3>
                      </div>
                      <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                        <p>{p.objects?.length || 0} objects · {p.events?.length || 0} events</p>
                        <p>{new Date(p.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/lab?project=${p._id}`} className="cyber-btn text-xs flex-1 text-center py-1">✏️ Edit</Link>
                        <button onClick={() => deleteProject(p._id)} className="cyber-btn text-xs px-2 py-1 border-red-500 text-red-400">🗑</button>
                      </div>
                      {p.published && (
                        <span className="mt-2 block text-xs text-center py-0.5 rounded"
                          style={{ background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.3)' }}>
                          ✓ Published
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-3xl mb-2">📦</p>
                  <p style={{ color: 'var(--text-secondary)' }}>No projects in this folder</p>
                  <Link href="/lab" className="cyber-btn cyber-btn-primary text-xs mt-4 inline-block">Create Game</Link>
                </div>
              )
            ) : (
              <div className="text-center py-16">
                <p className="text-3xl mb-2">👈</p>
                <p style={{ color: 'var(--text-secondary)' }}>Select a folder to view projects</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
