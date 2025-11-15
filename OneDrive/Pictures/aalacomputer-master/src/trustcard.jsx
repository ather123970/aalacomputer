import React from "react";
import { CheckCircle, Tag, Truck } from "lucide-react";
import { motion as FM } from "framer-motion";
import { useInView } from "react-intersection-observer";

const TrustCard = () => {
  const { ref, inView } = useInView({
    triggerOnce: false, // animate again when re-entered
    threshold: 0.2, // starts when 20% visible
  });

  const cardVariants = {
    hidden: (direction) => ({
      opacity: 0,
      x: direction === "left" ? -80 : direction === "right" ? 80 : 0,
      y: direction === "up" ? 80 : 0,
      scale: 0.9,
    }),
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={ref}
      className="bg-black py-16 px-4 sm:px-8 md:px-12 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 lg:gap-14 flex-wrap">
  {/* Card 1 */}
        <FM.div
          custom="right"
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          transition={{ delay: 0.1 }}
          className="border-2 border-gray-800 bg-[#0a0a0a] shadow-lg shadow-green-900/40 rounded-2xl p-6 sm:p-8 w-full sm:w-[80%] md:w-[30%] text-center transition-all duration-300 hover:scale-105 hover:shadow-green-600/40"
        >
          <CheckCircle
            size={45}
            className="text-green-500 mx-auto mb-3 sm:mb-4 icon-accept"
          />
          <p className="text-white text-xl sm:text-2xl font-semibold mb-2">
            100% Genuine Parts
          </p>
          <p className="text-gray-200 text-sm sm:text-base">
            All components are sourced from trusted suppliers.
          </p>
        </FM.div>

  {/* Card 2 */}
        <FM.div
          custom="up"
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          transition={{ delay: 0.25 }}
          className="border-2 border-gray-800 bg-[#0a0a0a] shadow-lg shadow-blue-900/40 rounded-2xl p-6 sm:p-8 w-full sm:w-[80%] md:w-[30%] text-center transition-all duration-300 hover:scale-105 hover:shadow-blue-600/40"
        >
          <Truck
            size={45}
            className="text-blue-400 mx-auto mb-3 sm:mb-4 icon-truck"
          />
          <p className="text-white text-xl sm:text-2xl font-semibold mb-2">
            Fast Delivery
          </p>
          <p className="text-gray-200 text-sm sm:text-base">
            Speedy doorstep delivery across Pakistan.
          </p>
        </FM.div>

  {/* Card 3 */}
        <FM.div
          custom="left"
          variants={cardVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          transition={{ delay: 0.4 }}
          className="border-2 border-gray-800 bg-[#0a0a0a] shadow-lg shadow-yellow-900/40 rounded-2xl p-6 sm:p-8 w-full sm:w-[80%] md:w-[30%] text-center transition-all duration-300 hover:scale-105 hover:shadow-yellow-600/40"
        >
          <Tag
            size={45}
            className="text-yellow-400 mx-auto mb-3 sm:mb-4 icon-tag"
          />
          <p className="text-white text-xl sm:text-2xl font-semibold mb-2">
            Best Prices in Pakistan
          </p>
          <p className="text-gray-200 text-sm sm:text-base">
            Competitive prices without compromising quality.
          </p>
        </FM.div>
      </div>
    </section>
  );
};

export default TrustCard;
