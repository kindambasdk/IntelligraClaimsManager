// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useClaim } from '../hooks/useClaim.js';
import api from '../services/api';
import { CLAIM_STATUS, CLAIM_STATUS_LABELS, CLAIM_TYPE } from '../constants/claimStatus.js';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const { claims } = useClaim();
  
  // State for users management (local – no backend API for listing users)
  const [users, setUsers] = useState([
    // We'll keep these as default, but they can be updated via registration
    { id: 1, username: 'admin', fullName: 'System Admin', email: 'admin@intelligra.io', role: 'admin', status: 'active', password: 'Admin@123', lastLogin: '2026-06-30 10:00:00' },
    { id: 2, username: 'agent1', fullName: 'John Agent', email: 'john@intelligra.io', role: 'rep', status: 'active', password: 'Admin@123', lastLogin: '2026-06-30 09:30:00' },
    { id: 3, username: 'care1', fullName: 'Sarah Care', email: 'sarah@intelligra.io', role: 'care', status: 'active', password: 'Admin@123', lastLogin: '2026-06-30 09:00:00' },
    { id: 4, username: 'finance1', fullName: 'Peter Finance', email: 'peter@intelligra.io', role: 'finance', status: 'active', password: 'Admin@123', lastLogin: '2026-06-29 16:30:00' },
  ]);
  
  // State for user form
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'rep',
    password: '',
    status: 'active',
    confirmPassword: ''
  });
  
  // State for password view modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // State for report generation
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [reportFormat, setReportFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // State for finance stats (dashboard)
  const [financeStats, setFinanceStats] = useState(null);
  
  // State for report data
  const [reportData, setReportData] = useState([]);
  
  // Fetch finance stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats();
        setFinanceStats(res.data);
      } catch (error) {
        console.error('Failed to fetch finance stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Claim statistics (derived from local claims from context)
  const getClaimStats = () => {
    const total = claims.length;
    const pending = claims.filter(c => c.status === CLAIM_STATUS.PENDING || c.status === 'PENDING').length;
    const awaitingCare = claims.filter(c => c.status === CLAIM_STATUS.AWAITING_CARE).length;
    const awaitingRep = claims.filter(c => c.status === CLAIM_STATUS.AWAITING_REP).length;
    const readyVerify = claims.filter(c => c.status === CLAIM_STATUS.READY_VERIFY).length;
    const verified = claims.filter(c => c.status === CLAIM_STATUS.VERIFIED).length;
    const rejected = claims.filter(c => c.status === CLAIM_STATUS.REJECTED).length;
    const completed = claims.filter(c => c.status === CLAIM_STATUS.COMPLETED).length;
    
    // By claim type
    const replacements = claims.filter(c => c.claim_type === CLAIM_TYPE.REPLACEMENT).length;
    const repairs = claims.filter(c => c.claim_type === CLAIM_TYPE.REPAIR).length;
    const normal = claims.filter(c => c.claim_subtype === 'Normal').length;
    const excess = claims.filter(c => c.claim_subtype === 'Excess').length;
    
    return {
      total,
      pending,
      awaitingCare,
      awaitingRep,
      readyVerify,
      verified,
      rejected,
      completed,
      replacements,
      repairs,
      normal,
      excess,
      completionRate: total > 0 ? ((verified + completed) / total * 100).toFixed(1) : 0,
      pendingRate: total > 0 ? ((pending + awaitingCare + awaitingRep) / total * 100).toFixed(1) : 0,
    };
  };

  const stats = getClaimStats();

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // User CRUD operations (some are local, registration uses API)
  const handleAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      username: '',
      fullName: '',
      email: '',
      role: 'rep',
      password: '',
      status: 'active',
      confirmPassword: ''
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
      status: user.status,
      confirmPassword: ''
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // Prevent deleting self
      if (userId === user?.id) {
        alert('You cannot delete your own account!');
        return;
      }
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully!');
    }
  };

  const handleSaveUser = async () => {
    // Validate form
    if (!userFormData.username || !userFormData.fullName || !userFormData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Check for duplicate username (local)
    const existingUser = users.find(u => 
      u.username === userFormData.username && 
      (!editingUser || u.id !== editingUser.id)
    );
    if (existingUser) {
      alert('Username already exists!');
      return;
    }
    
    // Validate password for new user
    if (!editingUser && !userFormData.password) {
      alert('Please set a password for the new user');
      return;
    }
    
    // Validate password confirmation
    if (userFormData.password && userFormData.password !== userFormData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    
    if (editingUser) {
      // Edit existing user (local only)
      const updateData = {
        username: userFormData.username,
        fullName: userFormData.fullName,
        email: userFormData.email,
        role: userFormData.role,
        status: userFormData.status
      };
      if (userFormData.password) {
        updateData.password = userFormData.password;
      }
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...updateData } 
          : u
      ));
      alert('User updated successfully!');
    } else {
      // Add new user – call register API
      try {
        const registerData = {
          username: userFormData.username,
          password: userFormData.password,
          fullName: userFormData.fullName,
          email: userFormData.email,
          role: userFormData.role
        };
        await api.register(registerData);
        // Add to local list
        const newUser = {
          id: Date.now(),
          username: userFormData.username,
          fullName: userFormData.fullName,
          email: userFormData.email,
          role: userFormData.role,
          status: userFormData.status,
          password: userFormData.password,
          lastLogin: 'Never'
        };
        setUsers([...users, newUser]);
        alert(`User added successfully!\nPassword: ${userFormData.password}`);
      } catch (error) {
        alert('Error adding user: ' + error.message);
        return;
      }
    }
    
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } 
        : u
    ));
  };

  // Password management (local)
  const handleViewPassword = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
    setShowPassword(false);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleChangePassword = () => {
    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }
    if (newPassword.length < 3) {
      alert('Password must be at least 3 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Update locally (no API for this)
    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, password: newPassword } 
        : u
    ));
    alert('Password updated successfully!');
    setShowPasswordModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password).then(() => {
      alert('Password copied to clipboard!');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Password copied to clipboard!');
    });
  };

  // Report generation (using finance report API)
  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  const handleExportReport = async () => {
    setIsGenerating(true);
    try {
      // Fetch report data from finance API (we'll use the current date range or all)
      let start = '';
      let end = '';
      if (reportPeriod === 'daily') {
        const today = new Date().toISOString().slice(0,10);
        start = today;
        end = today;
      } else if (reportPeriod === 'weekly') {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        start = startOfWeek.toISOString().slice(0,10);
        end = now.toISOString().slice(0,10);
      } else if (reportPeriod === 'monthly') {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
        end = now.toISOString().slice(0,10);
      } else if (reportPeriod === 'quarterly') {
        const now = new Date();
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterMonth, 1).toISOString().slice(0,10);
        end = now.toISOString().slice(0,10);
      } else if (reportPeriod === 'yearly') {
        const now = new Date();
        start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0,10);
        end = now.toISOString().slice(0,10);
      } else {
        // all time – send empty dates
        start = '';
        end = '';
      }
      
      const res = await api.getReport(start, end);
      const data = res.data || [];
      setReportData(data);
      
      if (reportFormat === 'csv') {
        const headers = ['MSISDN', 'Customer', 'Payment Type', 'Excess Amount', 'Status', 'Agent'];
        const rows = data.map(item => [
          item.msisdn || 'N/A',
          item.customerName || 'N/A',
          item.paymentType || 'N/A',
          item.excessAmount ? `"${item.excessAmount.toFixed(2)}"` : 'N/A',
          item.paymentStatus || 'N/A',
          item.agentName || 'N/A'
        ]);
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims_report_${reportPeriod}_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('✅ CSV report downloaded successfully!');
      } else {
        // JSON
        const jsonData = {
          generatedAt: new Date().toISOString(),
          period: reportPeriod,
          totalRecords: data.length,
          records: data
        };
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `claims_report_${reportPeriod}_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('✅ JSON report downloaded successfully!');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('❌ Error generating report: ' + error.message);
    } finally {
      setIsGenerating(false);
      setShowReportModal(false);
    }
  };

  // Role badge helpers
  const getRoleBadgeClass = (role) => {
    const classes = {
      'admin': 'role-admin',
      'rep': 'role-rep',
      'care': 'role-care',
      'finance': 'role-finance'
    };
    return classes[role] || 'role-default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Administrator',
      'rep': 'Representative',
      'care': 'Customer Care',
      'finance': 'Finance'
    };
    return labels[role] || role;
  };

  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  return (
    <div className="admin-page">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <i className="fas fa-user-shield"></i>
          <h2>Administrator Dashboard</h2>
          <span className="admin-subtitle">Manage users, view claims, generate reports</span>
        </div>
        <div className="admin-actions">
          <button className="btn-primary" onClick={handleGenerateReport}>
            <i className="fas fa-file-pdf"></i> Generate Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-chart-pie"></i> Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <i className="fas fa-users"></i> Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          <i className="fas fa-file-invoice"></i> All Claims
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="admin-dashboard">
          {/* Finance Stats */}
          {financeStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">
                  <i className="fas fa-file-invoice"></i>
                </div>
                <div className="stat-number">{financeStats.monthlyTotal || 0}</div>
                <div className="stat-label">Monthly Transactions</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon verified">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-number">{financeStats.completedTotal || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon total">
                  <i className="fas fa-coins"></i>
                </div>
                <div className="stat-number">{financeStats.totalExcessCollected ? `TZS ${financeStats.totalExcessCollected.toFixed(2)}` : 'TZS 0'}</div>
                <div className="stat-label">Total Excess</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon pending">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-number">{financeStats.pendingReplacements || 0}</div>
                <div className="stat-label">Pending Replacements</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon pending">
                  <i className="fas fa-tools"></i>
                </div>
                <div className="stat-number">{financeStats.pendingScreenDamage || 0}</div>
                <div className="stat-label">Pending Screen Damage</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon rate">
                  <i className="fas fa-percentage"></i>
                </div>
                <div className="stat-number">{stats.completionRate}%</div>
                <div className="stat-label">Claim Completion Rate</div>
              </div>
            </div>
          )}

          {/* Claim Type Distribution (from local claims) */}
          <div className="stats-row">
            <div className="stat-card-wide">
              <h4><i className="fas fa-tag"></i> Claim Types</h4>
              <div className="type-distribution">
                <div className="type-item">
                  <span className="type-label">Replacement</span>
                  <div className="type-bar">
                    <div 
                      className="type-fill replacement" 
                      style={{ width: `${stats.total > 0 ? (stats.replacements / stats.total * 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className="type-count">{stats.replacements}</span>
                </div>
                <div className="type-item">
                  <span className="type-label">Repair</span>
                  <div className="type-bar">
                    <div 
                      className="type-fill repair" 
                      style={{ width: `${stats.total > 0 ? (stats.repairs / stats.total * 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className="type-count">{stats.repairs}</span>
                </div>
              </div>
            </div>

            <div className="stat-card-wide">
              <h4><i className="fas fa-layer-group"></i> Claim Subtypes</h4>
              <div className="type-distribution">
                <div className="type-item">
                  <span className="type-label">Normal</span>
                  <div className="type-bar">
                    <div 
                      className="type-fill normal" 
                      style={{ width: `${stats.total > 0 ? (stats.normal / stats.total * 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className="type-count">{stats.normal}</span>
                </div>
                <div className="type-item">
                  <span className="type-label">Excess</span>
                  <div className="type-bar">
                    <div 
                      className="type-fill excess" 
                      style={{ width: `${stats.total > 0 ? (stats.excess / stats.total * 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className="type-count">{stats.excess}</span>
                </div>
              </div>
            </div>

            <div className="stat-card-wide">
              <h4><i className="fas fa-users"></i> Users</h4>
              <div className="user-stats">
                <div className="user-stat-item">
                  <span className="user-stat-label">Total Users</span>
                  <span className="user-stat-value">{users.length}</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-label">Active</span>
                  <span className="user-stat-value active-count">{users.filter(u => u.status === 'active').length}</span>
                </div>
                <div className="user-stat-item">
                  <span className="user-stat-label">Inactive</span>
                  <span className="user-stat-value inactive-count">{users.filter(u => u.status === 'inactive').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-users">
          <div className="users-toolbar">
            <div className="search-filter">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="rep">Representative</option>
                <option value="care">Customer Care</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            <button className="btn-primary add-user-btn" onClick={handleAddUser}>
              <i className="fas fa-user-plus"></i> Add User
            </button>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-users">
                      <i className="fas fa-users"></i>
                      <p>No users found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {u.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="user-fullname">{u.fullName}</span>
                        </div>
                      </td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`status-badge ${getStatusBadgeClass(u.status)}`}
                          onClick={() => handleToggleUserStatus(u.id)}
                        >
                          {u.status === 'active' ? (
                            <i className="fas fa-check-circle"></i>
                          ) : (
                            <i className="fas fa-times-circle"></i>
                          )}
                          {u.status}
                        </button>
                      </td>
                      <td>{u.lastLogin}</td>
                      <td>
                        <div className="user-actions">
                          <button 
                            className="action-btn password"
                            onClick={() => handleViewPassword(u)}
                            title="View/Change Password"
                          >
                            <i className="fas fa-key"></i>
                          </button>
                          <button 
                            className="action-btn edit"
                            onClick={() => handleEditUser(u)}
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteUser(u.id)}
                            title="Delete User"
                            disabled={u.id === user?.id}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="users-footer">
              <span>Showing {filteredUsers.length} of {users.length} users</span>
            </div>
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="admin-claims">
          <div className="claims-toolbar">
            <div className="claims-stats-summary">
              <span>Total Claims: <strong>{stats.total}</strong></span>
              <span>Pending: <strong>{stats.pending}</strong></span>
              <span>Verified: <strong>{stats.verified}</strong></span>
              <span>Rejected: <strong>{stats.rejected}</strong></span>
            </div>
          </div>

          <div className="claims-table-container">
            <table className="claims-table">
              <thead>
                <tr>
                  <th>Cover Note</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-claims">
                      <i className="fas fa-inbox"></i>
                      <p>No claims found</p>
                    </td>
                  </tr>
                ) : (
                  claims.map(claim => (
                    <tr key={claim.id}>
                      <td className="claim-ref">{claim.covernoteRefNumber}</td>
                      <td>{claim.customerName}</td>
                      <td>{claim.msisdn}</td>
                      <td>
                        <span className="claim-type-badge">
                          {claim.claim_type || 'N/A'} - {claim.claim_subtype || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className={`claim-status-badge status-${claim.status?.toLowerCase()}`}>
                          {CLAIM_STATUS_LABELS[claim.status] || claim.status || 'Pending'}
                        </span>
                      </td>
                      <td>{claim.total_amount ? `TZS ${claim.total_amount.toLocaleString()}` : 'N/A'}</td>
                      <td>{claim.transaction_date || claim.insuranceClaimDate || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({...userFormData, fullName: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                  placeholder="Enter username"
                  disabled={!!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>
              <div className="form-group">
                <label>Password {editingUser ? '(Leave blank to keep current)' : '*'}</label>
                <input
                  type="text"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  placeholder={editingUser ? 'Enter new password' : 'Enter password'}
                />
              </div>
              {(userFormData.password || !editingUser) && (
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="text"
                    value={userFormData.confirmPassword}
                    onChange={(e) => setUserFormData({...userFormData, confirmPassword: e.target.value})}
                    placeholder="Confirm password"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                >
                  <option value="rep">Representative</option>
                  <option value="care">Customer Care</option>
                  <option value="finance">Finance</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={userFormData.status}
                  onChange={(e) => setUserFormData({...userFormData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowUserModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveUser}>
                <i className="fas fa-save"></i> {editingUser ? 'Update' : 'Add'} User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password View/Change Modal */}
      {showPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-key"></i> Password Management</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="password-user-info">
                <div className="password-user-avatar">
                  {selectedUser.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="password-user-details">
                  <h4>{selectedUser.fullName}</h4>
                  <p><span className="label">Username:</span> {selectedUser.username}</p>
                  <p><span className="label">Role:</span> {getRoleLabel(selectedUser.role)}</p>
                </div>
              </div>

              <div className="password-display">
                <div className="password-field">
                  <label>Current Password</label>
                  <div className="password-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={selectedUser.password}
                      readOnly
                      className="password-input"
                    />
                    <button 
                      className="toggle-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    <button 
                      className="copy-password-btn"
                      onClick={() => handleCopyPassword(selectedUser.password)}
                      title="Copy password"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="password-change-section">
                <div className="divider">
                  <span>Change Password</span>
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="text"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="password-requirements">
                  <small>Password must be at least 3 characters long</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowPasswordModal(false)}>Close</button>
              <button className="btn-primary" onClick={handleChangePassword}>
                <i className="fas fa-save"></i> Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-file-export"></i> Generate Report</h3>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Report Period</label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="all">All Time</option>
                </select>
              </div>
              <div className="form-group">
                <label>Report Format</label>
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                >
                  <option value="csv">CSV (Excel)</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div className="report-preview">
                <h4>Report Summary</h4>
                <div className="report-stats">
                  <span>Total Claims: <strong>{stats.total}</strong></span>
                  <span>Period: <strong>{reportPeriod}</strong></span>
                  <span>Format: <strong>{reportFormat.toUpperCase()}</strong></span>
                  <span>Generated: <strong>{new Date().toLocaleString()}</strong></span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setShowReportModal(false)}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={handleExportReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <><i className="fas fa-spinner fa-spin"></i> Generating...</>
                ) : (
                  <><i className="fas fa-download"></i> Download</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;