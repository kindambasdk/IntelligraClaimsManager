// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import logoIcon from '../assets/intelligra.png';
import { ROLES, ROLE_LABELS } from '../constants/roles.js';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.REPRESENTATIVE);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!username.trim()) {
      setError('Username is required');
      setIsLoading(false);
      return;
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters');
      setIsLoading(false);
      return;
    }

    const user = {
      username: username.trim(),
      role: role,
      name: username.trim(),
      email: `${username}@intelligra.io`
    };

    login(user);
    navigate('/');
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
        <img src={logoIcon} alt="INTELLIGRA Logo" className="logo-icon" />
             <span>INTELLIGRA</span>
        </div>
        <h2>Sign In</h2>
      
        
        <form onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value={ROLES.REPRESENTATIVE}>{ROLE_LABELS[ROLES.REPRESENTATIVE]}</option>
              <option value={ROLES.CUSTOMER_CARE}>{ROLE_LABELS[ROLES.CUSTOMER_CARE]}</option>
              <option value={ROLES.FINANCE}>{ROLE_LABELS[ROLES.FINANCE]}</option>
              <option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</option>
            </select>
          </div>
          
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
          <span>rep@intelligra.com</span>
        </div>
      </div>
    </div>
  );
};

export default Login;