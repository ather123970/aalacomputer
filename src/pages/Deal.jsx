import React from 'react';
import { useNavigate } from 'react-router-dom';
import DealsList from './_dealsListForImport';

export default function Deal() {
  const navigate = useNavigate();

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

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {DealsList.map((deal) => (
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
      </div>
    </div>
  );
}
