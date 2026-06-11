import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', department: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.fullName) {
      toast.error('Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="logo">🎫</div>
          <h2>Create Account</h2>
          <p>Register to submit support tickets</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-control" value={form.fullName} onChange={set('fullName')} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input className="form-control" value={form.username} onChange={set('username')} placeholder="Choose username" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input type="email" className="form-control" value={form.email} onChange={set('email')} placeholder="your@company.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" className="form-control" value={form.password} onChange={set('password')} placeholder="Min 8 characters" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-control" value={form.department} onChange={set('department')} placeholder="e.g. Finance" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.phone} onChange={set('phone')} placeholder="+91 9999999999" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating…</> : '✅ Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, marginTop: 16, color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
