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
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Verify token is valid (basic check - not expired)
        try {
          // Decode JWT without verifying signature (frontend only)
          const parts = token.split('.');
          if (parts.length !== 3) {
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
              sessionStorage.removeItem('aalacomp_admin_token');
              setIsAuthenticated(false);
              setLoading(false);
              return;
            }
          }

          setIsAuthenticated(true);
        } catch (decodeErr) {
          sessionStorage.removeItem('aalacomp_admin_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
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
    return <Navigate to="/admin/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
