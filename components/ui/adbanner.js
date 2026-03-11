export default function AdBanner({ slot = 'auto', format = 'auto', className = '' }) {
  return (
    <div className={`w-full flex items-center justify-center ${className}`}
      style={{ background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border-color)', borderRadius: '8px', minHeight: '90px' }}>
      {/* Google AdSense - Replace with real ad code in production */}
      <div className="text-center">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Advertisement</p>
        <p className="text-xs opacity-50" style={{ color: 'var(--text-secondary)' }}>AdSense Slot: {slot}</p>
      </div>
      {/* Uncomment for real AdSense:
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true" />
      */}
    </div>
  );
}
