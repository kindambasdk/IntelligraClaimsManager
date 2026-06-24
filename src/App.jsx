// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ClaimProvider } from './context/ClaimContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import Login from './pages/Login.jsx';
import Representative from './pages/Representative.jsx';
import CustomerCare from './pages/CustomerCare.jsx';
import Finance from './pages/Finance.jsx';
import Admin from './pages/Admin.jsx';
import Layout from './components/layout/Layout.jsx';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ClaimProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ClaimProvider>
    </AuthProvider>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  // If user is not logged in and not on login page, redirect to login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If user is logged in and on login page, redirect to home
  if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // If user is logged in, render the appropriate role page
  if (user) {
    const roleComponents = {
      rep: Representative,
      care: CustomerCare,
      finance: Finance,
      admin: Admin
    };
    const Component = roleComponents[user.role] || Representative;
    return (
      <Layout>
        <Component />
      </Layout>
    );
  }

  // Login page
  if (location.pathname === '/login') {
    return <Login />;
  }

  // Default fallback
  return <Navigate to="/" replace />;
}

export default App;