import React from "react";
import { motion as FM } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";

const App = () => {
  const navigate = useNavigate();

  const { ref: sectionRef, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  return (
    <>
      <section
        ref={sectionRef}
        className="relative bg-gradient-to-br from-white via-blue-100 to-blue-400 text-blue-900 mt-[3vh] px-6 md:px-10 py-12 md:py-24 flex flex-col-reverse md:flex-row items-center justify-between overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] rounded-3xl"
        style={{ minHeight: 'auto' }}
      >
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

          <FM.button
            initial={{ y: 100, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: 100, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            id="view-prebuilds-btn"
            onClick={() => navigate("/products")}
            className="bg-blue-700 hover:bg-blue-800 text-white text-lg sm:text-xl rounded-md py-3 px-6 transition-all shadow-md hover:shadow-lg"
          >
            View PreBuilds
          </FM.button>
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
