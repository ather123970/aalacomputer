import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Tag, TrendingDown, Flame, AlertCircle, ShoppingCart, Zap } from 'lucide-react';
import { API_CONFIG } from '../config/api';

// Deal rotation settings
const DEAL_ROTATION_HOURS = 5;
const DEAL_STORAGE_KEY = 'dealRotationTimestamp';

export default function Deal() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dealRotationTime, setDealRotationTime] = useState(null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('aala_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [notification, setNotification] = useState('');
  
  // Initialize or check deal rotation timer
  useEffect(() => {
    const checkRotation = () => {
      const stored = localStorage.getItem(DEAL_STORAGE_KEY);
      const now = Date.now();
      
      if (!stored) {
        // First time - set rotation time
        const rotationTime = now + (DEAL_ROTATION_HOURS * 60 * 60 * 1000);
        localStorage.setItem(DEAL_STORAGE_KEY, rotationTime.toString());
        setDealRotationTime(rotationTime);
      } else {
        const storedTime = parseInt(stored);
        if (now >= storedTime) {
          // Time expired - rotate to next deal
          const newRotationTime = now + (DEAL_ROTATION_HOURS * 60 * 60 * 1000);
          localStorage.setItem(DEAL_STORAGE_KEY, newRotationTime.toString());
          setDealRotationTime(newRotationTime);
          // Move to next deal
          setCurrentDealIndex(prev => (prev + 1) % Math.max(deals.length, 1));
        } else {
          setDealRotationTime(storedTime);
        }
      }
    };
    
    checkRotation();
    // Check every minute
    const interval = setInterval(checkRotation, 60000);
    return () => clearInterval(interval);
  }, [deals.length]);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        // Try to fetch from Deals category first, then fallback to all products
        let response = await fetch(`${base}/api/products?category=Deals&limit=100`);
        let data = await response.json();
        let productsArray = Array.isArray(data) ? data : (data.products || []);
        
        // If no deals found, fetch random products to use as deals
        if (productsArray.length === 0) {
          response = await fetch(`${base}/api/products?limit=50&page=1`);
          data = await response.json();
          productsArray = Array.isArray(data) ? data : (data.products || []);
          // Shuffle and take first 5
          productsArray = productsArray.sort(() => Math.random() - 0.5).slice(0, 5);
        }
        
        const formatted = productsArray.map(d => {
          const dealId = d._id || d.id;
          const originalPrice = typeof d.price === 'number' ? d.price : parseInt(d.price) || 0;
          const discountPercent = 10; // Always 10% discount
          const dealPrice = Math.round(originalPrice * 0.9); // 10% off
          
          return {
            id: dealId,
            name: d.title || d.name || 'Unnamed Deal',
            price: originalPrice,
            originalPrice: originalPrice,
            discount: discountPercent,
            img: d.img || d.imageUrl || (dealId ? `/api/product-image/${dealId}` : '/placeholder.svg'),
            target: d.description || d.category || 'Special Deal',
            tag: d.category || 'Deal',
            expiryDate: d.expiryDate || d.expiry,
            dealPrice: dealPrice
          };
        });
        setDeals(formatted);
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('aala_cart', JSON.stringify(cart));
    // Fire custom event to update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
  }, [cart]);

  // Add single product to cart
  const addToCart = (deal) => {
    const newItem = {
      id: deal.id.toString(),
      name: deal.name,
      price: deal.dealPrice,
      img: deal.img,
      spec: deal.target || '',
      qty: 1
    };
    
    // Check if item already exists
    const existingIndex = cart.findIndex(item => item.id === newItem.id);
    let updatedCart;
    
    if (existingIndex !== -1) {
      // Item exists, increment quantity
      updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        qty: (updatedCart[existingIndex].qty || 1) + 1
      };
    } else {
      // New item
      updatedCart = [...cart, newItem];
    }
    
    setCart(updatedCart);
    setNotification(`✅ ${deal.name} added to cart!`);
    setTimeout(() => setNotification(''), 3000);
  };


  return (
    <div className="py-12 bg-gray-900">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          {notification}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Urgency Header */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full mb-4 animate-pulse shadow-lg">
            <Flame className="w-5 h-5" />
            <span className="font-bold text-lg">⚡ FLASH DEALS - LIMITED TIME ONLY!</span>
            <Flame className="w-5 h-5" />
          </div>
          
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-3">
            Grab It Before It Ends! 🔥
          </h2>
          
          {dealRotationTime && (
            <GlobalCountdown expiryTime={dealRotationTime} />
          )}
          
          <div className="flex items-center justify-center gap-2 mt-4 text-yellow-400">
            <AlertCircle className="w-5 h-5" />
            <p className="text-lg font-semibold">
              Deals rotate automatically! Don't miss out!
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No deals available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for amazing offers!</p>
          </div>
        ) : (
          <div className="mt-12 flex justify-center">
            {(() => {
              const deal = deals[currentDealIndex % deals.length];
              return (
                <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative group">
                  {/* Discount Badge */}
                  {deal.discount > 0 && (
                    <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {deal.discount}% OFF
                    </div>
                  )}
                  
                  <div className="h-64 w-full overflow-hidden bg-gray-700">
                    <img
                      src={deal.img}
                      alt={deal.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                    />
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold text-white mb-2">{deal.name}</h3>
                    
                    {/* Price Section */}
                    <div className="flex items-center gap-2 mb-4">
                      {deal.discount > 0 && deal.originalPrice && (
                        <span className="text-gray-400 line-through text-lg">
                          Rs. {deal.originalPrice.toLocaleString()}
                        </span>
                      )}
                      <span className="text-yellow-400 font-bold text-3xl">
                        Rs. {(deal.dealPrice || deal.price).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* Countdown Timer */}
                    {dealRotationTime && <GlobalCountdown expiryTime={dealRotationTime} />}
                    
                    <p className="mt-4 text-gray-400 text-sm">{deal.target}</p>
                    
                    <div className="mt-4 flex items-center justify-between mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                        <Tag className="w-3 h-3 mr-1" />
                        {deal.tag}
                      </span>
                      <span className="text-gray-400 text-sm">
                        Deal {currentDealIndex + 1} of {deals.length}
                      </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(deal)}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// Global Countdown Timer Component (for all deals)
function GlobalCountdown({ expiryTime }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = expiryTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timer);
  }, [expiryTime]);

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <div className="bg-gray-800 px-6 py-4 rounded-xl border-2 border-red-500 shadow-2xl">
        <div className="flex items-center gap-4">
          <Clock className="w-8 h-8 text-red-500 animate-pulse" />
          <div className="flex gap-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs text-gray-400 uppercase">Hours</div>
            </div>
            <div className="text-3xl font-bold text-white">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs text-gray-400 uppercase">Minutes</div>
            </div>
            <div className="text-3xl font-bold text-white">:</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs text-gray-400 uppercase">Seconds</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-2 text-red-400 font-semibold text-sm">
          🔥 DEALS EXPIRE SOON! 🔥
        </div>
      </div>
    </div>
  );
}

// Individual Product Countdown Timer Component
function CountdownTimer({ expiryDate }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiryDate).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m left`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft || timeLeft === 'Expired') return null;

  return (
    <div className="flex items-center gap-1 text-orange-400 text-sm font-medium">
      <Clock className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  );
}
