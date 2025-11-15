import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Link, useLocation } from 'react-router-dom';
import FloatingButtons from './pages/FloatingButtons';
import { LoadingSpinner } from './components/PremiumUI';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Deal = React.lazy(() => import('./pages/Deal'));
const About = React.lazy(() => import('./About'));
const Cart = React.lazy(() => import('./cart'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AuthPage = React.lazy(() => import('./pages/Auth'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const DealDetail = React.lazy(() => import('./pages/Dealdetail'));
const Prebuilds = React.lazy(() => import('./pages/Prebuilds'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/admin/ModernDashboard'));
const AdminDashboardV2 = React.lazy(() => import('./pages/AdminDashboardV2'));
const BulkProductManager = React.lazy(() => import('./pages/BulkProductManager'));
const BulkEditPage = React.lazy(() => import('./pages/BulkEditPage'));
const CategoriesPage = React.lazy(() => import('./pages/CategoriesPage'));
const CategoryProductsPage = React.lazy(() => import('./pages/CategoryProductsPage'));
const BrandsPage = React.lazy(() => import('./pages/BrandsPage'));
const DiagnosticPage = React.lazy(() => import('./pages/DiagnosticPage'));
const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/categories" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname.includes('/categor') 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Categories
              </Link>
              <Link 
                to="/brands" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname.includes('/brands') 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Brands
              </Link>
              <Link 
                to="/products" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname.includes('/products') 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Products
              </Link>
              <Link 
                to="/deal" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname.includes('/deal') 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Deals
              </Link>
              <Link 
                to="/prebuild" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname.includes('/prebuild') 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Prebuilds
              </Link>
              <Link 
                to="/contact" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/contact' 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                About
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/cart" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/cart' 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Cart
              </Link>
              <Link 
                to="/profile" 
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/profile' 
                    ? 'text-primary-600' 
                    : 'text-neutral-600 hover:text-primary-600'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>

      <FloatingButtons />
    </div>
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
        children: [
          { 
            index: true, 
            element: <ErrorBoundary><CategoriesPage /></ErrorBoundary>
          }
        ]
      },
      { 
        path: 'category/:slug',
        element: <ErrorBoundary><CategoryProductsPage /></ErrorBoundary>
      },
      { 
        path: 'brands',
        children: [
          { 
            index: true, 
            element: <ErrorBoundary><BrandsPage /></ErrorBoundary>
          },
          { 
            path: ':brand', 
            element: <ErrorBoundary><BrandsPage /></ErrorBoundary>
          }
        ]
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
          { index: true, element: <Deal /> },
          { path: ':id', element: <DealDetail /> }
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
        children: [
          { index: true, element: <Checkout /> },
          { path: 'orders/:id', element: <Checkout /> }
        ]
      },
      {
        path: 'diagnostic',
        element: <ErrorBoundary><DiagnosticPage /></ErrorBoundary>
      }
    ]
  },
  {
    path: '/admin',
    children: [
      { path: 'login', element: <AdminLogin /> },
      // Fast inline-edit products dashboard (default)
      { index: true, element: <AdminDashboardV2 /> },
      { path: 'products', element: <AdminDashboardV2 /> },
      // Bulk product management
      { path: 'bulk-manager', element: <BulkProductManager /> },
      { path: 'bulk-edit', element: <BulkEditPage /> },
      // Old overview-style dashboard
      { path: 'overview', element: <AdminDashboard /> }
    ]
  }
])

export const RouterRoot = () => <RouterProvider router={router} />

export default RouterRoot