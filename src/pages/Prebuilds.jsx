import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, HardDrive, MemoryStick, Monitor, Zap, Package } from 'lucide-react';
import { API_BASE } from '../config';
import SmartImage from '../components/SmartImage';

export default function Prebuilds() {
  const navigate = useNavigate();
  const [prebuilds, setPrebuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrebuilds = async () => {
      setLoading(true);
      try {
        const base = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
        
        // Fetch ONLY from dedicated prebuilds endpoint
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
          
          // Format prebuilds
          const formatted = prebuildsData
            .filter(p => p && (p.price > 0 || p.status === 'published')) // Only show valid items
            .map(p => {
              const prebuildId = p._id || p.id;
              
              // Explicitly create product object for SmartImage
              const productForImage = {
                id: prebuildId,
                name: p.title || p.name || 'Gaming PC',
                category: 'prebuild',
                brand: p.brand || 'ZAH Computers',
                img: p.img || p.imageUrl || p.image
              };
              
              return {
                id: prebuildId,
                name: p.title || p.name || 'Gaming PC Build',
                price: typeof p.price === 'number' ? p.price : parseInt(p.price) || 0,
                img: p.img || p.imageUrl || p.image,
                description: p.description || 'Custom Gaming PC Build',
                category: 'prebuild',
                components: p.components || p.specs || [],
                performance: p.performance || 'High Performance',
                brand: p.brand || 'ZAH Computers',
                productForImage
              };
            });
          
          console.log(`[Prebuilds] Loaded ${formatted.length} prebuilds from /api/prebuilds`);
          setPrebuilds(formatted);
        } else {
          console.warn('[Prebuilds] API returned non-OK response');
          setPrebuilds([]);
        }
      } catch (error) {
        console.error('[Prebuilds] Failed to fetch:', error);
        setPrebuilds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrebuilds();
  }, []);

  return (
    <div className="py-12 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Pre-Built Gaming PCs
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Professionally assembled, tested, and ready to dominate. Choose from our curated builds.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : prebuilds.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No prebuilds available at the moment.</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for amazing builds!</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {prebuilds.map((prebuild) => (
              <div
                key={prebuild.id}
                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/prebuild/${prebuild.id}`)}
              >
                {/* Image Section */}
                <div className="h-56 sm:h-64 w-full overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900 relative">
                  <SmartImage
                    src={prebuild.img}
                    alt={prebuild.name}
                    product={prebuild.productForImage || prebuild}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    <Zap className="w-3 h-3 inline mr-1" />
                    {prebuild.performance}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {prebuild.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {prebuild.description}
                  </p>

                  {/* Components Preview */}
                  {prebuild.components && prebuild.components.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {prebuild.components.slice(0, 3).map((comp, idx) => (
                        <ComponentItem key={idx} component={comp} />
                      ))}
                      {prebuild.components.length > 3 && (
                        <p className="text-gray-500 text-xs">
                          +{prebuild.components.length - 3} more components
                        </p>
                      )}
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div>
                      <p className="text-gray-400 text-xs">Starting at</p>
                      <p className="text-yellow-400 font-bold text-2xl">
                        Rs. {prebuild.price.toLocaleString()}
                      </p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      View Build
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

// Component Item Display
function ComponentItem({ component }) {
  const getIcon = (type) => {
    const iconClass = "w-4 h-4 text-blue-400";
    switch (type?.toLowerCase()) {
      case 'cpu':
      case 'processor':
        return <Cpu className={iconClass} />;
      case 'gpu':
      case 'graphics':
        return <Monitor className={iconClass} />;
      case 'ram':
      case 'memory':
        return <MemoryStick className={iconClass} />;
      case 'storage':
      case 'ssd':
      case 'hdd':
        return <HardDrive className={iconClass} />;
      default:
        return <Package className={iconClass} />;
    }
  };

  const compType = component.type || component.category || 'Component';
  const compName = component.name || component.model || component.value || 'Unknown';

  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="mt-0.5">{getIcon(compType)}</div>
      <div className="flex-1 min-w-0">
        <span className="text-gray-400 font-medium">{compType}:</span>
        <span className="text-white ml-2 line-clamp-1">{compName}</span>
      </div>
    </div>
  );
}
