const axios = require('axios');
const sharp = require('sharp');

// Check if an image URL is accessible
async function isImageAccessible(url) {
    try {
        const response = await axios.head(url);
        const contentType = response.headers['content-type'];
        return contentType && contentType.startsWith('image/');
    } catch (error) {
        return false;
    }
}

// Generate different sizes of an image
async function generateImageSizes(imageBuffer) {
    try {
        const [small, medium, large] = await Promise.all([
            sharp(imageBuffer).resize(300, 300, { fit: 'contain' }).toBuffer(),
            sharp(imageBuffer).resize(600, 600, { fit: 'contain' }).toBuffer(),
            sharp(imageBuffer).resize(1000, 1000, { fit: 'contain' }).toBuffer()
        ]);

        return { small, medium, large };
    } catch (error) {
        console.error('Error generating image sizes:', error);
        return null;
    }
}

// Upload image to storage and return URLs
async function uploadImageToStorage(imageBuffer, fileName, storage) {
    try {
        const sizes = await generateImageSizes(imageBuffer);
        if (!sizes) return null;

        const urls = {};
        for (const [size, buffer] of Object.entries(sizes)) {
            const path = `products/${fileName}_${size}`;
            await storage.upload(path, buffer);
            urls[size] = await storage.getUrl(path);
        }

        return urls;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}

// Fetch image from URL and return buffer
async function fetchImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
}

// Get fallback image URL based on category
function getFallbackImageUrl(category) {
    const fallbacks = {
        'Keyboards': 'https://your-cdn.com/fallbacks/keyboard.jpg',
        'Mouse': 'https://your-cdn.com/fallbacks/mouse.jpg',
        'Monitors': 'https://your-cdn.com/fallbacks/monitor.jpg',
        'default': 'https://your-cdn.com/fallbacks/product.jpg'
    };

    return fallbacks[category] || fallbacks.default;
}

module.exports = {
    isImageAccessible,
    generateImageSizes,
    uploadImageToStorage,
    fetchImage,
    getFallbackImageUrl
};