'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRICING_PLANS } from '@/app/lib/constants';
import { FiCheck, FiStar } from 'react-icons/fi';
import Button from '@/app/components/ui/Button';

export default function Pricing() {
    const [currency, setCurrency] = useState<'USD' | 'PKR'>('PKR');

    return (
        <section id="pricing" className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold text-sm mb-6"
                    >
                        Pricing
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black text-gray-900 mb-6"
                    >
                        Simple, <span className="text-gradient-blue">Transparent</span> Pricing
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600 mb-10"
                    >
                        Choose the perfect plan for your business. No hidden fees, ever.
                    </motion.p>

                    {/* Currency Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-black ${currency === 'PKR' ? 'text-gray-900' : 'text-gray-400'}`}>PKR</span>
                        <button
                            onClick={() => setCurrency(currency === 'USD' ? 'PKR' : 'USD')}
                            className="relative w-16 h-8 bg-gray-200 rounded-full p-1 transition-all"
                        >
                            <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                                className={`w-6 h-6 bg-blue-600 rounded-full shadow-lg ${currency === 'USD' ? 'translate-x-8' : 'translate-x-0'}`}
                            />
                        </button>
                        <span className={`text-sm font-black ${currency === 'USD' ? 'text-gray-900' : 'text-gray-400'}`}>USD</span>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {PRICING_PLANS.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-3xl p-10 border-2 transition-all duration-300 flex flex-col ${plan.highlight
                                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-600 shadow-2xl shadow-blue-600/30 scale-105 z-10'
                                    : 'bg-white border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl card-hover'
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-sm font-black shadow-xl flex items-center gap-2">
                                    <FiStar className="w-4 h-4" />
                                    Most Popular
                                </div>
                            )}

                            <div className={`text-center mb-8 ${plan.highlight ? 'text-white' : ''}`}>
                                <h3 className={`text-2xl font-black mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`font-bold text-sm mb-6 ${plan.highlight ? 'text-blue-100' : 'text-blue-600'}`}>
                                    {plan.description}
                                </p>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className={`text-5xl font-black tracking-tight ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                                        {currency === 'USD' ? '$' : 'PKR '}
                                        {currency === 'USD' ? plan.range.usd : plan.range.pkr}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className={`flex items-start gap-3 text-sm font-medium ${plan.highlight ? 'text-blue-50' : 'text-gray-700'}`}>
                                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-white/20' : 'bg-blue-100'}`}>
                                            <FiCheck className={`w-4 h-4 ${plan.highlight ? 'text-white' : 'text-blue-600'} font-bold`} />
                                        </div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                variant={plan.highlight ? 'primary' : 'outline'}
                                className={`w-full justify-center font-black text-base py-4 ${plan.highlight
                                        ? 'bg-white text-blue-600 hover:bg-gray-100 border-0'
                                        : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                                    }`}
                                href="#order"
                            >
                                {plan.buttonText}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
