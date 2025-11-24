import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { LoadingSpinner } from './components/PremiumUI';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import App from './App';
import FloatingButtonsPage from './pages/FloatingButtons';
import LiveViewerBadge from './components/LiveViewerBadge';
import { initializeTracking } from './utils/visitorTracking';

// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const AppPage = React.lazy(() => import('./App'));
const Deal = React.lazy(() => import('./pages/Deal'));
const About = React.lazy(() => import('./About'));
const Cart = React.lazy(() => import('./cart'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AuthPage = React.lazy(() => import('./pages/Auth'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const DealDetail = React.lazy(() => import('./pages/Dealdetail'));
const Prebuilds = React.lazy(() => import('./pages/Prebuilds'));
const AdminLogin = React.lazy(() => import('./pages/AdminLoginNew'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboardPro'));

const Layout = () => {
  useEffect(() => {
    // Initialize visitor tracking (silently, no UI)
    const cleanup = initializeTracking();
    return cleanup;
  }, []);

  return (
    <>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      }>
        <Outlet />
      </Suspense>
      <FloatingButtonsPage />
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { 
        index: true, 
        element: <ErrorBoundary><Home /></ErrorBoundary>
      },
      { 
        path: 'categories',
        element: <ErrorBoundary><Products /></ErrorBoundary>
      },
      { 
        path: 'category/:slug',
        element: <ErrorBoundary><Products /></ErrorBoundary>
      },
      { 
        path: 'products',
        children: [
          { 
            index: true, 
            element: <ErrorBoundary><Products /></ErrorBoundary>
          },
          { 
            path: ':id', 
            element: <ErrorBoundary><ProductDetail /></ErrorBoundary>
          }
        ]
      },
      { 
        path: 'deal',
        children: [
          { index: true, element: <ErrorBoundary><Deal /></ErrorBoundary> },
          { path: ':id', element: <ErrorBoundary><DealDetail /></ErrorBoundary> }
        ]
      },
      { 
        path: 'prebuild', 
        element: <ErrorBoundary><Prebuilds /></ErrorBoundary> 
      },
      { 
        path: 'contact', 
        element: <About /> 
      },
      { 
        path: 'cart', 
        element: <Cart /> 
      },
      { 
        path: 'profile', 
        element: <Profile /> 
      },
      { 
        path: 'auth', 
        element: <AuthPage /> 
      },
      { 
        path: 'checkout',
        element: <ErrorBoundary><CheckoutPage /></ErrorBoundary>
      }
    ]
  },
  {
    path: '/admin',
    children: [
      { path: 'login', element: <AdminLogin /> },
      { 
        index: true, 
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'products', 
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ) 
      },
      // Image manager - shows ALL products at once
      // { path: 'images', element: <AdminImageManager /> },
      // Bulk product management
      // { path: 'bulk-manager', element: <BulkProductManager /> },
      // { path: 'bulk-edit', element: <BulkEditPage /> },
      // { path: 'bulk-categories', element: <ErrorBoundary><BulkCategoryManager /></ErrorBoundary> },
      // Update product images
      // { path: 'update-images', element: <ErrorBoundary><UpdateProductImages /></ErrorBoundary> }
    ]
  }
])

const RouterRoot = () => <RouterProvider router={router} />

export default RouterRoot
