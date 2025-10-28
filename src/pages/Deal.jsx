import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
          const formatted = Array.isArray(data) ? data.map(d => ({
            id: d._id || d.id,
            name: d.title || d.name || 'Unnamed Deal',
            price: typeof d.price === 'number' ? `Rs ${d.price.toLocaleString()}` : `Rs ${d.price}`,
            img: d.imageUrl || d.img || '/placeholder.svg',
            target: d.description || d.category || 'Special Deal',
            tag: d.category || 'Deal'
          })) : [];
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
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(`/deal/${deal.id}`)}
            >
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={deal.img}
                  alt={deal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.currentTarget.src="/images/placeholder.svg"}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white">{deal.name}</h3>
                <p className="mt-2 text-yellow-400 font-bold">{deal.price}</p>
                <p className="mt-2 text-gray-400">{deal.target}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {deal.tag}
                  </span>
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
