import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_CONFIG } from '../config/api';
import categoryMatcher from '../utils/categoryMatcher';
import Nav from '../nav';

const CATEGORY_GROUPS = categoryMatcher.CATEGORY_GROUPS;

// Get image from product
const getProductImage = (product) => {
  if (!product) return '/placeholder.svg';
  
  const imageFields = [
    'img', 'imageUrl', 'image', 'image_url', 'imageLink', 'image_link',
    'photo', 'photoUrl', 'photo_url', 'picture', 'pictureUrl', 'picture_url',
    'thumbnail', 'thumbnailUrl', 'thumbnail_url', 'src', 'url', 
    'imageUrl1', 'image1', 'image1_url'
  ];
  
  for (const field of imageFields) {
    const value = product[field];
    if (value && typeof value === 'string' && value.trim()) {
      const trimmed = value.trim();
      if (trimmed === 'empty' || trimmed === 'null' || trimmed === 'undefined') continue;
      if (trimmed.startsWith('http') || trimmed.startsWith('data:') || trimmed.startsWith('/')) {
        return trimmed;
      }
    }
  }
  
  return '/placeholder.svg';
};

// Get product name
const getProductName = (product) => {
  if (!product) return 'Unnamed Product';
  
  const nameFields = ['Name', 'name', 'title', 'productName', 'product_name', 'productTitle', 'product_title'];
  
  for (const field of nameFields) {
    const value = product[field];
    if (value && typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed && trimmed !== 'empty' && trimmed !== 'null' && trimmed !== 'undefined') {
        return trimmed;
      }
    }
  }
  
  return 'Unnamed Product';
};

