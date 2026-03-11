import Navbar from './Navbar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children, noFooter = false }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {!noFooter && <Footer />}
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          fontFamily: 'Rajdhani, sans-serif',
        },
      }} />
    </div>
  );
}
