// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ClaimProvider } from './context/ClaimContext.jsx';
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
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // If not logged in and not on login page, redirect to login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If logged in and on login page, redirect to dashboard
  if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  // If logged in, render the appropriate dashboard based on role
  if (user) {
    console.log('🔹 User role:', user.role); // Debug log

    const roleMap = {
      agent: Representative,
      customer_care: CustomerCare,
      finance: Finance,
      admin: Admin
    };

    // Fallback: if role is not recognized, redirect to login (or show a default page)
    const Component = roleMap[user.role];
    if (!Component) {
      console.warn('⚠️ Unknown role:', user.role);
      return <Navigate to="/login" replace />;
    }

    return (
      <Layout>
        <Component />
      </Layout>
    );
  }

  // Fallback: render login
  return <Login />;
}

export default App;