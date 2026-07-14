// src/components/layout/Header.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useLocation } from 'react-router-dom';
import { ROLE_LABELS } from '../../constants/roles.js';
import logoIcon from '../../assets/intelligra.png';
import './Header.css';

const Header = ({ onMenuClick, isSidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/rep') return 'Claims Dashboard';
    if (path === '/care') return 'Repair Management';
    if (path === '/finance') return 'Verification Dashboard';
    if (path === '/admin') return 'Administrator Dashboard';
    return 'Dashboard';
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="hamburger-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <span className={`hamburger-icon ${isSidebarOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        <div className="logo">
          <img src={logoIcon} alt="INTELLIGRA Logo" className="logo-icon" />
        </div>
      </div>
      <div className="header-center">
        {/* Page title removed – you can uncomment if needed */}
        {/* <span className="page-title">{getPageTitle()}</span> */}
      </div>
      <div className="header-right">
        <div className="user-badge">
          <i className="fas fa-user-circle"></i>
          {/* Use fullName, fallback to username */}
          <span>{user?.fullName || user?.username || 'User'}</span>
         {/* <span className="user-role">{ROLE_LABELS[user?.role] || ''}</span> */}
        </div>
      </div>
    </header>
  );
};

export default Header;