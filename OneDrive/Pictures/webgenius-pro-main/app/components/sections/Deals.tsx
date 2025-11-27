'use client';

import { motion } from 'framer-motion';
import { DEALS } from '@/app/lib/constants';
import { FiCheck, FiArrowRight, FiZap, FiShoppingBag, FiTrendingUp, FiCpu, FiStar } from 'react-icons/fi';

export default function Deals() {
    const getIcon = (color: string) => {
        switch (color) {
            case 'blue': return FiZap;
            case 'green': return FiShoppingBag;
            case 'purple': return FiTrendingUp;
            case 'orange': return FiCpu;
            default: return FiStar;
        }
    };

    const getGradient = (color: string) => {
        switch (color) {
            case 'blue': return 'from-blue-600 to-cyan-600';
            case 'green': return 'from-green-600 to-emerald-600';
            case 'purple': return 'from-purple-600 to-pink-600';
            case 'orange': return 'from-orange-600 to-red-600';
            default: return 'from-blue-600 to-purple-600';
        }
    };

    return (
        <section id="deals" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6"
                    >
                        <FiZap className="w-4 h-4" />
                        <span>Exclusive Packages</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6"
                    >
                        Packages That <span className="text-gradient-blue">Deliver Results</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        From quick launches to enterprise AI systems - we have the perfect solution for every stage of your journey.
                    </motion.p>
                </div>

                {/* Deals Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {DEALS.map((deal, index) => {
                        const Icon = getIcon(deal.color);
                        const gradient = getGradient(deal.color);

                        return (
                            <motion.div
                                key={deal.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative ${deal.highlight ? 'md:col-span-2 lg:col-span-1' : ''}`}
                            >
                                {/* Card */}
                                <div className={`relative h-full rounded-3xl bg-white border-2 transition-all duration-300 overflow-hidden ${deal.highlight
                                    ? 'border-blue-500 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30'
                                    : 'border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl'
                                    } hover:-translate-y-2`}>

                                    {/* Badge */}
                                    {deal.badge && (
                                        <div className={`absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r ${gradient} text-white text-xs font-black rounded-bl-2xl rounded-tr-2xl shadow-lg`}>
                                            {deal.badge}
                                        </div>
                                    )}

                                    <div className="p-8">
                                        {/* Icon */}
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">
                                            {deal.title}
                                        </h3>
                                        <p className="text-sm font-bold text-blue-600 mb-3">
                                            {deal.tagline}
                                        </p>
                                        <p className="text-gray-600 text-sm mb-6">
                                            {deal.description}
                                        </p>

                                        {/* Price */}
                                        <div className="mb-6 pb-6 border-b-2 border-gray-100">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-gray-900">
                                                    {deal.priceRange}
                                                </span>
                                                <span className="text-gray-600 font-bold">
                                                    {deal.currency}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-3 mb-6">
                                            {deal.features.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                    <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                    <span className="font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Addons */}
                                        {deal.addons && deal.addons.length > 0 && (
                                            <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                                                <p className="text-xs font-black text-gray-900 mb-2 uppercase tracking-wider">Add-ons Available:</p>
                                                {deal.addons.map((addon, i) => (
                                                    <p key={i} className="text-xs text-gray-600 font-medium">{addon}</p>
                                                ))}
                                            </div>
                                        )}

                                        {/* Best For */}
                                        {deal.bestFor && (
                                            <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-100">
                                                <p className="text-xs font-bold text-blue-900">
                                                    <span className="font-black">Best for:</span> {deal.bestFor}
                                                </p>
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <a
                                            href="#order"
                                            className={`group/btn w-full py-4 rounded-xl font-black text-sm text-white bg-gradient-to-r ${gradient} hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                                        >
                                            Get Started
                                            <FiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <p className="text-gray-600 mb-4 text-lg">
                        Need a custom solution? <span className="font-black text-gray-900">We build anything.</span>
                    </p>
                    <a
                        href="https://wa.me/923434153736"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all hover:scale-105 shadow-xl"
                    >
                        Discuss on WhatsApp
                        <FiArrowRight />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
