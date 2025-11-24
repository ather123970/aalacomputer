import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoadingSpinner } from './PremiumUI';

/**
 * ProtectedRoute - Ensures only authenticated admins can access admin pages
 * Redirects to /admin/login if no valid token is found
 */
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check if admin token exists in sessionStorage (expires on browser close)
        const token = sessionStorage.getItem('aalacomp_admin_token');
        
        if (!token) {
          console.log('[ProtectedRoute] No token found - redirecting to login');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verify token is valid (basic check - not expired)
        try {
          // Decode JWT without verifying signature (frontend only)
          const parts = token.split('.');
          if (parts.length !== 3) {
            console.log('[ProtectedRoute] Invalid token format');
            localStorage.removeItem('aalacomp_admin_token');
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }

          // Decode payload
          const payload = JSON.parse(atob(parts[1]));
          
          // Check if token is expired
          if (payload.exp) {
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            
            if (currentTime > expirationTime) {
              console.log('[ProtectedRoute] Token expired - redirecting to login');
              sessionStorage.removeItem('aalacomp_admin_token');
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
          }

          console.log('[ProtectedRoute] ✅ Token valid for user:', payload.sub);
          setIsAuthenticated(true);
        } catch (decodeErr) {
          console.error('[ProtectedRoute] Failed to decode token:', decodeErr.message);
          sessionStorage.removeItem('aalacomp_admin_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('[ProtectedRoute] Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Redirecting to /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
