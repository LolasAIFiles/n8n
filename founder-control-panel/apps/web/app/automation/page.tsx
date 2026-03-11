'use client';

import { useEffect, useState } from 'react';
import { Shell } from '../../components/Shell';
import { api } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';

const engines = ['REVENUE_AUTOMATION', 'IDEA_ASSET_PIPELINE', 'AUDIENCE_ENGINE', 'OPPORTUNITY_SCANNER', 'DELEGATION_ENGINE'];

export default function AutomationPage() {
  const ready = useRequireAuth();
  const [engine, setEngine] = useState(engines[0]);
  const [nextStep, setNextStep] = useState('');
  const [completionRate, setCompletionRate] = useState(0);
  const [rows, setRows] = useState<any[]>([]);

  const load = async () => setRows(await api('/automation/progress'));
  useEffect(() => { if (ready) load(); }, [ready]);
  if (!ready) return null;

  return (
    <Shell title="Automation Systems" subtitle="Track progress one engine at a time.">
      <label>Engine</label><select value={engine} onChange={(e) => setEngine(e.target.value)}>{engines.map((e) => <option key={e}>{e}</option>)}</select>
      <label>Completion %</label><input type="number" min={0} max={100} value={completionRate} onChange={(e) => setCompletionRate(Number(e.target.value))} />
      <label>Next step</label><input value={nextStep} onChange={(e) => setNextStep(e.target.value)} />
      <button onClick={async () => { await api('/automation/progress', { method: 'POST', body: JSON.stringify({ engine, checklist: [{ label: nextStep || 'Step', done: completionRate >= 100 }], completionRate, nextStep }) }); await load(); }}>Save progress</button>
      {rows.map((r) => <p key={r.id}>{r.engine}: {r.completionRate}% — {r.nextStep}</p>)}
    </Shell>
  );
}
