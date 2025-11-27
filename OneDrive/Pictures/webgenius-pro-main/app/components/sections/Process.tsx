'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PROCESS_STEPS as processSteps } from '@/app/lib/constants';
import { fadeInUp, staggerContainer } from '@/app/lib/animations';

export default function Process() {
    return (
        <section id="process" className="section-padding bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 relative">
            <div className="container-custom relative z-10">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={staggerContainer}
                    className="space-y-20"
                >
                    {/* Section Header */}
                    <motion.div variants={fadeInUp} className="text-center space-y-6 max-w-3xl mx-auto">
                        <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
                            How We Work
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight">
                            Our Proven <span className="text-gradient-blue">Process</span>
                        </h2>

                        <p className="text-xl text-gray-600">
                            From concept to launch, we follow a battle-tested methodology.
                        </p>
                    </motion.div>

                    {/* Desktop Timeline */}
                    <div className="hidden lg:block">
                        <div className="relative">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 -translate-y-1/2 opacity-20 rounded-full" />

                            {/* Steps */}
                            <div className="grid grid-cols-6 gap-4 relative">
                                {processSteps.map((step, index) => (
                                    <motion.div
                                        key={step.id}
                                        variants={fadeInUp}
                                        custom={index}
                                        className="space-y-6 relative group"
                                    >
                                        {/* Icon Circle */}
                                        <div className="flex justify-center relative">
                                            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                                            <div className="w-24 h-24 rounded-2xl bg-white border-4 border-blue-600 group-hover:border-purple-600 flex items-center justify-center text-4xl relative z-10 shadow-2xl shadow-blue-600/20 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                                                <step.icon className="text-blue-600 group-hover:text-purple-600 transition-colors" />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="text-center space-y-2">
                                            <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 leading-relaxed px-2">
                                                {step.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Timeline */}
                    <div className="lg:hidden space-y-8 relative">
                        <div className="absolute top-8 bottom-8 left-10 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-blue-600 opacity-20 rounded-full" />

                        {processSteps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                variants={fadeInUp}
                                custom={index}
                                className="relative flex items-start gap-6 group"
                            >
                                {/* Icon */}
                                <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                                    <div className="w-20 h-20 rounded-2xl bg-white border-4 border-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-600/20 group-hover:border-purple-600 group-hover:-rotate-6 transition-all">
                                        <step.icon className="text-blue-600 group-hover:text-purple-600" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="pt-4 space-y-2 flex-1">
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
