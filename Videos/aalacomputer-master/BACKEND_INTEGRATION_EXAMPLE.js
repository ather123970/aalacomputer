// Example Backend Integration (backend/routes/products.js)

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || 'http://localhost:5000/images';

// When fetching products from MongoDB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    
    // Add full image URLs
    const productsWithImages = products.map(product => ({
      ...product.toObject(),
      img: product.img ? `${IMAGE_BASE_URL}/${encodeURIComponent(product.img)}` : null,
      imageUrl: product.imageUrl ? `${IMAGE_BASE_URL}/${encodeURIComponent(product.imageUrl)}` : null
    }));
    
    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Environment Variables (.env file)
// Development:
IMAGE_BASE_URL=http://localhost:5000/images

// Production:
IMAGE_BASE_URL=https://your-image-server.herokuapp.com/images
// or
IMAGE_BASE_URL=https://cdn.yourdomain.com/images