// nav.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, ChevronDown, ShoppingCart, User } from 'lucide-react';
import { motion as FM, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_CONFIG } from './config/api';

const categories = [
  { name: 'Prebuilds', path: '/prebuild' },
  { name: 'Processors', path: '/products?category=Processors' },
  { name: 'Motherboards', path: '/products?category=Motherboards' },
  { name: 'Graphics Cards', path: '/products?category=Graphics Cards' },
  { name: 'RAM', path: '/products?category=RAM' },
  { name: 'Storage', path: '/products?category=Storage' },
  { name: 'Power Supply', path: '/products?category=Power Supply' },
  { name: 'CPU Coolers', path: '/products?category=CPU Coolers' },
  { name: 'PC Cases', path: '/products?category=PC Cases' },
  { name: 'Peripherals', path: '/products?category=Peripherals' },
  { name: 'Monitors', path: '/products?category=Monitors' },
  { name: 'Laptops', path: '/products?category=Laptops' },
  { name: 'All Products', path: '/products' },
];

const dropdownVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

const mobileDropdownVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.22 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.16 } },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [desktopCatOpen, setDesktopCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // for portal safe mount
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const toggleMenu = () => setIsOpen((s) => !s);
  const toggleDesktopCategory = () => setDesktopCatOpen((s) => !s);
  const toggleMobileCategory = () => setMobileCatOpen((s) => !s);

  const handleCategoryClick = (categoryPath) => {
    setDesktopCatOpen(false);
    setMobileCatOpen(false);
    setIsOpen(false);
    navigate(categoryPath);
  };

  const closeAll = () => {
    setIsOpen(false);
    setDesktopCatOpen(false);
    setMobileCatOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    closeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Listen for cart updates from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('aala_cart');
        if (stored) {
          const items = JSON.parse(stored);
          setCartCount(Array.isArray(items) ? items.length : 0);
        } else {
          setCartCount(0);
        }
      } catch (e) {
        console.warn('Failed to read cart from localStorage:', e);
        setCartCount(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper function to get API base URL
  const getApiBaseUrl = () => API_CONFIG.BASE_URL;

  // ✅ FIXED: Check cart expiry (24 hours)
  useEffect(() => {
    const checkCartExpiry = () => {
      try {
        const cartData = localStorage.getItem('aala_cart_data');
        if (cartData) {
          const { items, timestamp } = JSON.parse(cartData);
          const now = Date.now();
          const oneDayMs = 24 * 60 * 60 * 1000;
          
          // If cart is older than 24 hours, clear it
          if (now - timestamp > oneDayMs) {
            localStorage.removeItem('aala_cart');
            localStorage.removeItem('aala_cart_data');
            setCartCount(0);
            console.log('✅ Cart expired and cleared (24 hours)');
          } else {
            // Cart is still valid, show count
            const count = Array.isArray(items) ? items.length : 0;
            setCartCount(count);
          }
        }
      } catch (e) {
        console.warn('Cart expiry check error:', e);
      }
    };

    checkCartExpiry();
    // Check every minute
    const interval = setInterval(checkCartExpiry, 60000);
    return () => clearInterval(interval);
  }, []);

  // keep your original auth + cart logic intact
  useEffect(() => {
    let alive = true;
    // prefer Authorization header with local accessToken when available (easier in dev)
    const token = (() => { try { return localStorage.getItem('accessToken'); } catch (e) { return null; } })();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${getApiBaseUrl()}/api/v1/auth/me`, { credentials: 'include', headers })
      .then(async (res) => {
        if (!alive) return null;
        if (!res.ok) return null;
        const j = await res.json();
        return j.user;
      })
      .then((u) => {
        if (!alive) return;
        if (u) {
          setUser(u);
          try { localStorage.setItem('user', JSON.stringify(u)); } catch (e) {}
          return;
        }
        try {
          const r = localStorage.getItem('user');
          if (r) setUser(JSON.parse(r));
        } catch (e) { setUser(null); }
      })
      .catch(() => {
        try {
          const r = localStorage.getItem('user');
          if (r) setUser(JSON.parse(r));
        } catch (e) { setUser(null); }
      });

    // Read cart from localStorage instead of API
    try {
      const stored = localStorage.getItem('aala_cart');
      if (stored) {
        const items = JSON.parse(stored);
        setCartCount(Array.isArray(items) ? items.length : 0);
      } else {
        setCartCount(0);
      }
    } catch (e) {
      console.warn('Failed to read cart from localStorage:', e);
      setCartCount(0);
    }

    return () => { alive = false; };
  }, []);

  const handleLogout = () => {
    const token = (() => { try { return localStorage.getItem('accessToken'); } catch (e) { return null; } })();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${getApiBaseUrl()}/api/v1/auth/logout`, { method: 'POST', credentials: 'include', headers }).finally(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      setUser(null);
      navigate('/');
    });
  };

  // ---- header content (regular React element) ----
  const header = (
  <FM.header
      initial={{ y: 60, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: 'easeInOut' }}
  className="bg-panel text-primary fixed top-0 left-0 w-full shadow-sm"
    // ensure header sits above most floating widgets but below UI debug overlays
  style={{ transform: 'none', pointerEvents: 'auto', zIndex: 200000 }}
      role="navigation"
      aria-label="Main navigation"
      tabIndex={0}
    >
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-4 pointer-events-auto">
        {/* ✅ Brand Name Only */}
        <Link to="/" onClick={closeAll} className="text-lg font-bold text-blue-400 hover:text-blue-300 transition">
          Aala Computer
        </Link>

        {/* Desktop nav */}
  <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link to="/" onClick={closeAll} className="hover:text-blue-400 transition">Home</Link>
          <Link to="/products" onClick={closeAll} className="hover:text-blue-400 transition">Products</Link>

          <div className="relative">
            <button
              onClick={toggleDesktopCategory}
              aria-expanded={desktopCatOpen}
              className="flex items-center gap-2 hover:text-blue-400 transition rounded px-2 py-1"
            >
              Category <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {desktopCatOpen && (
                <FM.ul
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className="absolute right-0 mt-2 bg-card rounded-lg shadow-lg w-52 ring-1 ring-black/30 overflow-hidden max-h-[400px] overflow-y-auto"
                >
                  {categories.map((cat) => (
                    <FM.li key={cat.name} whileHover={{ scale: 1.02 }} className="cursor-pointer">
                      <button
                        onClick={() => handleCategoryClick(cat.path)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white transition"
                      >
                        {cat.name}
                      </button>
                    </FM.li>
                  ))}
                </FM.ul>
              )}
            </AnimatePresence>
          </div>

          <Link to="/contact" onClick={closeAll} className="hover:text-blue-400 transition">Contact</Link>
        </nav>

        {/* Right area desktop */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
          <button onClick={() => navigate('/cart')} className="p-2 bg-white hover:bg-gray-100 transition rounded relative" aria-label="Open cart">
            <ShoppingCart size={22} className="text-blue-600" strokeWidth={2.5} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-xs bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-[11px] shadow-lg">{cartCount}</span>}
          </button>

          {user ? (
              <div className="flex items-center gap-3">
              <button onClick={() => navigate('/profile')} className="p-2 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center" aria-label="Profile">
                <User size={18} />
              </button>
              <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700">Logout</button>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="p-2 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center" aria-label="Login">
              <User size={18} />
            </button>
          )}
        </div>

        {/* Mobile icons */}
  <div className="md:hidden flex items-center gap-3 ml-auto pointer-events-auto">
          <button onClick={() => navigate('/cart')} className="p-2 bg-white hover:bg-gray-100 transition rounded relative" aria-label="Open cart">
            <ShoppingCart size={20} className="text-blue-600" strokeWidth={2.5} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 text-xs bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-white font-bold text-[11px] shadow-lg">{cartCount}</span>}
          </button>

          <button
            onClick={toggleMenu}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="p-2 rounded-md bg-white/5 hover:bg-white/10 transition z-[100102] text-primary outline-none focus:outline-none"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* mobile menu (rendered inside header DOM to keep structure) */}
      <AnimatePresence>
        {isOpen && (
            <FM.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-card/95 border-t border-gray-800 shadow-inner"
            style={{ transform: 'none' }}
          >
              <ul className="flex flex-col px-4 py-3 gap-1">
              <li><Link to="/" onClick={closeAll} className="block px-3 py-2 hover:text-blue-400 transition">Home</Link></li>
              <li><Link to="/products" onClick={closeAll} className="block px-3 py-2 hover:text-blue-400 transition">Products</Link></li>

              <li className="pt-1 border-t border-gray-800">
                <button onClick={toggleMobileCategory} className="w-full flex items-center justify-between px-3 py-2 hover:text-blue-400 transition">
                  <span>Category</span>
                  <ChevronDown size={14} className={`${mobileCatOpen ? 'rotate-180' : ''} transition-transform`} />
                </button>

                <AnimatePresence>
                  {mobileCatOpen && (
                    <FM.ul initial="hidden" animate="visible" exit="exit" variants={mobileDropdownVariants} className="pl-3 mt-2 space-y-1 overflow-hidden max-h-[300px] overflow-y-auto">
                      {categories.map((cat) => (
                        <FM.li key={cat.name} whileHover={{ x: 6 }}>
                          <button onClick={() => handleCategoryClick(cat.path)} className="block w-full text-left px-3 py-2 hover:bg-blue-600 hover:text-white rounded transition">{cat.name}</button>
                        </FM.li>
                      ))}
                    </FM.ul>
                  )}
                </AnimatePresence>
              </li>

              <li className="pt-1 border-t border-gray-800">
                <Link to="/contact" onClick={closeAll} className="block px-3 py-2 hover:text-blue-400 transition">Contact</Link>
              </li>
              <li className="pt-2 border-t border-gray-800">
                <div className="flex gap-2">
                  <button onClick={() => { setIsOpen(false); navigate('/cart'); }} className="flex-1 px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold">Cart ({cartCount})</button>
                  {user ? <button onClick={() => { setIsOpen(false); navigate('/profile'); }} className="px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-white">Profile</button> : <button onClick={() => { setIsOpen(false); navigate('/auth'); }} className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold">Login</button>}
                </div>
              </li>
            </ul>
          </FM.div>
        )}
      </AnimatePresence>
    </FM.header>
  );

  // ---- portal render for header + floating WA button to bypass any parent stacking context ----
  return (
    <>
      {/* render header into body when mounted so it's outside transforms/stacking contexts */}
      {mounted && createPortal(header, document.body)}

  {/* spacer so page content doesn't hide under header (responsive) */}
  <div className="h-[72px] md:h-[72px] w-full" />

      {/* Floating buttons removed from global header — moved to a dedicated page */}
    </>
  );
}
