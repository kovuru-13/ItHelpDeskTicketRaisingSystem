import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ticketsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];

export default function TicketDetailPage() {
  const { id } = useParams();
  const { isAgent } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [internalNote, setInternalNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Agent update state
  const [editStatus, setEditStatus] = useState('');
  const [editAssignee, setEditAssignee] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketsApi.getById(id),
        ticketsApi.getComments(id),
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data || []);
      setEditStatus(ticketRes.data.status);
      setEditPriority(ticketRes.data.priority);
      setEditAssignee(ticketRes.data.assignedTo?.id || '');
      setResolutionNotes(ticketRes.data.resolutionNotes || '');

      if (isAgent) {
        const agentsRes = await ticketsApi.getAgents();
        setAgents(agentsRes.data || []);
      }
    } catch {
      toast.error('Ticket not found');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  }, [id, isAgent, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const updates = {
        status: editStatus,
        priority: editPriority,
        resolutionNotes,
      };
      if (editAssignee) updates.assignedToId = editAssignee;
      await ticketsApi.update(id, updates);
      toast.success('Ticket updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await ticketsApi.addComment(id, commentText, internalNote);
      setCommentText('');
      setInternalNote(false);
      toast.success('Comment added');
      load();
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!ticket) return null;

  const StatusBadge = ({ status }) => <span className={`badge badge-${status?.toLowerCase()}`}>{status?.replace('_', ' ')}</span>;
  const PriorityBadge = ({ priority }) => <span className={`badge badge-${priority?.toLowerCase()}`}>{priority}</span>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Link to="/tickets" style={{ color: '#6b7280', fontSize: 14 }}>← Tickets</Link>
            <span style={{ color: '#9ca3af' }}>/</span>
            <span style={{ fontSize: 14, color: '#374151', fontFamily: 'JetBrains Mono, monospace' }}>{ticket.ticketNumber}</span>
          </div>
          <h2 style={{ fontSize: 20 }}>{ticket.title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="ticket-detail-grid">
        {/* Main */}
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#374151' }}>📝 Description</h3>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
          </div>

          {ticket.resolutionNotes && (
            <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #16a34a' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#16a34a' }}>✅ Resolution Notes</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{ticket.resolutionNotes}</p>
            </div>
          )}

          {/* Comments */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: '#374151' }}>
              💬 Comments ({comments.length})
            </h3>

            {comments.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>No comments yet. Be the first to comment.</p>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {comments.map(c => (
                  <div key={c.id} className={`comment ${c.internal ? 'internal' : ''}`}>
                    <div className="comment-header">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="comment-author">{c.author?.fullName}</span>
                        <span style={{ fontSize: 11, background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, color: '#374151' }}>
                          {c.author?.role?.toLowerCase()}
                        </span>
                        {c.internal && <span className="internal-badge">🔒 Internal</span>}
                      </div>
                      <span className="comment-time">
                        {new Date(c.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="comment-content">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleComment}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <textarea className="form-control" value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Add a comment or reply to this ticket…" rows={3} />
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !commentText.trim()}>
                  {submitting ? <><span className="spinner" /> Posting…</> : '💬 Post Comment'}
                </button>
                {isAgent && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={internalNote} onChange={e => setInternalNote(e.target.checked)} />
                    🔒 Internal note (agents only)
                  </label>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="ticket-meta" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#374151', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Ticket Info
            </h3>
            <div className="meta-item">
              <div className="label">Ticket Number</div>
              <div className="value" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}>{ticket.ticketNumber}</div>
            </div>
            <div className="meta-item">
              <div className="label">Category</div>
              <div className="value">{ticket.category}</div>
            </div>
            <div className="meta-item">
              <div className="label">Raised By</div>
              <div className="value">{ticket.createdBy?.fullName}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{ticket.createdBy?.department}</div>
            </div>
            <div className="meta-item">
              <div className="label">Assigned To</div>
              <div className="value" style={{ color: ticket.assignedTo ? '#374151' : '#9ca3af' }}>
                {ticket.assignedTo?.fullName || 'Unassigned'}
              </div>
            </div>
            <div className="meta-item">
              <div className="label">Created</div>
              <div className="value" style={{ fontSize: 13 }}>{new Date(ticket.createdAt).toLocaleString('en-IN')}</div>
            </div>
            {ticket.resolvedAt && (
              <div className="meta-item">
                <div className="label">Resolved</div>
                <div className="value" style={{ fontSize: 13 }}>{new Date(ticket.resolvedAt).toLocaleString('en-IN')}</div>
              </div>
            )}
          </div>

          {/* Agent actions */}
          {isAgent && (
            <div className="ticket-meta">
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: '#374151', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                🛠️ Agent Actions
              </h3>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control" value={editPriority} onChange={e => setEditPriority(e.target.value)}>
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-control" value={editAssignee} onChange={e => setEditAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {agents.map(a => <option key={a.id} value={a.id}>{a.fullName} ({a.role})</option>)}
                </select>
              </div>
              {(editStatus === 'RESOLVED' || editStatus === 'CLOSED') && (
                <div className="form-group">
                  <label className="form-label">Resolution Notes</label>
                  <textarea className="form-control" value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    placeholder="Describe how the issue was resolved…" rows={3} />
                </div>
              )}
              <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleUpdate} disabled={updating}>
                {updating ? <><span className="spinner" /> Saving…</> : '💾 Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
