import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, ShoppingCart } from "lucide-react";
import { motion as FM } from "framer-motion";
import { useInView } from "react-intersection-observer";
import deals from "./_dealsListForImport";
import { API_CONFIG } from '../config/api'

const DealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  // Get selected deal by id
  useEffect(() => {
    const found = deals.find((d) => d.id === Number(id));
    if (found) setDeal(found);
    else navigate("/deals");
  }, [id, navigate]);

  // Add to cart
  const addToCart = async () => {
    if (!deal) return;
    try {
      setLoading(true);
      const payload = {
        id: deal.id?.toString(),
        name: deal.name,
        img: deal.img,
        specs: deal.specs || [],
        type: deal.type || "deal",
        price: deal.price,
      };
  const res = await fetch(API_BASE.replace(/\/+$/, '') + "/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // try to read error body for better diagnostics
        let errMsg = `Server returned ${res.status}`
        try { const j = await res.json(); if (j && (j.error || j.message)) errMsg = j.error || j.message } catch(e){}
        throw new Error(errMsg)
      }
      const data = await res.json();
      console.log("✅ Deal added to cart:", data);

      const raw = localStorage.getItem("cart");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ ...deal, qty: 1 });
      localStorage.setItem("cart", JSON.stringify(arr));
      navigate("/cart");
    } catch (err) {
      console.error("❌ Error adding deal:", err);
      alert("Failed to add deal to cart. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (!deal) return null;

  const fadeVariant = {
    hidden: { opacity: 1, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div
      ref={ref}
      className="min-h-screen bg-black text-white p-6 md:p-10 flex flex-col items-center"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="self-start mb-6 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
      >
        ← Back
      </button>

      {/* Main Deal Detail Card */}
      <FM.div
        variants={fadeVariant}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-6 md:p-10 shadow-xl border border-gray-800 flex flex-col md:flex-row items-center md:items-start gap-8"
      >
        {/* Image Section */}
        <FM.div
          variants={{
            hidden: { opacity: 0, x: -80 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
          }}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="w-full md:w-1/2 bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center p-4"
        >
          <img
            src={deal.img}
            alt={deal.name}
            className="max-h-80 object-contain w-full hover:scale-105 transition-transform duration-300"
          />
        </FM.div>

        {/* Info Section */}
        <FM.div
          variants={{
            hidden: { opacity: 0, x: 80 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
          }}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex-1"
        >
          <h1 className="text-3xl font-bold text-blue-400 mb-2 text-center md:text-left">
            {deal.name}
          </h1>
          <p className="text-lg text-gray-300 mb-4 text-center md:text-left">
            {deal.target}
          </p>
          <p className="text-2xl font-semibold text-yellow-400 mb-6 text-center md:text-left">
            {deal.price}
          </p>

          <ul className="space-y-2 mb-8 text-gray-300">
            {deal.specs?.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="text-green-400" size={18} />
                <span>{s}</span>
              </li>
            ))}
          </ul>

          {/* Add to Cart Button */}
          <FM.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={
              inView
                ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2 } }
                : {}
            }
            onClick={addToCart}
            disabled={loading}
            className={`flex items-center gap-2 mx-auto md:mx-0 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition-all ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <ShoppingCart size={20} />
            {loading ? "Adding..." : "Add to Cart"}
          </FM.button>
        </FM.div>
      </FM.div>
    </div>
  );
};

export default DealDetail;
