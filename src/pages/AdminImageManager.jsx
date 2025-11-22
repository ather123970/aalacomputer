/**
 * ADMIN IMAGE MANAGER
 * 
 * Shows ALL products at once
 * Click to edit image URL
 * Auto-saves to database
 * Real-time updates
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, X, Check, AlertCircle, LogOut, Copy, Clipboard } from 'lucide-react';
import { apiCall } from '../config/api';

const AdminImageManager = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // All products from DB
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingUrl, setEditingUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clipboardUrl, setClipboardUrl] = useState('');
  const [copiedProductName, setCopiedProductName] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // all, updated, notUpdated
  const [updatedProducts, setUpdatedProducts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [copyAnimation, setCopyAnimation] = useState(null);
  const [productsQueue, setProductsQueue] = useState([]); // Queue of products to show
  const PRODUCTS_PER_PAGE = 50; // Show 50 at a time for faster workflow

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadAllProducts();
  }, [navigate]);

  // Load ALL products at once (in batches if needed)
  const loadAllProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading all products from API...');
      
      let allList = [];
      let page = 1;
      let hasMore = true;
      const pageSize = 50; // API returns 50 per request
      const maxPages = 200; // Safety limit to prevent infinite loops (200 * 50 = 10,000 products max)
      
      // Load all products in batches
      while (hasMore && page <= maxPages) {
        console.log(`📄 Loading page ${page}...`);
        const data = await apiCall(`/api/admin/products?limit=${pageSize}&page=${page}`);
        
        console.log(`  Raw response:`, data);
        
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.products)) {
          list = data.products;
        } else if (data && Array.isArray(data.data)) {
          list = data.data;
        } else if (data && data.result && Array.isArray(data.result)) {
          list = data.result;
        } else if (data && data.items && Array.isArray(data.items)) {
          list = data.items;
        }
        
        console.log(`  Page ${page}: Got ${list.length} products`);
        
        if (!list || list.length === 0) {
          console.log(`  No more products, stopping`);
          hasMore = false;
        } else {
          allList = [...allList, ...list];
          page++;
          
          // Stop only if we got 0 products (no more pages)
          // Don't stop based on pageSize since API might return less
          if (list.length === 0) {
            console.log(`  Got 0 products, stopping`);
            hasMore = false;
          }
        }
      }
      
      console.log('✅ Successfully loaded', allList.length, 'total products');
      
      if (!allList || allList.length === 0) {
        console.warn('No products found in response');
        setError('No products found - API returned empty list');
        setAllProducts([]);
        setLoading(false);
        return;
      }
      
      let list = allList;
      
      setAllProducts(list); // Store all products
      
      // Auto-detect products that already have images
      const productsWithImages = new Set();
      const productsNeedingImages = [];
      
      list.forEach(product => {
        if (product.image || product.img || product.imageUrl) {
          productsWithImages.add(product._id);
        } else {
          productsNeedingImages.push(product);
        }
      });
      
      console.log('Categorized:', {
        withImages: productsWithImages.size,
        needingImages: productsNeedingImages.length
      });
      
      setUpdatedProducts(productsWithImages);
      
      // If all products have images, show them in updated section
      // Otherwise show products needing images
      if (productsNeedingImages.length === 0) {
        console.log('⚠️ All products have images! Showing them in Updated section');
        setProducts([]);
      } else {
        // Initialize queue with first 50 products needing images
        const initialQueue = productsNeedingImages.slice(0, PRODUCTS_PER_PAGE);
        setProductsQueue(initialQueue);
        setProducts(initialQueue);
      }
      
      console.log('✅ Load complete:', {
        total: list.length,
        updated: productsWithImages.size,
        needingImages: productsNeedingImages.length,
        productsToShow: productsNeedingImages.length > 0 ? Math.min(PRODUCTS_PER_PAGE, productsNeedingImages.length) : 0
      });
    } catch (err) {
      setError('Failed to load products: ' + err.message);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Copy product name to clipboard with animation (NO ALERTS)
  const copyProductName = async (productName, productId) => {
    try {
      await navigator.clipboard.writeText(productName);
      setCopiedProductName(productId);
      setCopyAnimation(productId);
      
      // Animation duration
      setTimeout(() => {
        setCopyAnimation(null);
      }, 600);
      
      // Clear copied state
      setTimeout(() => {
        setCopiedProductName(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy product name');
    }
  };

  // Paste image URL from clipboard and auto-save (AUTO-LOAD NEXT)
  const pasteAndSaveImageUrl = async (productId) => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText.trim()) {
        console.error('Clipboard is empty');
        return;
      }
      
      setClipboardUrl(clipboardText);
      setEditingUrl(clipboardText);
      
      // Auto-save immediately
      await saveImageUrl(productId, clipboardText);
      
      // Mark as updated
      setUpdatedProducts(prev => {
        const newUpdated = new Set([...prev, productId]);
        
        // Remove updated product from current queue and load next one
        setProducts(prevProducts => {
          const updated = prevProducts.filter(p => p._id !== productId);
          
          // If we have less than 50 products, load more from the queue
          if (updated.length < PRODUCTS_PER_PAGE) {
            const currentIndices = new Set(productsQueue.map(p => p._id));
            const nextProducts = allProducts.filter(p => 
              !newUpdated.has(p._id) && 
              !currentIndices.has(p._id) &&
              p._id !== productId &&
              !(p.image || p.img || p.imageUrl)
            );
            
            const toAdd = nextProducts.slice(0, PRODUCTS_PER_PAGE - updated.length);
            return [...updated, ...toAdd];
          }
          
          return updated;
        });
        
        return newUpdated;
      });
    } catch (err) {
      console.error('Failed to read clipboard');
    }
  };

  // Move to next product automatically
  const moveToNextProduct = () => {
    const filtered = getFilteredProducts();
    const currentIndex = filtered.findIndex(p => p._id === editingId);
    
    if (currentIndex !== -1 && currentIndex < filtered.length - 1) {
      // Move to next product
      const nextProduct = filtered[currentIndex + 1];
      setEditingId(nextProduct._id);
      
      // Auto-copy next product name
      copyProductName(nextProduct.name || nextProduct.Name || 'Unknown', nextProduct._id);
    } else {
      // End of current view, show message
      setSuccess('✅ All products in this view updated! Switch view to continue.');
    }
  };

  // Save image URL to database
  const saveImageUrl = async (productId, imageUrl) => {
    if (!imageUrl.trim()) {
      setError('Image URL cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const product = products.find(p => p._id === productId);
      if (!product) return;

      const updateData = {
        ...product,
        image: imageUrl,
        img: imageUrl,
        imageUrl: imageUrl,
        images: [{ url: imageUrl }]
      };

      await apiCall(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      // Update local state
      setProducts(prev => prev.map(p =>
        p._id === productId
          ? { ...p, image: imageUrl, img: imageUrl, imageUrl: imageUrl }
          : p
      ));

      // Silent operation - no alert
      setEditingId(null);
    } catch (err) {
      setError('Failed to save image');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Get filtered products based on view mode (optimized with useMemo)
  const filteredProducts = useMemo(() => {
    let filtered = [];

    if (viewMode === 'updated') {
      // Show all products with images
      filtered = allProducts.filter(p => updatedProducts.has(p._id));
    } else if (viewMode === 'notUpdated') {
      // Show products needing images (not updated) - ONLY products without images
      filtered = allProducts.filter(p => !updatedProducts.has(p._id));
    } else {
      // Show ONLY products needing images (not products with images)
      filtered = allProducts.filter(p => !updatedProducts.has(p._id));
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(p => {
        const name = (p.name || p.Name || '').toLowerCase();
        return name.includes(searchTerm.toLowerCase());
      });
    }

    return filtered;
  }, [allProducts, updatedProducts, viewMode, searchTerm]);

  // Pagination - show 50 per page
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = useMemo(() => 
    filteredProducts.slice(startIndex, endIndex),
    [filteredProducts, startIndex, endIndex]
  );

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('aalacomp_admin_token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading all products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      {/* Header - Clean & Dark */}
      <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-white">
            📸 Image Manager
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Total: {allProducts.length} | Updated: {updatedProducts.size} | Remaining: {allProducts.length - updatedProducts.size}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-sm font-semibold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* View Mode Tabs - Clean & Dark */}
      <div className="flex gap-2 mb-8 max-w-6xl mx-auto">
        <button
          onClick={() => { setViewMode('all'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded font-semibold text-sm transition ${
            viewMode === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          📋 All ({allProducts.length - updatedProducts.size})
        </button>
        <button
          onClick={() => { setViewMode('updated'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded font-semibold text-sm transition ${
            viewMode === 'updated'
              ? 'bg-green-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          ✅ Updated ({updatedProducts.size})
        </button>
        <button
          onClick={() => { setViewMode('notUpdated'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded font-semibold text-sm transition ${
            viewMode === 'notUpdated'
              ? 'bg-orange-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          ⏳ Not Updated ({allProducts.length - updatedProducts.size})
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-900/50 border border-green-500 rounded-lg flex items-center gap-2">
          <Check size={20} />
          {success}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 max-w-6xl mx-auto">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {/* Products List - Clean & Dark */}
      <div className="space-y-2 max-w-6xl mx-auto">
        {paginatedProducts.map(product => (
          <div
            key={product._id}
            className={`flex items-center gap-3 p-3 rounded border transition ${
              updatedProducts.has(product._id)
                ? 'bg-slate-800 border-green-600'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            {/* Product Image - Small */}
            <div className="flex-shrink-0">
              {product.image || product.img || product.imageUrl ? (
                <img
                  src={product.image || product.img || product.imageUrl}
                  alt={product.name}
                  className="w-14 h-14 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/56?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-14 h-14 bg-slate-700 rounded flex items-center justify-center text-slate-500 text-xs font-medium">
                  No Img
                </div>
              )}
            </div>

            {/* Product Name + Buttons (Inline) */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Two Buttons - VERY CLOSE to Product Name */}
              <div className="flex gap-1 flex-shrink-0">
                {/* Button 1: Copy Product Name with Animation */}
                <button
                  onClick={() => copyProductName(product.name || product.Name || 'Unknown', product._id)}
                  title="Copy product name"
                  className={`p-2 rounded transition-all duration-300 transform ${
                    copyAnimation === product._id
                      ? 'scale-125 bg-green-500'
                      : copiedProductName === product._id
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <Copy size={15} />
                </button>

                {/* Button 2: Replace Image URL (Auto-Save) */}
                <button
                  onClick={() => pasteAndSaveImageUrl(product._id)}
                  disabled={saving}
                  title="Replace image with clipboard URL"
                  className="p-2 rounded transition bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:opacity-50"
                >
                  <Clipboard size={15} />
                </button>
              </div>
              
              {/* Product Name */}
              <h3 className="font-semibold text-sm truncate flex-1">
                {product.name || product.Name || 'Unknown'}
              </h3>
            </div>

            {/* Status */}
            <div className="flex-shrink-0 text-sm font-bold">
              {updatedProducts.has(product._id) ? (
                <span className="text-green-400">✅</span>
              ) : (
                <span className="text-orange-400">⏳</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 max-w-6xl mx-auto">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded transition text-sm"
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-sm">
              Page {currentPage} / {totalPages}
            </span>
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 rounded transition text-sm"
          >
            Next →
          </button>
        </div>
      )}

      {/* Stats - Clean & Dark */}
      <div className="mt-12 p-6 bg-slate-800 border border-slate-700 rounded max-w-6xl mx-auto">
        <h3 className="text-lg font-bold mb-6 text-white">📊 Statistics</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-700 p-4 rounded border border-slate-600">
            <p className="text-slate-400 text-sm font-medium">Total Products</p>
            <p className="text-3xl font-bold text-white mt-2">{allProducts.length || 0}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded border border-slate-600">
            <p className="text-slate-400 text-sm font-medium">Updated</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{updatedProducts.size || 0}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded border border-slate-600">
            <p className="text-slate-400 text-sm font-medium">Remaining</p>
            <p className="text-3xl font-bold text-orange-400 mt-2">{(allProducts.length || 0) - (updatedProducts.size || 0)}</p>
          </div>
          <div className="bg-slate-700 p-4 rounded border border-slate-600">
            <p className="text-slate-400 text-sm font-medium">Progress</p>
            <p className="text-3xl font-bold text-blue-400 mt-2">
              {allProducts.length > 0 ? Math.round((updatedProducts.size / allProducts.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminImageManager;
