import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'investor' | 'entrepreneur';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. While the app is checking the token in localStorage, show a loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 2. If the user is not logged in, redirect them to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If a specific role is required (e.g., 'investor') and the user is an 'entrepreneur',
  // redirect them to their correct dashboard instead of letting them see the wrong one.
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={`/dashboard/${user?.role}`} replace />;
  }

  // 4. If everything is fine, show the page (children)
  return <>{children}</>;
};