import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Search, Filter, ChevronDown, X } from 'lucide-react';
import { API_CONFIG } from '../../config/api';

const AdminDealsV2 = ({ showMessage }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Product A Selection
  const [productASearch, setProductASearch] = useState('');
  const [productACategory, setProductACategory] = useState('');
  const [productAResults, setProductAResults] = useState([]);
  const [selectedProductA, setSelectedProductA] = useState(null);
  const [priceA, setPriceA] = useState(0);
  const [showProductADropdown, setShowProductADropdown] = useState(false);
  
  // Product B Selection
  const [productBSearch, setProductBSearch] = useState('');
  const [productBCategory, setProductBCategory] = useState('');
  const [productBResults, setProductBResults] = useState([]);
  const [selectedProductB, setSelectedProductB] = useState(null);
  const [priceB, setPriceB] = useState(0);
  const [showProductBDropdown, setShowProductBDropdown] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [creatingDeal, setCreatingDeal] = useState(false);

  // Load products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/products?limit=5000`, {
        cache: 'no-store'
      });
      const data = await response.json();
      const allProds = Array.isArray(data) ? data : data.products || [];
      
      console.log('Loaded products:', allProds.length);
      setAllProducts(allProds);
      setProducts(allProds);
      
      // Extract categories - filter out empty/null values
      const cats = allProds
        .map(p => p.category)
        .filter(cat => cat && cat.trim() !== '' && cat !== 'undefined' && cat !== 'null');
      
      const uniqueCats = [...new Set(cats)];
      const sortedCats = uniqueCats.sort();
      
      console.log('Categories found:', sortedCats);
      setCategories(sortedCats);
      
      // Load deals
      fetchDeals();
    } catch (error) {
      console.error('Failed to fetch products:', error);
      showMessage('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/deals`, {
        cache: 'no-store'
      });
      const data = await response.json();
      setDeals(Array.isArray(data) ? data : data.deals || []);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
    }
  };

  // Search and filter products for A
  const handleProductASearch = useCallback((search, category) => {
    let filtered = allProducts;
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p => {
        const name = (p.name || p.Name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        return name.includes(term) || brand.includes(term);
      });
    }
    
    setProductAResults(filtered.slice(0, 10));
  }, [allProducts]);

  // Search and filter products for B
  const handleProductBSearch = useCallback((search, category) => {
    let filtered = allProducts;
    
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p => {
        const name = (p.name || p.Name || '').toLowerCase();
        const brand = (p.brand || '').toLowerCase();
        return name.includes(term) || brand.includes(term);
      });
    }
    
    setProductBResults(filtered.slice(0, 10));
  }, [allProducts]);

  // Update search results when search or category changes
  useEffect(() => {
    handleProductASearch(productASearch, productACategory);
  }, [productASearch, productACategory, handleProductASearch]);

  useEffect(() => {
    handleProductBSearch(productBSearch, productBCategory);
  }, [productBSearch, productBCategory, handleProductBSearch]);

  // Select product A
  const selectProductA = (product) => {
    setSelectedProductA(product);
    const price = typeof product.price === 'number' ? product.price : 
                  parseInt(String(product.price).replace(/[^0-9]/g, '')) || 0;
    setPriceA(price);
    setShowProductADropdown(false);
    setProductASearch('');
  };

  // Select product B
  const selectProductB = (product) => {
    setSelectedProductB(product);
    const price = typeof product.price === 'number' ? product.price : 
                  parseInt(String(product.price).replace(/[^0-9]/g, '')) || 0;
    setPriceB(price);
    setShowProductBDropdown(false);
    setProductBSearch('');
  };

  // Create deal
  const createDeal = async () => {
    if (!selectedProductA || !selectedProductB) {
      showMessage('Please select both products', 'error');
      return;
    }

    if (selectedProductA._id === selectedProductB._id) {
      showMessage('Please select different products', 'error');
      return;
    }

    setCreatingDeal(true);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const totalPrice = priceA + priceB;
      const discountedPrice = Math.round(totalPrice * 0.9); // 10% discount
      const savings = totalPrice - discountedPrice;

      const dealData = {
        productA: {
          id: selectedProductA._id || selectedProductA.id,
          name: selectedProductA.name || selectedProductA.Name,
          price: priceA,
          img: selectedProductA.img || selectedProductA.imageUrl || selectedProductA.image
        },
        productB: {
          id: selectedProductB._id || selectedProductB.id,
          name: selectedProductB.name || selectedProductB.Name,
          price: priceB,
          img: selectedProductB.img || selectedProductB.imageUrl || selectedProductB.image
        },
        originalPrice: totalPrice,
        dealPrice: discountedPrice,
        savings: savings,
        discount: 10,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${base}/api/admin/deals`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('aalacomp_admin_token')}`
        },
        body: JSON.stringify(dealData)
      });

      if (response.ok) {
        const newDeal = await response.json();
        setDeals([...deals, newDeal]);
        
        // Reset form
        setSelectedProductA(null);
        setSelectedProductB(null);
        setPriceA(0);
        setPriceB(0);
        setProductASearch('');
        setProductBSearch('');
        setProductACategory('');
        setProductBCategory('');
        
        showMessage('Deal created successfully!', 'success');
      } else {
        showMessage('Failed to create deal', 'error');
      }
    } catch (error) {
      console.error('Failed to create deal:', error);
      showMessage('Error creating deal', 'error');
    } finally {
      setCreatingDeal(false);
    }
  };

  // Delete deal
  const deleteDeal = async (dealId) => {
    if (!window.confirm('Delete this deal?')) return;

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/admin/deals/${dealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('aalacomp_admin_token')}`
        }
      });

      if (response.ok) {
        setDeals(deals.filter(d => d._id !== dealId));
        showMessage('Deal deleted', 'success');
      } else {
        showMessage('Failed to delete deal', 'error');
      }
    } catch (error) {
      console.error('Failed to delete deal:', error);
      showMessage('Error deleting deal', 'error');
    }
  };

  // Add deal to cart
  const addDealToCart = (deal) => {
    const cartItem = {
      id: `deal-${deal._id}`,
      name: `${deal.productA.name} + ${deal.productB.name}`,
      price: deal.dealPrice,
      qty: 1,
      img: deal.productA.img,
      isDeal: true,
      dealId: deal._id,
      products: [deal.productA.id, deal.productB.id]
    };

    const cart = JSON.parse(localStorage.getItem('aala_cart') || '[]');
    const existingItem = cart.find(item => item.id === cartItem.id);
    
    if (existingItem) {
      existingItem.qty += 1;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem('aala_cart', JSON.stringify(cart));
    showMessage('Deal added to cart!', 'success');
  };

  return (
    <div className="space-y-8">
      {/* Create Deal Section */}
      <div className="bg-white border border-blue-200 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Deal</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product A Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Product A</h3>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category ({categories.length})
              </label>
              <select
                value={productACategory}
                onChange={(e) => setProductACategory(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="">All Categories ({allProducts.length})</option>
                {categories && categories.length > 0 ? (
                  categories.map(cat => {
                    const count = allProducts.filter(p => p.category === cat).length;
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({count})
                      </option>
                    );
                  })
                ) : (
                  <option disabled>Loading categories...</option>
                )}
              </select>
            </div>

            {/* Products in Category Dropdown */}
            {productACategory && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Products in {productACategory}
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const product = allProducts.find(p => (p._id || p.id) === e.target.value);
                      if (product) selectProductA(product);
                    }
                  }}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white"
                  defaultValue=""
                >
                  <option value="">Select a product...</option>
                  {productAResults.map(product => (
                    <option key={product._id || product.id} value={product._id || product.id}>
                      {product.name || product.Name} - PKR {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Product
              </label>
              <input
                type="text"
                placeholder="Search by name or brand..."
                value={productASearch}
                onChange={(e) => setProductASearch(e.target.value)}
                onFocus={() => setShowProductADropdown(true)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />

              {/* Dropdown Results */}
              <AnimatePresence>
                {showProductADropdown && productAResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
                  >
                    {productAResults.map(product => (
                      <motion.button
                        key={product._id || product.id}
                        whileHover={{ backgroundColor: '#f0f9ff' }}
                        onClick={() => selectProductA(product)}
                        className="w-full text-left px-4 py-3 border-b border-blue-100 hover:bg-blue-50 transition flex items-center gap-3"
                      >
                        <img
                          src={product.img || product.imageUrl || '/placeholder.svg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => e.target.src = '/placeholder.svg'}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name || product.Name}</p>
                          <p className="text-sm text-gray-600">PKR {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Product A */}
            {selectedProductA && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex gap-4">
                  <img
                    src={selectedProductA.img || selectedProductA.imageUrl || '/placeholder.svg'}
                    alt={selectedProductA.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => e.target.src = '/placeholder.svg'}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedProductA.name || selectedProductA.Name}</p>
                    <p className="text-sm text-gray-600">{selectedProductA.brand || 'No brand'}</p>
                    <div className="mt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={priceA}
                        onChange={(e) => setPriceA(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1 border border-blue-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedProductA(null);
                      setPriceA(0);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Product B Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Product B</h3>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category ({categories.length})
              </label>
              <select
                value={productBCategory}
                onChange={(e) => setProductBCategory(e.target.value)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="">All Categories ({allProducts.length})</option>
                {categories && categories.length > 0 ? (
                  categories.map(cat => {
                    const count = allProducts.filter(p => p.category === cat).length;
                    return (
                      <option key={cat} value={cat}>
                        {cat} ({count})
                      </option>
                    );
                  })
                ) : (
                  <option disabled>Loading categories...</option>
                )}
              </select>
            </div>

            {/* Products in Category Dropdown */}
            {productBCategory && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Products in {productBCategory}
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const product = allProducts.find(p => (p._id || p.id) === e.target.value);
                      if (product) selectProductB(product);
                    }
                  }}
                  className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition bg-white"
                  defaultValue=""
                >
                  <option value="">Select a product...</option>
                  {productBResults.map(product => (
                    <option key={product._id || product.id} value={product._id || product.id}>
                      {product.name || product.Name} - PKR {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Product
              </label>
              <input
                type="text"
                placeholder="Search by name or brand..."
                value={productBSearch}
                onChange={(e) => setProductBSearch(e.target.value)}
                onFocus={() => setShowProductBDropdown(true)}
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
              />

              {/* Dropdown Results */}
              <AnimatePresence>
                {showProductBDropdown && productBResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
                  >
                    {productBResults.map(product => (
                      <motion.button
                        key={product._id || product.id}
                        whileHover={{ backgroundColor: '#f0f9ff' }}
                        onClick={() => selectProductB(product)}
                        className="w-full text-left px-4 py-3 border-b border-blue-100 hover:bg-blue-50 transition flex items-center gap-3"
                      >
                        <img
                          src={product.img || product.imageUrl || '/placeholder.svg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                          onError={(e) => e.target.src = '/placeholder.svg'}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name || product.Name}</p>
                          <p className="text-sm text-gray-600">PKR {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}</p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Selected Product B */}
            {selectedProductB && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex gap-4">
                  <img
                    src={selectedProductB.img || selectedProductB.imageUrl || '/placeholder.svg'}
                    alt={selectedProductB.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => e.target.src = '/placeholder.svg'}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedProductB.name || selectedProductB.Name}</p>
                    <p className="text-sm text-gray-600">{selectedProductB.brand || 'No brand'}</p>
                    <div className="mt-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={priceB}
                        onChange={(e) => setPriceB(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1 border border-blue-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedProductB(null);
                      setPriceB(0);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Deal Summary & Create Button */}
        {selectedProductA && selectedProductB && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Original Price</p>
                <p className="text-2xl font-bold text-gray-900">PKR {(priceA + priceB).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Discount</p>
                <p className="text-2xl font-bold text-red-600">-10%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Deal Price</p>
                <p className="text-2xl font-bold text-green-600">PKR {Math.round((priceA + priceB) * 0.9).toLocaleString()}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={createDeal}
              disabled={creatingDeal}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition font-semibold flex items-center justify-center gap-2"
            >
              {creatingDeal ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating Deal...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Create Deal
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Active Deals Section */}
      <div className="bg-white border border-blue-200 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Deals ({deals.length})</h2>

        {deals.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No deals created yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(deal => (
              <motion.div
                key={deal._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border border-blue-200 rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {/* Deal Card */}
                <div className="p-4 space-y-4">
                  {/* Products */}
                  <div className="space-y-3">
                    {/* Product A */}
                    <div className="flex gap-3 items-center">
                      <img
                        src={deal.productA.img || '/placeholder.svg'}
                        alt={deal.productA.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => e.target.src = '/placeholder.svg'}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{deal.productA.name}</p>
                        <p className="text-xs text-gray-600">PKR {deal.productA.price.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Plus Sign */}
                    <div className="flex justify-center">
                      <span className="text-gray-400 font-bold">+</span>
                    </div>

                    {/* Product B */}
                    <div className="flex gap-3 items-center">
                      <img
                        src={deal.productB.img || '/placeholder.svg'}
                        alt={deal.productB.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => e.target.src = '/placeholder.svg'}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{deal.productB.name}</p>
                        <p className="text-xs text-gray-600">PKR {deal.productB.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="border-t border-blue-200 pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Original:</span>
                      <span className="text-gray-900 line-through">PKR {deal.originalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-semibold">Deal Price:</span>
                      <span className="text-xl font-bold text-green-600">PKR {deal.dealPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Save:</span>
                      <span className="text-red-600 font-semibold">PKR {deal.savings.toLocaleString()} (10%)</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-blue-200">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addDealToCart(deal)}
                      className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-semibold text-sm"
                    >
                      Add to Cart
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteDeal(deal._id)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDealsV2;
