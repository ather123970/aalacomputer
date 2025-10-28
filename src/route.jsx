import React from 'react'
import { createBrowserRouter, RouterProvider, Outlet, Link } from 'react-router-dom'
 import FloatingButtons from './pages/FloatingButtons'
import Home from './pages/Home'
import ThemeProvider from './components/ThemeProvider'
import Products from './pages/products'
import ProductDetail from './pages/ProductDetail'
import Deal from './pages/Deal'
import About from './About'
import Cart from './cart'
import Profile from './pages/Profile'
import AuthPage from './pages/Auth'
import Checkout from './pages/Checkout'
import DealDetail from './pages/Dealdetail'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
const Layout = () => (
  <div>
    <nav className="p-4 border-b">
      <Link to="/" className="mr-4">Home</Link>
      <Link to="/products" className="mr-4">Products</Link>
      <Link to="/deal" className="mr-4">Deal</Link>
      <Link to="/contact">About</Link>
    </nav>
    <main>
      <Outlet />
    </main>
  {/* Global floating buttons (WhatsApp) */}
  <FloatingButtons />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path:"/deal/:id" ,element:<DealDetail /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'deal', element: <Deal /> },
  { path: 'contact', element: <About /> },
      { path: 'cart', element: <Cart /> },
      { path: 'profile', element: <Profile /> },
      { path: 'auth', element: <AuthPage /> },
  { path: 'checkout', element: <Checkout /> },
  { path: 'orders/:id', element: <Checkout /> }
      ,{ path: 'admin/login', element: <AdminLogin /> }
    ],
  },
  { 
    path: '/admin', 
    element: <AdminDashboard /> 
  },
])

export const RouterRoot = () => <RouterProvider router={router} />

export default RouterRoot