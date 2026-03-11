'use client';

import { useState } from 'react';
import { Shell } from '../../components/Shell';
import { applyTheme, getSavedTheme } from '../../lib/theme';
import { useRequireAuth } from '../../lib/auth';

export default function SettingsPage() {
  const ready = useRequireAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(getSavedTheme());
  const [saved, setSaved] = useState('');
  if (!ready) return null;

  return (
    <Shell title="Settings" subtitle="Minimal controls to keep the workspace steady and calm.">
      <div className="card-soft" style={{ maxWidth: 420 }}>
        <label>Theme</label>
        <select value={theme} onChange={(e) => { const t = e.target.value as 'light' | 'dark'; setTheme(t); applyTheme(t); setSaved('Theme updated.'); }}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        <p className="muted">Theme preference is saved on this device.</p>
        {saved ? <p style={{ color: '#166534', marginTop: 8 }}>{saved}</p> : null}
      </div>
    </Shell>
  );
}
