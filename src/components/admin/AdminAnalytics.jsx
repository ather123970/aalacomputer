import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, Star, TrendingUp } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminAnalytics = ({ showMessage }) => {
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalValuation: 0,
    topSellers: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      
      // Fetch first 2000 products for fast initial load
      console.log('[Analytics] Fetching first 2000 products...');
      const response = await fetch(`${base}/api/products?limit=2000&page=1`, {
        cache: 'no-store'
      });
      const data = await response.json();
      let products = Array.isArray(data) ? data : data.products || [];
      
      console.log('[Analytics] Fetched initial products count:', products.length);

      // Get total count from response if available
      const totalCount = data.total || products.length;
      console.log('[Analytics] Total products in database:', totalCount);

      // Calculate REAL total products and valuation from initial batch
      const totalProducts = totalCount; // Use actual total from DB
      const totalValuation = products.reduce((sum, p) => {
        const price = typeof p.price === 'number' ? p.price : 
                     parseInt(String(p.price).replace(/[^0-9]/g, '')) || 0;
        return sum + price;
      }, 0);

      console.log('[Analytics] Total Products:', totalProducts, 'Total Valuation:', totalValuation);

      // Get REAL top sellers from initial batch
      const topSellers = products
        .map(p => {
          const price = typeof p.price === 'number' ? p.price : 
                       parseInt(String(p.price).replace(/[^0-9]/g, '')) || 0;
          const stock = p.stock || p.sold || 0;
          return {
            name: p.name || p.Name || 'Unknown Product',
            stock: stock,
            price: price,
            revenue: stock * price,
            id: p._id || p.id
          };
        })
        .filter(p => p.stock > 0)
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5)
        .map((p, idx) => ({
          rank: idx + 1,
          name: p.name,
          sold: p.stock,
          revenue: p.revenue
        }));

      console.log('[Analytics] Top Sellers:', topSellers);

      setAnalytics({ totalProducts, totalValuation, topSellers });
      
      // Load remaining products in background if there are more
      if (products.length < totalCount) {
        console.log('[Analytics] Loading remaining products in background...');
        loadRemainingProducts(base, totalCount, products);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      showMessage('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load remaining products in background
  const loadRemainingProducts = async (base, totalCount, initialProducts) => {
    try {
      const remainingPages = Math.ceil((totalCount - initialProducts.length) / 2000);
      console.log('[Analytics] Loading', remainingPages, 'more pages in background...');
      
      for (let page = 2; page <= remainingPages + 1; page++) {
        await fetch(`${base}/api/products?limit=2000&page=${page}`, {
          cache: 'no-store'
        });
        console.log('[Analytics] Background loaded page', page);
      }
    } catch (error) {
      console.warn('[Analytics] Background loading error:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Products</p>
              <p className="text-4xl font-bold text-blue-400 mt-2">
                {analytics.totalProducts.toLocaleString()}
              </p>
            </div>
            <Package className="w-16 h-16 text-blue-500 opacity-10" />
          </div>
        </motion.div>

        {/* Total Valuation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Valuation</p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                PKR {analytics.totalValuation.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-16 h-16 text-green-500 opacity-10" />
          </div>
        </motion.div>

        {/* Top Seller */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-yellow-500 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Top Seller</p>
              {analytics.topSellers.length > 0 && (
                <>
                  <p className="text-xl font-bold text-yellow-400 mt-2 truncate">
                    {analytics.topSellers[0].name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analytics.topSellers[0].sold} sold
                  </p>
                </>
              )}
            </div>
            <Star className="w-16 h-16 text-yellow-500 opacity-10" />
          </div>
        </motion.div>
      </div>

      {/* Top Sellers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-green-400" />
          <h2 className="text-xl font-bold">Top 5 Sellers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Rank</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Product Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Units Sold</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topSellers.map(seller => (
                <tr key={seller.rank} className="border-b border-gray-700 hover:bg-gray-700 transition">
                  <td className="py-3 px-4 font-bold text-yellow-400">#{seller.rank}</td>
                  <td className="py-3 px-4 text-white">{seller.name}</td>
                  <td className="py-3 px-4 text-blue-400 font-semibold">{seller.sold}</td>
                  <td className="py-3 px-4 text-green-400 font-semibold">
                    PKR {seller.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
