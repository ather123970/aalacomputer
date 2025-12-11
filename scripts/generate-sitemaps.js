/**
 * Sitemap Generator for Aala Computer
 * Generates XML sitemaps for Google Search Console
 * Run: node scripts/generate-sitemaps.js
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://aalacomputer.com';
const PUBLIC_DIR = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

/**
 * Generate XML sitemap header
 */
function generateSitemapHeader() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0">
`;
}

/**
 * Generate single URL entry
 */
function generateUrlEntry(url, lastmod = new Date().toISOString().split('T')[0], priority = '0.8', changefreq = 'weekly') {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
}

/**
 * Generate sitemap footer
 */
function generateSitemapFooter() {
  return `</urlset>`;
}

/**
 * Main sitemap - Homepage and key pages
 */
function generateMainSitemap() {
  let xml = generateSitemapHeader();

  const mainPages = [
    { url: BASE_URL, priority: '1.0', changefreq: 'daily' },
    { url: `${BASE_URL}/products`, priority: '0.9', changefreq: 'daily' },
    { url: `${BASE_URL}/deals`, priority: '0.8', changefreq: 'daily' },
    { url: `${BASE_URL}/about`, priority: '0.7', changefreq: 'monthly' },
    { url: `${BASE_URL}/contact`, priority: '0.7', changefreq: 'monthly' },
    { url: `${BASE_URL}/guides`, priority: '0.8', changefreq: 'weekly' },
    { url: `${BASE_URL}/blog`, priority: '0.8', changefreq: 'weekly' },
  ];

  mainPages.forEach(page => {
    xml += generateUrlEntry(page.url, new Date().toISOString().split('T')[0], page.priority, page.changefreq);
  });

  xml += generateSitemapFooter();
  return xml;
}

/**
 * Category pages sitemap
 */
function generateCategoriesSitemap() {
  let xml = generateSitemapHeader();

  const categories = [
    'gpu',
    'cpu',
    'ram',
    'motherboard',
    'storage',
    'power-supply',
    'cpu-cooler',
    'pc-case',
    'monitor',
    'keyboard',
    'mouse',
    'headset',
    'laptop',
    'networking',
    'cables-accessories',
    'deals',
  ];

  categories.forEach(category => {
    const url = `${BASE_URL}/category/${category}`;
    xml += generateUrlEntry(url, new Date().toISOString().split('T')[0], '0.9', 'weekly');
  });

  xml += generateSitemapFooter();
  return xml;
}

/**
 * Products sitemap (split into multiple files for large catalogs)
 * This is a template - in production, fetch from database
 */
function generateProductsSitemap() {
  let xml = generateSitemapHeader();

  // Example products - in production, fetch from MongoDB
  const exampleProducts = [
    { id: '1', slug: 'nvidia-rtx-4090-24gb', category: 'gpu', priority: '0.8' },
    { id: '2', slug: 'nvidia-rtx-4080-16gb', category: 'gpu', priority: '0.8' },
    { id: '3', slug: 'intel-core-i9-13900k', category: 'cpu', priority: '0.8' },
    { id: '4', slug: 'amd-ryzen-9-7950x', category: 'cpu', priority: '0.8' },
    { id: '5', slug: 'corsair-32gb-ddr5-ram', category: 'ram', priority: '0.8' },
  ];

  exampleProducts.forEach(product => {
    const url = `${BASE_URL}/products/${product.category}/${product.slug}`;
    xml += generateUrlEntry(url, new Date().toISOString().split('T')[0], product.priority, 'weekly');
  });

  // Note: In production, add all 5000+ products here
  xml += `  <!-- Add all 5000+ products here from database -->
`;

  xml += generateSitemapFooter();
  return xml;
}

/**
 * Guides and blog sitemap
 */
function generateGuidesSitemap() {
  let xml = generateSitemapHeader();

  const guides = [
    { slug: 'best-gpu-for-gaming-2024', priority: '0.8' },
    { slug: 'gaming-pc-build-guide', priority: '0.8' },
    { slug: 'how-to-choose-cpu', priority: '0.7' },
    { slug: 'rtx-4090-vs-rtx-4080', priority: '0.7' },
    { slug: 'intel-vs-amd-processors', priority: '0.7' },
    { slug: 'best-gaming-laptop-pakistan', priority: '0.8' },
    { slug: 'pc-building-for-beginners', priority: '0.7' },
    { slug: 'budget-gaming-pc-build', priority: '0.8' },
  ];

  guides.forEach(guide => {
    const url = `${BASE_URL}/guides/${guide.slug}`;
    xml += generateUrlEntry(url, new Date().toISOString().split('T')[0], guide.priority, 'monthly');
  });

  xml += generateSitemapFooter();
  return xml;
}

/**
 * Sitemap index - references all sitemaps
 */
function generateSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-main.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-categories.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-products.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-guides.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/**
 * Write sitemap to file
 */
function writeSitemap(filename, content) {
  const filepath = path.join(PUBLIC_DIR, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ Generated: ${filename} (${content.length} bytes)`);
}

/**
 * Main execution
 */
function generateAllSitemaps() {
  console.log('🚀 Generating sitemaps for Aala Computer...\n');

  try {
    // Generate individual sitemaps
    writeSitemap('sitemap-main.xml', generateMainSitemap());
    writeSitemap('sitemap-categories.xml', generateCategoriesSitemap());
    writeSitemap('sitemap-products.xml', generateProductsSitemap());
    writeSitemap('sitemap-guides.xml', generateGuidesSitemap());
    
    // Generate sitemap index
    writeSitemap('sitemap.xml', generateSitemapIndex());

    console.log('\n✅ All sitemaps generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Submit sitemap.xml to Google Search Console');
    console.log('2. Submit sitemap.xml to Bing Webmaster Tools');
    console.log('3. Verify robots.txt includes sitemap location');
    console.log('\n📊 Sitemaps created:');
    console.log('- sitemap.xml (index)');
    console.log('- sitemap-main.xml (homepage and key pages)');
    console.log('- sitemap-categories.xml (category pages)');
    console.log('- sitemap-products.xml (product pages)');
    console.log('- sitemap-guides.xml (guides and blog)');

  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  generateAllSitemaps();
}

module.exports = {
  generateMainSitemap,
  generateCategoriesSitemap,
  generateProductsSitemap,
  generateGuidesSitemap,
  generateSitemapIndex,
};
