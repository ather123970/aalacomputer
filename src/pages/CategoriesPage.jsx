import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Cpu, HardDrive, Monitor, Keyboard, Mouse, Headphones, 
  Box, Zap, Laptop, Package, Tag, TrendingUp, Folder
} from 'lucide-react';
import { LoadingSpinner } from '../components/PremiumUI';
import { PC_HARDWARE_CATEGORIES, autoDetectCategory } from '../data/categoriesData';
import { API_CONFIG } from '../config/api';
import { fetchDynamicCategories } from '../services/categoryService';

// Category icons mapping
const categoryIcons = {
  'Processors': Cpu,
  'Motherboards': Box,
  'RAM': Zap,
  'Graphics Cards': Monitor,
  'Power Supplies': Zap,
  'CPU Coolers': Zap,
  'PC Cases': Box,
  'Storage': HardDrive,
  'Cables & Accessories': Package,
  'Keyboards': Keyboard,
  'Mouse': Mouse,
  'Headsets': Headphones,
  'Peripherals': Package,
  'Monitors': Monitor,
  'Prebuilt PCs': Laptop,
  'Laptops': Laptop,
  'Deals': TrendingUp
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState({});

  useEffect(() => {
    loadCategoriesWithProducts();
  }, []);

  const loadCategoriesWithProducts = async () => {
    setLoading(true);
    try {
      console.log('[CategoriesPage] Fetching dynamic categories from database...');
      
      // Use the new dynamic categories API with intelligent matching
      const dynamicCategories = await fetchDynamicCategories();
      
      if (dynamicCategories && dynamicCategories.length > 0) {
        console.log('[CategoriesPage] Loaded', dynamicCategories.length, 'dynamic categories');
        
        // Filter out categories with 0 products
        const validCategories = dynamicCategories.filter(cat => 
          (cat.productCount || 0) > 0
        );
        
        setCategories(validCategories);
        
        // Build counts object for display
        const counts = {};
        validCategories.forEach(cat => {
          counts[cat.name] = cat.productCount || 0;
        });
        setProductCounts(counts);
        
      } else {
        // Fallback: Use static categories and fetch products
        console.log('[CategoriesPage] Falling back to static categories...');
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/products?limit=10000`);
        const data = await response.json();
        const products = Array.isArray(data) ? data : (data.products || []);

        const counts = {};
        products.forEach(product => {
          let productCategory = product.category;
          
          if (!productCategory || productCategory.trim() === '') {
            const detected = autoDetectCategory(product);
            productCategory = detected ? detected.name : 'Uncategorized';
          }

          let matchedCategoryName = productCategory;
          const normalizedProductCategory = (productCategory || '').toLowerCase().trim();
          const matchedCategory = PC_HARDWARE_CATEGORIES.find(cat => {
            const normalizedCategoryName = cat.name.toLowerCase().trim();
            const normalizedSlug = cat.slug.toLowerCase().trim();
            
            return (
              normalizedProductCategory === normalizedCategoryName ||
              normalizedProductCategory === normalizedSlug ||
              cat.alternativeNames?.some(alt => 
                alt.toLowerCase().trim() === normalizedProductCategory
              )
            );
          });

          if (matchedCategory) {
            matchedCategoryName = matchedCategory.name;
          }

          counts[matchedCategoryName] = (counts[matchedCategoryName] || 0) + 1;
        });

        const enrichedCategories = PC_HARDWARE_CATEGORIES.map(cat => ({
          ...cat,
          productCount: counts[cat.name] || 0
        })).filter(cat => cat.productCount > 0);

        setCategories(enrichedCategories);
        setProductCounts(counts);
      }
    } catch (error) {
      console.error('[CategoriesPage] Error loading categories:', error);
      // Last resort fallback to static categories
      setCategories(PC_HARDWARE_CATEGORIES.map(cat => ({ ...cat, productCount: 0 })));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold">Browse by Category</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore our complete range of PC hardware and peripherals
            </p>
            <div className="text-3xl font-bold text-blue-200">
              {categories.length} Categories | {Object.values(productCounts).reduce((a, b) => a + b, 0)} Products
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = categoryIcons[category.name] || Folder;
            
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => navigate(`/category/${category.slug}`)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer overflow-hidden border border-gray-200"
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{category.productCount}</div>
                      <div className="text-xs text-blue-100">Products</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">{category.name}</h3>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description || 'Browse products in this category'}
                  </p>

                  {/* Brands */}
                  {category.brands && category.brands.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        Top Brands
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {category.brands.slice(0, 4).map((brand, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium"
                          >
                            {brand}
                          </span>
                        ))}
                        {category.brands.length > 4 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            +{category.brands.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Button */}
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-all">
                    View Products →
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <Folder className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">No Categories Found</h3>
            <p className="text-gray-500">Products will be automatically categorized when added</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
