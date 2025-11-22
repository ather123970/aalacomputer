import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import Nav from '../nav';

const UpdateProductImages = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:10000/api/products?limit=10000');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCopyUrl = async (url) => {
    await navigator.clipboard.writeText(url);
    setImageUrl(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUpdateImage = async (productId) => {
    if (!imageUrl) {
      alert('Paste an image URL first!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:10000/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ img: imageUrl, imageUrl: imageUrl, image: imageUrl })
      });

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p._id === productId 
            ? { ...p, img: imageUrl, imageUrl: imageUrl, image: imageUrl }
            : p
        ));
        alert('✅ Updated!');
      } else {
        alert('❌ Failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Nav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Update Product Images</h1>
          
          {/* URL Input Box */}
          <div className="bg-gray-800 rounded-lg p-4 flex gap-2">
            <input
              type="text"
              placeholder="Paste image URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => {
                navigator.clipboard.readText().then(text => {
                  setImageUrl(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold flex items-center gap-2"
            >
              <Copy size={18} />
              Paste
            </button>
          </div>

          {/* Status */}
          {copied && (
            <div className="mt-2 text-green-400 flex items-center gap-2">
              <Check size={18} />
              Ready to update!
            </div>
          )}
        </div>

        {/* Simple Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product._id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all">
              {/* Product Image */}
              <div className="bg-gray-700 h-32 flex items-center justify-center overflow-hidden">
                <img
                  src={product.img || product.imageUrl || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => e.target.src = '/placeholder.svg'}
                />
              </div>

              {/* Product Info */}
              <div className="p-3">
                <p className="text-white text-sm font-semibold line-clamp-2 mb-2">
                  {product.name || product.Name || 'Unknown'}
                </p>
                <p className="text-gray-400 text-xs mb-3">
                  Rs. {product.price || 0}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyUrl(product.img || product.imageUrl || '')}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                  <button
                    onClick={() => handleUpdateImage(product._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-semibold"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpdateProductImages;
