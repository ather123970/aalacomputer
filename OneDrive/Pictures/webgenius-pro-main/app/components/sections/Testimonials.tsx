'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { TESTIMONIALS as testimonials } from '@/app/lib/constants';

export default function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    useEffect(() => {
        if (!isAutoPlay) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlay]);

    const goToNext = () => {
        setIsAutoPlay(false);
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
    };

    const goToPrevious = () => {
        setIsAutoPlay(false);
        setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const activeTestimonial = testimonials[activeIndex];

    return (
        <section className="section-padding bg-white relative overflow-hidden">
            <div className="container-custom">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm mb-6"
                    >
                        Testimonials
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black text-gray-900 mb-6"
                    >
                        Client <span className="text-gradient-blue">Love</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600"
                    >
                        Don't just take our word. Here's whatour clients say.
                    </motion.p>
                </div>

                {/* Testimonial Carousel */}
                <div className="max-w-5xl mx-auto">
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-3xl p-12 md:p-16 shadow-2xl relative"
                            >
                                <div className="absolute -top-6 -left-6 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <span className="text-4xl font-black text-white">"</span>
                                </div>

                                <div className="space-y-8 relative z-10">
                                    {/* Stars */}
                                    <div className="flex gap-1 justify-center">
                                        {[...Array(activeTestimonial.rating)].map((_, i) => (
                                            <FiStar key={i} className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <blockquote className="text-2xl md:text-3xl text-gray-900 leading-relaxed font-bold text-center">
                                        "{activeTestimonial.content}"
                                    </blockquote>

                                    {/* Author */}
                                    <div className="flex items-center justify-center gap-4 pt-8">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl">
                                            {activeTestimonial.name.charAt(0)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-black text-gray-900 text-xl">{activeTestimonial.name}</p>
                                            <p className="text-sm text-blue-600 font-bold">
                                                {activeTestimonial.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex justify-center items-center gap-8 mt-12">
                            <button
                                onClick={goToPrevious}
                                className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all hover:scale-110 shadow-lg"
                            >
                                <FiChevronLeft className="w-7 h-7" />
                            </button>

                            {/* Dots */}
                            <div className="flex gap-3">
                                {testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setIsAutoPlay(false);
                                            setActiveIndex(index);
                                        }}
                                        className={`transition-all duration-300 ${index === activeIndex
                                            ? 'w-10 h-3 bg-blue-600 rounded-full'
                                            : 'w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={goToNext}
                                className="w-14 h-14 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all hover:scale-110 shadow-lg"
                            >
                                <FiChevronRight className="w-7 h-7" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto pt-20 mt-20 border-t-2 border-gray-200">
                    {[
                        { label: '100%', sublabel: 'On-Time Delivery' },
                        { label: '50+', sublabel: 'Projects Completed' },
                        { label: '5.0★', sublabel: 'Average Rating' },
                        { label: '24/7', sublabel: 'Support' },
                    ].map((badge, i) => (
                        <div key={i} className="text-center space-y-2">
                            <p className="text-5xl md:text-6xl font-black text-gradient-blue">{badge.label}</p>
                            <p className="text-sm text-gray-600 uppercase tracking-wider font-bold">{badge.sublabel}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
