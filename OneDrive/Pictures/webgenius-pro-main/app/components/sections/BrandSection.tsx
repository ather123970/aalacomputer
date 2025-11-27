'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiTrendingUp, FiUsers, FiZap, FiCode, FiLayout, FiSmartphone, FiBarChart, FiMessageCircle } from 'react-icons/fi';
import { SiTiktok, SiInstagram, SiLinkedin } from 'react-icons/si';
import Image from 'next/image';

export default function BrandSection() {
    const skills = [
        { icon: FiCode, name: 'Web Development', description: 'Next.js, React, TypeScript' },
        { icon: FiLayout, name: 'UI/UX Design', description: 'Figma, Adobe XD, Tailwind' },
        { icon: FiSmartphone, name: 'Mobile Apps', description: 'React Native, Flutter' },
        { icon: FiBarChart, name: 'Digital Marketing', description: 'SEO, Social Media, Ads' },
        { icon: FiZap, name: 'E-Commerce', description: 'Shopify, WooCommerce' },
        { icon: FiTrendingUp, name: 'Growth Strategy', description: 'Analytics, Optimization' },
    ];

    const socialLinks = [
        { icon: SiTiktok, name: 'TikTok', handle: '@sleepyeyes114', url: 'https://tiktok.com/@sleepyeyes114', color: 'text-black' },
        { icon: SiInstagram, name: 'Instagram', handle: '@atherweb', url: 'https://instagram.com', color: 'text-pink-600' },
        { icon: SiLinkedin, name: 'LinkedIn', handle: 'Ather Web Agency', url: 'https://linkedin.com', color: 'text-blue-600' },
    ];

    const stats = [
        { number: '127+', label: 'Brands Built' },
        { number: '10x', label: 'Faster Growth' },
        { number: '100%', label: 'Client Satisfaction' },
        { number: '24/7', label: 'Support' },
    ];

    return (
        <section className="py-32 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />
            </div>

            <div className="container-custom relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT: Image & Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Main Image */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-2xl animate-pulse" />
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                                <Image
                                    src="/api/placeholder/600/700"
                                    alt="Ather Web Agency Team"
                                    width={600}
                                    height={700}
                                    className="w-full h-auto"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Floating Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="absolute -bottom-10 -right-10 bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-100"
                        >
                            <div className="grid grid-cols-2 gap-6">
                                {stats.map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-3xl font-black text-gradient-blue">{stat.number}</div>
                                        <div className="text-xs text-gray-600 font-bold mt-1">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                                About Us
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
                                Meet <span className="text-gradient-blue">Ather Web Agency</span>
                            </h2>

                            <p className="text-xl text-gray-600 leading-relaxed">
                                We're not just developers – we're digital architects building brands that dominate their markets.
                                With <span className="font-black text-blue-600">127+ successful launches</span>, we help businesses grow <span className="font-black text-purple-600">10x faster</span> through cutting-edge technology and data-driven strategies.
                            </p>
                        </div>

                        {/* Skills Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {skills.map((skill, i) => (
                                <motion.div
                                    key={skill.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-4 rounded-xl bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer"
                                >
                                    <skill.icon className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                                    <h4 className="font-black text-gray-900 mb-1">{skill.name}</h4>
                                    <p className="text-xs text-gray-600">{skill.description}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Social Presence */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-black text-gray-900">Follow Our Journey</h3>
                            <div className="flex flex-wrap gap-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.name}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group"
                                    >
                                        <social.icon className={`w-5 h-5 ${social.color} group-hover:scale-110 transition-transform`} />
                                        <div className="text-left">
                                            <div className="text-xs text-gray-500 font-medium">{social.name}</div>
                                            <div className="text-sm font-black text-gray-900">{social.handle}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* WhatsApp CTA */}
                        <motion.a
                            href="https://wa.me/923434153736"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl font-black text-lg shadow-2xl shadow-green-600/30 hover:shadow-green-600/50 transition-all"
                        >
                            <FiMessageCircle className="w-6 h-6" />
                            Discuss Your Project on WhatsApp
                        </motion.a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
