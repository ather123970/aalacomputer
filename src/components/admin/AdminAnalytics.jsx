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
      
      // Fetch only essential data for faster loading
      const response = await fetch(`${base}/api/products?limit=5000`, {
        cache: 'no-store'
      });
      const data = await response.json();
      const products = Array.isArray(data) ? data : data.products || [];

      const totalProducts = products.length;
      const totalValuation = products.reduce((sum, p) => {
        const price = typeof p.price === 'number' ? p.price : 
                     parseInt(String(p.price).replace(/[^0-9]/g, '')) || 0;
        return sum + price;
      }, 0);

      // Get REAL top sellers - sort by actual sold quantity (not random)
      const topSellers = products
        .filter(p => p.sold && p.sold > 0) // Only products with actual sales
        .sort((a, b) => (b.sold || 0) - (a.sold || 0)) // Sort by real sales
        .slice(0, 5)
        .map((p, idx) => {
          const price = typeof p.price === 'number' ? p.price : 
                       parseInt(String(p.price).replace(/[^0-9]/g, '')) || 0;
          const sold = p.sold || 0; // Use actual sold count
          return {
            rank: idx + 1,
            name: p.name || p.Name,
            sold: sold,
            revenue: sold * price
          };
        });

      // If no products with sales, show top 5 by price instead
      if (topSellers.length === 0) {
        const topByPrice = products
          .sort((a, b) => {
            const priceA = typeof a.price === 'number' ? a.price : 
                          parseInt(String(a.price).replace(/[^0-9]/g, '')) || 0;
            const priceB = typeof b.price === 'number' ? b.price : 
                          parseInt(String(b.price).replace(/[^0-9]/g, '')) || 0;
            return priceB - priceA;
          })
          .slice(0, 5)
          .map((p, idx) => {
            const price = typeof p.price === 'number' ? p.price : 
                         parseInt(String(p.price).replace(/[^0-9]/g, '')) || 0;
            return {
              rank: idx + 1,
              name: p.name || p.Name,
              sold: p.sold || 0,
              revenue: (p.sold || 0) * price
            };
          });
        setAnalytics({ totalProducts, totalValuation, topSellers: topByPrice });
      } else {
        setAnalytics({ totalProducts, totalValuation, topSellers });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      showMessage('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
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
              <p className="text-4xl font-bold text-green-400 mt-2">
                PKR {(analytics.totalValuation / 1000000).toFixed(2)}M
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
