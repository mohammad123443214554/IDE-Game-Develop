import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TEMPLATES = {
  empty: { name: 'Empty Project', icon: '⬜', objects: [], events: [] },
  platformer: {
    name: 'Platformer', icon: '🦊',
    objects: [
      { id: 'player', name: 'Player', x: 100, y: 300, w: 40, h: 40, color: '#00d4ff', type: 'sprite', speed: 5, gravity: 0.5 },
      { id: 'ground', name: 'Ground', x: 0, y: 400, w: 800, h: 40, color: '#4a7c59', type: 'platform', speed: 0, gravity: 0 },
    ],
    events: [
      { id: 'e1', trigger: 'key_left', condition: '', action: 'move_left', targetId: 'player' },
      { id: 'e2', trigger: 'key_right', condition: '', action: 'move_right', targetId: 'player' },
      { id: 'e3', trigger: 'key_space', condition: '', action: 'jump', targetId: 'player' },
    ]
  },
  shooter: {
    name: 'Shooter', icon: '🚀',
    objects: [
      { id: 'ship', name: 'Ship', x: 380, y: 350, w: 40, h: 50, color: '#00ff88', type: 'sprite', speed: 6, gravity: 0 },
    ],
    events: [
      { id: 'e1', trigger: 'key_left', condition: '', action: 'move_left', targetId: 'ship' },
      { id: 'e2', trigger: 'key_right', condition: '', action: 'move_right', targetId: 'ship' },
      { id: 'e3', trigger: 'key_space', condition: '', action: 'shoot', targetId: 'ship' },
    ]
  },
  runner: {
    name: 'Endless Runner', icon: '🏃',
    objects: [
      { id: 'runner', name: 'Runner', x: 80, y: 300, w: 35, h: 45, color: '#ff8800', type: 'sprite', speed: 3, gravity: 0.4 },
      { id: 'floor', name: 'Floor', x: 0, y: 380, w: 800, h: 30, color: '#555', type: 'platform', speed: 0, gravity: 0 },
    ],
    events: [
      { id: 'e1', trigger: 'key_space', condition: '', action: 'jump', targetId: 'runner' },
    ]
  },
};

const TRIGGERS = ['key_left', 'key_right', 'key_up', 'key_down', 'key_space', 'collision', 'timer', 'score_reaches', 'game_start'];
const ACTIONS = ['move_left', 'move_right', 'jump', 'shoot', 'destroy', 'show_message', 'win', 'lose', 'spawn_object'];

