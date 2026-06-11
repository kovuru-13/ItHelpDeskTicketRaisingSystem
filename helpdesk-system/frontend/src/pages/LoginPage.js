import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const setDemo = (u, p) => setForm({ username: u, password: p });

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-header">
          <div className="logo">🎫</div>
          <h2>IT Help Desk</h2>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-control" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Enter your username" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Enter your password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in…</> : '🔐 Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: 14, background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
          <p style={{ fontWeight: 600, marginBottom: 8, color: '#374151' }}>🧪 Demo Accounts</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['Admin', 'admin', 'admin123'], ['Agent', 'agent1', 'agent123'], ['User', 'user1', 'user123']].map(([role, u, p]) => (
              <button key={u} onClick={() => setDemo(u, p)}
                style={{ textAlign: 'left', background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', color: '#374151', fontSize: 13 }}>
                <strong>{role}:</strong> {u} / {p}
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, marginTop: 16, color: '#6b7280' }}>
          No account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 500 }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
