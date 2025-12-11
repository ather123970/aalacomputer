import React, { createContext, useContext, useState, useCallback } from 'react';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [updatedProducts, setUpdatedProducts] = useState({});

  const updateProduct = useCallback((productId, updatedData) => {
    setUpdatedProducts(prev => ({
      ...prev,
      [productId]: updatedData
    }));
  }, []);

  const getUpdatedProduct = useCallback((productId) => {
    return updatedProducts[productId];
  }, [updatedProducts]);

  const value = {
    updatedProducts,
    updateProduct,
    getUpdatedProduct
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within ProductProvider');
  }
  return context;
};
