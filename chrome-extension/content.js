// Auto-extract image on page load (ULTRA FAST!)
extractAndCopyFirstImage();

function extractAndCopyFirstImage() {
  // FAST: Only 300ms wait for images to load
  setTimeout(() => {
    try {
      let imageUrl = '';
      
      // Method 1: FASTEST - Try to get from image src directly
      const images = document.querySelectorAll('img[src*="http"]');
      for (let img of images) {
        const src = img.src;
        if (src && 
            src.includes('http') && 
            !src.includes('gstatic') && 
            !src.includes('google.com/images') &&
            !src.includes('data:image') &&
            src.length > 50) {
          imageUrl = src;
          break;
        }
      }
      
      // Method 2: Try data-src attribute (for lazy-loaded images)
      if (!imageUrl) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        for (let img of lazyImages) {
          const src = img.getAttribute('data-src');
          if (src && src.includes('http') && !src.includes('gstatic') && src.length > 50) {
            imageUrl = src;
            break;
          }
        }
      }
      
      // Method 3: Try all images as fallback
      if (!imageUrl) {
        const allImages = document.querySelectorAll('img');
        for (let img of allImages) {
          const src = img.src || img.getAttribute('data-src');
          if (src && 
              src.includes('http') && 
              src.length > 50 &&
              !src.includes('gstatic') && 
              !src.includes('google.com')) {
            imageUrl = src;
            break;
          }
        }
      }
      
      if (imageUrl) {
        // Copy to clipboard
        navigator.clipboard.writeText(imageUrl).then(() => {
          console.log('✅ Image URL copied:', imageUrl.substring(0, 80) + '...');
          
          // Show visual feedback
          showNotification('✅ Image copied! Returning...');
          
          // Auto-return to Aala Computer IMMEDIATELY (200ms)
          setTimeout(() => {
            window.location.href = 'http://localhost:5173/admin';
          }, 200);
        }).catch(err => {
          console.error('Failed to copy:', err);
          showNotification('❌ Copy failed');
        });
      } else {
        console.log('❌ No image URL found');
        showNotification('❌ No image found');
      }
    } catch (error) {
      console.error('Error extracting image:', error);
      showNotification('❌ Error');
    }
  }, 300); // ULTRA FAST: Only 300ms wait (was 1000ms)
}

function showNotification(message) {
  // Create a notification element
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1f2937;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
