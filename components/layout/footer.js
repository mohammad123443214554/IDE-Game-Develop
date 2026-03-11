import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--neon-blue)' }}>
                <span className="text-black font-black text-sm font-display">IG</span>
              </div>
              <span className="font-display font-bold" style={{ color: 'var(--neon-blue)' }}>IDE Game Develop</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create games without code. Publish and earn money from your creativity.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Platform</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/games', 'Games'], ['/lab', 'Lab'], ['/about', 'About']].map(([href, label]) => (
                <li key={href}><Link href={href} className="text-sm hover:text-[var(--neon-blue)] transition-colors" style={{ color: 'var(--text-secondary)' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Account</h4>
            <ul className="space-y-2">
              {[['/login', 'Login'], ['/signup', 'Sign Up'], ['/dashboard', 'Dashboard'], ['/settings', 'Settings']].map(([href, label]) => (
                <li key={href}><Link href={href} className="text-sm hover:text-[var(--neon-blue)] transition-colors" style={{ color: 'var(--text-secondary)' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Legal</h4>
            <ul className="space-y-2">
              {[['/privacy', 'Privacy Policy'], ['/terms', 'Terms & Conditions'], ['/contact', 'Contact']].map(([href, label]) => (
                <li key={href}><Link href={href} className="text-sm hover:text-[var(--neon-blue)] transition-colors" style={{ color: 'var(--text-secondary)' }}>{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            © 2026 IDE Game Develop. Created by <span style={{ color: 'var(--neon-blue)' }}>Mohammad Khan</span>. Version 1.0
          </p>
          <div className="flex gap-4">
            {['200 plays = $1', 'Min withdraw $5', 'Max $10/request'].map(tag => (
              <span key={tag} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--neon-blue)', border: '1px solid var(--border-color)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
