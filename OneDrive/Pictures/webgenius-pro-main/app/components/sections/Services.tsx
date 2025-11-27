'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SERVICES as services } from '@/app/lib/constants';
import Link from 'next/link';

export default function Services() {
    const colorMap: Record<string, string> = {
        'blue': '#0066FF',
        'green': '#10B981',
        'purple': '#8B5CF6',
        'orange': '#F59E0B',
        'indigo': '#6366F1',
        'slate': '#64748B',
    };

    const bgColorMap: Record<string, string> = {
        'blue': 'from-blue-500 to-blue-600',
        'green': 'from-green-500 to-green-600',
        'purple': 'from-purple-500 to-purple-600',
        'orange': 'from-orange-500 to-orange-600',
        'indigo': 'from-indigo-500 to-indigo-600',
        'slate': 'from-slate-500 to-slate-600',
    };

    return (
        <section id="services" className="section-padding bg-gradient-to-b from-white to-gray-50">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6"
                    >
                        Our Services
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black text-gray-900 mb-6"
                    >
                        What We <span className="text-gradient-blue">Deliver</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 leading-relaxed"
                    >
                        Premium digital solutions engineered for growth.
                    </motion.p>
                </div>

                {/* Services Scrolling Animation - Like Calendly */}
                <div className="relative overflow-hidden">
                    {/* Gradient Overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

                    {/* Infinite Scrolling Container */}
                    <motion.div
                        className="flex gap-8"
                        animate={{
                            x: [0, -100 * services.length - 100],
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
                        {/* Duplicate services for seamless loop */}
                        {[...services, ...services, ...services].map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <div
                                    key={`${service.id}-${index}`}
                                    className="flex-shrink-0 w-80 group relative"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                                    <div className="relative h-full p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-1">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all"
                                            style={{
                                                background: `linear-gradient(135deg, ${service.color}20, ${service.color}40)`,
                                                color: colorMap[service.color] || '#0066FF'
                                            }}
                                        >
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                                            {service.description}
                                        </p>
                                        <ul className="space-y-2 mb-6">
                                            {service.features.slice(0, 3).map((feature) => (
                                                <li key={feature} className="text-sm text-gray-700 font-medium flex items-start gap-2">
                                                    <span className="text-blue-600 mt-0.5">✓</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={`/services/${service.id}`}
                                            className={`py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r ${bgColorMap[service.color] || 'from-blue-500 to-blue-600'} hover:shadow-xl transition-all hover:scale-105 text-center`}
                                        >
                                            Learn More
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
