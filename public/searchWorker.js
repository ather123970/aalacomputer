// Web Worker for search functionality
let searchIndex = null;

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'INIT_SEARCH':
      // Initialize search index with product data
      searchIndex = payload.map(product => ({
        id: product._id,
        name: product.name.toLowerCase(),
        brand: (product.brand || '').toLowerCase(),
        category: (product.category?.main || '').toLowerCase(),
        searchText: `${product.name} ${product.brand} ${product.category?.main || ''} ${product.description || ''}`.toLowerCase()
      }));
      self.postMessage({ type: 'INIT_COMPLETE' });
      break;

    case 'SEARCH':
      if (!searchIndex) {
        self.postMessage({ type: 'ERROR', error: 'Search index not initialized' });
        return;
      }

      const searchTerm = payload.toLowerCase();
      const results = searchIndex
        .filter(item => item.searchText.includes(searchTerm))
        .map(item => item.id)
        .slice(0, 10); // Limit to 10 results

      self.postMessage({ type: 'SEARCH_RESULTS', results });
      break;
  }
};