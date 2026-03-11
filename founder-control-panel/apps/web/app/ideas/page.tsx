'use client';

import { useState } from 'react';
import { Shell } from '../../components/Shell';
import { api } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';

export default function IdeasPage() {
  const ready = useRequireAuth();
  const [form, setForm] = useState({ title: '', description: '', problemSolved: '', targetCustomer: '', industry: '', notes: '', tags: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!ready) return null;

  return (
    <Shell title="Idea Capture" subtitle="Capture fast so your mind can stay clear.">
      <label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <label>Problem solved</label><input value={form.problemSolved} onChange={(e) => setForm({ ...form, problemSolved: e.target.value })} />
      <label>Target customer</label><input value={form.targetCustomer} onChange={(e) => setForm({ ...form, targetCustomer: e.target.value })} />
      <label>Industry</label><input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
      <label>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      <label>Tags (comma separated)</label><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      {message ? <p style={{ color: '#166534' }}>{message}</p> : null}
      <button onClick={async () => {
        try {
          setError('');
          const idea = await api('/ideas', { method: 'POST', body: JSON.stringify({ ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }) });
          localStorage.setItem('fcp_last_idea_id', idea.id);
          setMessage('Saved. You can evaluate this idea now.');
          setForm({ title: '', description: '', problemSolved: '', targetCustomer: '', industry: '', notes: '', tags: '' });
        } catch (e:any) { setError(e.message); }
      }}>Save idea</button>
      <button style={{ marginLeft: 8 }} onClick={() => { window.location.href = '/decision-engine'; }}>Go to decision engine</button>
    </Shell>
  );
}
