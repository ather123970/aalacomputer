import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';
import { autoDetectCategory, autoDetectBrand } from '../data/categoriesData';

/**
 * DIAGNOSTIC PAGE
 * Use this page to see what categories your products have in the database
 * Access at: /diagnostic
 */
const DiagnosticPage = () => {
  const [products, setProducts] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [sampleProducts, setSampleProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/products?limit=10000`);
      const data = await response.json();
      const allProducts = Array.isArray(data) ? data : (data.products || []);

      // Count categories
      const counts = {};
      const samples = {};

      allProducts.forEach(product => {
        const originalCategory = product.category || '(empty)';
        const detectedCategory = autoDetectCategory(product);
        const detectedBrand = autoDetectBrand(product);

        const key = `${originalCategory} → ${detectedCategory ? detectedCategory.name : 'Not Detected'}`;
        
        counts[key] = (counts[key] || 0) + 1;

        if (!samples[key] || samples[key].length < 3) {
          samples[key] = samples[key] || [];
          samples[key].push({
            name: product.name || product.title,
            originalCategory: originalCategory,
            detectedCategory: detectedCategory ? detectedCategory.name : 'Not Detected',
            detectedBrand: detectedBrand || 'Not Detected'
          });
        }
      });

      setProducts(allProducts);
      setCategoryCounts(counts);
      setSampleProducts(samples);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading diagnostic data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">🔍 Product Category Diagnostic</h1>
          <p className="text-gray-600 mb-6">
            This page shows what categories your products have in the database and how they're being auto-detected.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{Object.keys(categoryCounts).length}</div>
                <div className="text-sm text-gray-600">Unique Category Mappings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Category Mapping Analysis</h2>
          <p className="text-sm text-gray-600 mb-6">
            Format: <strong>Original Category in DB</strong> → <strong>Auto-Detected Category</strong>
          </p>

          <div className="space-y-4">
            {Object.entries(categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([mapping, count]) => {
                const [original, detected] = mapping.split(' → ');
                const samples = sampleProducts[mapping] || [];
                
                return (
                  <div key={mapping} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-semibold text-gray-800">
                          {original === '(empty)' ? (
                            <span className="text-red-500 italic">(empty)</span>
                          ) : (
                            <span className="text-blue-600">{original}</span>
                          )}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className={`text-lg font-semibold ${
                          detected === 'Not Detected' ? 'text-red-500' : 'text-green-600'
                        }`}>
                          {detected}
                        </span>
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {count} product{count !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {samples.length > 0 && (
                      <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-3">
                        <div className="text-xs font-semibold text-gray-500 mb-2">Sample Products:</div>
                        {samples.map((sample, idx) => (
                          <div key={idx} className="text-sm text-gray-700 mb-1 flex items-center space-x-2">
                            <span className="text-gray-400">•</span>
                            <span className="flex-1">{sample.name}</span>
                            {sample.detectedBrand !== 'Not Detected' && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs">
                                {sample.detectedBrand}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action suggestion */}
                    {original === '(empty)' && detected === 'Not Detected' && (
                      <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">
                        <div className="text-xs font-semibold text-yellow-800 mb-1">⚠️ Action Required:</div>
                        <div className="text-xs text-yellow-700">
                          These products have no category and couldn't be auto-detected. 
                          Update their names/descriptions to include keywords like "Processor", "GPU", "RAM", etc.
                        </div>
                      </div>
                    )}
                    
                    {original !== '(empty)' && original !== detected && detected !== 'Not Detected' && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
                        <div className="text-xs font-semibold text-green-800 mb-1">✅ Auto-Corrected:</div>
                        <div className="text-xs text-green-700">
                          Original category "{original}" is being mapped to "{detected}" automatically.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">💡 Tips</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>If a category shows as "(empty) → Not Detected", add keywords to the product name like "Intel Core i9 Processor" or "RTX 4070 Graphics Card"</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>Products with "Processor" → "Processors" mapping are working correctly (singular → plural is auto-corrected)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>The system recognizes: "CPU", "Processor", "Graphics Card", "GPU", "RAM", "Memory", "Motherboard", "SSD", "HDD", etc.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
