import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Nav from "../nav";
import { API_BASE } from '../config';

const Prebuilds = () => {
  const navigate = useNavigate();
  const [prebuilds, setPrebuilds] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    loadPrebuilds();

    // Listen for updates
    const onProductsUpdated = () => {
      console.log('🔔 Admin updated products - refreshing prebuilds...');
      loadPrebuilds();
    };

    const onStorage = (e) => {
      if (e && e.key === 'products_last_updated') {
        console.log('🔔 Cross-tab update detected - refreshing prebuilds...');
        onProductsUpdated();
      }
    };

    window.addEventListener('products-updated', onProductsUpdated);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('products-updated', onProductsUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const loadPrebuilds = async () => {
    setIsLoading(true);
    try {
      const base = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
      console.log('🔄 Fetching prebuilds from database:', `${base}/api/prebuilds`);
      const response = await fetch(`${base}/api/prebuilds`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Prebuilds fetched from DB:', data);
        if (Array.isArray(data)) {
          const previousCount = prebuilds.length;
          const formatted = data.map(p => ({
            id: p._id || p.id,
            Name: p.title || p.name || 'Unnamed Prebuild',
            price: (typeof p.price === 'number' ? p.price : Number(p.price)) || 0,
            img: p.imageUrl || p.img || '/placeholder.svg',
            Spec: Array.isArray(p.specs) ? p.specs : (p.description ? [p.description] : []),
            category: 'Prebuild'
          }));
          console.log('📦 Total prebuilds loaded:', formatted.length);
          
          // Show notification if new products were added
          if (previousCount > 0 && formatted.length > previousCount) {
            setShowUpdateNotification(true);
            console.log(`🎉 ${formatted.length - previousCount} new prebuild(s) added!`);
            setTimeout(() => setShowUpdateNotification(false), 5000);
          }
          
          setPrebuilds(formatted);
          setLastUpdateTime(new Date());
        }
      } else {
        console.error('❌ Failed to fetch prebuilds, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Failed to load prebuilds:', error);
      setPrebuilds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const viewDetails = (prebuild) => {
    setLoadingId(prebuild.id);
    setTimeout(() => {
      navigate(`/products/${prebuild.id}`);
    }, 150);
  };

  return (
    <>
      <Nav />
      <div className="p-6 md:px-20 bg-panel min-h-[calc(100vh-72px)] text-primary">
        {/* Update Notification */}
        {showUpdateNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between"
          >
            <span className="font-semibold">
              🎉 New prebuilds added from backend! Page refreshed automatically.
            </span>
            <button
              onClick={() => setShowUpdateNotification(false)}
              className="ml-4 text-white hover:text-gray-200 font-bold text-xl"
            >
              ×
            </button>
          </motion.div>
        )}
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-500">Products - Prebuild</h1>
            <p className="text-gray-400 mt-2">Pre-configured systems ready to go</p>
            {!isLoading && prebuilds.length > 0 && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="inline-block bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                  ✅ {prebuilds.length} Prebuilds from Database
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  🔄 Auto-updates from backend
                </span>
                <span className="text-xs text-gray-500">
                  Last Updated: {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : 'Just now'}
                </span>
              </div>
            )}
            {!isLoading && prebuilds.length === 0 && (
              <div className="mt-2">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                  ⚠️ No prebuilds in database - Add some in admin!
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              loadPrebuilds();
            }}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh from DB
              </>
            )}
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        )}

        {/* Windsurf Floating Prebuilds Section */}
        {!isLoading && prebuilds.length > 0 && (
          <div className="relative w-full h-64 overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 rounded-3xl mb-8 shadow-xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative h-full flex items-center justify-center">
              <h3 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-blue-700 font-bold text-lg z-10">
                🏄 Featured Prebuilds - Floating Showcase
              </h3>
              
              {/* Windsurf animated prebuilds */}
              {prebuilds.slice(0, 3).map((prebuild, idx) => (
                <div
                  key={prebuild.id}
                  className="absolute bottom-0 cursor-pointer group z-10"
                  style={{
                    animationDelay: `${idx * 2}s`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${prebuild.id}`);
                  }}
                >
                  <div className="animate-[moveX_6s_linear_infinite]">
                    <div className="relative w-32 h-32 transform transition-all duration-300 group-hover:scale-110">
                      <img
                        src={prebuild.img || "/placeholder.svg"}
                        alt={prebuild.Name}
                        className="w-full h-full object-contain drop-shadow-2xl"
                        onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                      />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {prebuild.Name.slice(0, 20)}...
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prebuilds Grid */}
        {!isLoading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {prebuilds.map((p, idx) => (
                <PrebuildCard 
                  key={p.id} 
                  prebuild={p} 
                  viewDetails={viewDetails} 
                  loadingId={loadingId} 
                  navigate={navigate} 
                  delay={idx * 0.1} 
                />
              ))}
            </div>

            {prebuilds.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🖥️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Prebuilds Available</h3>
                <p className="text-gray-500 mb-6">
                  Check back soon or contact us for custom builds!
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Browse All Products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

// Single Prebuild Card Component
const PrebuildCard = ({ prebuild, viewDetails, loadingId, navigate, delay }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: false });

  useEffect(() => {
    if (inView) {
      controls.start({ opacity: 1, y: 0, scale: 1 });
    } else {
      controls.start({ opacity: 0, y: 50, scale: 0.95 });
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={controls}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onClick={() => navigate(`/products/${prebuild.id}`)}
      className="bg-card rounded-2xl p-4 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-800 relative overflow-hidden"
    >
      {/* Prebuild Badge */}
      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
        PREBUILD
      </div>

      <div className="relative h-48 mb-4 rounded-xl bg-gray-800 flex items-center justify-center p-2">
        <img
          src={prebuild.img || "/placeholder.svg"}
          alt={prebuild.Name}
          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
        />
      </div>

      <h2 className="text-lg font-semibold text-blue-400">{prebuild.Name}</h2>
      <p className="text-blue-500 font-medium text-xl">PKR {prebuild.price.toLocaleString()}</p>
      
      {prebuild.Spec && prebuild.Spec.length > 0 && (
        <div className="mt-2 space-y-1">
          {prebuild.Spec.slice(0, 3).map((spec, idx) => (
            <p key={idx} className="text-muted text-xs truncate">• {spec}</p>
          ))}
          {prebuild.Spec.length > 3 && (
            <p className="text-blue-400 text-xs">+{prebuild.Spec.length - 3} more specs</p>
          )}
        </div>
      )}
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          viewDetails(prebuild);
        }}
        disabled={loadingId === prebuild.id}
        className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
      >
        {loadingId === prebuild.id ? "Loading..." : "View Details"}
      </button>
    </motion.div>
  );
};

export default Prebuilds;
