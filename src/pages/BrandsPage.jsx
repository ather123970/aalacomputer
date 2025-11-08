import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Grid, ArrowLeft, Package } from 'lucide-react';
import { LoadingSpinner, ProductGrid } from '../components/PremiumUI';
import { getAllBrands, autoDetectBrand } from '../data/categoriesData';
import { API_CONFIG } from '../config/api';

const BrandsPage = () => {
  const { brand: selectedBrandParam } = useParams();
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(selectedBrandParam || null);
  const [brandCounts, setBrandCounts] = useState({});

  useEffect(() => {
    loadBrandsAndProducts();
  }, []);

  useEffect(() => {
    if (selectedBrandParam) {
      setSelectedBrand(selectedBrandParam);
    }
  }, [selectedBrandParam]);

  const loadBrandsAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products?limit=10000`);
      const data = await response.json();
      const allProducts = Array.isArray(data) ? data : (data.products || []);

      // Auto-detect brands and count products
      const counts = {};
      const processedProducts = allProducts.map(product => {
        let brand = product.brand;
        
        // Auto-detect if missing
        if (!brand || brand.trim() === '') {
          const detected = autoDetectBrand(product);
          brand = detected || 'Unknown';
          product.brand = brand;
        }

        counts[brand] = (counts[brand] || 0) + 1;
        return product;
      });

      // Get all brands with counts
      const allBrands = Object.keys(counts).sort();
      
      setBrands(allBrands);
      setBrandCounts(counts);
      setProducts(processedProducts);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
    navigate(`/brands/${encodeURIComponent(brand)}`);
  };

  const filteredProducts = selectedBrand
    ? products.filter(p => p.brand === selectedBrand)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (selectedBrand) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => {
                setSelectedBrand(null);
                navigate('/brands');
              }}
              className="flex items-center space-x-2 text-purple-100 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Brands</span>
            </button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <span className="text-3xl font-bold">
                  {selectedBrand.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{selectedBrand}</h1>
              <p className="text-purple-100 text-lg">
                {filteredProducts.length} Products Available
              </p>
            </motion.div>
          </div>
        </div>

        {/* Products */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-20 bg-white rounded-xl">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">No Products Found</h3>
              <p className="text-gray-500">No products available for this brand</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">Browse by Brand</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Shop from your favorite PC hardware manufacturers
            </p>
            <div className="text-3xl font-bold text-purple-200">
              {brands.length} Brands Available
            </div>
          </motion.div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {brands.map((brand, index) => (
            <motion.div
              key={brand}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -5, scale: 1.05 }}
              onClick={() => handleBrandClick(brand)}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer p-6 text-center relative group"
            >
              {/* Brand Initials */}
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {brand.substring(0, 2).toUpperCase()}
              </div>

              {/* Brand Name */}
              <h3 className="font-bold text-gray-900 mb-1 truncate">{brand}</h3>
              
              {/* Product Count */}
              <p className="text-sm text-gray-500">
                {brandCounts[brand]} {brandCounts[brand] === 1 ? 'Product' : 'Products'}
              </p>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-90 transition-opacity flex items-center justify-center">
                <span className="text-white font-semibold">View Products →</span>
              </div>
            </motion.div>
          ))}
        </div>

        {brands.length === 0 && (
          <div className="text-center py-20">
            <Tag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Brands Found</h3>
            <p className="text-gray-500">Brands will be automatically detected when products are added</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;
