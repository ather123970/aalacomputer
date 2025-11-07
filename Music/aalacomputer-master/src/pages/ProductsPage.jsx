import React, { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductGrid, LoadingSpinner } from '../components/PremiumUI';
import { API_CONFIG } from '../config/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // Fetch products with pagination (32 per page)
  const fetchProducts = useCallback(async (pageNum) => {
    const isFirstPage = pageNum === 1;
    if (isFirstPage) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
      const limit = 32; // Load 32 products per page
      
      console.log(`[ProductsPage] Fetching page ${pageNum}...`);
      const response = await fetch(`${base}/api/products?limit=${limit}&page=${pageNum}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      let fetchedProducts = [];
      
      // Handle both array and paginated response
      if (Array.isArray(data)) {
        fetchedProducts = data;
      } else if (data && Array.isArray(data.products)) {
        fetchedProducts = data.products;
      }
      
      console.log(`[ProductsPage] Fetched ${fetchedProducts.length} products`);
      
      // Format products
      const formatted = fetchedProducts.map(p => {
        // Use whichever field has a value, preferring img over imageUrl for consistency
        const imageValue = p.img || p.imageUrl || '/placeholder.svg';
        
        return {
          id: p._id || p.id,
          name: p.title || p.name || p.Name || 'Unnamed Product',
          title: p.title || p.name || p.Name || 'Unnamed Product',
          price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
          img: imageValue,  // Use the same value for both
          imageUrl: imageValue,  // Use the same value for both
          category: p.category || 'Product',
          brand: p.brand || '',
        };
      });
      
      // Update state
      if (isFirstPage) {
        setProducts(formatted);
      } else {
        setProducts(prev => [...prev, ...formatted]);
      }
      
      // Check if there are more products
      const hasMoreProducts = fetchedProducts.length === limit;
      setHasMore(hasMoreProducts);
      
      if (fetchedProducts.length < limit) {
        setAllProductsLoaded(true);
      }
    } catch (error) {
      console.error('[ProductsPage] Error fetching products:', error);
    } finally {
      if (isFirstPage) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && !loading && !loadingMore && hasMore && !allProductsLoaded) {
      console.log('[ProductsPage] Loading more...');
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
  }, [inView, loading, loadingMore, hasMore, allProductsLoaded, page, fetchProducts]);

  // Skeleton loader component
  const ProductSkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg border border-neutral-200 animate-pulse">
          <div className="aspect-square bg-gray-200"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-600">
          {products.length > 0 && `Showing ${products.length} products`}
        </p>
      </div>
      
      {loading ? (
        <ProductSkeletonGrid />
      ) : (
        <>
          <ProductGrid products={products} />
          
          {/* Load More Trigger */}
          {hasMore && !allProductsLoaded && (
            <div ref={ref} className="py-8 flex justify-center items-center">
              <div className="h-10"></div>
            </div>
          )}
          
          {/* All Products Loaded */}
          {allProductsLoaded && products.length > 0 && (
            <div className="py-8 text-center">
              <p className="text-gray-600 font-medium">
                ✅ All {products.length} products loaded
              </p>
            </div>
          )}
          
          {/* No Products */}
          {products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No products found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;