export default function Lab() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Folder/Project state
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [projectName, setProjectName] = useState('My Game');
  const [showTemplates, setShowTemplates] = useState(false);

  // Editor state
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState([]);
  const [activePanel, setActivePanel] = useState('objects');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPreview, setShowPreview] = useState(false);
  const [publishModal, setPublishModal] = useState(false);
  const [publishData, setPublishData] = useState({ title: '', description: '', genre: 'Other' });
  const [saving, setSaving] = useState(false);
  const [projectId, setProjectId] = useState(null);

  const canvasRef = useRef(null);
  const dragRef = useRef({ isDragging: false, objId: null, startX: 0, startY: 0, objStartX: 0, objStartY: 0 });

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/lab');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/api/projects/folders`)
        .then(res => {
          const f = res.data.folders || [];
          setFolders(f);
          if (f.length === 0) setShowFolderModal(true);
          else if (router.query.project) loadProject(router.query.project);
        })
        .catch(() => setShowFolderModal(true));
    }
  }, [user]);

  const loadProject = async (id) => {
    try {
      const res = await axios.get(`${API}/api/projects/${id}`);
      const proj = res.data.project;
      setObjects(proj.objects || []);
      setEvents(proj.events || []);
      setProjectName(proj.name);
      setProjectId(id);
      setActiveFolder(proj.folderId);
    } catch {}
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await axios.post(`${API}/api/projects/folders`, { name: newFolderName });
      const f = res.data.folder;
      setFolders([...folders, f]);
      setActiveFolder(f._id);
      setShowFolderModal(false);
      setNewFolderName('');
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  const loadTemplate = (key) => {
    const tmpl = TEMPLATES[key];
    pushHistory();
    setObjects(tmpl.objects.map(o => ({ ...o, id: o.id + '_' + Date.now() })));
    setEvents(tmpl.events);
    setProjectName(tmpl.name);
    setShowTemplates(false);
  };

  const pushHistory = () => {
    const snapshot = { objects: JSON.parse(JSON.stringify(objects)), events: JSON.parse(JSON.stringify(events)) };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const snap = history[historyIndex - 1];
      setObjects(snap.objects);
      setEvents(snap.events);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const snap = history[historyIndex + 1];
      setObjects(snap.objects);
      setEvents(snap.events);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const addObject = () => {
    pushHistory();
    const obj = {
      id: 'obj_' + Date.now(),
      name: 'Object ' + (objects.length + 1),
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      w: 60, h: 60,
      color: `hsl(${Math.random() * 360},70%,60%)`,
      type: 'sprite',
      speed: 3,
      gravity: 0,
      opacity: 1,
      rotation: 0,
      image: null,
    };
    setObjects([...objects, obj]);
    setSelectedId(obj.id);
  };

  const updateObject = (id, props) => {
    setObjects(objects.map(o => o.id === id ? { ...o, ...props } : o));
  };

  const deleteObject = (id) => {
    pushHistory();
    setObjects(objects.filter(o => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const addEvent = () => {
    const ev = {
      id: 'ev_' + Date.now(),
      trigger: 'key_space',
      condition: '',
      action: 'jump',
      targetId: objects[0]?.id || '',
      value: '',
    };
    setEvents([...events, ev]);
  };

  const updateEvent = (id, props) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...props } : e));
  };

  const deleteEvent = (id) => setEvents(events.filter(e => e.id !== id));

  const saveProject = async () => {
    if (!activeFolder) return toast.error('Select a folder first');
    setSaving(true);
    try {
      const data = { name: projectName, folderId: activeFolder, objects, events };
      if (projectId) {
        await axios.put(`${API}/api/projects/${projectId}`, data);
      } else {
        const res = await axios.post(`${API}/api/projects`, data);
        setProjectId(res.data.project._id);
      }
      toast.success('Project saved!');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const publishGame = async (e) => {
    e.preventDefault();
    if (!projectId) { await saveProject(); }
    try {
      await axios.post(`${API}/api/games/publish`, { projectId, ...publishData });
      toast.success('Game published!');
      setPublishModal(false);
      router.push('/games');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Publish failed');
    }
  };

  // Canvas interactions
  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = [...objects].reverse().find(o =>
      mx >= o.x && mx <= o.x + o.w && my >= o.y && my <= o.y + o.h
    );
    if (hit) {
      setSelectedId(hit.id);
      dragRef.current = { isDragging: true, objId: hit.id, startX: mx, startY: my, objStartX: hit.x, objStartY: hit.y };
    } else {
      setSelectedId(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const dx = mx - dragRef.current.startX;
    const dy = my - dragRef.current.startY;
    updateObject(dragRef.current.objId, { x: dragRef.current.objStartX + dx, y: dragRef.current.objStartY + dy });
  };

  const handleCanvasMouseUp = () => {
    if (dragRef.current.isDragging) pushHistory();
    dragRef.current.isDragging = false;
  };

  const selected = objects.find(o => o.id === selectedId);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="font-display text-xl animate-pulse neon-text">Loading Lab<span className="loading-dots" /></div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Toaster position="top-right" />

      {/* TOP TOOLBAR */}
      <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', height: '48px' }}>
        <div className="flex items-center gap-2 mr-4">
          <div className="w-6 h-6 rounded flex items-center justify-center font-display font-black text-xs"
            style={{ background: 'var(--neon-blue)', color: '#000' }}>IG</div>
          <input value={projectName} onChange={e => setProjectName(e.target.value)}
            className="bg-transparent border-none outline-none font-display text-sm font-bold"
            style={{ color: 'var(--neon-blue)', minWidth: '120px' }} />
        </div>
        
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { label: '💾 Save', action: saveProject, disabled: saving },
            { label: '▶ Preview', action: () => setShowPreview(true) },
            { label: '🌐 Publish', action: () => setPublishModal(true) },
            { label: '↩ Undo', action: undo, disabled: historyIndex <= 0 },
            { label: '↪ Redo', action: redo, disabled: historyIndex >= history.length - 1 },
            { label: '+ Event', action: addEvent },
            { label: '📁 Templates', action: () => setShowTemplates(true) },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} disabled={btn.disabled}
              className="lab-toolbar-btn disabled:opacity-40">
              {btn.label}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <select className="cyber-input text-xs py-1 px-2" value={activeFolder || ''}
            onChange={e => setActiveFolder(e.target.value)}
            style={{ minWidth: '120px' }}>
            <option value="">Select Folder</option>
            {folders.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {/* MAIN EDITOR */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-52 flex-shrink-0 flex flex-col lab-panel overflow-y-auto" style={{ borderRight: '1px solid var(--border-color)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--border-color)' }}>
            {['objects', 'assets'].map(p => (
              <button key={p} onClick={() => setActivePanel(p)}
                className="flex-1 py-2 text-xs font-display font-bold transition-colors"
                style={{ color: activePanel === p ? 'var(--neon-blue)' : 'var(--text-secondary)', borderBottom: activePanel === p ? '2px solid var(--neon-blue)' : 'none' }}>
                {p === 'objects' ? '🧩 Objects' : '🖼 Assets'}
              </button>
            ))}
          </div>

          <div className="p-2 flex-1">
            {activePanel === 'objects' && (
              <>
                <button onClick={addObject} className="cyber-btn w-full text-xs py-2 mb-2">+ Add Object</button>
                <div className="space-y-1">
                  {objects.map(obj => (
                    <div key={obj.id} onClick={() => setSelectedId(obj.id)}
                      className="flex items-center gap-2 p-2 rounded cursor-pointer transition-all text-xs group"
                      style={{
                        background: selectedId === obj.id ? 'rgba(0,212,255,0.15)' : 'transparent',
                        border: selectedId === obj.id ? '1px solid rgba(0,212,255,0.4)' : '1px solid transparent',
                      }}>
                      <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: obj.color }} />
                      <span className="flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{obj.name}</span>
                      <button onClick={e => { e.stopPropagation(); deleteObject(obj.id); }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs">✕</button>
                    </div>
                  ))}
                  {objects.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>No objects yet.<br />Click + Add Object</p>
                  )}
                </div>
              </>
            )}
            {activePanel === 'assets' && (
              <div>
                <label className="cyber-btn w-full text-xs py-2 mb-2 block text-center cursor-pointer">
                  📤 Upload Asset
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const fd = new FormData();
                    fd.append('file', file);
                    try {
                      const res = await axios.post(`${API}/api/upload`, fd);
                      const url = res.data.url;
                      const obj = {
                        id: 'obj_' + Date.now(), name: file.name.split('.')[0],
                        x: 100, y: 100, w: 60, h: 60,
                        color: '#888', type: 'sprite', speed: 0, gravity: 0,
                        opacity: 1, rotation: 0, image: url,
                      };
                      setObjects([...objects, obj]);
                      toast.success('Asset uploaded!');
                    } catch { toast.error('Upload failed'); }
                  }} />
                </label>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Upload PNG/JPG sprites and backgrounds</p>
              </div>
            )}
          </div>
        </div>

        {/* CENTER CANVAS */}
        <div className="flex-1 flex items-center justify-center overflow-auto" style={{ background: '#05080f' }}>
          <div className="relative" style={{ width: '800px', height: '500px', flexShrink: 0 }}>
            <div ref={canvasRef} className="canvas-grid relative overflow-hidden cursor-crosshair"
              style={{ width: '800px', height: '500px', background: '#0a1020', border: '1px solid var(--border-color)' }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}>
              {objects.map(obj => (
                <div key={obj.id}
                  className="absolute"
                  style={{
                    left: obj.x + 'px', top: obj.y + 'px',
                    width: obj.w + 'px', height: obj.h + 'px',
                    background: obj.image ? 'transparent' : obj.color,
                    opacity: obj.opacity || 1,
                    transform: `rotate(${obj.rotation || 0}deg)`,
                    cursor: 'move',
                    border: selectedId === obj.id ? '2px solid var(--neon-blue)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: selectedId === obj.id ? '0 0 10px var(--neon-blue)' : 'none',
                    backgroundImage: obj.image ? `url(${obj.image})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: selectedId === obj.id ? 10 : 1,
                  }}>
                  {selectedId === obj.id && (
                    <>
                      {/* Resize handles */}
                      {[['se', 'bottom:0;right:0;cursor:se-resize']].map(([pos, style]) => (
                        <div key={pos} className="absolute w-3 h-3 rounded-sm"
                          style={{ [style.split(';')[0].split(':')[0]]: 0, [style.split(';')[1].split(':')[0]]: 0, background: 'var(--neon-blue)', cursor: 'se-resize' }}
                          onMouseDown={e => {
                            e.stopPropagation();
                            const startW = obj.w, startH = obj.h, startX = e.clientX, startY = e.clientY;
                            const onMove = (ev) => updateObject(obj.id, { w: Math.max(10, startW + ev.clientX - startX), h: Math.max(10, startH + ev.clientY - startY) });
                            const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); pushHistory(); };
                            document.addEventListener('mousemove', onMove);
                            document.addEventListener('mouseup', onUp);
                          }} />
                      ))}
                      <div className="absolute -top-5 left-0 text-xs whitespace-nowrap px-1 rounded font-display"
                        style={{ background: 'var(--neon-blue)', color: '#000', fontSize: '9px' }}>{obj.name}</div>
                    </>
                  )}
                </div>
              ))}
              {objects.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl mb-2">🎮</p>
                  <p className="font-display text-sm" style={{ color: 'var(--text-secondary)' }}>Add objects or load a template</p>
                </div>
              )}
            </div>
            {/* Canvas info bar */}
            <div className="flex items-center gap-4 px-3 py-1 text-xs" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <span>Canvas: 800×500</span>
              <span>Objects: {objects.length}</span>
              {selected && <span style={{ color: 'var(--neon-blue)' }}>Selected: {selected.name} ({Math.round(selected.x)},{Math.round(selected.y)})</span>}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - PROPERTIES */}
        <div className="w-56 flex-shrink-0 flex flex-col lab-panel overflow-y-auto" style={{ borderLeft: '1px solid var(--border-color)' }}>
          <div className="p-2 border-b text-xs font-display font-bold" style={{ borderColor: 'var(--border-color)', color: 'var(--neon-blue)' }}>
            ⚙ PROPERTIES
          </div>
          <div className="p-3 flex-1">
            {selected ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                  <input type="text" className="cyber-input text-xs py-1" value={selected.name}
                    onChange={e => updateObject(selected.id, { name: e.target.value })} />
                </div>
                {[
                  ['Position X', 'x', 'number'], ['Position Y', 'y', 'number'],
                  ['Width', 'w', 'number'], ['Height', 'h', 'number'],
                  ['Rotation', 'rotation', 'number'], ['Opacity', 'opacity', 'number'],
                  ['Speed', 'speed', 'number'], ['Gravity', 'gravity', 'number'],
                ].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                    <input type={type} step={key === 'opacity' ? '0.1' : '1'} min={key === 'opacity' ? 0 : undefined} max={key === 'opacity' ? 1 : undefined}
                      className="cyber-input text-xs py-1" value={selected[key] !== undefined ? Math.round(selected[key] * 100) / 100 : ''}
                      onChange={e => updateObject(selected.id, { [key]: parseFloat(e.target.value) || 0 })} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Color</label>
                  <input type="color" value={selected.color || '#00d4ff'}
                    onChange={e => updateObject(selected.id, { color: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer" style={{ background: 'transparent', border: '1px solid var(--border-color)' }} />
                </div>
                <button onClick={() => deleteObject(selected.id)} className="cyber-btn w-full text-xs py-1 border-red-500 text-red-400 hover:bg-red-900">
                  🗑 Delete Object
                </button>
              </div>
            ) : (
              <p className="text-xs text-center py-8" style={{ color: 'var(--text-secondary)' }}>Click an object on canvas to edit its properties</p>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL - EVENTS */}
      <div className="h-48 flex-shrink-0 flex flex-col lab-panel overflow-hidden" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <span className="font-display text-xs font-bold" style={{ color: 'var(--neon-blue)' }}>⚡ EVENT SYSTEM</span>
          <button onClick={addEvent} className="lab-toolbar-btn text-xs py-1">+ New Event</button>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['#', 'TRIGGER', 'CONDITION', 'ACTION', 'TARGET', 'VALUE', ''].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-display font-bold" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => (
                <tr key={ev.id} style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }}
                  className="hover:bg-[rgba(0,212,255,0.05)] transition-colors">
                  <td className="px-3 py-1.5 font-display" style={{ color: 'var(--text-secondary)' }}>{i + 1}</td>
                  <td className="px-3 py-1.5">
                    <select className="cyber-input text-xs py-0.5" value={ev.trigger}
                      onChange={e => updateEvent(ev.id, { trigger: e.target.value })}>
                      {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="text" placeholder="e.g. score > 10" className="cyber-input text-xs py-0.5"
                      value={ev.condition} onChange={e => updateEvent(ev.id, { condition: e.target.value })} />
                  </td>
                  <td className="px-3 py-1.5">
                    <select className="cyber-input text-xs py-0.5" value={ev.action}
                      onChange={e => updateEvent(ev.id, { action: e.target.value })}>
                      {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <select className="cyber-input text-xs py-0.5" value={ev.targetId}
                      onChange={e => updateEvent(ev.id, { targetId: e.target.value })}>
                      <option value="">-- Object --</option>
                      {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-1.5">
                    <input type="text" placeholder="value" className="cyber-input text-xs py-0.5" style={{ width: '70px' }}
                      value={ev.value || ''} onChange={e => updateEvent(ev.id, { value: e.target.value })} />
                  </td>
                  <td className="px-3 py-1.5">
                    <button onClick={() => deleteEvent(ev.id)} className="text-red-400 hover:text-red-300 px-1">✕</button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={7} className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>No events. Click + New Event to add game logic.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOLDER MODAL */}
      <AnimatePresence>
        {showFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 w-full max-w-md text-center"
              style={{ border: '1px solid var(--neon-blue)' }}>
              <div className="text-5xl mb-4">📁</div>
              <h2 className="font-display font-black text-2xl mb-2" style={{ color: 'var(--neon-blue)' }}>Create Project Folder</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Create a folder to organize your games before opening the Lab.
              </p>
              <input type="text" className="cyber-input mb-4" placeholder="My Games"
                value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createFolder()} />
              <button onClick={createFolder} className="cyber-btn cyber-btn-primary w-full text-sm py-3">
                📁 Create Folder & Open Lab
              </button>
              {folders.length > 0 && (
                <button onClick={() => setShowFolderModal(false)} className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Use existing folder →
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TEMPLATES MODAL */}
      <AnimatePresence>
        {showTemplates && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-lg"
              style={{ border: '1px solid var(--border-color)' }}>
              <h2 className="font-display font-black text-xl mb-4" style={{ color: 'var(--neon-blue)' }}>🎮 Choose Template</h2>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                  <button key={key} onClick={() => loadTemplate(key)}
                    className="p-4 rounded-lg text-left transition-all hover:scale-105"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--neon-blue)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                    <div className="text-3xl mb-2">{tmpl.icon}</div>
                    <div className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{tmpl.name}</div>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTemplates(false)} className="mt-4 text-sm w-full text-center" style={{ color: 'var(--text-secondary)' }}>
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold" style={{ color: 'var(--neon-blue)' }}>▶ GAME PREVIEW</span>
                <button onClick={() => setShowPreview(false)} className="text-red-400 font-bold ml-8">✕ Close</button>
              </div>
              <GamePreview objects={objects} events={events} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PUBLISH MODAL */}
      <AnimatePresence>
        {publishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-md"
              style={{ border: '1px solid var(--border-color)' }}>
              <h2 className="font-display font-black text-xl mb-4" style={{ color: 'var(--neon-blue)' }}>🌐 Publish Game</h2>
              <form onSubmit={publishGame} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Game Title</label>
                  <input type="text" className="cyber-input" placeholder="My Awesome Game" required
                    value={publishData.title} onChange={e => setPublishData({ ...publishData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea className="cyber-input" rows={3} placeholder="Tell players about your game..."
                    value={publishData.description} onChange={e => setPublishData({ ...publishData, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Genre</label>
                  <select className="cyber-input" value={publishData.genre} onChange={e => setPublishData({ ...publishData, genre: e.target.value })}>
                    {['Platformer', 'Shooter', 'Runner', 'Puzzle', 'Racing', 'Other'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="cyber-btn cyber-btn-primary flex-1 text-xs">🌐 Publish</button>
                  <button type="button" onClick={() => setPublishModal(false)} className="cyber-btn flex-1 text-xs">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Game Preview Component
function GamePreview({ objects: initialObjects, events }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    objects: initialObjects.map(o => ({ ...o, velX: 0, velY: 0, onGround: false })),
    keys: {},
    score: 0,
    running: true,
  });
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;
    state.objects = initialObjects.map(o => ({ ...o, velX: 0, velY: 0, onGround: false }));

    const handleKey = (e, down) => { state.keys[e.code] = down; };
    window.addEventListener('keydown', e => handleKey(e, true));
    window.addEventListener('keyup', e => handleKey(e, false));

    const loop = () => {
      if (!state.running) return;
      ctx.clearRect(0, 0, 800, 500);
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, 800, 500);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(0,212,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 800; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 500); ctx.stroke(); }
      for (let y = 0; y < 500; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(800, y); ctx.stroke(); }

      // Process events
      events.forEach(ev => {
        const target = state.objects.find(o => o.id === ev.targetId);
        if (!target) return;
        if (ev.trigger === 'key_left' && state.keys['ArrowLeft']) target.velX = -(target.speed || 3);
        if (ev.trigger === 'key_right' && state.keys['ArrowRight']) target.velX = (target.speed || 3);
        if (ev.trigger === 'key_left' && state.keys['KeyA']) target.velX = -(target.speed || 3);
        if (ev.trigger === 'key_right' && state.keys['KeyD']) target.velX = (target.speed || 3);
        if (ev.trigger === 'key_space' && (state.keys['Space'] || state.keys['ArrowUp'])) {
          if (ev.action === 'jump' && target.onGround) { target.velY = -12; target.onGround = false; }
          if (ev.action === 'shoot') {
            const bullet = { id: 'b_' + Date.now(), x: target.x + target.w/2 - 4, y: target.y - 10, w: 8, h: 16, color: '#ffdd00', velX: 0, velY: -8, gravity: 0, speed: 0, onGround: false };
            state.objects.push(bullet);
          }
        }
      });

      // Physics & draw
      state.objects = state.objects.filter(o => o.y < 600 && o.y > -200);
      state.objects.forEach(obj => {
        if (!obj.velX && !obj.velY && !obj.gravity) {}
        else {
          if (obj.gravity) obj.velY += obj.gravity;
          obj.x += obj.velX || 0;
          obj.y += obj.velY || 0;
          obj.velX *= 0.85;
          // Ground collision
          if (obj.gravity) {
            state.objects.forEach(ground => {
              if (ground.id !== obj.id && !ground.gravity && ground.w > 100) {
                if (obj.x < ground.x + ground.w && obj.x + obj.w > ground.x &&
                    obj.y + obj.h >= ground.y && obj.y + obj.h <= ground.y + ground.h + 5 && obj.velY >= 0) {
                  obj.y = ground.y - obj.h;
                  obj.velY = 0;
                  obj.onGround = true;
                }
              }
            });
            if (obj.y + obj.h >= 500) { obj.y = 500 - obj.h; obj.velY = 0; obj.onGround = true; }
            if (obj.x < 0) obj.x = 0;
            if (obj.x + obj.w > 800) obj.x = 800 - obj.w;
          }
        }

        // Draw
        if (obj.image) {
          const img = new Image(); img.src = obj.image;
          ctx.drawImage(img, obj.x, obj.y, obj.w, obj.h);
        } else {
          ctx.fillStyle = obj.color || '#00d4ff';
          ctx.globalAlpha = obj.opacity || 1;
          ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
          ctx.globalAlpha = 1;
        }
      });

      // Score display
      ctx.fillStyle = '#00d4ff';
      ctx.font = '14px Orbitron, monospace';
      ctx.fillText(`Score: ${state.score}`, 10, 24);
      ctx.fillStyle = 'rgba(0,212,255,0.4)';
      ctx.font = '11px Orbitron';
      ctx.fillText('Arrow Keys / WASD to move | Space to jump/shoot', 10, 490);

      frameRef.current = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      state.running = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('keydown', e => handleKey(e, true));
      window.removeEventListener('keyup', e => handleKey(e, false));
    };
  }, []);

  return (
    <canvas ref={canvasRef} width={800} height={500} className="block"
      style={{ border: '2px solid var(--neon-blue)', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }} />
  );
}
