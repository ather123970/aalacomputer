import React, { useState, useEffect } from "react";
import { motion as FM } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "./config";

const App = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [prebuilds, setPrebuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  const { ref: sectionRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  useEffect(() => {
    const fetchPrebuilds = async () => {
      setLoading(true);
      try {
        const base = API_BASE ? API_BASE.replace(/\/+$/, '') : '';
        const response = await fetch(`${base}/api/prebuilds`);
        if (response.ok) {
          const data = await response.json();
          const formatted = Array.isArray(data) ? data.map(p => ({
            id: p._id || p.id,
            name: p.title || p.name || 'Unnamed Product',
            price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
            img: p.imageUrl || p.img || '/placeholder.svg'
          })) : [];
          setPrebuilds(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch prebuilds:', error);
        setPrebuilds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrebuilds();
  }, []);

  const filteredResults = searchTerm.trim()
    ? prebuilds.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-gradient-to-br from-white via-blue-100 to-blue-400 text-blue-900 mt-[3vh] px-6 md:px-10 py-12 md:py-24 flex flex-col-reverse md:flex-row items-center justify-between overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] rounded-3xl"
        style={{ minHeight: 'auto' }}
      >
        {/* TOP-RIGHT BUTTON */}
        <FM.button
          initial={{ y: 100, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : { y: 100, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          id="view-prebuilds-btn"
          onClick={() => navigate("/products")}
          className="absolute top-6 right-6 bg-blue-700 hover:bg-blue-800 text-white text-sm sm:text-base md:text-lg rounded-md py-2 px-4 md:py-3 md:px-6 transition-all shadow-md hover:shadow-lg z-20"
        >
          View PreBuilds
        </FM.button>
        {/* LEFT SIDE — TEXT CONTENT */}
        <FM.div
          initial={{ x: 100, opacity: 1 }}
          animate={inView ? { x: 0, opacity: 1 } : { x: 100, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex-1 text-center md:text-left space-y-6 md:ml-8 z-10"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight relative">
            Build your <br />
            <span className="relative inline-block text-blue-700 font-extrabold animate-float-glow">
              Dream
              {/* Tiny flame under “Dream” */}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[-10px] w-2 h-2">
                <span className="absolute inset-0 bg-orange-500 rounded-full blur-[1px] animate-flicker"></span>
                <span className="absolute top-[1px] left-[1px] w-[5px] h-[5px] bg-yellow-300 rounded-full blur-[0.5px] animate-flicker-slow"></span>
              </span>
            </span>{" "}
            PC in minutes
          </h1>

          <FM.h3
            initial={{ x: 100, opacity: 1 }}
            animate={inView ? { x: 0, opacity: 1 } : { x: 100, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="text-base sm:text-lg text-blue-700/80 max-w-lg mx-auto md:mx-0"
          >
            Choose from a wide range of parts and instantly build your own custom PC.
          </FM.h3>

          <FM.div
            initial={{ y: 100, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 100, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="flex flex-col items-center md:items-start space-y-4 w-full"
          >
            <div className="relative w-full md:w-[80%] lg:w-[70%]">
              <input
                type="text"
                placeholder={loading ? "Loading prebuilds..." : "Search Prebuilds..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border-2 border-blue-300 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-md text-blue-900 placeholder-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {searchTerm.trim() && filteredResults.length === 0 && !loading && (
              <div className="w-full md:w-[80%] lg:w-[70%] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-blue-200 text-center">
                <p className="text-blue-600">No prebuilds found matching "{searchTerm}"</p>
              </div>
            )}

            {filteredResults.length > 0 && (
              <div className="w-full md:w-[80%] lg:w-[70%] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 max-h-[60vh] overflow-y-auto space-y-3 border border-blue-200">
                {filteredResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b border-blue-100 pb-3 last:border-b-0 hover:bg-blue-50 transition-colors rounded-md p-2 cursor-pointer"
                    onClick={() => navigate("/products")}
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md shadow-sm"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm">
                        Rs {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </FM.div>
        </FM.div>

        {/* RIGHT SIDE — IMAGE SECTION */}
        <FM.div
          initial={{ x: -100, opacity: 0 }}
          animate={inView ? { x: 0, opacity: 1 } : { x: -100, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex-1 flex justify-center items-center mb-10 md:mb-0 relative max-w-full"
        >
          {/* Glow behind image - reduced size on very small screens to avoid overflow */}
          <div className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[200px] sm:w-[260px] md:w-[360px] h-[80px] sm:h-[100px] bg-blue-400/50 blur-3xl rounded-full opacity-70 pointer-events-none"></div>

          <img
            src="/pcglow.jpg"
            alt="PC build"
            className="relative w-[220px] sm:w-[300px] md:w-[420px] lg:w-[520px] max-w-full h-auto object-contain drop-shadow-[0_0_25px_rgba(37,99,235,0.6)]"
          />
        </FM.div>
      </section>

      {/* Tailwind Custom Animations */}
      <style>{`
        @keyframes floatGlow {
          0%, 100% { transform: translateY(0); text-shadow: 0 0 10px rgba(59,130,246,0.5); }
          50% { transform: translateY(-12px); text-shadow: 0 0 20px rgba(59,130,246,0.8); }
        }
        .animate-float-glow {
          animation: floatGlow 3s ease-in-out infinite;
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
        .animate-flicker {
          animation: flicker 0.3s infinite;
        }
        .animate-flicker-slow {
          animation: flicker 0.6s infinite;
        }
      `}</style>
    </>
  );
};

export default App;