const QuickCategoryUpdate = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, remaining: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [autoProcessing, setAutoProcessing] = useState(false);
  const [totalUpdated, setTotalUpdated] = useState(0);
  const [editingImageId, setEditingImageId] = useState(null);
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        const response = await fetch(`${base}/api/categories`);
        const data = await response.json();
        let cats = Array.isArray(data) ? data : (data.categories || []);
        cats = cats.filter(c => c && c !== 'All').map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${base}/api/products?limit=200&page=${pageNum}`);
      const json = await response.json();
      let prods = Array.isArray(json) ? json : (json.products || []);
      
      // Filter products without category
      const filtered = prods.filter(p => !p.category || p.category === '' || p.category === 'empty' || p.category === null);
      const toShow = filtered.length >= 200 ? filtered.slice(0, 200) : prods.slice(0, 200);
      
      setProducts(toShow);
      setStats({
        total: json.total || prods.length,
        remaining: filtered.length
      });
      
      // Check if there are more products to load
      const hasMoreProducts = json.hasMore || (pageNum * 200 < (json.total || prods.length));
      setHasMore(hasMoreProducts);
      
      console.log('Loaded page', pageNum, ':', toShow.length, 'products');
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-detect category based on product name
  const detectCategory = (product) => {
    const name = (product.Name || product.name || product.title || '').toLowerCase();
    
    // Check each category group for keyword matches
    for (const [key, group] of Object.entries(CATEGORY_GROUPS)) {
      if (key === 'empty') continue; // Skip empty category
      
      // Check if any keyword matches the product name
      for (const keyword of group.keywords) {
        if (name.includes(keyword.toLowerCase())) {
          return group.canonical;
        }
      }
    }
    
    return null; // No category detected
  };

  // Auto-process all current products
  const autoProcessProducts = async () => {
    setAutoProcessing(true);
    let processed = 0;
    let skipped = 0;
    
    try {
      for (const product of products) {
        const detectedCategory = detectCategory(product);
        
        if (detectedCategory) {
          console.log(`Auto-categorizing ${product.Name || product.name} as ${detectedCategory}`);
          
          const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
          const response = await fetch(`${base}/api/product/${product._id || product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: detectedCategory })
          });
          
          if (response.ok) {
            processed++;
            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } else {
          skipped++;
        }
      }
      
      alert(`Auto-processed: ${processed} products\nSkipped: ${skipped} products (couldn't detect category)`);
      
      // Reload products
      loadProducts(page);
    } catch (error) {
      console.error('Error in auto-process:', error);
      alert('Error during auto-process. Check console for details.');
    } finally {
      setAutoProcessing(false);
    }
  };

  // Update product image URL
  const updateImageUrl = async (productId, newImageUrl) => {
    if (!newImageUrl.trim()) {
      alert('Please enter an image URL');
      return;
    }

    setUpdatingId(productId);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      console.log('Updating product image', productId, 'to', newImageUrl);
      
      const response = await fetch(`${base}/api/product/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ img: newImageUrl })
      });

      console.log('Image update response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Image update successful:', result);
        
        // Update the product in the list with new image
        setProducts(prev => prev.map(p => 
          (p._id || p.id) === productId 
            ? { ...p, img: newImageUrl }
            : p
        ));
        
        setEditingImageId(null);
        setEditingImageUrl('');
      } else {
        const error = await response.text();
        console.error('Image update failed:', response.status, error);
        alert('Failed to update image. Check console for details.');
      }
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Error: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const updateCategory = async (productId, newCategory) => {
    if (!newCategory) return;
    
    setUpdatingId(productId);
    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      console.log('Updating product', productId, 'to category', newCategory);
      
      // Use /api/product/:id (singular) not /api/products/:id (plural)
      const response = await fetch(`${base}/api/product/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result);
        
        // Increment total updated count
        setTotalUpdated(prev => prev + 1);
        
        // Remove product from list immediately
        const updatedProducts = products.filter(p => (p._id || p.id) !== productId);
        setProducts(updatedProducts);
        
        // If list is getting low, load next batch
        if (updatedProducts.length < 50 && hasMore) {
          console.log('Loading next batch...');
          loadProducts(page + 1);
          setPage(page + 1);
        }
      } else {
        const error = await response.text();
        console.error('Update failed:', response.status, error);
        alert('Failed to update category. Check console for details.');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error: ' + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">⚡ Quick Category Update</h1>
              <p className="text-gray-400">Categorize products quickly and efficiently</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={autoProcessProducts}
                disabled={autoProcessing || products.length === 0}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                {autoProcessing ? '⏳ Processing...' : '🤖 Auto Categorize'}
              </button>
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Products Shown</p>
              <p className="text-2xl font-bold text-blue-400">{products.length}</p>
            </div>
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Without Category</p>
              <p className="text-2xl font-bold text-orange-400">{stats.remaining}</p>
            </div>
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Total Updated</p>
              <p className="text-2xl font-bold text-purple-400">{totalUpdated}</p>
            </div>
            <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Current Page</p>
              <p className="text-2xl font-bold text-cyan-400">{page}</p>
            </div>
            <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Jump to Page</p>
              <select
                value={page}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value);
                  setPage(newPage);
                  loadProducts(newPage);
                }}
                className="w-full px-2 py-1 bg-indigo-600 text-white rounded text-sm font-bold cursor-pointer hover:bg-indigo-700 transition-colors"
              >
                {stats.total > 0 ? (
                  [...Array(Math.max(100, Math.ceil(stats.total / 200)))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))
                ) : (
                  <option value={page}>Page {page}</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-12 text-center">
              <p className="text-xl text-green-400 font-semibold">✓ All products have been categorized!</p>
              <button
                onClick={() => navigate('/products')}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                View Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id || product.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center border border-gray-700">
                      <img
                        src={getProductImage(product)}
                        alt={getProductName(product)}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.target.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Info and Controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-2">
                        <h3 className="text-sm font-bold text-white line-clamp-2 flex-1">
                          {getProductName(product)}
                        </h3>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(getProductName(product));
                            setCopiedId(product._id || product.id);
                            setTimeout(() => setCopiedId(null), 1500);
                          }}
                          className={`px-2 py-1 rounded text-xs font-semibold transition-all flex-shrink-0 ${
                            copiedId === (product._id || product.id)
                              ? 'bg-green-600 text-white scale-110'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                          title="Copy product name"
                        >
                          {copiedId === (product._id || product.id) ? '✓ Copied!' : '📋'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">Category: <span className="text-gray-300 font-medium">{product.category || 'No Category'}</span></p>
                      <p className="text-xs text-gray-500 mb-3">Price: <span className="text-gray-300">PKR {(product.price || product.priceAmount)?.toLocaleString?.() || 'N/A'}</span></p>
                      

                      {/* Category & Image Fields */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Category Select - Larger */}
                        <div className="relative">
                          <select
                            onChange={(e) => updateCategory(product._id || product.id, e.target.value)}
                            disabled={updatingId === (product._id || product.id) || editingImageId === (product._id || product.id)}
                            className="w-full px-3 py-3 bg-blue-600 text-white rounded-lg text-base font-semibold cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">📂 Category</option>
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {updatingId === (product._id || product.id) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* Quick Image Field */}
                        <button
                          onClick={async () => {
                            try {
                              const clipboardText = await navigator.clipboard.readText();
                              if (clipboardText.trim()) {
                                // Auto-update with clipboard URL
                                await updateImageUrl(product._id || product.id, clipboardText);
                              } else {
                                alert('Clipboard is empty. Copy an image URL first.');
                              }
                            } catch (err) {
                              console.error('Failed to read clipboard:', err);
                              alert('Failed to read clipboard. Make sure you copied an image URL.');
                            }
                          }}
                          className="px-3 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-base font-semibold transition-colors"
                        >
                          🖼️ Update Image
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Load Next Button */}
          {!loading && products.length > 0 && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  const nextPage = page + 1;
                  setPage(nextPage);
                  loadProducts(nextPage);
                }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
              >
                ⬇️ Load Next 200 Products
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuickCategoryUpdate;
