'use client';

import { useState } from 'react';
import { Alert, EmptyState, ResultCard, Shell, TrustPanel } from '../../components/Shell';
import { api } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';

export default function DecisionPage() {
  const ready = useRequireAuth();
  const [ideaId, setIdeaId] = useState(typeof window !== 'undefined' ? localStorage.getItem('fcp_last_idea_id') || '' : '');
  const [manual, setManual] = useState({ missionAlignment: 3, revenuePotential: 3, automationPotential: 3, freedomImpact: 3, socialImpact: 3 });
  const [life, setLife] = useState({ stressLevel: 5, automationPotential: 5, founderDependence: 5, travelRestrictionRisk: 5, impact: 5 });
  const [result, setResult] = useState<any>(null);
  const [lifeResult, setLifeResult] = useState<any>(null);
  const [detector, setDetector] = useState({ marketDemand: 6, feasibility90Days: 6, automationPotential: 6, buyerLikelihood: 6, packagingPotential: 6 });
  const [detectorResult, setDetectorResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!ready) return null;

  return (
    <Shell title="Decision Engine" subtitle="Decide quickly with trust signals, clear reasoning, and an immediate next step.">
      <label>Idea ID</label><input value={ideaId} onChange={(e) => setIdeaId(e.target.value)} />

      <div className="card-soft">
        <p className="muted">Manual scoring (1–5)</p>
        {Object.keys(manual).map((k) => (
          <div key={k}><label>{k}</label><input type="number" min={1} max={5} value={(manual as any)[k]} onChange={(e) => setManual({ ...manual, [k]: Number(e.target.value) })} /></div>
        ))}
        <button disabled={loading} onClick={async () => {
          try { setLoading(true); setError(''); const r = await api('/decision-engine/evaluate', { method: 'POST', body: JSON.stringify({ ideaId, mode: 'MANUAL', ...manual }) }); setResult(r); }
          catch (e:any) { setError(e.message); } finally { setLoading(false); }
        }}>{loading ? 'Evaluating…' : 'Evaluate idea'}</button>
      </div>

      <div className="card-soft">
        <p className="muted">Life alignment (1–10)</p>
        {Object.keys(life).map((k) => (
          <div key={k}><label>{k}</label><input type="number" min={1} max={10} value={(life as any)[k]} onChange={(e) => setLife({ ...life, [k]: Number(e.target.value) })} /></div>
        ))}
        <button onClick={async () => {
          try { setError(''); const r = await api('/life-alignment/evaluate', { method: 'POST', body: JSON.stringify({ ideaId, ...life }) }); setLifeResult(r); }
          catch (e:any) { setError(e.message); }
        }}>Run life alignment</button>
      </div>

      <div className="card-soft">
        <p className="muted">$10K detector (1–10)</p>
        {Object.keys(detector).map((k) => (
          <div key={k}><label>{k}</label><input type="number" min={1} max={10} value={(detector as any)[k]} onChange={(e) => setDetector({ ...detector, [k]: Number(e.target.value) })} /></div>
        ))}
        <button onClick={async () => {
          try { setError(''); const r = await api('/detector-10k/evaluate', { method: 'POST', body: JSON.stringify({ ideaId, ...detector }) }); setDetectorResult(r); }
          catch (e:any) { setError(e.message); }
        }}>Run $10K detector</button>
      </div>

      <Alert tone="error" message={error} />

      {result ? (
        <>
          <ResultCard title="Decision result" recommendation={result.recommendation} reasoning={result.reasoning} nextAction={result.nextAction} confidence={result.confidence} />
          <TrustPanel confidence={result.confidence} label="AI-advised scoring recommendation" />
        </>
      ) : <EmptyState title="No decision yet" hint="Run one evaluation now. You’ll get a recommendation, confidence, and exact next move." />}

      {lifeResult ? <ResultCard title="Life alignment" recommendation={lifeResult.recommendation} reasoning={lifeResult.reasoning} nextAction={lifeResult.nextAction} confidence={lifeResult.confidence} /> : null}
      {detectorResult ? <ResultCard title="$10K detector" recommendation={detectorResult.recommendation} reasoning={`Estimated blueprint value: ${detectorResult.valueRange}. ${detectorResult.reasoning}`} nextAction={detectorResult.nextAction} confidence={detectorResult.confidence} /> : null}

      <div className="cluster" style={{ marginTop: 8 }}>
        <button onClick={async () => { try { await api(`/ideas/${ideaId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'PARK' }) }); alert('Idea parked.'); } catch (e:any) { setError(e.message); } }}>Park idea</button>
        <button onClick={() => { localStorage.setItem('fcp_blueprint_idea_id', ideaId); window.location.href = '/blueprints'; }}>Send to blueprint</button>
      </div>
    </Shell>
  );
}
