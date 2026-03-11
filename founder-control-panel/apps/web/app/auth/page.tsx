'use client';

import { useState } from 'react';
import { API_BASE } from '../../lib/api';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true); setError('');
      if (!email || !password) throw new Error('Enter email and password.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');
      if (mode === 'register') {
        const r = await fetch(`${API_BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        if (!r.ok) throw new Error((await r.json()).error || 'Register failed');
      }
      const r2 = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await r2.json();
      if (!r2.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('fcp_token', data.token);
      window.location.href = '/dashboard';
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <main className="container">
      <section className="card" style={{ maxWidth: 500, margin: '72px auto' }}>
        <p className="small muted">Welcome</p>
        <h1>{mode === 'login' ? 'Sign in' : 'Create your account'}</h1>
        <p className="muted">A composed operating space for founder clarity.</p>

        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />

        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

        <div className="cluster">
          <button onClick={submit} disabled={loading}>{loading ? 'Securing session…' : mode === 'login' ? 'Sign in' : 'Create and sign in'}</button>
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Need an account?' : 'Have an account?'}
          </button>
        </div>
      </section>
    </main>
  );
}
