import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, ExternalLink, Zap } from 'lucide-react';
import SmartImage from './SmartImage';

/**
 * GPU Search Results Component
 * Displays GPU products from aalacomputer.com in search results
 */
export default function GPUSearchResults({ results, query, isLoading = false }) {
  const navigate = useNavigate();
  const [displayResults, setDisplayResults] = useState([]);

  useEffect(() => {
    setDisplayResults(results || []);
  }, [results]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-gray-700 p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-muted">Searching for GPUs...</p>
      </div>
    );
  }

  if (!displayResults || displayResults.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-gray-700 p-8 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-lg font-semibold text-primary mb-2">No GPUs Found</p>
        <p className="text-muted text-sm mb-4">
          Try searching for specific GPU models like "RTX 4090", "RX 7900", or "RTX 4070"
        </p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-left">
          <p className="text-sm text-blue-400 font-semibold mb-2">💡 Search Tips:</p>
          <ul className="text-xs text-muted space-y-1">
            <li>• Search by model: "RTX 4090", "RTX 4080", "RTX 4070"</li>
            <li>• Search by brand: "NVIDIA", "AMD", "ASUS"</li>
            <li>• Search by type: "Graphics Card", "GPU"</li>
            <li>• Search by series: "RTX 40 series", "RX 7000 series"</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6" />
          <h2 className="text-2xl font-bold">GPU Search Results</h2>
        </div>
        <p className="text-blue-100">
          Found {displayResults.length} GPU{displayResults.length !== 1 ? 's' : ''} from aalacomputer.com
        </p>
        <p className="text-sm text-blue-200 mt-2">
          Searching for: <span className="font-semibold">"{query}"</span>
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayResults.map((product, index) => (
          <GPUResultCard 
            key={product.id || index} 
            product={product}
            navigate={navigate}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-card rounded-xl border border-gray-700 p-4 text-center">
        <p className="text-sm text-muted">
          All GPUs are from <span className="font-semibold text-blue-400">aalacomputer.com</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Individual GPU Result Card
 */
function GPUResultCard({ product, navigate, rank }) {
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.image,
      spec: product.description,
      qty: 1
    };

    if (window.addToCart) {
      window.addToCart(cartItem);
    } else {
      try {
        const raw = localStorage.getItem('aala_cart');
        const arr = raw ? JSON.parse(raw) : [];
        const idx = arr.findIndex(i => i.id === cartItem.id);
        if (idx === -1) arr.push(cartItem);
        else arr[idx] = { ...arr[idx], qty: (arr[idx].qty || 1) + 1 };
        localStorage.setItem('aala_cart', JSON.stringify(arr));
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Cart update error:', e);
      }
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-card rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-all hover:shadow-lg cursor-pointer group"
    >
      {/* Rank Badge */}
      <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
        #{rank}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square bg-gray-900 overflow-hidden">
        <SmartImage
          src={product.image}
          alt={product.name}
          product={product}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
          fallback="/placeholder.svg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <div className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wider">
          {product.brand}
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold text-primary mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>

        {/* Category Badge */}
        <div className="inline-block bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded mb-3 border border-blue-500/30">
          {product.category}
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-lg font-bold text-blue-400">
            PKR {product.price.toLocaleString()}
          </p>
        </div>

        {/* Specs Preview */}
        {product.specs && product.specs.length > 0 && (
          <div className="mb-3 p-2 bg-gray-900/50 rounded border border-gray-700 text-xs text-muted max-h-16 overflow-hidden">
            <p className="font-semibold text-gray-300 mb-1">Specs:</p>
            <ul className="space-y-0.5">
              {product.specs.slice(0, 2).map((spec, i) => (
                <li key={i} className="text-gray-400">• {spec}</li>
              ))}
              {product.specs.length > 2 && (
                <li className="text-gray-500 italic">+ {product.specs.length - 2} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add Cart
          </button>
        </div>

        {/* Website Badge */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            From <span className="text-blue-400 font-semibold">aalacomputer.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
