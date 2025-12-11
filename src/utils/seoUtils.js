/**
 * Updates the document title and meta tags for SEO.
 * @param {Object} metadata - The metadata to set.
 * @param {string} metadata.title - The page title.
 * @param {string} metadata.description - The page description.
 * @param {string} metadata.image - The image URL for OG tags.
 * @param {string} metadata.url - The current page URL.
 */
export const updateSEO = ({ title, description, image, url }) => {
  // Update Title
  document.title = title || 'Aala Computer';

  // Helper to update or create meta tag
  const setMetaTag = (selector, attribute, value) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      const [attrName, attrValue] = selector.replace('meta[', '').replace(']', '').split('=');
      element.setAttribute(attrName, attrValue.replace(/["']/g, ''));
      document.head.appendChild(element);
    }
    element.setAttribute(attribute, value);
  };

  // Update Description
  if (description) {
    setMetaTag('meta[name="description"]', 'content', description);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
  }

  // Update Title in OG/Twitter
  if (title) {
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[name="twitter:title"]', 'content', title);
  }

  // Update Image
  if (image) {
    setMetaTag('meta[property="og:image"]', 'content', image);
    setMetaTag('meta[name="twitter:image"]', 'content', image);
  }

  // Update URL
  if (url) {
    setMetaTag('meta[property="og:url"]', 'content', url);
  }
};
