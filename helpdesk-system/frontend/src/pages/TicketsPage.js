import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CATEGORIES = ['', 'HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'EMAIL', 'OTHER'];

export default function TicketsPage() {
  const { isAgent } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', keyword: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.category) params.category = filters.category;
      if (filters.keyword) params.keyword = filters.keyword;
      const res = await ticketsApi.getAll(params);
      setTickets(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotal(res.data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k) => (e) => {
    setPage(0);
    setFilters(f => ({ ...f, [k]: e.target.value }));
  };

  const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status?.toLowerCase()}`}>{status?.replace('_', ' ')}</span>
  );
  const PriorityBadge = ({ priority }) => (
    <span className={`badge badge-${priority?.toLowerCase()}`}>{priority}</span>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>🎫 {isAgent ? 'All Tickets' : 'My Tickets'}</h2>
          <p>{total} ticket{total !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">➕ New Ticket</Link>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="filters-bar">
          <input className="form-control" placeholder="🔍 Search tickets…" value={filters.keyword}
            onChange={setFilter('keyword')} style={{ minWidth: 200 }} />
          <select className="form-control" value={filters.status} onChange={setFilter('status')}>
            <option value="">All Status</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select className="form-control" value={filters.priority} onChange={setFilter('priority')}>
            <option value="">All Priority</option>
            {PRIORITIES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="form-control" value={filters.category} onChange={setFilter('category')}>
            <option value="">All Category</option>
            {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(filters.status || filters.priority || filters.category || filters.keyword) && (
            <button className="btn btn-secondary btn-sm"
              onClick={() => { setFilters({ status: '', priority: '', category: '', keyword: '' }); setPage(0); }}>
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tickets.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No tickets match your filters.</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Category</th>
                    {isAgent && <th>Raised By</th>}
                    {isAgent && <th>Assigned To</th>}
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id}>
                      <td><Link to={`/tickets/${t.id}`} className="ticket-link">{t.ticketNumber}</Link></td>
                      <td style={{ maxWidth: 260 }}>
                        <Link to={`/tickets/${t.id}`} className="ticket-link"
                          style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                          {t.title}
                        </Link>
                      </td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td style={{ fontSize: 13, color: '#6b7280' }}>{t.category}</td>
                      {isAgent && <td style={{ fontSize: 13 }}>{t.createdBy?.fullName}</td>}
                      {isAgent && <td style={{ fontSize: 13, color: t.assignedTo ? '#374151' : '#9ca3af' }}>
                        {t.assignedTo?.fullName || 'Unassigned'}
                      </td>}
                      <td style={{ fontSize: 13, color: '#6b7280' }}>
                        {new Date(t.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`page-btn ${i === page ? 'active' : ''}`} onClick={() => setPage(i)}>
                    {i + 1}
                  </button>
                ))}
                <button className="page-btn" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
