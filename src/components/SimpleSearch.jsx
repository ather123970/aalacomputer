import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from './utils/helpers';

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
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(term)}&limit=5`);
      const data = await response.json();
      setSuggestions(data.products || []);
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

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    setSearchTerm('');
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products..."
        className="w-full px-4 py-3 rounded-lg border-2 border-neutral-200 focus:border-primary-500 focus:outline-none"
      />

      {/* Simple loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
          {suggestions.map((product) => (
            <button
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-3"
            >
              <img 
                src={product.imageUrl || product.img} 
                alt={product.name}
                className="w-10 h-10 object-contain"
                loading="lazy"
              />
              <div>
                <div className="font-medium text-sm">{product.name}</div>
                <div className="text-sm text-neutral-500">
                  Rs. {product.price?.amount?.toLocaleString() || product.price?.toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleSearch;