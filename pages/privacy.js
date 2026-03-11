import Layout from '../components/layout/Layout';
export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display font-black text-4xl mb-2" style={{ color: 'var(--neon-blue)' }}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Last updated: January 2026</p>
        {[
          ['Information We Collect', 'We collect information you provide directly, such as your name, username, email address, and password when creating an account. We also collect usage data including game plays, earnings activity, and platform interactions.'],
          ['How We Use Your Information', 'We use your information to provide and improve our services, process payments, send verification emails, and communicate important account updates. We never sell your personal data to third parties.'],
          ['Cookies and Analytics', 'We use cookies to maintain your session and remember your preferences. We may use Google Analytics to understand platform usage. You can opt out of non-essential cookies in your browser settings.'],
          ['Advertising', 'Our platform displays Google AdSense advertisements. Google may use cookies to show relevant ads. Please see Google\'s Privacy Policy for more information about how Google handles advertising data.'],
          ['Data Security', 'We use industry-standard encryption to protect your data. Passwords are hashed using bcrypt. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.'],
          ['Data Retention', 'We retain your data as long as your account is active. You can request account deletion at any time via Settings > Danger Zone. Deleted accounts have their data removed within 30 days.'],
          ['Contact', 'If you have privacy concerns, please contact us at privacy@idegamedevelop.com or use our Contact page.'],
        ].map(([title, content]) => (
          <section key={title} className="mb-8">
            <h2 className="font-display font-bold text-xl mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{content}</p>
          </section>
        ))}
      </div>
    </Layout>
  );
}
