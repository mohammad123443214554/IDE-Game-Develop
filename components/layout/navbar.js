import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/games', label: 'Games' },
  { href: '/lab', label: 'Lab' },
  { href: '/your-games', label: 'Your Games' },
  { href: '/profile', label: 'Profile' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[var(--bg-primary)]/95 backdrop-blur-lg shadow-lg shadow-[var(--neon-blue)]/10' : 'bg-transparent'
    }`} style={{ borderBottom: scrolled ? '1px solid var(--border-color)' : 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
              style={{ background: 'var(--neon-blue)', boxShadow: '0 0 15px var(--neon-blue)' }}>
              <span className="text-black font-black text-sm font-display">IG</span>
            </div>
            <span className="font-display font-bold text-lg hidden sm:block" style={{ color: 'var(--neon-blue)' }}>
              IDE Game
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={`px-3 py-2 text-sm font-semibold transition-all duration-200 rounded font-body ${
                  router.pathname === link.href
                    ? 'text-[var(--neon-blue)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                style={router.pathname === link.href ? { textShadow: '0 0 8px var(--neon-blue)' } : {}}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--neon-blue)', color: '#000' }}>
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">{user.username}</span>
                  <span className="text-xs">▾</span>
                </button>
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl py-2 z-50"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      {[
                        { href: '/dashboard', label: '📊 Dashboard' },
                        { href: '/your-games', label: '🎮 Your Games' },
                        { href: '/settings', label: '⚙️ Settings' },
                      ].map(item => (
                        <Link key={item.href} href={item.href}
                          className="block px-4 py-2 text-sm hover:text-[var(--neon-blue)] transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onClick={() => setDropdownOpen(false)}>
                          {item.label}
                        </Link>
                      ))}
                      <hr style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                        🚪 Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-semibold transition-all"
                  style={{ color: 'var(--text-secondary)' }}>Login</Link>
                <Link href="/signup" className="cyber-btn text-xs">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2" style={{ color: 'var(--text-primary)' }}>
            <div className="space-y-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-0.5 w-6 transition-all" style={{ background: 'var(--neon-blue)' }} />
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 pb-4" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="block py-3 text-sm font-semibold border-b"
                style={{ color: router.pathname === link.href ? 'var(--neon-blue)' : 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex gap-2">
              {user ? (
                <button onClick={handleLogout} className="cyber-btn text-xs w-full">Logout</button>
              ) : (
                <>
                  <Link href="/login" className="flex-1 text-center py-2 text-sm border rounded" 
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Login</Link>
                  <Link href="/signup" className="cyber-btn text-xs flex-1">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
