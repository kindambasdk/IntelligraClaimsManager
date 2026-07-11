// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import logoIcon from '../assets/intelligra.png';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

// src/pages/Login.jsx (excerpt)
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);
  try {
    await login(username, password);
    navigate('/', { replace: true });
  } catch (err) {
    setError(err.message || 'Login failed');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src={logoIcon} alt="INTELLIGRA Logo" className="logo-icon" />
         {/* <span>INTELLIGRA</span>*/}
        </div>
        <h2>Sign In</h2>
        {/*<p className="login-sub">Enter your credentials to access the system</p>*/}
        
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
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label="Toggle password visibility"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <i className="fas fa-spinner fa-spin"></i> : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-footer">
        {/*  <span>Use the credentials provided by your administrator</span>*/}
        </div>
      </div>
    </div>
  );
};

export default Login;