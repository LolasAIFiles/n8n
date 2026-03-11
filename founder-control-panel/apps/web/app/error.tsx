'use client';

export default function ErrorView({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid #fecaca' }}>
        <p style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>Something interrupted your workflow.</p>
        <p style={{ color: '#64748b' }}>Try again. Your saved data remains intact.</p>
        <button onClick={reset} style={{ border: 0, background: '#0f172a', color: 'white', borderRadius: 8, padding: '8px 12px' }}>
          Retry
        </button>
      </div>
    </main>
  );
}
