'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, EmptyState, Shell, TrustPanel } from '../../components/Shell';
import { api } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';
import { toBlueprintReport } from '../../../../packages/utils/src/blueprint-report.js';

export default function BlueprintsPage() {
  const ready = useRequireAuth();
  const [ideaId, setIdeaId] = useState(typeof window !== 'undefined' ? localStorage.getItem('fcp_blueprint_idea_id') || '' : '');
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState('');

  const load = async () => setRows(await api('/blueprints'));
  useEffect(() => { if (ready) load().catch((e) => setError(e.message)); }, [ready]);
  if (!ready) return null;

  return (
    <Shell title="Blueprints" subtitle="High-trust strategic reports designed for action and monetization readiness.">
      <label>Idea ID</label>
      <input value={ideaId} onChange={(e) => setIdeaId(e.target.value)} />
      <button onClick={async () => {
        try {
          setError('');
          setStatus('Generating strategic report…');
          const res = await api('/blueprints/generate', { method: 'POST', body: JSON.stringify({ ideaId }) });
          setStatus(`Report generated · model ${res.blueprint.model} · prompt ${res.blueprint.promptVersion}`);
          await load();
        } catch (e:any) { setStatus(''); setError(e.message); }
      }}>Generate blueprint</button>

      {status ? <p className="muted" style={{ marginTop: 10 }}>{status}</p> : null}
      <Alert tone="error" message={error} />

      {rows.length === 0 ? <EmptyState title="No blueprints yet" hint="Generate one from a decision-approved idea, then move it to marketplace prep." /> : (
        <div className="stack" style={{ marginTop: 12 }}>
          {rows.map((b) => (
            <div key={b.id} className="card-soft">
              <p style={{ margin: 0 }}><strong>{b.idea?.title || 'Idea'}</strong></p>
              <p className="muted" style={{ marginTop: 4 }}>What this is: an AI-generated strategic report. Why it matters: helps you decide build vs sell with lower stress.</p>
              <TrustPanel model={b.model} promptVersion={b.promptVersion} confidence={b.output?.confidence} />

              <div className="stack" style={{ marginTop: 10 }}>
                {toBlueprintReport(b.output).map((section) => (
                  <div key={section.key} className="card" style={{ padding: 14 }}>
                    <p className="muted" style={{ marginBottom: 6 }}>{section.label}</p>
                    <p style={{ margin: 0 }}>{section.value}</p>
                    <button style={{ marginTop: 8 }} onClick={() => navigator.clipboard.writeText(String(section.value || ''))}>Copy section</button>
                  </div>
                ))}
              </div>

              <div className="cluster" style={{ marginTop: 12 }}>
                <Link href="/marketplace" className="pill">What should I do next? Prepare listing</Link>
                <Link href="/decision-engine" className="pill">Refine recommendation</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
