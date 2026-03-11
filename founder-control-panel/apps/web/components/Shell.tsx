'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { applyTheme, getSavedTheme } from '../lib/theme';

const links = [
  ['dashboard', 'Dashboard'],
  ['ideas', 'Capture'],
  ['bank', 'Idea Bank'],
  ['decision-engine', 'Decide'],
  ['blueprints', 'Blueprints'],
  ['marketplace', 'Marketplace'],
  ['automation', 'Automation'],
  ['settings', 'Settings'],
] as const;

export const Shell = ({ title, subtitle, children, mission, priority, nextAction }: { title: string; subtitle: string; children: React.ReactNode; mission?: string; priority?: string; nextAction?: string; }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getSavedTheme());
  const path = usePathname();
  const killMode = typeof window !== 'undefined' && localStorage.getItem('fcp_kill_active') === 'true';

  const killView = useMemo(() => (
    <section className="card stack">
      <p className="small muted">Kill switch active</p>
      <h2 style={{ margin: 0 }}>{mission || 'Define your mission to anchor decisions.'}</h2>
      <div className="card-soft">
        <p className="muted">One priority</p>
        <p style={{ margin: '6px 0 0 0' }}>{priority || 'Choose one meaningful outcome for today.'}</p>
      </div>
      <div className="card-soft">
        <p className="muted">Next action</p>
        <p style={{ margin: '6px 0 0 0' }}>{nextAction || 'Take one concrete step now.'}</p>
      </div>
      <p className="subtle">This mode protects focus by hiding non-essential UI until you turn it off.</p>
    </section>
  ), [mission, priority, nextAction]);

  return (
    <main className="container">
      <header className="header-row">
        <div>
          <p className="small muted">Founder Control Panel</p>
          <h1>{title}</h1>
          <p className="muted" style={{ maxWidth: 620 }}>{subtitle}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => { const n = theme === 'light' ? 'dark' : 'light'; setTheme(n); applyTheme(n); }}>{theme === 'light' ? 'Dark' : 'Light'} mode</button>
          <button onClick={() => { localStorage.removeItem('fcp_token'); window.location.href = '/auth'; }}>Sign out</button>
        </div>
      </header>

      {!killMode ? (
        <nav aria-label="Primary" className="nav-row">
          {links.map(([href, label]) => (
            <Link key={href} href={`/${href}`} className={`pill ${path === `/${href}` ? 'active' : ''}`}>{label}</Link>
          ))}
        </nav>
      ) : null}

      {killMode ? killView : <section className="card">{children}</section>}
    </main>
  );
};

export const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="empty">
    <p className="strong">{title}</p>
    <p className="muted" style={{ marginTop: 4 }}>{hint}</p>
  </div>
);

export const Alert = ({ tone = 'error', message }: { tone?: 'error' | 'success'; message?: string }) => {
  if (!message) return null;
  return <p style={{ color: tone === 'error' ? '#b91c1c' : '#166534' }}>{message}</p>;
};

export const TrustPanel = ({ model, promptVersion, label = 'AI-generated recommendation', confidence }: { model?: string; promptVersion?: string; label?: string; confidence?: number }) => (
  <p className="muted" style={{ marginTop: 4 }}>
    <span className="kbd">{label}</span>
    {model ? <> · model <span className="kbd">{model}</span></> : null}
    {promptVersion ? <> · prompt <span className="kbd">{promptVersion}</span></> : null}
    {typeof confidence === 'number' ? <> · confidence <span className="kbd">{Math.round(confidence * 100)}%</span></> : null}
  </p>
);

export const ResultCard = ({
  title,
  recommendation,
  reasoning,
  nextAction,
  confidence,
}: {
  title: string;
  recommendation: string;
  reasoning: string;
  nextAction: string;
  confidence?: number;
}) => (
  <div className="card-soft">
    <p className="muted">{title}</p>
    <h2 style={{ marginBottom: 6 }}>{recommendation}</h2>
    <p style={{ marginTop: 0 }}>{reasoning}</p>
    <p className="subtle" style={{ marginTop: 6 }}>Next action: {nextAction}</p>
    {typeof confidence === 'number' ? <p className="muted" style={{ marginTop: 4 }}>Confidence: {Math.round(confidence * 100)}%</p> : null}
  </div>
);
