import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Tag, TrendingDown, Flame, AlertCircle } from 'lucide-react';
import { API_CONFIG } from '../config/api';

// Deal rotation settings
const DEAL_ROTATION_HOURS = 5;
const DEAL_STORAGE_KEY = 'dealRotationTimestamp';

export default function Deal() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealRotationTime, setDealRotationTime] = useState(null);
  
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
          // Time expired - set new rotation time
          const newRotationTime = now + (DEAL_ROTATION_HOURS * 60 * 60 * 1000);
          localStorage.setItem(DEAL_STORAGE_KEY, newRotationTime.toString());
          setDealRotationTime(newRotationTime);
          // Trigger deals refresh
          window.location.reload();
        } else {
          setDealRotationTime(storedTime);
        }
      }
    };
    
    checkRotation();
    // Check every minute
    const interval = setInterval(checkRotation, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const base = API_CONFIG.BASE_URL.replace(/\/+$/, '');
        const response = await fetch(`${base}/api/deals`);
        if (response.ok) {
          const data = await response.json();
          const formatted = Array.isArray(data) ? data.map(d => {
            const dealId = d._id || d.id;
            return {
              id: dealId,
              name: d.title || d.name || 'Unnamed Deal',
              price: typeof d.price === 'number' ? d.price : parseInt(d.price) || 0,
              originalPrice: d.originalPrice || d.price,
              discount: d.discount || 0,
              img: d.img || d.imageUrl || (dealId ? `/api/product-image/${dealId}` : '/placeholder.svg'),
              target: d.description || d.category || 'Special Deal',
              tag: d.category || 'Deal',
              expiryDate: d.expiryDate || d.expiry,
              dealPrice: d.dealPrice
            };
          }) : [];
          setDeals(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return (
    <div className="py-12 bg-gray-900">
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
          <div className="mt-12 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer relative group"
              onClick={() => navigate(`/deal/${deal.id}`)}
            >
              {/* Discount Badge */}
              {deal.discount > 0 && (
                <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  {deal.discount}% OFF
                </div>
              )}
              
              <div className="h-48 sm:h-56 w-full overflow-hidden bg-gray-700">
                <img
                  src={deal.img}
                  alt={deal.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
              </div>
              
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white line-clamp-2 mb-2">{deal.name}</h3>
                
                {/* Price Section */}
                <div className="flex items-center gap-2 mb-3">
                  {deal.discount > 0 && deal.originalPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      Rs. {deal.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-yellow-400 font-bold text-xl">
                    Rs. {(deal.dealPrice || deal.price).toLocaleString()}
                  </span>
                </div>
                
                {/* Countdown Timer */}
                {deal.expiryDate && <CountdownTimer expiryDate={deal.expiryDate} />}
                
                <p className="mt-2 text-gray-400 text-sm line-clamp-1">{deal.target}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
                    <Tag className="w-3 h-3 mr-1" />
                    {deal.tag}
                  </span>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    View Deal →
                  </button>
                </div>
              </div>
            </div>
          ))}
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
