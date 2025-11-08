import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SmartImage from '../components/SmartImage';
import { API_CONFIG } from '../config/api';

function parsePrice(price) {
  if (typeof price === "number") return price;
  if (!price) return 0;
  const s = String(price).trim().toUpperCase();
  if (s.endsWith("K")) {
    const n = Number(s.replace("K", "").replace(/[^0-9.]/g, "")) || 0;
    return Math.round(n * 1000);
  }
  const num = Number(s.replace(/[^0-9.]/g, "")) || 0;
  return num;
}

export default function FeaturedPrebuilds() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [prebuilds, setPrebuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch prebuilds from backend
  useEffect(() => {
    const fetchPrebuilds = async () => {
      setLoading(true);
      try {
        const base = API_CONFIG.BASE_URL ? API_CONFIG.BASE_URL.replace(/\/+$/, '') : '';
        const response = await fetch(`${base}/api/prebuilds`);
        
        if (response.ok) {
          const data = await response.json();
          
          // Handle different response formats
          let prebuildsData = [];
          if (Array.isArray(data)) {
            prebuildsData = data;
          } else if (data.prebuilds) {
            prebuildsData = data.prebuilds;
          } else if (data.data) {
            prebuildsData = data.data;
          }
          
          // Format prebuilds - limit to first 10 for home page
          const formatted = prebuildsData
            .filter(p => p && (p.price > 0 || p.status === 'published')) // Only show valid items
            .slice(0, 10) // Limit to 10 for home page
            .map(p => {
              const prebuildId = p._id || p.id;
              
              return {
                id: prebuildId,
                Name: p.title || p.name || 'Gaming PC Build',
                price: typeof p.price === 'number' ? p.price : parseInt(p.price) || 0,
                img: p.img || p.imageUrl || p.image,
                description: p.description || 'Custom Gaming PC Build',
                category: 'prebuild',
                components: p.components || p.specs || [],
                performance: p.performance || 'High Performance',
                brand: p.brand || 'ZAH Computers'
              };
            });
          
          console.log(`[FeaturedPrebuilds] Loaded ${formatted.length} prebuilds for home page`);
          setPrebuilds(formatted);
        } else {
          console.warn('[FeaturedPrebuilds] API returned non-OK response');
          setPrebuilds([]);
        }
      } catch (error) {
        console.error('[FeaturedPrebuilds] Failed to fetch:', error);
        setPrebuilds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrebuilds();
  }, []);

  const goToDetail = (prebuild) => {
    setLoadingId(prebuild.id);
    setTimeout(() => {
      navigate(`/prebuild/${prebuild.id}`, { state: { prebuild } });
      setLoadingId(null);
    }, 120);
  };

  const viewAllPrebuilds = () => {
    navigate('/prebuild');
  };

  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 relative bg-panel min-h-[400px] text-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (prebuilds.length === 0) {
    return (
      <div className="p-4 sm:p-6 relative bg-panel text-primary">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            Featured Prebuilds
          </h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No prebuilds available at the moment</p>
          <button
            onClick={viewAllPrebuilds}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
          >
            Visit Prebuilds Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 relative bg-panel text-primary">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
          Featured Prebuilds
        </h1>
        <button
          onClick={viewAllPrebuilds}
          className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition text-sm"
        >
          View All Prebuilds →
        </button>
      </div>

      {/* Scrollable Cards */}
      <div
        ref={scrollRef}
        className="flex space-x-5 overflow-x-auto py-4 px-2 scrollbar-hide snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {prebuilds.map((p) => (
          <div
            key={p.id}
            className="flex-none w-[85vw] sm:w-[380px] md:w-[420px] h-auto rounded-2xl p-4 bg-card/10 border border-blue-600/10 text-primary transform hover:-translate-y-1 transition-all duration-300 snap-start cursor-pointer"
            onClick={() => goToDetail(p)}
          >
            <div className="relative h-48 mb-4 rounded-xl bg-gray-800 flex items-center justify-center p-2">
              <SmartImage
                src={p.img}
                alt={p.Name}
                product={{ ...p, category: 'prebuild' }}
                className="max-h-full max-w-full object-contain"
              />
              {loadingId === p.id && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                {p.performance}
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">{p.Name}</h2>
            <p className="text-2xl font-bold text-blue-500 mb-3">
              Rs. {parsePrice(p.price).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {p.description}
            </p>
            {p.components && p.components.length > 0 && (
              <div className="space-y-1 mb-3">
                {p.components.slice(0, 3).map((comp, idx) => (
                  <p key={idx} className="text-xs text-muted flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    <span className="line-clamp-1">{comp.name || comp}</span>
                  </p>
                ))}
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToDetail(p);
              }}
              disabled={loadingId === p.id}
              className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingId === p.id ? "Loading..." : "View Details"}
            </button>
          </div>
        ))}
      </div>

      {/* View All Button - Mobile */}
      <div className="sm:hidden text-center mt-6">
        <button
          onClick={viewAllPrebuilds}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
        >
          View All Prebuilds →
        </button>
      </div>

      {/* Scroll to End Button */}
      {prebuilds.length > 2 && (
        <button
          onClick={scrollToEnd}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
