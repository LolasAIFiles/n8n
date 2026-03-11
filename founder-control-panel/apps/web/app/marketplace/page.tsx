'use client';

import { useEffect, useState } from 'react';
import { Alert, EmptyState, Shell } from '../../components/Shell';
import { api } from '../../lib/api';
import { useRequireAuth } from '../../lib/auth';

export default function MarketplacePage() {
  const ready = useRequireAuth();
  const [blueprints, setBlueprints] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState<any>({ blueprintId: '', title: '', description: '', price: 4900, licenseType: 'Single License', deliveryType: 'PDF + Notion', status: 'DRAFT', platformFeePercent: 10 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [b, l] = await Promise.all([api('/blueprints'), api('/marketplace/listings')]);
    setBlueprints(b);
    setListings(l);
  };

  useEffect(() => { if (ready) load().catch((e) => setError(e.message)); }, [ready]);
  if (!ready) return null;

  const submit = async () => {
    try {
      setError('');
      if (!form.blueprintId) throw new Error('Select a blueprint before creating a listing.');
      if (editingId) {
        await api(`/marketplace/listings/${editingId}`, { method: 'PATCH', body: JSON.stringify(form) });
        setSuccess('Listing updated.');
      } else {
        await api('/marketplace/listings', { method: 'POST', body: JSON.stringify(form) });
        setSuccess('Listing created. Stripe checkout architecture is ready for wiring.');
      }
      setEditingId('');
      setForm({ blueprintId: '', title: '', description: '', price: 4900, licenseType: 'Single License', deliveryType: 'PDF + Notion', status: 'DRAFT', platformFeePercent: 10 });
      await load();
    } catch (e:any) { setError(e.message); }
  };

  return (
    <Shell title="Marketplace Prep" subtitle="Convert strategic reports into sellable assets with calm, clear listing controls.">
      <Alert tone="error" message={error} />
      <Alert tone="success" message={success} />

      <div className="card-soft">
        <p className="muted">Create listing from blueprint</p>
        <p className="subtle" style={{ marginTop: 6 }}>What this is: your monetization handoff. Why it matters: turn excess ideas into assets instead of obligations.</p>
        {blueprints.length === 0 ? <EmptyState title="No blueprints available" hint="Generate one blueprint first, then return here to create a listing." /> : null}
        <label>Blueprint</label>
        <select value={form.blueprintId} onChange={(e) => {
          const bp = blueprints.find((x) => x.id === e.target.value);
          setForm({ ...form, blueprintId: e.target.value, title: bp?.idea?.title ? `${bp.idea.title} Blueprint` : form.title, description: bp?.output?.opportunitySummary || form.description });
        }}>
          <option value="">Select blueprint</option>
          {blueprints.map((b) => <option value={b.id} key={b.id}>{b.idea?.title || b.id}</option>)}
        </select>
        <label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>Price</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <label>License type</label><input value={form.licenseType} onChange={(e) => setForm({ ...form, licenseType: e.target.value })} />
        <label>Delivery type</label><input value={form.deliveryType} onChange={(e) => setForm({ ...form, deliveryType: e.target.value })} />
        <label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>DRAFT</option><option>READY</option><option>PUBLISHED</option></select>
        <button disabled={blueprints.length === 0} onClick={submit}>{editingId ? 'Update listing' : 'Create listing'}</button>
      </div>

      {listings.length === 0 ? <EmptyState title="No listings yet" hint="Generate a blueprint and create your first listing to test monetization readiness." /> : (
        <div className="stack" style={{ marginTop: 14 }}>
          {listings.map((l) => (
            <div key={l.id} className="card-soft">
              <p style={{ margin: 0 }}><strong>{l.title}</strong> · <span className="muted">{l.status}</span></p>
              <p className="muted" style={{ marginTop: 4 }}>${Number(l.price).toLocaleString()} · {l.licenseType} · {l.deliveryType}</p>
              <p className="subtle" style={{ marginTop: 6 }}>Checkout trust cue: Stripe placeholder-ready architecture.</p>
              <div className="cluster" style={{ marginTop: 8 }}>
                <button onClick={() => { setEditingId(l.id); setForm({ ...l, price: Number(l.price) }); }}>Edit</button>
                <button onClick={async () => { await api(`/marketplace/listings/${l.id}`, { method: 'PATCH', body: JSON.stringify({ status: l.status === 'PUBLISHED' ? 'ARCHIVED' : 'PUBLISHED' }) }); await load(); }}>{l.status === 'PUBLISHED' ? 'Archive' : 'Publish'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
