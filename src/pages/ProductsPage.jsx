import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ProductGrid, LoadingSpinner } from '../components/PremiumUI';
import { API_BASE } from '../config/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products?page=${page}`);
      const data = await response.json();
      
      setProducts(prev => page === 1 ? data.products : [...prev, ...data.products]);
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6">Our Products</h1>
      
      <ProductGrid products={products} />
      
      {loading && <LoadingSpinner />}
      
      {hasMore && !loading && (
        <div ref={ref} className="h-10" />
      )}
    </div>
  );
};

export default ProductsPage;