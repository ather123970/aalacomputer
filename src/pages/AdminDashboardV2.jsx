/**
 * AdminDashboardV2 - Optimized for Continuous 50-Product Workflow
 * 
 * Features:
 * - Always shows exactly 50 unedited products
 * - Auto-fetches next product when one is updated
 * - Separate "Updated Products" section
 * - No pagination (removed page numbers)
 * - Fast loading and smooth updates
 * - Never repeats updated products
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, 
  Filter, 
  Package,
  LogOut,
  Zap, CheckCircle, Clock, AlertCircle, Trash2, Copy, RefreshCw
} from 'lucide-react';
import { apiCall } from '../config/api';
import { ProductImageCell } from '../components/ProductImageCell';

const PRODUCT_WINDOW = 50; // Always show exactly 50 products

const AdminDashboardV2 = () => {
  const navigate = useNavigate();

  // Core state
  const [products, setProducts] = useState([]); // Current 50 unedited products
  const [updatedProducts, setUpdatedProducts] = useState([]); // Products that have been updated
  const [totalUnedited, setTotalUnedited] = useState(0); // Total unedited products in DB
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Editing state
  const [copiedId, setCopiedId] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());
  const [originalImages, setOriginalImages] = useState({}); // Track original images for undo
  const [brokenImages, setBrokenImages] = useState(new Set()); // Track products with broken images

  // Track which products have been updated (to avoid re-fetching them)
  const updatedProductIds = useRef(new Set());
  
  // Track current page for infinite loading
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const loaderRef = useRef(null);
  
  // Batch selection dropdown
  const [startingBatch, setStartingBatch] = useState(1);
  const [totalBatches, setTotalBatches] = useState(1);
  
  // Failed products state
  const [failedProducts, setFailedProducts] = useState(new Set());
  const [autoExtracting, setAutoExtracting] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [selectedFailedProduct, setSelectedFailedProduct] = useState(null);
  
  // Missing/Placeholder images state
  const [missingImageProducts, setMissingImageProducts] = useState([]);
  const [loadingMissingImages, setLoadingMissingImages] = useState(false);
  const [showMissingImagesTab, setShowMissingImagesTab] = useState(false);
  const [selectedMissingProduct, setSelectedMissingProduct] = useState(null);
  const [missingImageUrl, setMissingImageUrl] = useState('');
  
  // All products without images state
  const [allProductsWithoutImages, setAllProductsWithoutImages] = useState([]);
  const [loadingAllMissingImages, setLoadingAllMissingImages] = useState(false);
  const [showAllMissingImagesSection, setShowAllMissingImagesSection] = useState(false);
  
  // Category Manager State
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [productsToUpdate, setProductsToUpdate] = useState([]);
  const [updatingProductId, setUpdatingProductId] = useState(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('aalacomp_admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadInitialData();
  }, [navigate]);

  // Infinite scroll - load more when user scrolls to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreProducts && !isLoadingMore && !loading) {
          console.log('📍 Reached bottom - loading more products');
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMoreProducts, isLoadingMore, loading, currentPage, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Reload when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset page when filters change
    setProducts([]); // Clear products
    setUpdatedProducts([]); // Clear updated products
    updatedProductIds.current.clear(); // Clear updated IDs
    loadInitialData();
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load categories
      const catsResp = await apiCall('/api/admin/categories').catch(() => 
        apiCall('/api/categories').catch(() => ({ categories: [] }))
      );
      
      const catsList = Array.isArray(catsResp) ? catsResp : (catsResp.categories || []);
      setCategories(catsList.map(c => typeof c === 'string' ? c : c.name).filter(Boolean));
      
      // Load first 50 unedited products
      await loadNextBatch();
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load ALL products without images (no limit)
  const loadAllProductsWithoutImages = async () => {
    setLoadingAllMissingImages(true);
    try {
      // Fetch ALL products with no limit
      const data = await apiCall('/api/products?limit=999999');
      
      let allProducts = [];
      if (Array.isArray(data)) {
        allProducts = data;
      } else if (data && data.products && Array.isArray(data.products)) {
        allProducts = data.products;
      }

      // Filter products without images
      const productsWithoutImages = allProducts.filter(p => {
        const hasImage = p.img || p.imageUrl || p.image || p.image_url || 
                        p.imageLink || p.image_link || p.photo || p.photoUrl ||
                        p.photo_url || p.picture || p.pictureUrl || p.picture_url ||
                        p.thumbnail || p.thumbnailUrl || p.thumbnail_url || 
                        p.src || p.url || p.imageUrl1 || p.image1 || p.image1_url;
        return !hasImage || hasImage.trim() === '';
      });

      setAllProductsWithoutImages(productsWithoutImages);
      console.log(`📊 Found ${productsWithoutImages.length} products without images out of ${allProducts.length} total`);
    } catch (err) {
      setError('Failed to load products without images: ' + (err.message || err));
      console.error(err);
    } finally {
      setLoadingAllMissingImages(false);
    }
  };

  const loadNextBatch = async (pageToLoad = null, isManualBatchSelection = false) => {
    try {
      setLoading(true);
      
      // Use provided page or current page
      const pageNum = pageToLoad !== null ? pageToLoad : currentPage;
      
      console.log('📍 loadNextBatch called with pageNum:', pageNum, 'isManualBatchSelection:', isManualBatchSelection);
      console.log('📊 Expected to load products:', (pageNum - 1) * PRODUCT_WINDOW + 1, 'to', pageNum * PRODUCT_WINDOW);
      
      // Build query to fetch unedited products
      const params = new URLSearchParams({
        limit: PRODUCT_WINDOW,
        page: pageNum,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder })
      });

      console.log('🔗 API URL:', `/api/admin/products?${params}`);
      const data = await apiCall(`/api/admin/products?${params}`);
      
      let productsList = [];
      let totalProducts = 0;
      
      if (data && data.products && Array.isArray(data.products)) {
        productsList = data.products;
        totalProducts = data.total || data.products.length;
      } else if (Array.isArray(data)) {
        productsList = data;
        totalProducts = data.length;
      }

      console.log('✅ Loaded products:', productsList.length, 'Total unedited:', totalProducts, 'Page:', pageNum);

      // Filter out already-updated products
      const uneditedProducts = productsList.filter(p => {
        const id = p._id || p.id;
        return !updatedProductIds.current.has(id);
      });

      // Ensure we have exactly 50 (or all remaining if less than 50)
      const productsToShow = uneditedProducts.slice(0, PRODUCT_WINDOW);

      // REPLACE products if:
      // 1. Initial load (pageNum === 1)
      // 2. Manual batch selection from dropdown
      if (pageNum === 1 || isManualBatchSelection) {
        setProducts(productsToShow);
        console.log('🔄 REPLACED products with batch', pageNum);
      } else {
        // APPEND products (for infinite scroll on page > 1)
        setProducts(prev => [...prev, ...productsToShow]);
        console.log('➕ APPENDED products from batch', pageNum);
      }
      
      // Update current page if we loaded a different page
      if (pageToLoad !== null) {
        setCurrentPage(pageToLoad);
      }
      
      // Check if there are more products to load
      const totalLoaded = pageNum * PRODUCT_WINDOW;
      setHasMoreProducts(totalLoaded < totalProducts);
      
      // Calculate total batches
      const batches = Math.ceil(totalProducts / PRODUCT_WINDOW);
      setTotalBatches(batches);
      
      setTotalUnedited(totalProducts);
      setError('');
    } catch (err) {
      setError('Failed to load products: ' + (err.message || err));
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductUpdate = async (productId, imageUrl) => {
    try {
      // Find the product
      const product = products.find(p => (p._id || p.id) === productId);
      if (!product) return;

      // Save original image for undo
      setOriginalImages(prev => ({
        ...prev,
        [productId]: product.img || product.imageUrl || ''
      }));

      // INSTANTLY update the product in the list with new image (NO WAIT)
      const updatedProduct = {
        ...product,
        img: imageUrl.trim(),
        imageUrl: imageUrl.trim()
      };
      
      // Update product in list immediately (show image instantly)
      setProducts(prev => prev.map(p => 
        (p._id || p.id) === productId ? updatedProduct : p
      ));

      // Show success immediately (don't wait for database)
      setSuccess('✅ Image updated!');
      setTimeout(() => setSuccess(''), 2000);

      // Mark as updated
      updatedProductIds.current.add(productId);

      // Update in database IN BACKGROUND (don't await, don't block UI)
      apiCall(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProduct)
      }).catch(err => {
        console.error('Background save error:', err);
        setError('⚠️ Failed to save to database');
        setTimeout(() => setError(''), 3000);
      });

    } catch (err) {
      setError('Failed to update product');
      console.error(err);
      setTimeout(() => setError(''), 3000);
    }
  };

  // Auto-search for broken images
  const handleBrokenImage = async (productId) => {
    const product = products.find(p => (p._id || p.id) === productId);
    if (!product) return;
    
    setBrokenImages(prev => new Set([...prev, productId]));
    
    try {
      const name = product.name || product.title || 'Unnamed';
      const response = await apiCall('/api/admin/extract-image', {
        method: 'POST',
        body: JSON.stringify({ productName: name })
      });
      
      if (response && response.imageUrl) {
        handleProductUpdate(productId, response.imageUrl);
        setFailedProducts(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      } else {
        // Mark as failed if no image found
        setFailedProducts(prev => new Set([...prev, productId]));
      }
    } catch (err) {
      console.error('Error:', err);
      // Mark as failed on error
      setFailedProducts(prev => new Set([...prev, productId]));
    } finally {
      setBrokenImages(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Auto-extract images for ALL products
  const handleAutoExtractAll = async () => {
    setAutoExtracting(true);
    setSuccess('🚀 Starting auto-extract for all products...');
    
    let successCount = 0;
    let failCount = 0;
    const newFailedProducts = new Set();
    
    for (const product of products) {
      const productId = product._id || product.id;
      try {
        const name = product.name || product.title || 'Unnamed';
        const response = await apiCall('/api/admin/extract-image', {
          method: 'POST',
          body: JSON.stringify({ productName: name })
        });
        
        if (response && response.imageUrl) {
          handleProductUpdate(productId, response.imageUrl);
          successCount++;
        } else {
          newFailedProducts.add(productId);
          failCount++;
        }
      } catch (err) {
        console.error('Error extracting image for', product.name, err);
        newFailedProducts.add(productId);
        failCount++;
      }
      
      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setFailedProducts(newFailedProducts);
    setSuccess(`✅ Auto-extract complete! ${successCount} found, ${failCount} failed`);
    setAutoExtracting(false);
    setTimeout(() => setSuccess(''), 4000);
  };

  // Handle manual image URL entry for failed products
  const handleManualImageSubmit = async () => {
    if (!selectedFailedProduct || !manualImageUrl.trim()) {
      setError('Please select a product and enter an image URL');
      return;
    }
    
    try {
      setSavingIds(prev => new Set([...prev, selectedFailedProduct]));
      await handleProductUpdate(selectedFailedProduct, manualImageUrl.trim());
      
      // Remove from failed products
      setFailedProducts(prev => {
        const next = new Set(prev);
        next.delete(selectedFailedProduct);
        return next;
      });
      
      setManualImageUrl('');
      setSelectedFailedProduct(null);
      setSuccess('✅ Image updated manually!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update image');
      console.error(err);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(selectedFailedProduct);
        return next;
      });
    }
  };

  // Fetch all products with missing or placeholder images
  const loadMissingImageProducts = async () => {
    setLoadingMissingImages(true);
    try {
      const response = await apiCall('/api/admin/products-missing-images', {
        method: 'GET'
      });
      
      if (response && Array.isArray(response)) {
        setMissingImageProducts(response);
        setSuccess(`✅ Found ${response.length} products with missing/placeholder images`);
        setTimeout(() => setSuccess(''), 3000);
      } else if (response && response.products && Array.isArray(response.products)) {
        setMissingImageProducts(response.products);
        setSuccess(`✅ Found ${response.products.length} products with missing/placeholder images`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error loading missing images:', err);
      setError('Failed to load products with missing images');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingMissingImages(false);
    }
  };

  // Handle manual image submission for missing image products
  const handleMissingImageSubmit = async () => {
    if (!selectedMissingProduct || !missingImageUrl.trim()) {
      setError('Please select a product and enter an image URL');
      return;
    }
    
    try {
      setSavingIds(prev => new Set([...prev, selectedMissingProduct._id]));
      await handleProductUpdate(selectedMissingProduct._id, missingImageUrl.trim());
      
      // Remove from missing products list
      setMissingImageProducts(prev => prev.filter(p => p._id !== selectedMissingProduct._id));
      
      setMissingImageUrl('');
      setSelectedMissingProduct(null);
      setSuccess('✅ Image updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update image');
      console.error(err);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(selectedMissingProduct._id);
        return next;
      });
    }
  };

  // Undo image change
  const handleUndoImage = async (productId) => {
    try {
      const product = products.find(p => (p._id || p.id) === productId);
      if (!product) return;

      const originalImage = originalImages[productId];
      if (!originalImage) {
        setError('No previous image to restore');
        return;
      }

      setSavingIds(prev => new Set([...prev, productId]));
      setSuccess('⏳ Restoring original image...');

      // Restore original image
      const restoredProduct = {
        ...product,
        img: originalImage,
        imageUrl: originalImage
      };

      // Update in list immediately
      setProducts(prev => prev.map(p => 
        (p._id || p.id) === productId ? restoredProduct : p
      ));

      // Update in database
      await apiCall(`/api/admin/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(restoredProduct)
      });

      // Clear original image from tracking
      setOriginalImages(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });

      setSuccess('✅ Image restored!');
      setTimeout(() => setSuccess(''), 2000);

    } catch (err) {
      setError('Failed to restore image');
      console.error(err);
      setTimeout(() => setError(''), 3000);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const fetchNextProduct = async () => {
    try {
      // Fetch more products to fill the 50-product window
      const params = new URLSearchParams({
        limit: 10, // Fetch 10 at a time to find unedited ones
        page: 1,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder })
      });

      const data = await apiCall(`/api/admin/products?${params}`);

      let productsList = [];
      if (data && data.products && Array.isArray(data.products)) {
        productsList = data.products;
      } else if (Array.isArray(data)) {
        productsList = data;
      }

      // Find first unedited product not already in list
      const currentIds = new Set(products.map(p => p._id || p.id));
      const nextProduct = productsList.find(p => {
        const id = p._id || p.id;
        return !updatedProductIds.current.has(id) && !currentIds.has(id);
      });

      if (nextProduct) {
        setProducts(prev => [...prev, nextProduct]);
      }
    } catch (err) {
      console.error('Failed to fetch next product:', err);
    }
  };

  // Load more products (for infinite scroll)
  const loadMoreProducts = async () => {
    if (isLoadingMore || !hasMoreProducts) return;
    
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log('� Auto-loading page', nextPage);
      await loadNextBatch(nextPage);
    } catch (err) {
      console.error('Error loading more products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aalacomp_admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Manager</h1>
            <div className="flex gap-6 mt-2 text-sm">
              <span className="text-gray-600">
                <span className="font-bold text-blue-600">{products.length}</span> Current
              </span>
              <span className="text-gray-600">
                <span className="font-bold text-green-600">{updatedProducts.length}</span> Updated
              </span>
              <span className="text-gray-600">
                <span className="font-bold text-purple-600">{totalUnedited}</span> Total Unedited
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const base = 'http://localhost:10000';
                fetch(`${base}/api/products?limit=999999`)
                  .then(r => r.json())
                  .then(json => {
                    let products = Array.isArray(json) ? json : (json.products || []);
                    setProductsToUpdate(products);
                    setShowCategoryManager(true);
                  })
                  .catch(err => console.error('Error loading products:', err));
              }}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 flex items-center gap-2 font-semibold"
            >
              ⚡ Quick Category Update
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border-2 border-orange-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">⚡ Quick Category Update</h2>
              <button
                onClick={() => setShowCategoryManager(false)}
                className="text-white text-2xl hover:opacity-80 transition-opacity"
              >
                ✕
              </button>
            </div>

            {/* Products List */}
            <div className="overflow-y-auto flex-1 p-6">
              {productsToUpdate.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-green-400 font-semibold">✓ All products updated!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {productsToUpdate.map((product) => (
                    <div
                      key={product._id || product.id}
                      className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex items-center gap-4 hover:border-orange-500/50 transition-colors"
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
                        <img
                          src={product.img || product.imageUrl || product.image || '/placeholder.svg'}
                          alt={product.Name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-blue-400 truncate">{product.Name}</h3>
                        <p className="text-sm text-gray-400">Current: {product.category || 'No Category'}</p>
                      </div>

                      {/* Category Dropdown */}
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            setUpdatingProductId(product._id || product.id);
                            const base = 'http://localhost:10000';
                            fetch(`${base}/api/products/${product._id || product.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ category: e.target.value })
                            })
                              .then(r => {
                                if (r.ok) {
                                  setProductsToUpdate(prev => prev.filter(p => (p._id || p.id) !== (product._id || product.id)));
                                }
                              })
                              .catch(err => console.error('Error updating category:', err))
                              .finally(() => setUpdatingProductId(null));
                          }}
                          disabled={updatingProductId === (product._id || product.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">📂 Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        {updatingProductId === (product._id || product.id) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-800/50 border-t border-gray-700 p-4 text-center">
              <p className="text-sm text-gray-400">
                {productsToUpdate.length} products remaining • Products auto-remove after category is saved
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jump to Batch</label>
              <select
                value={startingBatch}
                onChange={(e) => {
                  const batch = parseInt(e.target.value);
                  setStartingBatch(batch);
                  setCurrentPage(batch);
                  setProducts([]); // Clear current products
                  loadNextBatch(batch, true); // Pass true for manual batch selection
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: totalBatches }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Batch {i + 1} (Products {(i * PRODUCT_WINDOW) + 1}-{Math.min((i + 1) * PRODUCT_WINDOW, totalUnedited)})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Auto Extract All Button */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={handleAutoExtractAll}
              disabled={autoExtracting || products.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Zap className="w-4 h-4" />
              {autoExtracting ? 'Auto-Extracting...' : 'Auto Extract All Images'}
            </button>
            
            <button
              onClick={() => {
                if (showMissingImagesTab) {
                  setShowMissingImagesTab(false);
                } else {
                  setShowMissingImagesTab(true);
                  loadMissingImageProducts();
                }
              }}
              disabled={loadingMissingImages}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <AlertCircle className="w-4 h-4" />
              {loadingMissingImages ? 'Loading...' : `Missing Images (${missingImageProducts.length})`}
            </button>
            
            {failedProducts.size > 0 && (
              <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                ⚠️ {failedProducts.size} Failed - Fix Below
              </div>
            )}
          </div>
        </div>

        {/* Failed Products Section */}
        {failedProducts.size > 0 && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-red-700 mb-4">
              ⚠️ Failed Products ({failedProducts.size})
            </h3>
            <p className="text-red-600 mb-4">These products couldn't find images automatically. Please manually enter image URLs below.</p>
            
            <div className="space-y-4">
              {/* Product Selector */}
              <div>
                <label className="block text-sm font-medium text-red-700 mb-2">Select Product</label>
                <select
                  value={selectedFailedProduct || ''}
                  onChange={(e) => {
                    setSelectedFailedProduct(e.target.value || null);
                    setManualImageUrl('');
                  }}
                  className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">-- Select a failed product --</option>
                  {Array.from(failedProducts).map(productId => {
                    const product = products.find(p => (p._id || p.id) === productId);
                    return (
                      <option key={productId} value={productId}>
                        {product?.name || product?.title || 'Unknown'}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* Image URL Input */}
              {selectedFailedProduct && (
                <div>
                  <label className="block text-sm font-medium text-red-700 mb-2">Image URL</label>
                  <input
                    type="text"
                    value={manualImageUrl}
                    onChange={(e) => setManualImageUrl(e.target.value)}
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-red-600 mt-2">💡 Tip: You can paste URLs from Google Images, Amazon, or any website</p>
                </div>
              )}
              
              {/* Submit Button */}
              {selectedFailedProduct && manualImageUrl.trim() && (
                <button
                  onClick={handleManualImageSubmit}
                  disabled={savingIds.has(selectedFailedProduct)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium"
                >
                  {savingIds.has(selectedFailedProduct) ? '⏳ Saving...' : '✅ Save Image'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Missing/Placeholder Images Section */}
        {showMissingImagesTab && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-orange-700 mb-4">
              🖼️ Products with Missing/Placeholder Images ({missingImageProducts.length})
            </h3>
            <p className="text-orange-600 mb-4">These products have missing or placeholder images. Please manually enter image URLs below.</p>
            
            {loadingMissingImages ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-orange-600">Searching for products with missing images...</p>
                </div>
              </div>
            ) : missingImageProducts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-lg">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">🎉 All products have images!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {missingImageProducts.map(product => (
                    <div
                      key={product._id}
                      onClick={() => {
                        setSelectedMissingProduct(product);
                        setMissingImageUrl('');
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedMissingProduct?._id === product._id
                          ? 'border-orange-600 bg-orange-100'
                          : 'border-orange-200 bg-white hover:border-orange-400'
                      }`}
                    >
                      <p className="font-medium text-gray-900 truncate">{product.name || product.title || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {product._id}</p>
                      <p className="text-xs text-orange-600 mt-2">
                        Current: {product.img ? product.img.substring(0, 40) + '...' : 'No image'}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Image URL Input */}
                {selectedMissingProduct && (
                  <div className="bg-white p-6 rounded-lg border-2 border-orange-300">
                    <h4 className="font-bold text-gray-900 mb-4">
                      📝 Editing: {selectedMissingProduct.name || selectedMissingProduct.title}
                    </h4>
                    
                    <input
                      type="text"
                      value={missingImageUrl}
                      onChange={(e) => setMissingImageUrl(e.target.value)}
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      className="w-full px-4 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
                    />
                    <p className="text-xs text-orange-600 mb-4">💡 Tip: You can paste URLs from Google Images, Amazon, or any website</p>
                    
                    {missingImageUrl.trim() && (
                      <button
                        onClick={handleMissingImageSubmit}
                        disabled={savingIds.has(selectedMissingProduct._id)}
                        className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-medium"
                      >
                        {savingIds.has(selectedMissingProduct._id) ? '⏳ Saving...' : '✅ Save Image'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Products Without Images Section */}
        <div className="bg-orange-50 rounded-lg shadow-sm border border-orange-200 mb-8">
          <div className="p-4 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-orange-900">
                  🖼️ Products Without Images
                </h2>
                <p className="text-sm text-orange-700 mt-1">
                  {allProductsWithoutImages.length > 0 
                    ? `${allProductsWithoutImages.length} products need images`
                    : 'Click "Load All" to fetch all products without images'}
                </p>
              </div>
              <button
                onClick={loadAllProductsWithoutImages}
                disabled={loadingAllMissingImages}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-semibold transition-all"
              >
                {loadingAllMissingImages ? '⏳ Loading...' : '📥 Load All'}
              </button>
            </div>
          </div>

          {loadingAllMissingImages ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-orange-700">Fetching all products without images...</p>
              </div>
            </div>
          ) : allProductsWithoutImages.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <p className="text-orange-700 text-lg">No products without images</p>
              <p className="text-orange-600 text-sm mt-2">All products have images! 🎉</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-100 border-b border-orange-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-orange-900">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-orange-900">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-orange-900">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-orange-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200">
                  {allProductsWithoutImages.map((product) => {
                    const productId = product._id || product.id;
                    return (
                      <tr key={productId} className="hover:bg-orange-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name || product.Name || product.title || 'Unnamed'}
                          </p>
                          <p className="text-xs text-gray-500">{productId}</p>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded">
                            {product.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          PKR {Number(product.price || product.priceAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => navigate(`/products/${productId}`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-semibold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Current Products - Infinite Scroll */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              All Products ({products.length} loaded)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              📜 Scroll to load more products automatically. {hasMoreProducts ? `${totalUnedited - products.length} more to load` : 'All products loaded!'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No products to update</p>
              <p className="text-gray-500 text-sm mt-2">All products have been updated!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product, index) => {
                    const productId = product._id || product.id;
                    const isSaving = savingIds.has(productId);
                    // Unique key combining ID and index to prevent duplicates
                    const uniqueKey = `${productId}-${index}`;

                    return (
                      <motion.tr
                        key={uniqueKey}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ProductImageCell product={product} productId={productId} onBrokenImage={handleBrokenImage} isSearching={brokenImages.has(productId)} />
                            
                            {/* Auto Button - Right next to image */}
                            <button
                              onClick={async () => {
                                const name = product.name || product.title || 'Unnamed';
                                
                                setSuccess('🔍 Searching...');
                                
                                try {
                                  // Call backend to extract image from Google Images
                                  const response = await apiCall('/api/admin/extract-image', {
                                    method: 'POST',
                                    body: JSON.stringify({ productName: name })
                                  });
                                  
                                  if (response && response.imageUrl) {
                                    // Update product with the image URL (no await, instant)
                                    handleProductUpdate(productId, response.imageUrl);
                                  } else {
                                    setError('❌ No image found');
                                    setTimeout(() => setError(''), 2000);
                                  }
                                } catch (err) {
                                  console.error('Error:', err);
                                  setError('❌ Error: ' + err.message);
                                  setTimeout(() => setError(''), 2000);
                                }
                              }}
                              disabled={isSaving}
                              className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all duration-200 transform flex-shrink-0 ${
                                isSaving
                                  ? 'bg-green-100 text-green-700 border-2 border-green-400 scale-105 shadow-md'
                                  : 'bg-blue-100 text-blue-700 border-2 border-blue-400 hover:bg-blue-200 hover:scale-105 active:scale-95'
                              }`}
                              title="Auto-extract image from Google"
                            >
                              {isSaving ? (
                                <>
                                  <div className="w-2 h-2 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Extracting...</span>
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3 h-3" />
                                  <span>Auto</span>
                                </>
                              )}
                            </button>
                            
                            {/* Undo Button - Next to Auto */}
                            {originalImages[productId] && (
                              <button
                                onClick={() => handleUndoImage(productId)}
                                disabled={isSaving}
                                className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-all duration-200 transform flex-shrink-0 bg-orange-100 text-orange-700 border-2 border-orange-400 hover:bg-orange-200 hover:scale-105 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
                                title="Undo image change"
                              >
                                <span>↶ Undo</span>
                              </button>
                            )}
                            
                            {/* Product Info */}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {product.name || product.title || 'Unnamed'}
                              </p>
                              <p className="text-xs text-gray-500">{productId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {product.category || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          PKR {Number(product.price || 0).toLocaleString()}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Infinite Scroll Loader */}
        {hasMoreProducts && (
          <div ref={loaderRef} className="flex items-center justify-center py-12">
            <div className="text-center">
              {isLoadingMore && (
                <>
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading more products...</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Updated Products Section */}
        {updatedProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-green-50">
              <h2 className="text-xl font-bold text-green-900">
                ✅ Updated Products ({updatedProducts.length})
              </h2>
              <p className="text-sm text-green-700 mt-1">
                These products have been successfully updated and will not appear again.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {updatedProducts.map((product) => (
                    <tr key={product._id || product.id} className="bg-green-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.img || product.imageUrl ? (
                              <img
                                src={product.img || product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name || product.title || 'Unnamed'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded">
                          {product.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        PKR {Number(product.price || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                          <CheckCircle className="w-4 h-4" />
                          Updated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardV2;
