import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout, isAgent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🎫</div>
          <div>
            <h1>HelpDesk</h1>
            <span>IT Support Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/tickets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon">🎫</span> {isAgent ? 'All Tickets' : 'My Tickets'}
          </NavLink>
          <NavLink to="/tickets/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="icon">➕</span> New Ticket
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <div className="name">{user?.fullName}</div>
              <div className="role">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
