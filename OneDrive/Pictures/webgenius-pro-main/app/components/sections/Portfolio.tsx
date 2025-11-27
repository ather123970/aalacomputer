'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { FiArrowUpRight, FiArrowRight } from 'react-icons/fi';
import Modal from '@/app/components/ui/Modal';
import { PORTFOLIO_ITEMS as portfolio } from '@/app/lib/constants';
import Image from 'next/image';

export default function Portfolio() {
    const [selectedCase, setSelectedCase] = useState<typeof portfolio[0] | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [isInView, controls]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 50,
                damping: 20,
                duration: 0.8
            }
        }
    };

    return (
        <>
            <section id="portfolio" className="section-padding bg-gradient-to-b from-white via-blue-50/20 to-white overflow-hidden" ref={sectionRef}>
                <div className="container-custom">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 font-bold text-sm mb-6 shadow-sm"
                        >
                            ✨ Our Work
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-gray-900 mb-6 leading-tight"
                        >
                            Success <span className="text-gradient-blue">Stories</span>
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-600 leading-relaxed"
                        >
                            3 premium projects that showcase our expertise in creating <br className="hidden md:block" />
                            stunning, high-performance digital experiences.
                        </motion.p>
                    </div>

                    {/* Horizontal Scroll Container */}
                    <motion.div
                        ref={scrollRef}
                        variants={containerVariants}
                        initial="hidden"
                        animate={controls}
                        className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        {portfolio.map((item, index) => (
                            <motion.div
                                key={item.id}
                                variants={cardVariants}
                                className="group cursor-pointer flex-shrink-0 w-[85vw] md:w-[600px] snap-center"
                                onClick={() => setSelectedCase(item)}
                            >
                                <div className="relative rounded-3xl overflow-hidden bg-white border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-xl hover:shadow-2xl h-full">
                                    {/* Image Container */}
                                    <div className="aspect-[16/10] overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-700">
                                        {/* Category Badge */}
                                        <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full text-xs font-black bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg border border-gray-200">
                                            {item.category}
                                        </div>

                                        {/* Real Project Image */}
                                        <div className="w-full h-full relative">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                priority={index === 0}
                                            />
                                        </div>

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/95 via-blue-600/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center">
                                            <div className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-lg flex items-center gap-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 shadow-2xl">
                                                View Case Study <FiArrowRight className="text-2xl" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 space-y-5 bg-white">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                    {item.client} • {item.niche}
                                                </p>
                                            </div>
                                            <FiArrowUpRight className="text-3xl text-blue-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <p className="text-gray-600 text-lg leading-relaxed line-clamp-2">
                                            {item.description}
                                        </p>

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4 pt-6 border-t-2 border-gray-100">
                                            {item.results && Object.entries(item.results).map(([key, value]) => (
                                                <div key={key} className="text-center">
                                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">{key}</p>
                                                    <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                        {value}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Scroll Indicator */}
                    <div className="text-center mt-12">
                        <p className="text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
                            <FiArrowRight className="animate-pulse" />
                            Scroll right to see more projects
                        </p>
                    </div>
                </div>
            </section>

            {/* Case Study Modal */}
            <Modal
                isOpen={!!selectedCase}
                onClose={() => setSelectedCase(null)}
                title={selectedCase?.title || ''}
            >
                {selectedCase && (
                    <div className="space-y-8">
                        {/* Project Image */}
                        <div className="aspect-video rounded-2xl overflow-hidden relative bg-gradient-to-br from-gray-900 to-gray-700 shadow-xl">
                            <Image
                                src={selectedCase.image}
                                alt={selectedCase.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                {/* Client Info */}
                                <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-100">
                                    <span className="text-sm font-bold text-gray-500">CLIENT:</span>
                                    <span className="text-lg font-black text-gray-900">{selectedCase.client}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-sm font-bold text-blue-600">{selectedCase.niche}</span>
                                </div>

                                {/* Challenge */}
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                        The Challenge
                                    </h4>
                                    <p className="text-gray-600 leading-relaxed text-lg">{selectedCase.problem}</p>
                                </div>

                                {/* Solution */}
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                        Our Solution
                                    </h4>
                                    <ul className="space-y-3">
                                        {selectedCase.solution?.map((sol, i) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-600 text-lg">
                                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                                                    <span className="text-xs font-black text-blue-600">{i + 1}</span>
                                                </div>
                                                <span>{sol}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Results Card */}
                            <div className="space-y-6 p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100 shadow-lg h-fit">
                                <h4 className="font-black text-gray-900 text-xl">🎯 Key Results</h4>
                                <div className="space-y-5">
                                    {selectedCase.results && Object.entries(selectedCase.results).map(([key, value]) => (
                                        <div key={key} className="pb-4 border-b border-blue-200 last:border-0">
                                            <span className="text-gray-600 capitalize text-sm font-bold block mb-2 uppercase tracking-wide">{key}</span>
                                            <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </>
    );
}
