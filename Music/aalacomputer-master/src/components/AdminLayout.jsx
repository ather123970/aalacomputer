import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  Plus, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Home,
  Sparkles,
  Shield
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    // Decode token to get user info
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setAdminUser({ email: payload.sub, role: payload.role });
    } catch (error) {
      console.error('Token decode error:', error);
      localStorage.removeItem('aalacomp_admin_token');
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('aalacomp_admin_token');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/admin', color: 'from-blue-500 to-blue-600' },
    { name: 'Products', icon: Package, path: '/admin/products', color: 'from-purple-500 to-purple-600' },
    { name: 'Add Product', icon: Plus, path: '/admin/products/new', color: 'from-green-500 to-green-600' },
    { name: 'Analytics', icon: TrendingUp, path: '/admin/analytics', color: 'from-orange-500 to-orange-600' },
    { name: 'Settings', icon: Settings, path: '/admin/settings', color: 'from-gray-500 to-gray-600' },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", damping: 25, stiffness: 200 } },
    closed: { x: "-100%", transition: { type: "spring", damping: 25, stiffness: 200 } }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg font-medium">Loading Admin Panel...</p>
        </motion.div>
      </div>
    );
  }

  if (!adminUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        variants={sidebarVariants}
        animate={sidebarOpen ? "open" : "closed"}
        className="fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-slate-400">Aala Computer Store</p>
            </div>
          </motion.div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.name}
                variants={itemVariants}
                initial="closed"
                animate="open"
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-700">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-4"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {adminUser.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{adminUser.email}</p>
              <p className="text-xs text-slate-400 capitalize">{adminUser.role}</p>
            </div>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top bar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 h-20 flex items-center justify-between px-6"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-white">
                {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-400">Welcome back, {adminUser.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Premium Admin</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Page content */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;