import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'scorer' | 'user';
  requireScoring?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requireScoring = false, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, hasRole, canScore, canAdmin } = useAuth();

  console.log('ProtectedRoute check:', { isAuthenticated, requireScoring, requireAdmin, canScore: canScore(), canAdmin: canAdmin() });

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  if (requireScoring && !canScore()) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !canAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
