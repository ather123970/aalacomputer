import React from 'react';
import { Package } from 'lucide-react';

export const ProductImageCell = ({ product, productId, onBrokenImage, isSearching }) => {
  return (
    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
      {product.img || product.imageUrl ? (
        <>
          <img
            src={(product.img || product.imageUrl).trim()}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => {
              console.log('Broken image for:', product.name, 'URL:', (product.img || product.imageUrl));
              onBrokenImage(productId);
            }}
          />
          {isSearching && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-50 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <Package className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  );
};
