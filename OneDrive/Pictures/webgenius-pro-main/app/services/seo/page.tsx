'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SERVICES } from '@/app/lib/constants';
import { FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import Header from '@/app/components/sections/Header';
import Footer from '@/app/components/sections/Footer';

export default function SEOPage() {
    const service = SERVICES.find((s: any) => s.id === 'seo');
    if (!service) return null;

    const Icon = service.icon;

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
        <>
            <Header />
            <main className="min-h-screen pt-24">
                <section className="section-padding bg-gradient-to-br from-orange-50 via-white to-yellow-50">
                    <div className="container-custom">
                        <Link
                            href="/#services"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8 font-semibold transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            Back to Services
                        </Link>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <div
                                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-6"
                                    style={{
                                        background: `linear-gradient(135deg, ${service.color}20, ${service.color}30)`,
                                        color: colorMap[service.color]
                                    }}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-bold text-sm">Growth Experts</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">{service.title}</h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">{(service as any).detailedDescription}</p>
                                <div className="flex flex-wrap gap-4">
                                    <Link href="/#order" className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${bgColorMap[service.color]} text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105`}>
                                        Get Started
                                        <FiArrowRight className="w-5 h-5" />
                                    </Link>
                                    <Link href="/#contact" className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-xl font-bold hover:border-orange-300 transition-all hover:scale-105">
                                        Schedule Consultation
                                    </Link>
                                </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="relative">
                                <div className="aspect-square rounded-3xl p-12 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${service.color}10, ${service.color}30)` }}>
                                    <Icon className="w-64 h-64 opacity-20" style={{ color: colorMap[service.color] }} />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
                <section className="section-padding bg-white">
                    <div className="container-custom">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Technology Stack</h2>
                            <p className="text-xl text-gray-600">We use cutting-edge technologies to build your solution</p>
                        </motion.div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {(service as any).techStack.map((tech: string, index: number) => (
                                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-center hover:shadow-lg transition-all hover:scale-105">
                                    <p className="font-bold text-gray-900">{tech}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="section-padding bg-gray-50">
                    <div className="container-custom">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Perfect For</h2>
                            <p className="text-xl text-gray-600">Ideal use cases for this service</p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 gap-8">
                            {(service as any).useCases.map((useCase: any, index: number) => (
                                <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all">
                                    <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${service.color}30, ${service.color}50)`, color: colorMap[service.color] }}>
                                        <FiCheck className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-3">{useCase.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="section-padding bg-white">
                    <div className="container-custom">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Key Benefits</h2>
                            <p className="text-xl text-gray-600">Why choose our {service.title.toLowerCase()}</p>
                        </motion.div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {(service as any).benefits.map((benefit: string, index: number) => (
                                <motion.div key={index} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="flex items-start gap-3 p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: colorMap[service.color] }}>
                                        <FiCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <p className="text-gray-700 font-medium leading-relaxed">{benefit}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
                <section className="section-padding bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                    <div className="container-custom">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black mb-6">Investment Range</h2>
                            <div className="text-6xl md:text-7xl font-black mb-4">${(service as any).priceRange.min.toLocaleString()} - ${(service as any).priceRange.max.toLocaleString()}</div>
                            <p className="text-xl text-gray-300 mb-8">{(service as any).priceRange.currency}</p>
                            <p className="text-gray-400 mb-8">Final pricing depends on project scope, complexity, and specific requirements. Schedule a free consultation to get an accurate quote.</p>
                            <Link href="/#contact" className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${bgColorMap[service.color]} text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105`}>
                                Get Custom Quote
                                <FiArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </section>
                <section className="section-padding bg-gradient-to-br from-orange-600 to-yellow-600 text-white">
                    <div className="container-custom text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Get Started?</h2>
                            <p className="text-xl mb-8 text-orange-100 max-w-2xl mx-auto">Let's build something amazing together. Schedule a free consultation to discuss your project.</p>
                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link href="/#order" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105">
                                    Start Your Project
                                    <FiArrowRight className="w-5 h-5" />
                                </Link>
                                <Link href="/#services" className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white hover:text-orange-600 transition-all">
                                    View All Services
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
