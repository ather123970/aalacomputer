import { FiLayout, FiShoppingCart, FiPenTool, FiSearch, FiCpu, FiSettings, FiCheck, FiCode, FiSmartphone, FiGlobe, FiTrendingUp } from 'react-icons/fi';

export const NAV_LINKS = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Deals', href: '#deals' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Team', href: '#team' },
    { name: 'Contact', href: '#contact' },
];

export const SERVICES = [
    {
        id: 'web-apps',
        title: 'Custom Web Applications',
        description: 'Scalable, high-performance web apps built with Next.js and React. Perfect for SaaS, dashboards, and complex tools.',
        icon: FiLayout,
        features: ['Next.js 14 / React', 'Secure Authentication', 'Database Integration', 'Admin Dashboards'],
        color: 'blue',
        detailedDescription: 'Transform your business with custom web applications built using cutting-edge technologies. We specialize in creating scalable, secure, and high-performance solutions tailored to your unique needs.',
        techStack: ['Next.js 14', 'React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'MongoDB', 'Tailwind CSS', 'Framer Motion'],
        useCases: [
            { title: 'SaaS Platforms', description: 'Multi-tenant applications with advanced features' },
            { title: 'Admin Dashboards', description: 'Data visualization and management tools' },
            { title: 'Customer Portals', description: 'Self-service platforms for your clients' },
            { title: 'Business Tools', description: 'Custom applications for internal workflows' }
        ],
        benefits: [
            'Lightning-fast performance with Next.js optimization',
            'Secure authentication and authorization',
            'Scalable architecture that grows with your business',
            'Real-time data synchronization',
            'Mobile-responsive design',
            'SEO-friendly architecture'
        ],
        priceRange: { min: 1500, max: 10000, currency: 'USD' }
    },
    {
        id: 'shopify',
        title: 'Shopify Stores',
        description: 'Custom Shopify themes and headless storefronts that convert visitors into loyal customers.',
        icon: FiShoppingCart,
        features: ['Custom Themes', 'Headless Shopify', 'Conversion Optimization', 'App Integration'],
        color: 'green',
        detailedDescription: 'Launch or upgrade your e-commerce store with expert Shopify development. From custom themes to headless commerce solutions, we create shopping experiences that drive sales.',
        techStack: ['Shopify Liquid', 'Headless Commerce', 'React', 'Next.js', 'Shopify APIs', 'Payment Gateways', 'Analytics Tools'],
        useCases: [
            { title: 'Custom Shopify Themes', description: 'Unique designs that match your brand' },
            { title: 'Headless Storefronts', description: 'Lightning-fast shopping experiences' },
            { title: 'Store Migration', description: 'Seamless migration from other platforms' },
            { title: 'App Integration', description: 'Connect with essential e-commerce tools' }
        ],
        benefits: [
            'Conversion-optimized checkout flows',
            'Mobile-first responsive design',
            'Advanced product filtering and search',
            'Integration with marketing tools',
            'Custom app development',
            'Performance optimization for fast load times'
        ],
        priceRange: { min: 800, max: 5000, currency: 'USD' }
    },
    {
        id: 'design',
        title: 'UI/UX Design',
        description: 'Stunning, user-centric designs that blend aesthetics with functionality. We design for conversion.',
        icon: FiPenTool,
        features: ['Figma Prototypes', 'User Research', 'Design Systems', 'Motion Design'],
        color: 'purple',
        detailedDescription: 'Create memorable digital experiences with our comprehensive UI/UX design services. We combine user research, beautiful aesthetics, and conversion-focused design principles.',
        techStack: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Principle', 'After Effects', 'Illustrator', 'Photoshop'],
        useCases: [
            { title: 'Website Design', description: 'Beautiful, conversion-focused web designs' },
            { title: 'Mobile App Design', description: 'Intuitive iOS and Android interfaces' },
            { title: 'Design Systems', description: 'Scalable component libraries' },
            { title: 'Brand Identity', description: 'Complete visual identity packages' }
        ],
        benefits: [
            'User research and persona development',
            'Interactive prototypes and wireframes',
            'Comprehensive design systems',
            'Motion design and micro-interactions',
            'Accessibility-first approach',
            'Conversion rate optimization'
        ],
        priceRange: { min: 500, max: 3000, currency: 'USD' }
    },
    {
        id: 'seo',
        title: 'SEO & Growth',
        description: 'Data-driven SEO strategies to rank your site higher and drive organic traffic that converts.',
        icon: FiSearch,
        features: ['Technical SEO', 'Content Strategy', 'Local SEO', 'Performance Tuning'],
        color: 'orange',
        detailedDescription: 'Dominate search rankings and drive qualified organic traffic with our comprehensive SEO services. We use proven strategies to increase your visibility and grow your business.',
        techStack: ['Google Analytics', 'Search Console', 'Ahrefs', 'SEMrush', 'Screaming Frog', 'Schema Markup', 'GTM'],
        useCases: [
            { title: 'Technical SEO Audit', description: 'Comprehensive site analysis and fixes' },
            { title: 'Content Optimization', description: 'Keyword research and content strategy' },
            { title: 'Local SEO', description: 'Dominate local search results' },
            { title: 'E-commerce SEO', description: 'Product and category optimization' }
        ],
        benefits: [
            'Comprehensive technical SEO audits',
            'Keyword research and content strategy',
            'On-page and off-page optimization',
            'Local SEO and Google Business Profile',
            'Performance optimization (Core Web Vitals)',
            'Monthly reporting and analytics'
        ],
        priceRange: { min: 500, max: 2500, currency: 'USD/month' }
    },
    {
        id: 'ai',
        title: 'AI Integration',
        description: 'Leverage the power of AI with custom chatbots, automation, and intelligent features for your business.',
        icon: FiCpu,
        features: ['Custom Chatbots', 'OpenAI Integration', 'Process Automation', 'Data Analysis'],
        color: 'indigo',
        detailedDescription: 'Stay ahead of the competition with AI-powered solutions. From intelligent chatbots to automation workflows, we help you leverage AI to enhance customer experience and operational efficiency.',
        techStack: ['OpenAI GPT-4', 'LangChain', 'Pinecone', 'Python', 'TensorFlow', 'Hugging Face', 'Vector Databases'],
        useCases: [
            { title: 'AI Chatbots', description: '24/7 customer support automation' },
            { title: 'Content Generation', description: 'AI-powered content creation tools' },
            { title: 'Data Analysis', description: 'Intelligent insights from your data' },
            { title: 'Process Automation', description: 'Streamline repetitive tasks' }
        ],
        benefits: [
            'Custom AI chatbots trained on your data',
            'Integration with GPT-4 and Claude',
            'Automated customer support',
            'Intelligent product recommendations',
            'Document processing and analysis',
            'Natural language interfaces'
        ],
        priceRange: { min: 1000, max: 8000, currency: 'USD' }
    },
    {
        id: 'maintenance',
        title: 'Maintenance & Support',
        description: 'Keep your digital assets running smoothly with our 24/7 monitoring and support packages.',
        icon: FiSettings,
        features: ['24/7 Monitoring', 'Security Updates', 'Performance Optimization', 'Regular Backups'],
        color: 'slate',
        detailedDescription: 'Ensure your website or application runs flawlessly with our comprehensive maintenance and support services. We provide proactive monitoring, security updates, and performance optimization.',
        techStack: ['Monitoring Tools', 'Security Scanners', 'CDN', 'Backup Solutions', 'Performance Tools', 'SSL Management'],
        useCases: [
            { title: 'Website Maintenance', description: 'Regular updates and monitoring' },
            { title: 'Security Management', description: 'Proactive security and backups' },
            { title: 'Performance Optimization', description: 'Speed and uptime improvements' },
            { title: 'Technical Support', description: '24/7 expert assistance' }
        ],
        benefits: [
            '24/7 uptime monitoring and alerts',
            'Regular security patches and updates',
            'Daily automated backups',
            'Performance optimization',
            'Priority technical support',
            'Monthly reports and analytics'
        ],
        priceRange: { min: 200, max: 1000, currency: 'USD/month' }
    }
];

export const PRICING_PLANS = [
    {
        id: 'starter',
        name: 'Starter Package',
        price: { usd: 250, pkr: 30000 },
        range: { usd: '250–700', pkr: '30k–80k' },
        description: 'Perfect for small businesses and startups',
        features: [
            'Professional 5-Page Website',
            'Mobile Responsive Design',
            'Basic SEO Setup',
            'Contact Form Integration',
            'Social Media Links',
            '1 Month Free Support'
        ],
        highlight: false,
        buttonText: 'Get Started'
    },
    {
        id: 'growth',
        name: 'Growth Package',
        price: { usd: 500, pkr: 70000 },
        range: { usd: '500–1500', pkr: '70k–150k' },
        description: 'Ideal for growing businesses',
        features: [
            '10-Page Custom Website',
            'CMS Integration',
            'Advanced SEO',
            'Speed Optimization',
            'Google Analytics',
            '3 Months Free Support',
            'Free Domain for 1 Year'
        ],
        highlight: true,
        buttonText: 'Order Now'
    },
    {
        id: 'premium',
        name: 'Enterprise Solution',
        price: { usd: 1500, pkr: 200000 },
        range: { usd: '1500+', pkr: '200k+' },
        description: 'Full-scale digital solution',
        features: [
            'Unlimited Pages',
            'E-commerce Functionality',
            'Custom Web Application',
            'Premium UI/UX Design',
            'Priority 24/7 Support',
            '6 Months Maintenance'
        ],
        highlight: false,
        buttonText: 'Contact Sales'
    }
];

export const DEALS = [
    {
        id: 'deal-1',
        title: 'Starter Web Presence',
        tagline: 'Perfect for new businesses',
        description: 'Get online fast with a professional presence',
        price: { usd: 100, pkr: 10000 },
        priceRange: '7,999 – 12,000',
        currency: 'PKR',
        features: [
            '1–3 Page Website (Home, About, Contact)',
            'Clean UI/UX Design',
            'Mobile-Responsive Layout',
            'WhatsApp Chat Integration',
            'Basic SEO Setup',
            'Free Speed Optimization',
            '⚡ Delivery in 2–3 Days',
        ],
        badge: 'Quick Start',
        color: 'blue',
        bestFor: 'New businesses, local shops, small services'
    },
    {
        id: 'deal-2',
        title: 'Ecommerce Launch Pack',
        tagline: 'Start selling online',
        description: 'Full online store that drives sales',
        price: { usd: 350, pkr: 32500 },
        priceRange: '25,000 – 40,000',
        currency: 'PKR',
        features: [
            'Full Ecommerce Website (Shopify or Custom)',
            '10–20 Products Upload',
            'Categories, Filters & Checkout Setup',
            'Payment Gateway Integration',
            'Order + Inventory Management System',
            'SEO-Optimized Product Pages',
            'Clean, Minimal UI',
            'Mobile-First Layout',
            'Basic Analytics Integration',
        ],
        addons: [
            '+500 PKR per additional product',
            '+4,000 PKR WhatsApp Order Bot',
            '+5,000 PKR Email Order Notifications',
        ],
        badge: 'Most Popular',
        color: 'green',
        bestFor: 'Small to medium online stores',
        highlight: true
    },
    {
        id: 'deal-3',
        title: 'Growth & Branding Bundle',
        tagline: 'Scale your brand',
        description: 'Premium design + marketing power',
        price: { usd: 700, pkr: 65000 },
        priceRange: '50,000 – 80,000',
        currency: 'PKR',
        features: [
            'Full Website Redesign + Premium UI/UX',
            'Brand Identity Pack (Colors, Typography, Logo)',
            'SEO Optimization (20 Keywords)',
            'Blog Setup & Management',
            'Speed Score 95+',
            'Mobile-Optimized Animations',
            'Social Media Integration',
            '1 Month of Support',
        ],
        addons: [
            '+15,000 PKR Content Writing (5 Pages)',
            '+10,000 PKR Monthly SEO Maintenance',
        ],
        badge: 'Best Value',
        color: 'purple',
        bestFor: 'Growing businesses ready to scale'
    },
    {
        id: 'deal-4',
        title: 'AI-Powered Business System',
        tagline: 'Enterprise automation',
        description: 'AI + automation for serious growth',
        price: { usd: 1300, pkr: 122500 },
        priceRange: '95,000 – 150,000',
        currency: 'PKR',
        features: [
            'Full Advanced Ecommerce/Business Site',
            'AI Sales Agent (Chatbot for Support)',
            'AI Product Recommenders',
            'Automated Email + WhatsApp Flows',
            'Dashboard Integration (Orders, Customers)',
            'Advanced SEO Strategy',
            'High-End UI/UX',
            'Premium Animations + Micro-Interactions',
            '1 Month Technical Support',
        ],
        addons: [
            '+10,000–20,000 PKR Extra AI Features',
            '+15,000 PKR CRM Setup',
        ],
        badge: '🔥 Premium',
        color: 'orange',
        bestFor: 'Established businesses seeking automation'
    }
];

export const TEAM_MEMBERS = [
    {
        id: 1,
        name: 'Ather',
        role: 'Founder & Lead Developer',
        image: '/team/ather.jpg',
        skills: ['Next.js', 'React', 'Node.js', 'System Architecture'],
        bio: 'Full-stack expert with a passion for building scalable web solutions.'
    },
    {
        id: 2,
        name: 'Sarah',
        role: 'Senior UI/UX Designer',
        image: '/team/sarah.jpg',
        skills: ['Figma', 'Motion Design', 'User Research'],
        bio: 'Creating intuitive and beautiful digital experiences.'
    },
    {
        id: 3,
        name: 'Ali',
        role: 'Shopify Expert',
        image: '/team/ali.jpg',
        skills: ['Liquid', 'Headless Commerce', 'CRO'],
        bio: 'Specializing in high-converting e-commerce stores.'
    },
    {
        id: 4,
        name: 'Zain',
        role: 'SEO Specialist',
        image: '/team/zain.jpg',
        skills: ['Technical SEO', 'Content Strategy', 'Analytics'],
        bio: 'Driving organic growth and visibility for brands.'
    }
];

export const PROCESS_STEPS = [
    {
        id: 1,
        title: 'Discovery',
        description: 'We analyze your requirements and business goals.',
        icon: FiSearch
    },
    {
        id: 2,
        title: 'Planning',
        description: 'Creating a roadmap and technical strategy.',
        icon: FiLayout
    },
    {
        id: 3,
        title: 'Design',
        description: 'Crafting beautiful, user-centric interfaces.',
        icon: FiPenTool
    },
    {
        id: 4,
        title: 'Development',
        description: 'Building robust and scalable solutions.',
        icon: FiCode
    },
    {
        id: 5,
        title: 'Testing',
        description: 'Rigorous QA to ensure bug-free delivery.',
        icon: FiCheck
    },
    {
        id: 6,
        title: 'Launch',
        description: 'Deploying your project to the world.',
        icon: FiGlobe
    }
];

export const TESTIMONIALS = [
    {
        id: 1,
        name: 'John Doe',
        role: 'CEO, TechStart',
        content: 'AtherWeb transformed our digital presence. Their attention to detail and technical expertise is unmatched.',
        rating: 5,
        image: '/testimonials/john.jpg'
    },
    {
        id: 2,
        name: 'Jane Smith',
        role: 'Marketing Director, ShopNow',
        content: 'The Shopify store they built for us increased our conversions by 200%. Highly recommended!',
        rating: 5,
        image: '/testimonials/jane.jpg'
    },
    {
        id: 3,
        name: 'Mike Johnson',
        role: 'Founder, Appify',
        content: 'Professional, timely, and incredibly talented team. The web app works flawlessly.',
        rating: 5,
        image: '/testimonials/mike.jpg'
    }
];

export const PORTFOLIO_ITEMS = [
    {
        id: 1,
        title: 'WorkFlowX',
        category: 'Web Application',
        image: '/portfolio/workflowx.png',
        client: 'Live Project',
        niche: 'Project Management',
        description: 'Professional project management system with task tracking, team collaboration, and real-time updates.',
        problem: 'Teams needed a centralized system to manage projects, track progress, and collaborate effectively.',
        solution: ['Real-time Collaboration', 'Task Management System', 'Project Analytics', 'Team Dashboard'],
        results: { efficiency: '+180%', productivity: '85% saved', teams: '50+ users' },
        liveUrl: 'https://workflowx-b4d1.onrender.com'
    },
    {
        id: 2,
        title: 'Watch Store PK',
        category: 'E-commerce',
        image: '/portfolio/watchstore.png',
        client: 'Live Store',
        niche: 'Luxury Watches',
        description: 'Premium online watch boutique with elegant design, product filtering, and seamless shopping experience.',
        problem: 'Needed an elegant e-commerce platform to showcase and sell premium luxury timepieces online.',
        solution: ['Premium UI Design', 'Advanced Product Filters', 'Responsive Layout', 'Secure Checkout'],
        results: { sales: 'Active', conversion: '4.2%', products: '100+ items' },
        liveUrl: 'http://watchstorepk.onrender.com'
    },
    {
        id: 3,
        title: 'Edgeline Creative Studio',
        category: 'Agency Website',
        image: '/portfolio/project_agency_website.png',
        client: 'Edgeline Agency',
        niche: 'Creative Digital Agency',
        description: 'Futuristic agency website with bold design, immersive 3D elements, and cutting-edge animations.',
        problem: 'Old website failed to showcase their creative capabilities and premium services.',
        solution: ['3D Interactive Elements', 'Bold Typography System', 'Immersive Animations', 'Premium Dark UI'],
        results: { clients: '+250%', engagement: '5min avg', leads: '+180%' }
    },
    {
        id: 4,
        title: 'Premium Fashion Store',
        category: 'E-commerce',
        image: '/portfolio/project_ecommerce_store.png',
        client: 'Luxe Boutique',
        niche: 'High-End Fashion',
        description: 'Luxury Shopify store with seamless checkout, product filters, and mobile-first design.',
        problem: 'Outdated platform with poor mobile experience and low conversion rates.',
        solution: ['Headless Shopify Architecture', 'Advanced Product Filtering', 'One-Click Checkout', 'Mobile-First Design'],
        results: { sales: '+320%', conversion: '4.8%', aov: '+85%' }
    },
    {
        id: 5,
        title: 'Modern UI/UX Portfolio',
        category: 'Web Design',
        image: '/portfolio/project_uiux_design.png',
        client: 'DesignHub Studio',
        niche: 'UI/UX Design Agency',
        description: 'Elegant portfolio website showcasing modern design work with clean aesthetics and smooth interactions.',
        problem: 'Portfolio wasn\'t effectively highlighting their premium design services.',
        solution: ['Interactive Case Studies', 'Motion Design', 'Clean Typography', 'Responsive Grid System'],
        results: { projects: '100+ leads', engagement: '+220%', bookings: '+150%' }
    }
];

export const FAQS = [
    {
        question: 'How long does a project take?',
        answer: 'Timeline varies by complexity. A standard website takes 2-4 weeks, while custom web apps can take 8-12 weeks.'
    },
    {
        question: 'Do you offer maintenance?',
        answer: 'Yes, we offer comprehensive maintenance packages to ensure your site remains secure and up-to-date.'
    },
    {
        question: 'What is your payment structure?',
        answer: 'We typically require a 50% deposit to start, with the remaining balance due upon successful delivery.'
    },
    {
        question: 'Can you help with hosting?',
        answer: 'Absolutely. We can recommend and set up the best hosting solution for your specific needs.'
    }
];
