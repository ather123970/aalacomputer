import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Tag, TrendingDown } from 'lucide-react';
import { API_BASE } from '../config';

export default function Deal() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      try {
        const base = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
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
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Special Deals
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Choose from our carefully curated PC builds
          </p>
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

// Countdown Timer Component
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
