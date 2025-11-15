import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import SmartImage from './SmartImage';

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const SimpleSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Simple debounced search
  const debouncedSearch = debounce(async (term) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:10000' : window.location.origin;
      const response = await fetch(`${baseUrl}/api/products?search=${encodeURIComponent(term)}&limit=6`);
      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id || product._id}`);
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    // Navigate to product page and scroll to buy section
    navigate(`/product/${product.id || product._id}`, { state: { buyNow: true } });
    setSearchTerm('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-900"
        />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Enhanced Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-2">
              Found {suggestions.length} Products
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {suggestions.map((product) => (
              <div
                key={product._id || product.id}
                className="hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3 p-3 sm:p-4">
                  {/* Product Image - Fixed size, no overflow */}
                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg p-2 flex items-center justify-center">
                    <SmartImage
                      src={product.imageUrl || product.img}
                      alt={product.name || product.Name || product.title}
                      product={product}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Details - Responsive, no horizontal scroll */}
                  <div className="flex-1 min-w-0">
                    {/* Product Name - Text ellipsis instead of scroll */}
                    <div className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-2 leading-tight">
                      {product.name || product.Name || product.title || 'Untitled Product'}
                    </div>
                    
                    {/* Price and Category */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                      <span className="font-bold text-blue-600">
                        Rs. {(product.price || 0).toLocaleString()}
                      </span>
                      {product.category && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 truncate max-w-[120px]">
                            {product.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Responsive */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    {/* View Button */}
                    <button
                      onClick={() => handleProductClick(product)}
                      className="p-2 sm:px-3 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group-hover:bg-gray-200"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    {/* Buy Now Button */}
                    <button
                      onClick={(e) => handleBuyNow(e, product)}
                      className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-1.5 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg whitespace-nowrap"
                      title="Buy Now"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Buy Now</span>
                      <span className="sm:hidden">Buy</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Results */}
          <button
            onClick={() => {
              navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
              setSearchTerm('');
              setSuggestions([]);
            }}
            className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-600 font-medium text-sm border-t border-gray-200 transition-colors"
          >
            View All Results
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleSearch;