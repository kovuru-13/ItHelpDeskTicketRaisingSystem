import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, isAgent } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ticketsRes = await ticketsApi.getAll({ page: 0, size: 5 });
        setRecentTickets(ticketsRes.data.content || []);

        if (isAgent) {
          const statsRes = await ticketsApi.getStats();
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAgent]);

  const StatusBadge = ({ status }) => (
    <span className={`badge badge-${status?.toLowerCase()}`}>{status?.replace('_', ' ')}</span>
  );

  const PriorityBadge = ({ priority }) => (
    <span className={`badge badge-${priority?.toLowerCase()}`}>{priority}</span>
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>👋 Welcome, {user?.fullName?.split(' ')[0]}!</h2>
          <p>Here's what's happening with your IT support tickets.</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">➕ New Ticket</Link>
      </div>

      {isAgent && stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total || 0}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
          <div className="stat-card open">
            <div className="stat-number">{stats.open || 0}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-number">{stats.inProgress || 0}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card resolved">
            <div className="stat-number">{stats.resolved || 0}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card critical">
            <div className="stat-number">{stats.critical || 0}</div>
            <div className="stat-label">Critical Open</div>
          </div>
          <div className="stat-card progress">
            <div className="stat-number">{stats.high || 0}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>📋 Recent Tickets</h3>
          <Link to="/tickets" className="btn btn-secondary btn-sm">View All →</Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No tickets yet. <Link to="/tickets/new">Create your first ticket</Link></p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map(t => (
                  <tr key={t.id}>
                    <td><Link to={`/tickets/${t.id}`} className="ticket-link">{t.ticketNumber}</Link></td>
                    <td style={{ maxWidth: 240 }}>
                      <Link to={`/tickets/${t.id}`} className="ticket-link"
                        style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </Link>
                    </td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>{t.category}</td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
