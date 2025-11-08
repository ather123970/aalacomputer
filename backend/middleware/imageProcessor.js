const { isImageAccessible, fetchImage, uploadImageToStorage, getFallbackImageUrl } = require('../utils/imageUtils');
const storage = require('../utils/storage');

async function processProductImages(req, res, next) {
    if (!req.body.images) {
        req.body.images = [];
    }

    // Convert single image URL to images array if needed
    if (req.body.imageUrl && !req.body.images.length) {
        req.body.images.push({
            url: req.body.imageUrl,
            isPrimary: true
        });
    }

    try {
        const processedImages = [];
        
        for (let image of req.body.images) {
            // Check if image URL is accessible
            const isAccessible = await isImageAccessible(image.url);
            
            if (!isAccessible) {
                // Try to fetch from original source if available
                if (req.body.link) {
                    const scrapedImage = await fetchImage(req.body.link);
                    if (scrapedImage) {
                        const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        const urls = await uploadImageToStorage(scrapedImage, fileName, storage);
                        if (urls) {
                            image.url = urls.large;
                            image.sizes = urls;
                            processedImages.push(image);
                            continue;
                        }
                    }
                }
                
                // Use fallback image if everything else fails
                const fallbackUrl = getFallbackImageUrl(req.body.category?.main);
                image.url = fallbackUrl;
                image.isFallback = true;
            }
            
            // Generate thumbnails and different sizes if needed
            if (!image.sizes && !image.isFallback) {
                const imageBuffer = await fetchImage(image.url);
                if (imageBuffer) {
                    const fileName = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    const urls = await uploadImageToStorage(imageBuffer, fileName, storage);
                    if (urls) {
                        image.sizes = urls;
                    }
                }
            }
            
            processedImages.push(image);
        }

        req.body.images = processedImages;
        
        // Set primary image URL for backward compatibility
        if (processedImages.length > 0) {
            const primaryImage = processedImages.find(img => img.isPrimary) || processedImages[0];
            req.body.imageUrl = primaryImage.url;
            req.body.img = primaryImage.url; // For legacy support
        }

        next();
    } catch (error) {
        console.error('Error processing images:', error);
        next(error);
    }
}

module.exports = processProductImages;