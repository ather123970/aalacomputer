import React from 'react';
import { colors, shadows, typography, spacing } from '../theme/theme';
import { useNavigate } from 'react-router-dom';

export const ProductCard = ({ product, onClick }) => {
  const amount = typeof product?.price === 'number' ? product.price : (product?.price?.amount ?? 0);
  const marketPrice = typeof product?.price === 'number' ? product.price : (product?.price?.marketPrice ?? amount);
  const discount = typeof product?.price === 'number' ? 0 : (product?.price?.discount ?? 0);
  const stockStatus = product?.stock?.status || 'in_stock';
  const imgSrc = (product?.images?.[0]?.url || product?.imageUrl || product?.img || '/placeholder.svg');
  const [src, setSrc] = React.useState(imgSrc);
  const [triedProxy, setTriedProxy] = React.useState(false);
  const onImgError = (e) => {
    try {
      const original = (product?.images?.[0]?.url || product?.imageUrl || product?.img || '');
      const isExternal = /^https?:\/\//i.test(original);
      const alreadyProxied = (e.currentTarget.src || '').includes('/api/proxy-image');
      if (isExternal && !alreadyProxied && !triedProxy) {
        setTriedProxy(true);
        setSrc(`/api/proxy-image?url=${encodeURIComponent(original)}`);
        return;
      }
    } catch {}
    setSrc('/placeholder.svg');
  };
  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-lg border border-neutral-200 transition-transform hover:-translate-y-1"
      onClick={onClick}
    >

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={src}
          alt={product?.name || 'Product image'}
          className="object-contain w-full h-full transition-transform hover:scale-105 bg-white p-2"
          loading="lazy"
          onError={onImgError}
          crossOrigin="anonymous"
        />
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-primary-600 font-semibold mb-1">{product?.brand || ''}</div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2 line-clamp-2">{product?.name || 'Unnamed Product'}</h3>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-neutral-900">
            Rs. {Number(amount || 0).toLocaleString()}
          </span>
          {discount > 0 && (
            <span className="text-sm text-neutral-500 line-through">
              Rs. {Number(marketPrice || 0).toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className={`text-sm font-medium ${
          stockStatus === 'in_stock' ? 'text-success' :
          stockStatus === 'low_stock' ? 'text-warning' :
          'text-error'
        }`}>
          {stockStatus === 'in_stock' ? 'In Stock' :
           stockStatus === 'low_stock' ? 'Low Stock' :
           'Out of Stock'}
        </div>

        <div className="mt-4">
          <button
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            onClick={onClick}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductGrid = ({ products }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <div key={product._id || product.id}>
          <ProductCard
            product={product}
            onClick={() => navigate(`/products/${product._id || product.id}`)}
          />
        </div>
      ))}
    </div>
  );
};

export const PremiumButton = ({ children, variant = 'primary', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
    secondary: "bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div
      className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
    />
  </div>
);

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const PageHeader = ({ title, description }) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-neutral-900 mb-2">{title}</h1>
    {description && (
      <p className="text-lg text-neutral-600">{description}</p>
    )}
  </div>
);

export const SectionContainer = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

export const CategoryPill = ({ category, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
      isSelected
        ? 'bg-primary-600 text-white'
        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
    }`}
  >
    {category}
  </button>
);

export const PriceTag = ({ amount, marketPrice, discount }) => (
  <div className="flex flex-col">
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-neutral-900">
        Rs. {Number(amount || 0).toLocaleString()}
      </span>
      {Number(discount || 0) > 0 && (
        <span className="text-sm text-neutral-500 line-through">
          Rs. {Number(marketPrice || 0).toLocaleString()}
        </span>
      )}
    </div>
    {Number(discount || 0) > 0 && (
      <span className="text-accent-600 text-sm font-medium">
        Save {discount}%
      </span>
    )}
  </div>
);