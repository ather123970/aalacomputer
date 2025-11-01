// Helper functions for handling product images

function normalizeImageUrl(url) {
    if (!url) return '/placeholder.svg';
    
    // If it's already an absolute URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    // If it's a relative path starting with /
    if (url.startsWith('/')) {
        return process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}${url}` : url;
    }
    
    // Add leading slash if missing
    return `/${url}`;
}

function syncImageFields(product) {
    const imageUrl = product.imageUrl || product.img;
    const normalizedUrl = normalizeImageUrl(imageUrl);
    
    return {
        ...product,
        imageUrl: normalizedUrl,
        img: normalizedUrl
    };
}

module.exports = {
    normalizeImageUrl,
    syncImageFields
};