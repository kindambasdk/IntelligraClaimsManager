import React from 'react';
import RoleNav from '../components/navigation/RoleNav.jsx';
import './Admin.css';

const Admin = () => {
  const stats = [
    { label: 'Total Claims', value: 24, icon: 'fa-file-invoice' },
    { label: 'Pending', value: 8, icon: 'fa-clock' },
    { label: 'Verified', value: 5, icon: 'fa-check-circle' },
    { label: 'Users', value: 3, icon: 'fa-users' },
  ];

  const users = [
    { name: 'Shabani', role: 'Representative', email: 'shabani@intelligra.io', status: 'Active' },
    { name: 'Grace', role: 'Customer Care', email: 'grace@intelligra.io', status: 'Active' },
    { name: 'Peter', role: 'Finance', email: 'peter@intelligra.io', status: 'Active' },
  ];

  const handleGenerateReport = () => {
    alert('Generating report...');
  };

  const handleManageUser = (name) => {
    alert(`Managing user: ${name}`);
  };

  return (
    <div>
      
      <div className="admin-container">
        <div className="admin-header">
          <i className="fas fa-chart-bar"></i>
          <h3>Dashboard & Reports</h3>
        </div>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <i className={`fas ${stat.icon}`}></i>
              <div className="stat-number">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="admin-section">
          <h4><i className="fas fa-users"></i> Users</h4>
          <div className="user-list">
            {users.map((user, index) => (
              <div key={index} className="user-item">
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-meta">
                    <span className="user-role">{user.role}</span>
                    <span className="user-email">{user.email}</span>
                    <span className="user-status active">{user.status}</span>
                  </div>
                </div>
                <button 
                  className="btn-outline"
                  onClick={() => handleManageUser(user.name)}
                >
                  Manage
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <button className="btn-primary full-width report-btn" onClick={handleGenerateReport}>
          <i className="fas fa-file-pdf"></i> Generate Report
        </button>
      </div>
    </div>
  );
};

export default Admin;