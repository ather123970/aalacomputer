'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiLayout, FiShoppingCart, FiPenTool, FiSearch, FiCpu, FiSettings } from 'react-icons/fi';

export default function ScrollingServices() {
    // Services data
    const services = [
        { icon: FiLayout, name: 'Web Apps', color: 'from-blue-500 to-blue-600' },
        { icon: FiShoppingCart, name: 'Shopify Stores', color: 'from-green-500 to-green-600' },
        { icon: FiPenTool, name: 'UI/UX Design', color: 'from-purple-500 to-purple-600' },
        { icon: FiSearch, name: 'SEO & Growth', color: 'from-orange-500 to-orange-600' },
        { icon: FiCpu, name: 'AI Integration', color: 'from-indigo-500 to-indigo-600' },
        { icon: FiSettings, name: 'Maintenance', color: 'from-slate-500 to-slate-600' },
    ];

    // Duplicate services for seamless loop
    const duplicatedServices = [...services, ...services];

    return (
        <section className="py-16 bg-gradient-to-r from-gray-50 to-white overflow-hidden border-y border-gray-200">
            <div className="mb-8 text-center">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-sm font-bold text-gray-500 uppercase tracking-wider"
                >
                    Trusted by 127+ businesses worldwide
                </motion.p>
            </div>

            {/* Scrolling Container */}
            <div className="relative">
                {/* Gradient Overlays */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

                {/* Scrolling Track */}
                <motion.div
                    className="flex gap-8"
                    animate={{
                        x: [0, -1920], // Adjust based on content width
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                >
                    {duplicatedServices.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <div
                                key={index}
                                className="flex-shrink-0 w-64 px-8 py-6 bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                                    >
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-black text-gray-900 text-lg">
                                        {service.name}
                                    </h3>
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
