// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import './Layout.css';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Close sidebar on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay show" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main Content */}
      <div className="main-content">
        <Header onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;