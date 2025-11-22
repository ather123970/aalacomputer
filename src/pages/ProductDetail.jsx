import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as FM } from 'framer-motion';
import { API_CONFIG } from '../config/api';
import { getSmartImageUrl, isExternalImage, getProxyImageUrl } from '../utils/imageUtils';
import { ArrowLeft, ShoppingCart, Tag, Plus, Check, X, Search, Edit2 } from "lucide-react";
import SmartImage from '../components/SmartImage';
import Nav from '../nav';
import { useProductContext } from '../context/ProductContext';

function parsePrice(price) {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const s = String(price).trim().toUpperCase();
  if (s.endsWith("K")) {
    const n = Number(s.replace("K", "").replace(/[^0-9.]/g, "")) || 0;
    return Math.round(n * 1000);
  }
  const num = Number(s.replace(/[^0-9.]/g, "")) || 0;
  return num;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateProduct } = useProductContext();
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Generate random urgency data (in production, this would come from backend)
  const viewingCount = Math.floor(Math.random() * 50) + 20;
  const boughtCount = Math.floor(Math.random() * 30) + 10;
  const leftCount = Math.floor(Math.random() * 40) + 15;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        console.log(`[ProductDetail] Fetching product with ID: ${id}`);
        
        // Fetch product by ID directly from backend
        const response = await fetch(`${base}/api/product/${id}`, {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const foundProduct = await response.json();
          console.log('[ProductDetail] Product found:', foundProduct.name || foundProduct.Name);
          console.log('[ProductDetail] Image URL:', foundProduct.img || foundProduct.imageUrl);
          
          // Use img or imageUrl - whichever has a value
          const imageUrl = foundProduct.img || foundProduct.imageUrl || foundProduct.image;
          
          const productData = {
            id: foundProduct._id || foundProduct.id,
            _id: foundProduct._id || foundProduct.id,
            Name: foundProduct.name || foundProduct.title || foundProduct.Name,
            name: foundProduct.name || foundProduct.title || foundProduct.Name,
            title: foundProduct.name || foundProduct.title,
            price: foundProduct.price,
            img: imageUrl,
            imageUrl: imageUrl,
            Spec: foundProduct.Spec || foundProduct.specs || [],
            description: foundProduct.description,
            category: foundProduct.category,
            brand: foundProduct.brand
          };
          
          setProduct(productData);
          setEditData({
            name: productData.Name || '',
            price: productData.price || 0,
            category: productData.category || '',
            description: productData.description || '',
            specs: productData.Spec || [],
            imageUrl: productData.imageUrl || productData.img || ''
          });
        } else {
          console.error('[ProductDetail] Failed to fetch product:', response.status);
          setProduct(null);
        }
      } catch (e) {
        console.error("[ProductDetail] Failed to load product", e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    // Fetch all categories
    const fetchCategories = async () => {
      try {
        // Try dedicated categories endpoint first
        let response = await fetch(`${API_CONFIG.BASE_URL}/api/categories`);
        if (response.ok) {
          const cats = await response.json();
          const categoryNames = Array.isArray(cats) 
            ? cats.map(c => c.name || c).filter(Boolean)
            : [];
          setCategories(categoryNames.sort());
          console.log('[ProductDetail] Loaded categories:', categoryNames);
          return;
        }
        
        // Fallback: fetch from products
        response = await fetch(`${API_CONFIG.BASE_URL}/api/products?limit=5000`);
        if (response.ok) {
          const data = await response.json();
          const products = Array.isArray(data) ? data : data.products || [];
          const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories.sort());
          console.log('[ProductDetail] Loaded categories from products:', uniqueCategories);
        }
      } catch (e) {
        console.error("Failed to load categories", e);
        // Fallback to hardcoded categories
        const fallbackCategories = [
          'Processors', 'Motherboards', 'RAM', 'Graphics Cards', 'Power Supplies',
          'CPU Coolers', 'PC Cases', 'Storage', 'Monitors', 'Keyboards',
          'Mouse', 'Headsets', 'Cables & Accessories', 'Laptops', 'Prebuilds',
          'Peripherals', 'Networking', 'Gaming Chairs'
        ];
        setCategories(fallbackCategories);
        console.log('[ProductDetail] Using fallback categories');
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id, updateProduct]);

  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      e.target.src = '/placeholder.svg';
    }
  };

  const handleSaveEdit = async () => {
    if (!editData.name.trim()) {
      setEditError('Product name is required');
      return;
    }

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const payload = {
        name: editData.name,
        price: Number(editData.price) || 0,
        category: editData.category,
        description: editData.description,
        Spec: Array.isArray(editData.specs) ? editData.specs : []
      };
      
      // Only include image fields if they were actually changed
      if (editData.imageUrl && editData.imageUrl.trim()) {
        payload.imageUrl = editData.imageUrl;
        payload.img = editData.imageUrl;
      }
      
      console.log('Sending update:', payload);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/product/${product._id || product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to update product (${response.status})`);
      }
      
      if (!data.ok) {
        throw new Error(data.error || 'Update failed');
      }
      
      setEditSuccess('✓ Product updated!');
      const updatedProduct = {
        ...product,
        Name: editData.name,
        price: Number(editData.price) || 0,
        category: editData.category,
        description: editData.description,
        imageUrl: editData.imageUrl,
        img: editData.imageUrl,
        Spec: Array.isArray(editData.specs) ? editData.specs : []
      };
      setProduct(updatedProduct);
      
      // Update global context so all pages see the change
      updateProduct(product._id || product.id, updatedProduct);
      
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess('');
      }, 1200);
    } catch (err) {
      console.error('Edit error:', err);
      setEditError(err.message || 'Error updating product');
    } finally {
      setEditLoading(false);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const payload = {
        id: product.id.toString(),
        name: product.Name,
        price: parsePrice(product.price),
        img: product.img,
        specs: product.Spec,
        type: product.type || "Pre-Build",
        qty: 1,
      };

      const res = await fetch(`${API_CONFIG.BASE_URL}/api/v1/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = `Server returned ${res.status}`
        try { const j = await res.json(); if (j && (j.error || j.message)) errMsg = j.error || j.message } catch(e){}
        throw new Error(errMsg)
      }
      await res.json();
      // Use the same cart key as cart.jsx
      const raw = localStorage.getItem("aala_cart");
      const arr = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex((i) => i.id === payload.id);
      if (idx === -1) arr.unshift({ ...payload });
      else arr[idx] = { ...arr[idx], qty: (arr[idx].qty || 1) + 1 };
      localStorage.setItem("aala_cart", JSON.stringify(arr));

      navigate("/cart");
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart ❌");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="min-h-screen bg-panel text-primary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading product...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Nav />
        <div className="min-h-screen bg-panel text-primary flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
            <p className="text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-panel text-primary px-4 py-6 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted hover:text-primary mb-6"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <FM.div
            initial={{ opacity: 1, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-6 sm:p-10 rounded-2xl border border-gray-800 shadow-lg"
          >
            {/* Image Section */}
            <div className="flex items-center justify-center bg-card rounded-xl p-6 sm:p-8">
              {product ? (
                <SmartImage
                  src={product.imageUrl || product.img}
                  alt={product?.name || product?.Name || product?.title || 'Product image'}
                  product={product}
                  className="max-h-80 sm:max-h-[400px] w-full object-contain rounded-lg"
                  fallback="/placeholder.svg"
                />
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Loading product...</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="product-name text-3xl sm:text-4xl font-bold">
                    {product.Name}
                  </h1>
                </div>

                {/* Urgency Indicator */}
                <div className="mb-4 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 backdrop-blur-sm text-white px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
                  <svg className="w-5 h-5 text-red-500 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold text-sm sm:text-base text-red-100">
                      <span className="text-red-300">{viewingCount} people</span> are viewing this • 
                      <span className="text-orange-300"> {boughtCount} bought today</span> • 
                      <span className="text-yellow-300"> Only {leftCount} left in stock!</span>
                    </p>
                  </div>
                </div>

                <p className="text-2xl font-semibold text-blue-400 mb-4">
                  PKR {parsePrice(product.price).toLocaleString()}
                </p>

                {/* Edit Button */}
                <div className="mb-6">
                  <button
                    onClick={() => {
                      setEditData({
                        name: product.Name || '',
                        price: product.price || 0,
                        category: product.category || '',
                        description: product.description || '',
                        specs: product.Spec || []
                      });
                      setShowEditModal(true);
                      setEditError('');
                      setEditSuccess('');
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Product
                  </button>
                </div>

                <h2 className="text-xl font-semibold mb-3">Specifications</h2>
                <ul className="space-y-2 text-muted mb-8">
                  {product.Spec?.map((spec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-2 text-blue-400">•</span>
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addToCart}
                  disabled={loading}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:bg-gray-600 text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingCart size={24} />
                  {loading ? "Adding to Cart..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </FM.div>

          <div className="mt-12 border-t border-gray-800 pt-6">
            <h2 className="text-2xl font-bold mb-3">Product Details</h2>
            <div className="text-gray-400 whitespace-pre-wrap leading-relaxed">
              {product.description ||
                `Experience premium performance with the ${product.Name}. Built for reliability and power.`}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Product</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Image Preview */}
                {editData.imageUrl && (
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-xs font-bold text-gray-400 mb-2">IMAGE PREVIEW</p>
                    <div className="w-full h-32 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        key={editData.imageUrl}
                        src={editData.imageUrl}
                        alt="Preview"
                        className="h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Image URL</label>
                  <input
                    type="text"
                    value={editData.imageUrl || ''}
                    onChange={(e) => setEditData({ ...editData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Price (PKR)</label>
                  <input
                    type="number"
                    value={editData.price || 0}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Enter price"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Category</label>
                  <select
                    value={editData.category || ''}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Description</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:border-blue-500 focus:outline-none h-24 resize-none"
                    placeholder="Enter product description"
                  />
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Specifications</label>
                  <div className="space-y-2">
                    {Array.isArray(editData.specs) && editData.specs.map((spec, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={spec}
                          onChange={(e) => {
                            const newSpecs = [...editData.specs];
                            newSpecs[idx] = e.target.value;
                            setEditData({ ...editData, specs: newSpecs });
                          }}
                          className="flex-1 px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Enter specification"
                        />
                        <button
                          onClick={() => {
                            const newSpecs = editData.specs.filter((_, i) => i !== idx);
                            setEditData({ ...editData, specs: newSpecs });
                          }}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditData({ ...editData, specs: [...(editData.specs || []), ''] })}
                      className="w-full px-4 py-2 border-2 border-dashed border-blue-500 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-colors font-semibold"
                    >
                      + Add Spec
                    </button>
                  </div>
                </div>

                {/* Messages */}
                {editError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg text-sm">
                    {editError}
                  </div>
                )}

                {editSuccess && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg text-sm">
                    {editSuccess}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-semibold transition-all"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;