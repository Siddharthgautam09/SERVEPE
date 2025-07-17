
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'freelancer' | 'admin';
  allowedRoles?: ('client' | 'freelancer' | 'admin')[];
  requireRoleSelection?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  allowedRoles,
  requireRoleSelection = true 
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - user:', user, 'token:', !!token, 'isLoading:', isLoading);

  // Show loading while auth is initializing
  if (isLoading) {
    return <Loading message="Checking authentication..." />;
  }

  // Redirect to login if no token or user
  if (!token || !user) {
    console.log('ProtectedRoute - No auth, redirecting to login');
    return <Navigate to="/otp-login" state={{ from: location }} replace />;
  }

  // Check if user needs role selection
  if (requireRoleSelection && (!user.roleSelected || user.needsRoleSelection)) {
    console.log('ProtectedRoute - Role selection needed');
    // Prevent infinite redirect loop if already on role selection page
    if (location.pathname !== '/role-selection') {
      return <Navigate to="/role-selection" replace />;
    }
  }

  // Check if user has required role (single role check)
  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute - Wrong role, redirecting');
    // Redirect to username-based profile instead of role-specific dashboard
    const redirectPath = user.username ? `/${user.username}` : '/';
    return <Navigate to={redirectPath} replace />;
  }

  // Check if user has one of the allowed roles (multiple roles check)
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    console.log('ProtectedRoute - Role not allowed, redirecting');
    // Redirect to username-based profile instead of role-specific dashboard
    const redirectPath = user.username ? `/${user.username}` : '/';
    return <Navigate to={redirectPath} replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;
