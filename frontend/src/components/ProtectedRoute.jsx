import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '0.75rem' }}>
        <span className="loading-spinner" role="status" aria-label="Loading session" />
        <span style={{ color: '#64748b', fontWeight: 500 }}>Loading assessment environment...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // If user is not an administrator, deny access and send directly to home
    return <Navigate to="/" replace />;
  }

  return children;
};
