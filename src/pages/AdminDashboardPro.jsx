import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, BarChart3, Plus, Settings, Menu, X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_CONFIG } from '../config/api';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminProductsTableV2 from '../components/admin/AdminProductsTableV2';
import AdminDealsV2 from '../components/admin/AdminDealsV2';
import AdminCreateProduct from '../components/admin/AdminCreateProduct';
import AdminCategoriesBrands from '../components/admin/AdminCategoriesBrands';

const AdminDashboardPro = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Lazy load components only when tab is active
  const renderContent = () => {
    switch(activeTab) {
      case 'analytics':
        return <AdminAnalytics showMessage={showMessage} />;
      case 'products':
        return <AdminProductsTableV2 showMessage={showMessage} />;
      case 'deals':
        return <AdminDealsV2 showMessage={showMessage} />;
      case 'create':
        return <AdminCreateProduct showMessage={showMessage} />;
      case 'categories':
        return <AdminCategoriesBrands showMessage={showMessage} />;
      default:
        return <AdminAnalytics showMessage={showMessage} />;
    }
  };

  const showMessage = (text, type) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'deals', label: 'Deals', icon: '🎁' },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'categories', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-blue-200 shadow-lg z-40 transition-all duration-300 ${
          !sidebarOpen ? '-translate-x-full' : ''
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Aala</h1>
              <p className="text-xs text-blue-600 font-semibold">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Sidebar Menu */}
        <nav className="p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = typeof tab.icon === 'string' ? null : tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ x: 5 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-blue-50'
                }`}
              >
                {Icon ? <Icon size={20} /> : <span className="text-xl">{tab.icon}</span>}
                <span>{tab.label}</span>
                {activeTab === tab.id && <ChevronRight size={18} className="ml-auto" />}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium shadow-md transition"
          >
            <LogOut size={20} />
            Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-blue-200 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-blue-50 rounded-lg transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500">Manage your store efficiently</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {localStorage.getItem('adminUsername') || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Message Toast */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 px-6 py-3 rounded-lg z-40 shadow-xl font-medium ${
              message.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Content Area */}
        <main className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        />
      )}
    </div>
  );
};

export default AdminDashboardPro;
