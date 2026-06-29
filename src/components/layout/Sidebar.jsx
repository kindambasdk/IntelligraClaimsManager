// src/components/layout/Sidebar.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES, ROLE_ICONS, ROLE_LABELS } from '../../constants/roles.js';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    onClose();
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const getRoleIcon = () => ROLE_ICONS[user?.role] || 'fa-user';
  const getRoleLabel = () => ROLE_LABELS[user?.role] || 'User';

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getNavItems = () => {
    const role = user?.role;
    const items = [];

    // Dashboard for all
    items.push({
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fa-home',
      path: '/',
      active: location.pathname === '/'
    });

    if (role === ROLES.REPRESENTATIVE) {
      // Removed "Claims" item – only dashboard remains
      // (No extra items)
    }

    if (role === ROLES.CUSTOMER_CARE) {
      items.push({
        id: 'repairs',
        label: 'Repair Claims',
        icon: 'fa-tools',
        path: '/care',
        active: location.pathname === '/care'
      });
    }

    if (role === ROLES.FINANCE) {
      items.push({
        id: 'verify',
        label: 'Verification',
        icon: 'fa-check-double',
        path: '/finance',
        active: location.pathname === '/finance'
      });
    }

    if (role === ROLES.ADMIN) {
      items.push({
        id: 'admin-dashboard',
        label: 'Dashboard',
        icon: 'fa-chart-pie',
        path: '/admin',
        active: location.pathname === '/admin'
      });
      items.push({
        id: 'users',
        label: 'Users Management',
        icon: 'fa-users-cog',
        path: '/admin',
        active: location.pathname === '/admin'
      });
      items.push({
        id: 'all-claims',
        label: 'All Claims',
        icon: 'fa-file-invoice',
        path: '/admin',
        active: location.pathname === '/admin'
      });
      items.push({
        id: 'reports',
        label: 'Generate Reports',
        icon: 'fa-chart-bar',
        path: '/admin',
        active: location.pathname === '/admin'
      });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className={`sidebar-panel ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
        <i className="fas fa-times"></i>
      </button>

      <div className="sidebar-profile">
        <div className="avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span className="avatar-initials">{getUserInitials()}</span>
          )}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-role">
            <i className={`fas ${getRoleIcon()}`}></i>
            <span>{getRoleLabel()}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${item.active ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
            title={item.label}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;