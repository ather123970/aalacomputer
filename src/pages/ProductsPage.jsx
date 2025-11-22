import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductGrid, LoadingSpinner } from '../components/PremiumUI';
import { API_CONFIG } from '../config/api';
import { PC_HARDWARE_CATEGORIES } from '../data/categoriesData';
import { categoriesMatch } from '../utils/categoryMatcher';

// Skeleton loader component
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-neutral-200 animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  
  // Category filter state
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [displayedProducts, setDisplayedProducts] = useState([]);
  
  // Brand filter state
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [availableBrands, setAvailableBrands] = useState([]);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
  });
  
  const ITEMS_PER_PAGE = 32;

  // Fetch all products initially
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products?limit=10000`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both array and object response formats
      let fetchedProducts = [];
      
      if (Array.isArray(data)) {
        fetchedProducts = data;
      } else if (data.products) {
        fetchedProducts = data.products;
      }

      // Format products - preserve ALL image fields from database
      const formattedProducts = fetchedProducts.map(p => ({
        id: p._id || p.id,
        _id: p._id,
        name: p.name || p.title || p.Name,
        title: p.title || p.name || p.Name,
        price: p.price,
        // Preserve ALL image fields from database
        img: p.img,
        imageUrl: p.imageUrl,
        image: p.image,
        image_url: p.image_url,
        imageLink: p.imageLink,
        image_link: p.image_link,
        photo: p.photo,
        photoUrl: p.photoUrl,
        photo_url: p.photo_url,
        picture: p.picture,
        pictureUrl: p.pictureUrl,
        picture_url: p.picture_url,
        thumbnail: p.thumbnail,
        thumbnailUrl: p.thumbnailUrl,
        thumbnail_url: p.thumbnail_url,
        src: p.src,
        url: p.url,
        imageUrl1: p.imageUrl1,
        image1: p.image1,
        image1_url: p.image1_url,
        category: p.category || 'Uncategorized',
        brand: p.brand || '',
        description: p.description,
        Spec: p.Spec || p.specs || [],
        // Preserve all other fields
        ...p
      }));

      setAllProducts(formattedProducts);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(formattedProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Extract unique brands
      const uniqueBrands = ['All', ...new Set(formattedProducts.map(p => p.brand).filter(Boolean))];
      setBrands(uniqueBrands);
      setAvailableBrands(uniqueBrands);
      
      // Store in localStorage for offline access
      try {
        localStorage.setItem("products", JSON.stringify(formattedProducts));
      } catch (e) {
        console.warn("Failed to cache products:", e);
      }
      
      // Initially display first 32 products
      setDisplayedProducts(formattedProducts.slice(0, ITEMS_PER_PAGE));
      setProducts(formattedProducts);
      setPage(1);
      setHasMore(formattedProducts.length > ITEMS_PER_PAGE);

    } catch (error) {
      console.error('Error fetching products:', error);
      
      // On error, try localStorage
      try {
        const cached = localStorage.getItem("products");
        if (cached) {
          const cachedProducts = JSON.parse(cached);
          setAllProducts(cachedProducts);
          setProducts(cachedProducts);
          setDisplayedProducts(cachedProducts.slice(0, ITEMS_PER_PAGE));
          
          const uniqueCategories = ['All', ...new Set(cachedProducts.map(p => p.category).filter(Boolean))];
          setCategories(uniqueCategories);
          
          const uniqueBrands = ['All', ...new Set(cachedProducts.map(p => p.brand).filter(Boolean))];
          setBrands(uniqueBrands);
          setAvailableBrands(uniqueBrands);
        }
      } catch (e) {
        console.error("Failed to load cached products:", e);
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Priority sort products based on category's official brands
  const prioritySortProducts = useCallback((products, categoryName) => {
    if (categoryName === 'All') return products;
    
    // Find category data to get official brands
    const categoryData = PC_HARDWARE_CATEGORIES.find(
      cat => cat.name === categoryName || 
             cat.slug === categoryName.toLowerCase() ||
             cat.alternativeNames?.includes(categoryName)
    );
    
    if (!categoryData || !categoryData.brands || categoryData.brands.length === 0) {
      return products;
    }
    
    const officialBrands = categoryData.brands.map(b => b.toLowerCase());
    
    // Sort products: official brands first, then others
    return [...products].sort((a, b) => {
      const aBrand = (a.brand || '').toLowerCase();
      const bBrand = (b.brand || '').toLowerCase();
      
      const aIsOfficial = officialBrands.includes(aBrand);
      const bIsOfficial = officialBrands.includes(bBrand);
      
      // Official brands come first
      if (aIsOfficial && !bIsOfficial) return -1;
      if (!aIsOfficial && bIsOfficial) return 1;
      
      // Keep original order within same group
      return 0;
    });
  }, []);
  
  // Load more products (pagination)
  const loadMoreProducts = useCallback(() => {
    // Filter by both category and brand
    let filteredProducts = allProducts;
    
    if (selectedCategory !== 'All') {
      filteredProducts = filteredProducts.filter(p => categoriesMatch(p.category, selectedCategory));
    }
    
    if (selectedBrand !== 'All') {
      filteredProducts = filteredProducts.filter(p => p.brand === selectedBrand);
    }
    
    // Apply priority sorting
    filteredProducts = prioritySortProducts(filteredProducts, selectedCategory);
    
    const nextPage = page + 1;
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = nextPage * ITEMS_PER_PAGE;
    const moreProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (moreProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...moreProducts]);
      setPage(nextPage);
      setHasMore(endIndex < filteredProducts.length);
    } else {
      setHasMore(false);
      setAllProductsLoaded(true);
    }
  }, [allProducts, selectedCategory, selectedBrand, page, prioritySortProducts]);

  // Handle category change
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setSelectedBrand('All'); // Reset brand when category changes
    setPage(1);
    setLoadingMore(true);
    
    // Update available brands based on selected category
    if (category === 'All') {
      const uniqueBrands = ['All', ...new Set(allProducts.map(p => p.brand).filter(Boolean))];
      setAvailableBrands(uniqueBrands);
    } else {
      const categoryProducts = allProducts.filter(p => categoriesMatch(p.category, category));
      const categoryBrands = ['All', ...new Set(categoryProducts.map(p => p.brand).filter(Boolean))];
      setAvailableBrands(categoryBrands);
    }
    
    // Filter products by category
    let filteredProducts = category === 'All' 
      ? allProducts 
      : allProducts.filter(p => categoriesMatch(p.category, category));
    
    // Apply priority sorting (official brands first)
    filteredProducts = prioritySortProducts(filteredProducts, category);
    
    // Show first 32 products of filtered results
    setDisplayedProducts(filteredProducts.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredProducts.length > ITEMS_PER_PAGE);
    setAllProductsLoaded(false);
    
    setTimeout(() => setLoadingMore(false), 300);
  }, [allProducts, prioritySortProducts]);
  
  // Handle brand change
  const handleBrandChange = useCallback((brand) => {
    setSelectedBrand(brand);
    setPage(1);
    setLoadingMore(true);
    
    // Filter products by both category and brand
    let filteredProducts = allProducts;
    
    if (selectedCategory !== 'All') {
      filteredProducts = filteredProducts.filter(p => categoriesMatch(p.category, selectedCategory));
    }
    
    if (brand !== 'All') {
      filteredProducts = filteredProducts.filter(p => p.brand === brand);
    }
    
    // Apply priority sorting (official brands first)
    filteredProducts = prioritySortProducts(filteredProducts, selectedCategory);
    
    // Show first 32 products of filtered results
    setDisplayedProducts(filteredProducts.slice(0, ITEMS_PER_PAGE));
    setHasMore(filteredProducts.length > ITEMS_PER_PAGE);
    setAllProductsLoaded(false);
    
    setTimeout(() => setLoadingMore(false), 300);
  }, [allProducts, selectedCategory, prioritySortProducts]);

  // Handle category change from product card
  const handleProductCategoryChange = useCallback((productId, newCategory) => {
    // Update the product in allProducts
    const updatedProducts = allProducts.map(p => 
      (p._id === productId || p.id === productId) 
        ? { ...p, category: newCategory }
        : p
    );
    
    setAllProducts(updatedProducts);
    
    // Update displayed products
    setDisplayedProducts(displayedProducts.map(p =>
      (p._id === productId || p.id === productId)
        ? { ...p, category: newCategory }
        : p
    ));
    
    // Update categories list if new category
    if (!categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
    }
  }, [allProducts, displayedProducts, categories]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore && !allProductsLoaded) {
      console.log('[ProductsPage] Loading more...');
      loadMoreProducts();
    }
  }, [inView, loading, loadingMore, hasMore, allProductsLoaded, loadMoreProducts]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with filters */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>
        
        {/* Filter Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          {/* Brand Filter Dropdown */}
          {availableBrands.length > 1 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">🏢 Brand:</span>
                <span className="text-sm text-blue-600 font-medium">{selectedBrand}</span>
              </div>
              <select
                value={selectedBrand}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full md:w-64 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none bg-white text-gray-700 font-medium shadow-sm hover:border-blue-300 transition-all"
              >
                {availableBrands.map((brand) => {
                  const brandCount = selectedCategory === 'All' 
                    ? allProducts.filter(p => p.brand === brand).length
                    : allProducts.filter(p => p.category === selectedCategory && p.brand === brand).length;
                  
                  return (
                    <option key={brand} value={brand}>
                      {brand} {brand !== 'All' && `(${brandCount})`}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
        
        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Loading products...' : (
              <>
                Showing <span className="font-bold text-blue-600">{displayedProducts.length}</span> of{' '}
                <span className="font-bold">
                  {(() => {
                    let filtered = allProducts;
                    if (selectedCategory !== 'All') {
                      filtered = filtered.filter(p => p.category === selectedCategory);
                    }
                    if (selectedBrand !== 'All') {
                      filtered = filtered.filter(p => p.brand === selectedBrand);
                    }
                    return filtered.length;
                  })()}
                </span> products
                {selectedCategory !== 'All' && <span className="text-gray-500"> in {selectedCategory}</span>}
                {selectedBrand !== 'All' && <span className="text-gray-500"> by {selectedBrand}</span>}
              </>
            )}
          </p>
          
          {/* Clear Filters */}
          {(selectedCategory !== 'All' || selectedBrand !== 'All') && (
            <button
              onClick={() => {
                handleCategoryChange('All');
                setSelectedBrand('All');
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        // Skeleton Grid - Show 32 skeleton cards while loading
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(32)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {displayedProducts.length > 0 ? (
            <>
              <ProductGrid products={displayedProducts} />
              
              {/* Load More Trigger */}
              {hasMore && !allProductsLoaded && (
                <div ref={ref} className="py-8 flex justify-center items-center">
                  {loadingMore ? (
                    <div className="flex flex-col items-center gap-3">
                      <LoadingSpinner />
                      <p className="text-sm text-gray-600">Loading more products...</p>
                    </div>
                  ) : (
                    <div className="h-10"></div>
                  )}
                </div>
              )}
              
              {/* All Products Loaded */}
              {allProductsLoaded && (
                <div className="py-8 text-center">
                  <p className="text-gray-600 font-medium">
                    ✅ All {products.length} products loaded
                  </p>
                </div>
              )}
            </>
          ) : (
            // No Products Found
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No Products Found</h3>
              <p className="text-gray-500">Check back later for new products</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;