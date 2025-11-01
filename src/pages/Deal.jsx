import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export default function Deal() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/deals`);
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'string') return price;
    return `Rs ${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="py-12 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading deals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

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

        {deals.length === 0 ? (
          <div className="mt-12 text-center text-gray-400 text-lg">
            No deals available at the moment. Check back soon!
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <div
                key={deal.id || deal._id}
                className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/deal/${deal.id}`)}
              >
                <div className="h-48 w-full overflow-hidden">
                  <img
                    src={deal.img || deal.imageUrl}
                    alt={deal.name || deal.title}
                    className="w-full h-full object-cover"
                    onError={(e) => e.currentTarget.src="/images/placeholder.svg"}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white">{deal.name || deal.title}</h3>
                  <p className="mt-2 text-yellow-400 font-bold">{formatPrice(deal.price)}</p>
                  {deal.target && <p className="mt-2 text-gray-400">{deal.target}</p>}
                  {deal.tag && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {deal.tag}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
