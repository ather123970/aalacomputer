import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, FolderTree, Tag, TrendingUp,
  ShoppingBag, DollarSign, Users, BarChart3
} from 'lucide-react';
import ProductsManager from './ProductsManager';
import PrebuildsManager from './PrebuildsManager';
import DealsManager from './DealsManager';
import { apiCall } from '../../config/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalPrebuilds: 0,
    totalDeals: 0,
    totalOrders: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [products, prebuilds, deals] = await Promise.all([
        apiCall('/api/products').catch(() => []),
        apiCall('/api/admin/prebuilds').catch(() => ({ prebuilds: [] })),
        apiCall('/api/admin/deals').catch(() => ({ deals: [] }))
      ]);

      const productsList = Array.isArray(products) ? products : [];
      const prebuildsList = Array.isArray(prebuilds) ? prebuilds : (prebuilds?.prebuilds || []);
      const dealsList = Array.isArray(deals) ? deals : (deals?.deals || []);

      setStats({
        totalProducts: productsList.length,
        totalPrebuilds: prebuildsList.length,
        totalDeals: dealsList.length,
        totalOrders: 0
      });

      // Get top 6 products (you can add logic for most selling)
      setTopProducts(productsList.slice(0, 6));
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'prebuilds', label: 'Prebuilds', icon: ShoppingBag },
    { id: 'deals', label: 'Deals', icon: TrendingUp }
  ];

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 transition-all shadow-lg hover:shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-1">{label}</h3>
      <p className="text-3xl font-bold text-white">{loading ? '...' : value.toLocaleString()}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage your e-commerce store</p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Package}
                  label="Total Products"
                  value={stats.totalProducts}
                  color="from-blue-500 to-blue-600"
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Prebuilds"
                  value={stats.totalPrebuilds}
                  color="from-purple-500 to-purple-600"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Active Deals"
                  value={stats.totalDeals}
                  color="from-pink-500 to-pink-600"
                />
                <StatCard
                  icon={BarChart3}
                  label="Total Orders"
                  value={stats.totalOrders}
                  color="from-green-500 to-green-600"
                />
              </div>

              {/* Most Selling Products */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Top Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topProducts.map(product => (
                    <div
                      key={product._id || product.id}
                      className="bg-gray-900 rounded-xl p-4 border border-gray-700"
                    >
                      <div className="aspect-square bg-gray-800 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={product.imageUrl || product.img || '/placeholder.svg'}
                          alt={product.name || product.Name}
                          className="w-full h-full object-contain"
                          onError={(e) => e.target.src = '/placeholder.svg'}
                        />
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {product.name || product.Name || product.title}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-400 font-bold">
                          PKR {(product.price || 0).toLocaleString()}
                        </span>
                        {product.category && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    <Package className="w-6 h-6" />
                    <span className="font-semibold">Manage Products</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('prebuilds')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all"
                  >
                    <ShoppingBag className="w-6 h-6" />
                    <span className="font-semibold">Manage Prebuilds</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('deals')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all"
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="font-semibold">Manage Deals</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-gray-300">Database connected successfully</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-300">{stats.totalProducts} products loaded from MongoDB</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-gray-300">Admin dashboard ready</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <ProductsManager onStatsUpdate={loadStats} />
          )}

          {activeTab === 'prebuilds' && (
            <PrebuildsManager onStatsUpdate={loadStats} />
          )}

          {activeTab === 'deals' && (
            <DealsManager onStatsUpdate={loadStats} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
