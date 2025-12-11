import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Trash2, ChevronDown } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminDeals = ({ showMessage }) => {
  const [deals, setDeals] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductA, setSelectedProductA] = useState(null);
  const [selectedProductB, setSelectedProductB] = useState(null);
  const [dealDiscount, setDealDiscount] = useState(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      
      // Fetch products
      const prodResponse = await fetch(`${base}/api/products?limit=10000`, {
        cache: 'no-store'
      });
      const prodData = await prodResponse.json();
      const products = Array.isArray(prodData) ? prodData : prodData.products || [];
      setAllProducts(products);

      // Fetch deals
      const dealsResponse = await fetch(`${base}/api/deals`);
      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        setDeals(Array.isArray(dealsData) ? dealsData : dealsData.deals || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showMessage('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProductPrice = (product) => {
    if (!product) return 0;
    if (typeof product.price === 'number') return product.price;
    return parseInt(String(product.price).replace(/[^0-9]/g, '')) || 0;
  };

  const calculateDealPrice = () => {
    if (!selectedProductA || !selectedProductB) return 0;
    const totalPrice = getProductPrice(selectedProductA) + getProductPrice(selectedProductB);
    return Math.round(totalPrice * (1 - dealDiscount / 100));
  };

  const createDeal = async () => {
    if (!selectedProductA || !selectedProductB) {
      showMessage('Please select both products', 'error');
      return;
    }

    if (selectedProductA._id === selectedProductB._id) {
      showMessage('Please select different products', 'error');
      return;
    }

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const priceA = getProductPrice(selectedProductA);
      const priceB = getProductPrice(selectedProductB);
      const totalPrice = priceA + priceB;
      const dealPrice = calculateDealPrice();

      const dealData = {
        productA: selectedProductA._id || selectedProductA.id,
        productB: selectedProductB._id || selectedProductB.id,
        nameA: selectedProductA.name || selectedProductA.Name,
        nameB: selectedProductB.name || selectedProductB.Name,
        priceA: priceA,
        priceB: priceB,
        originalPrice: totalPrice,
        dealPrice: dealPrice,
        discount: dealDiscount,
        active: true,
        createdAt: new Date()
      };

      const response = await fetch(`${base}/api/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealData)
      });

      if (response.ok) {
        showMessage('Deal created successfully!', 'success');
        setSelectedProductA(null);
        setSelectedProductB(null);
        setDealDiscount(10);
        fetchData();
      } else {
        showMessage('Failed to create deal', 'error');
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
      showMessage('Error creating deal', 'error');
    }
  };

  const deleteDeal = async (dealId) => {
    if (!window.confirm('Delete this deal?')) return;

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/deals/${dealId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeals(deals.filter(d => d._id !== dealId));
        showMessage('Deal deleted', 'success');
      }
    } catch (error) {
      console.error('Failed to delete deal:', error);
      showMessage('Error deleting deal', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Create Deal Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Plus className="text-blue-400" />
          <h2 className="text-2xl font-bold">Create Combo Deal</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Product A */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Product A</label>
            <div className="relative">
              <select
                onChange={(e) => {
                  const product = allProducts.find(p => (p._id || p.id) === e.target.value);
                  setSelectedProductA(product);
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Select Product A</option>
                {allProducts.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name || p.Name} - PKR {getProductPrice(p).toLocaleString()}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={20} />
            </div>
            {selectedProductA && (
              <div className="mt-3 p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-400">Price:</p>
                <p className="text-lg font-bold text-green-400">PKR {getProductPrice(selectedProductA).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Product B */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Product B</label>
            <div className="relative">
              <select
                onChange={(e) => {
                  const product = allProducts.find(p => (p._id || p.id) === e.target.value);
                  setSelectedProductB(product);
                }}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="">Select Product B</option>
                {allProducts.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name || p.Name} - PKR {getProductPrice(p).toLocaleString()}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={20} />
            </div>
            {selectedProductB && (
              <div className="mt-3 p-3 bg-gray-700 rounded">
                <p className="text-sm text-gray-400">Price:</p>
                <p className="text-lg font-bold text-green-400">PKR {getProductPrice(selectedProductB).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Discount & Calculation */}
        {selectedProductA && selectedProductB && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-700 rounded-lg p-6 mb-6 border border-gray-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Discount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Discount %</label>
                <input
                  type="number"
                  value={dealDiscount}
                  onChange={(e) => setDealDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Original Price */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Original Total Price</p>
                <p className="text-2xl font-bold text-gray-300">
                  PKR {(getProductPrice(selectedProductA) + getProductPrice(selectedProductB)).toLocaleString()}
                </p>
              </div>

              {/* Deal Price */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Deal Price ({dealDiscount}% OFF)</p>
                <p className="text-2xl font-bold text-yellow-400">
                  PKR {calculateDealPrice().toLocaleString()}
                </p>
              </div>
            </div>

            {/* Savings */}
            <div className="border-t border-gray-600 pt-4">
              <p className="text-sm text-gray-400 mb-1">Customer Saves</p>
              <p className="text-3xl font-bold text-green-400">
                PKR {((getProductPrice(selectedProductA) + getProductPrice(selectedProductB)) - calculateDealPrice()).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={createDeal}
          disabled={!selectedProductA || !selectedProductB}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Create Deal
        </motion.button>
      </motion.div>

      {/* Active Deals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Star className="text-yellow-400" />
          <h2 className="text-2xl font-bold">Active Deals ({deals.length})</h2>
        </div>

        {deals.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No deals created yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal, idx) => (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-700 border border-gray-600 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-400">Product A</p>
                    <p className="font-bold text-white">{deal.nameA}</p>
                  </div>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                    PKR {deal.priceA?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-400">Product B</p>
                    <p className="font-bold text-white">{deal.nameB}</p>
                  </div>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                    PKR {deal.priceB?.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-600 pt-3 mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Original:</span>
                    <span className="text-gray-300 line-through">PKR {deal.originalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Deal Price ({deal.discount}% OFF):</span>
                    <span className="text-xl font-bold text-yellow-400">PKR {deal.dealPrice?.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteDeal(deal._id)}
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition"
                >
                  <Trash2 size={16} />
                  Delete Deal
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDeals;
