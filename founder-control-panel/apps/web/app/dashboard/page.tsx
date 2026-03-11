'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Alert, EmptyState, Shell } from '../../components/Shell';
import { api } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';

export default function DashboardPage() {
  const ready = useRequireAuth();
  const [data, setData] = useState<any>(null);
  const [missionText, setMissionText] = useState('');
  const [project, setProject] = useState({ name: '', description: '', status: 'ACTIVE' });
  const [kill, setKill] = useState({ active: false, priority: 'Protect calm focus', nextAction: 'Evaluate one idea' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [weekly, setWeekly] = useState({ wins: ['', '', ''], energyScore: 7, stressScore: 4 });

  const load = async () => {
    const d = await api('/dashboard');
    setData(d);
    setMissionText(d.mission?.missionText || '');
    if (d.killSwitch) {
      setKill({ active: d.killSwitch.active, priority: d.killSwitch.priority, nextAction: d.killSwitch.nextAction });
      localStorage.setItem('fcp_kill_active', String(d.killSwitch.active));
    }
  };

  useEffect(() => { if (ready) load().catch((e) => setError(e.message)); }, [ready]);
  const activeProjects = useMemo(() => data?.projects?.filter((p: any) => p.status === 'ACTIVE').length || 0, [data]);

  if (!ready) return null;
  if (!data) return <main className="container"><section className="card"><p className="muted">Preparing your command center…</p></section></main>;

  return (
    <Shell title="Dashboard" subtitle="Your control center: clear mission, protected focus, confident next move." mission={missionText} priority={kill.priority} nextAction={kill.nextAction}>
      <Alert tone="error" message={error} />
      <Alert tone="success" message={success} />

      <div className="cluster">
        <div className="card-soft" style={{ minWidth: 180 }}><p className="muted">Active projects</p><p className="metric">{activeProjects}/3</p></div>
        <div className="card-soft" style={{ minWidth: 180 }}><p className="muted">Kill switch</p><p className="metric">{kill.active ? 'On' : 'Off'}</p></div>
      </div>

      <div className="card-soft" style={{ marginTop: 14 }}>
        <p className="muted">Recommended next move</p>
        <p style={{ margin: '6px 0 0 0' }}>If you captured a new idea today, evaluate it now and move only one idea forward.</p>
        <div className="cluster" style={{ marginTop: 10 }}>
          <Link href="/ideas" className="pill">Capture idea</Link>
          <Link href="/decision-engine" className="pill">Evaluate now</Link>
          <Link href="/blueprints" className="pill">Generate blueprint</Link>
          <Link href="/marketplace" className="pill">Prepare listing</Link>
        </div>
      </div>

      <div className="stack" style={{ marginTop: 20 }}>
        <div>
          <label>Current mission</label>
          <textarea value={missionText} onChange={(e) => setMissionText(e.target.value)} rows={3} />
          <button onClick={async () => { await api('/missions/current', { method: 'PUT', body: JSON.stringify({ missionText }) }); setSuccess('Mission updated.'); await load(); }}>Save mission</button>
        </div>

        <div className="card-soft">
          <p className="muted">Add project</p>
          <label>Name</label><input value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} />
          <label>Description</label><input value={project.description} onChange={(e) => setProject({ ...project, description: e.target.value })} />
          <label>Status</label>
          <select value={project.status} onChange={(e) => setProject({ ...project, status: e.target.value })}><option>ACTIVE</option><option>PARKED</option><option>COMPLETED</option></select>
          <button onClick={async () => { try { await api('/projects', { method: 'POST', body: JSON.stringify(project) }); setProject({ name: '', description: '', status: 'ACTIVE' }); setSuccess('Project saved.'); await load(); } catch (e:any) { setError(e.message); } }}>Add project</button>
        </div>

        <div className="card-soft">
          <p className="muted">Weekly review</p>
          {weekly.wins.map((w, i) => <input key={i} placeholder={`Win ${i + 1}`} value={w} onChange={(e) => { const wins = [...weekly.wins]; wins[i] = e.target.value; setWeekly({ ...weekly, wins }); }} />)}
          <label>Energy score</label><input type="number" min={1} max={10} value={weekly.energyScore} onChange={(e) => setWeekly({ ...weekly, energyScore: Number(e.target.value) })} />
          <label>Stress score</label><input type="number" min={1} max={10} value={weekly.stressScore} onChange={(e) => setWeekly({ ...weekly, stressScore: Number(e.target.value) })} />
          <button onClick={async () => { await api('/weekly-reviews', { method: 'POST', body: JSON.stringify(weekly) }); setSuccess('Weekly review saved.'); await load(); }}>Save weekly review</button>
          <p className="muted" style={{ marginTop: 10 }}>{data.latestWeeklyReview ? `Latest: energy ${data.latestWeeklyReview.energyScore}/10 · stress ${data.latestWeeklyReview.stressScore}/10` : 'No weekly review yet.'}</p>
        </div>

        <div className="card-soft">
          <p className="muted">Kill switch</p>
          <label><input type="checkbox" checked={kill.active} onChange={(e) => setKill({ ...kill, active: e.target.checked })} style={{ width: 16, marginRight: 6 }} />Enable simplify mode</label>
          <input value={kill.priority} onChange={(e) => setKill({ ...kill, priority: e.target.value })} placeholder="One priority" />
          <input value={kill.nextAction} onChange={(e) => setKill({ ...kill, nextAction: e.target.value })} placeholder="Next action" />
          <button onClick={async () => { await api('/kill-switch', { method: 'POST', body: JSON.stringify({ sessionId: 'default-session', ...kill }) }); localStorage.setItem('fcp_kill_active', String(kill.active)); window.location.reload(); }}>Save simplify mode</button>
        </div>
      </div>

      {data.projects.length === 0 ? <EmptyState title="No projects yet" hint="Start with one focused project and keep the rest parked to protect mental clarity." /> : null}
    </Shell>
  );
}
