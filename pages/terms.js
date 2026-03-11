import Layout from '../components/layout/Layout';
export default function Terms() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display font-black text-4xl mb-2" style={{ color: 'var(--neon-blue)' }}>Terms & Conditions</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Last updated: January 2026</p>
        {[
          ['Acceptance', 'By using IDE Game Develop, you agree to these Terms. If you disagree, please do not use the platform.'],
          ['Eligibility', 'You must be at least 13 years old to create an account. Users under 18 require parental consent.'],
          ['User Content', 'You retain ownership of games and assets you create. By publishing, you grant us a license to display your game on the platform. You must not upload copyrighted material without permission.'],
          ['Earning & Withdrawals', 'Earnings are calculated at 200 plays per $1. Minimum withdrawal is $5, maximum per request is $10. We reserve the right to verify play counts and reject fraudulent activity. Earnings from bots or artificial plays will be voided.'],
          ['Prohibited Conduct', 'You may not use automated bots to inflate play counts, upload malicious content, impersonate others, or violate any applicable laws. Violation will result in account termination and forfeiture of earnings.'],
          ['Termination', 'We may terminate accounts that violate these terms. You may delete your account at any time via Settings.'],
          ['Limitation of Liability', 'IDE Game Develop is provided "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from platform use.'],
          ['Changes', 'We may update these terms at any time. Continued use after changes constitutes acceptance of the new terms.'],
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
