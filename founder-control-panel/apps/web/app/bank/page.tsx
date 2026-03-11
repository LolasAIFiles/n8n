'use client';

import { useEffect, useMemo, useState } from 'react';
import { EmptyState, Shell, TrustPanel } from '../../components/Shell';
import { api } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';

export default function BankPage() {
  const ready = useRequireAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [dormant, setDormant] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (dormant) params.set('dormant', 'true');
    const [ideaRows, runRows] = await Promise.all([
      api(`/idea-bank?${params.toString()}`),
      api('/compression-runs'),
    ]);
    setIdeas(ideaRows);
    setRuns(runRows);
  };

  useEffect(() => { if (ready) load().catch((e) => setError(e.message)); }, [ready, q, status, dormant]);
  const selectedIdeas = useMemo(() => ideas.filter((i) => selected.includes(i.id)), [ideas, selected]);
  if (!ready) return null;

  return (
    <Shell title="Idea Bank" subtitle="Capture everything. Compress overlap. Move only the strongest path forward.">
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <div className="cluster">
        <input placeholder="Search ideas" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 320, marginBottom: 0 }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 220, marginBottom: 0 }}><option value="">All statuses</option><option>UNTRIAGED</option><option>BUILD</option><option>SELL_BLUEPRINT</option><option>PARK</option><option>IGNORE</option></select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}><input type="checkbox" style={{ width: 16, margin: 0 }} checked={dormant} onChange={(e) => setDormant(e.target.checked)} />Dormant only</label>
      </div>

      {ideas.length === 0 ? (
        <EmptyState title="No ideas found" hint="Capture ideas first, then run compression to reduce noise and increase leverage." />
      ) : (
        <div className="stack" style={{ marginTop: 16 }}>
          {ideas.map((idea) => (
            <div key={idea.id} className="card-soft">
              <label style={{ display: 'flex', alignItems: 'start', gap: 8 }}>
                <input type="checkbox" style={{ width: 16, marginTop: 2 }} checked={selected.includes(idea.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, idea.id] : selected.filter((id) => id !== idea.id))} />
                <span>
                  <strong>{idea.title}</strong>
                  <span className="muted"> · {idea.status}</span>
                  <p style={{ margin: '6px 0 0 0' }}>{idea.description}</p>
                </span>
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="card-soft" style={{ marginTop: 14 }}>
        <p className="muted">Compression selection ({selectedIdeas.length})</p>
        {selectedIdeas.length < 2 ? <p className="muted">Select 2–20 ideas. Then run compression to identify one stronger concept.</p> : <ul>{selectedIdeas.map((i) => <li key={i.id}>{i.title}</li>)}</ul>}
        <button disabled={selectedIdeas.length < 2 || selectedIdeas.length > 20} onClick={async () => { try { await api('/compression-runs', { method: 'POST', body: JSON.stringify({ ideaIds: selected }) }); await load(); } catch (e:any) { setError(e.message); } }}>Run compression</button>
      </div>

      <div className="stack" style={{ marginTop: 14 }}>
        {runs.map((run) => (
          <div key={run.id} className="card-soft">
            <p style={{ margin: 0 }}><strong>{run.output.suggestedName || 'Compressed concept'}</strong> · <span className="muted">{run.output.mergeOrSeparate}</span></p>
            <p className="muted" style={{ marginTop: 6 }}>{run.output.strongestUnifyingConcept}</p>
            <p style={{ marginTop: 6 }}><strong>Why:</strong> {run.output.why}</p>
            <p style={{ marginTop: 6 }}><strong>Next actions:</strong> {(run.output.next3Actions || []).join(' • ')}</p>
            <TrustPanel confidence={run.output.confidence} label={`Recommendation: ${run.output.buildVsSellRecommendation}`} model={run.model} promptVersion={run.promptVersion} />
            <button onClick={async () => { await api('/compression-runs/save-idea', { method: 'POST', body: JSON.stringify({ compressionRunId: run.id, title: run.output.suggestedName || 'Compressed Concept' }) }); await load(); }}>Save concept to idea bank</button>
          </div>
        ))}
      </div>
    </Shell>
  );
}
