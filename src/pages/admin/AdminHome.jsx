import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Folder, Tag, Cpu, Target, LayoutDashboard, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';
import ProductsManagement from './ProductsManagement';
import CategoriesManagement from './CategoriesManagement';
import BrandsManagement from './BrandsManagement';
import PrebuildsManagement from './PrebuildsManagement';
import DealsManagement from './DealsManagement';

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'categories', name: 'Categories', icon: Folder },
    { id: 'brands', name: 'Brands', icon: Tag },
    { id: 'prebuilds', name: 'Prebuilds', icon: Cpu },
    { id: 'deals', name: 'Deals', icon: Target },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <ProductsManagement />;
      case 'categories':
        return <CategoriesManagement />;
      case 'brands':
        return <BrandsManagement />;
      case 'prebuilds':
        return <PrebuildsManagement />;
      case 'deals':
        return <DealsManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">Aala Computer Store</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.removeItem('aalacomp_admin_token');
                navigate('/admin/login');
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 overflow-x-auto pb-px -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Help Banner */}
        {activeTab !== 'dashboard' && activeTab !== 'products' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">?</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Quick Guide</h4>
                {activeTab === 'categories' && (
                  <p className="text-sm text-gray-600">
                    Create categories and subcategories to organize products. Attach brands to enable brand filtering.
                  </p>
                )}
                {activeTab === 'brands' && (
                  <p className="text-sm text-gray-600">
                    Use "Seed Pakistan Brands" to quickly add 60+ common brands, then assign them to categories.
                  </p>
                )}
                {activeTab === 'prebuilds' && (
                  <p className="text-sm text-gray-600">
                    Create pre-built PC configs. Components can be managed via the Products section.
                  </p>
                )}
                {activeTab === 'deals' && (
                  <p className="text-sm text-gray-600">
                    Schedule deals with start/end dates. Set priority to control which deal applies when multiple match.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Render Active Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminHome;
