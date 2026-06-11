import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ticketsApi } from '../services/api';

export default function NewTicketPage() {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', category: 'SOFTWARE' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setLoading(true);
    try {
      const res = await ticketsApi.create(form);
      toast.success(`Ticket ${res.data.ticketNumber} created successfully!`);
      navigate(`/tickets/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <h2>➕ New Support Ticket</h2>
          <p>Describe your issue clearly for faster resolution.</p>
        </div>
        <Link to="/tickets" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject / Title *</label>
            <input className="form-control" value={form.title} onChange={set('title')}
              placeholder="Brief description of the issue" maxLength={200} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={set('category')}>
                <option value="HARDWARE">🖥️ Hardware</option>
                <option value="SOFTWARE">💾 Software</option>
                <option value="NETWORK">🌐 Network / VPN</option>
                <option value="ACCESS">🔑 Access / Permissions</option>
                <option value="EMAIL">📧 Email</option>
                <option value="OTHER">📦 Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority *</label>
              <select className="form-control" value={form.priority} onChange={set('priority')}>
                <option value="LOW">🟢 Low – Minor issue, not urgent</option>
                <option value="MEDIUM">🟡 Medium – Affecting productivity</option>
                <option value="HIGH">🔴 High – Blocking work</option>
                <option value="CRITICAL">🟣 Critical – System down</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" value={form.description} onChange={set('description')}
              placeholder="Please describe:&#10;• What happened?&#10;• When did it start?&#10;• What have you already tried?&#10;• Any error messages?" rows={7} />
          </div>

          <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#1d4ed8' }}>
            💡 <strong>Tip:</strong> The more detail you provide, the faster our team can resolve your issue.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" /> Submitting…</> : '🚀 Submit Ticket'}
            </button>
            <Link to="/tickets" className="btn btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
