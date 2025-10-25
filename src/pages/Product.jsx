import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper to build image URLs respecting Vite base path.
function getImageUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || /^\/\//.test(path)) return path;
  const base = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : '';
  const normalized = path.replace(/^\/images\//, '').replace(/^\//, '');
  return `${base}/${normalized}`;
}

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

export default function Product() {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const products = [
    {
      id: 1,
      Name: "StreetRunner",
      price: "70K",
  img: getImageUrl('/images/rbtech_sonic_c05_white-removebg-preview.png'),
      Spec: [
        "CPU: AMD Ryzen 3 3200G (4 Cores, Vega 8 iGPU)",
        "GPU: Integrated Vega 8",
        "RAM: 8GB DDR4 3200MHz",
        "Storage: 240GB SSD",
        "Case: Simple ATX Compact Case",
        "PSU: 450W 80+ Bronze",
      ],
      type: "Pre-Build",
    },
    {
      id: 2,
      Name: "Workhorse",
      price: "230K",
  img: getImageUrl('/images/pcglow.jpg'),
      Spec: [
        "CPU: Ryzen 7 7700X",
        "GPU: RTX 3070 8GB",
        "RAM: 32GB DDR5 5200MHz",
        "Storage: 1TB NVMe SSD",
        "PSU: 750W 80+ Gold",
        "Case: Corsair 4000D Airflow",
      ],
      type: "Pre-Build",
    },
    {
      id: 3,
      Name: "DailyDriver",
      price: "110K",
  img: getImageUrl('/images/images-removebg-preview.png'),
      Spec: [
        "CPU: Intel Core i3-12100F (4 Cores, 8 Threads)",
        "GPU: GTX 1650 4GB",
        "RAM: 16GB DDR4 3200MHz",
        "Storage: 500GB NVMe SSD",
        "PSU: 500W 80+ Bronze",
        "Case: CoolerMaster Q300L",
      ],
      type: "Pre-Build",
    },
    {
      id: 4,
      Name: "MidBeast",
      price: "180K",
  img: getImageUrl('/images/images-removebg-preview.png'),
      Spec: [
        "CPU: Intel i5-13400F",
        "GPU: RTX 3060 Ti 8GB",
        "RAM: 32GB DDR4 3600MHz",
        "Storage: 1TB NVMe SSD + 2TB HDD",
        "PSU: 650W 80+ Gold",
        "Case: Lian Li Lancool 215",
      ],
      type: "Pre-Build",
    },
    {
      id: 5,
      Name: "GamerPc",
      price: "250K",
  img: getImageUrl('/images/11-146-346-09-removebg-preview.png'),
      Spec: [
        "CPU: Intel i9-13900K",
        "GPU: RTX 4080 16GB",
        "RAM: 32GB DDR5 6000MHz",
        "Storage: 2TB NVMe SSD",
        "PSU: 850W 80+ Gold",
        "Case: NZXT H9 Flow",
        "Cooler: DeepCool LT720 360mm",
      ],
      type: "Pre-Build",
    },
    {
      id: 6,
      Name: "TitanForge",
      price: "350K",
  img: getImageUrl('/images/images-removebg-preview (2).png'),
      Spec: [
        "CPU: AMD Ryzen 9 7950X",
        "GPU: RTX 4090 24GB",
        "RAM: 64GB DDR5 6000MHz",
        "Storage: 2TB NVMe + 4TB HDD",
        "Case: Lian Li O11 Dynamic EVO",
        "Cooler: Custom 360mm Liquid Cooling",
        "PSU: 1000W 80+ Platinum",
      ],
      type: "Pre-Build",
    },
    {
      id: 7,
      Name: "NebulaX",
      price: "400K",
  img: getImageUrl('/images/pcmain.png'),
      Spec: [
        "CPU: Intel Core i9-14900K (24 Cores, 32 Threads)",
        "GPU: NVIDIA RTX 4090 24GB",
        "RAM: 64GB DDR5 6400MHz",
        "Motherboard: ASUS ROG STRIX Z790-E",
        "Case: Lian Li O11 Vision Black",
        "Cooler: Corsair iCUE H150i Elite Capellix (360mm Liquid)",
        "PSU: 1000W 80+ Platinum",
        "Storage: 2TB Gen4 NVMe SSD + 4TB HDD",
      ],
      type: "Pre-Build",
    },
  ];

  useEffect(() => {
    try {
      localStorage.setItem("products", JSON.stringify(products));
    } catch (e) {
      console.warn("Failed to cache products", e);
    }
  }, []);

  const goToDetail = (product) => {
    setLoadingId(product.id);
    setTimeout(() => {
      navigate(`/products/${product.id}`, { state: { product } });
      setLoadingId(null);
    }, 120);
  };

  const scrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 relative bg-panel min-h-screen text-primary">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
        Products - PreBuild
      </h1>

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
        {products.map((p) => (
          <div
            key={p.id}
            className="flex-none w-[85vw] sm:w-[380px] md:w-[420px] h-auto rounded-2xl p-4 bg-card/10 border border-blue-600/10 text-primary transform hover:-translate-y-1 transition-all duration-300 snap-start cursor-pointer"
          >
            <div
              onClick={() => navigate(`/products/${p.id}`, { state: { product: p } })}
              className="h-[220px] sm:h-[260px] w-full rounded-xl overflow-hidden flex items-center justify-center bg-card cursor-pointer"
            >
              <img
                src={p.img || "/images/placeholder.svg"}
                alt={p.Name}
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.svg";
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold">{p.Name}</h2>
                <p className="text-lg font-medium text-blue-400 mt-1">
                  PKR {parsePrice(p.price).toLocaleString()}
                </p>
              </div>
              <span className="text-xs sm:text-sm font-medium px-3 py-1 rounded-full border bg-blue-50/10 text-blue-300">
                {p.type}
              </span>
            </div>

            <ul className="mt-4 max-h-[120px] overflow-auto text-sm leading-5 space-y-1 pr-2">
              {p.Spec.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="inline-block w-2 h-2 mt-2 rounded-full bg-blue-500/70" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToDetail(p);
              }}
              className="w-full py-3 mt-5 rounded-lg text-white font-semibold shadow-md hover:scale-[1.03] transition-transform btn-accent"
              disabled={loadingId === p.id}
            >
              {loadingId === p.id ? "Opening..." : "Buy Now"}
            </button>
          </div>
        ))}
      </div>

      {/* Scroll Button */}
      <button
        onClick={scrollToEnd}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg"
      >
        ➜
      </button>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
