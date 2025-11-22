import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, TrendingUp, DollarSign, Star, BarChart3, Plus, Settings, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_CONFIG } from '../config/api';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminProducts from '../components/admin/AdminProducts';
import AdminDeals from '../components/admin/AdminDeals';
import AdminCreateProduct from '../components/admin/AdminCreateProduct';
import AdminCategoriesBrands from '../components/admin/AdminCategoriesBrands';

const AdminDashboardNew = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showMessage = (text, type) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'deals', label: 'Deals', icon: Star },
    { id: 'create', label: 'Create Product', icon: Plus },
    { id: 'categories', label: 'Categories', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-400 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Aala Admin</h1>
              <p className="text-blue-100 text-xs">Dashboard</p>
            </div>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition font-medium shadow-lg"
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </div>
      </header>

      {/* Message Toast */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-20 right-4 px-6 py-3 rounded-lg z-40 shadow-xl font-medium ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
              : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-blue-200 sticky top-16 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition whitespace-nowrap font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'analytics' && <AdminAnalytics showMessage={showMessage} />}
          {activeTab === 'products' && <AdminProducts showMessage={showMessage} />}
          {activeTab === 'deals' && <AdminDeals showMessage={showMessage} />}
          {activeTab === 'create' && <AdminCreateProduct showMessage={showMessage} />}
          {activeTab === 'categories' && <AdminCategoriesBrands showMessage={showMessage} />}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2025 Aala Computer Admin Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboardNew;
