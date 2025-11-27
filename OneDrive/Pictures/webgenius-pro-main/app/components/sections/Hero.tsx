'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiCalendar, FiShoppingCart } from 'react-icons/fi';
import { SiShopify } from 'react-icons/si';
import { HiCode, HiColorSwatch, HiSearchCircle } from 'react-icons/hi';

// Counter animation hook
function useCounter(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (hasAnimated) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setCount(Math.floor(progress * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setHasAnimated(true);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, hasAnimated]);

    return count;
}

export default function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], [0, 100]);
    const y2 = useTransform(scrollY, [0, 300], [0, -50]);
    const revenue = useCounter(450, 2500);

    const services = [
        { icon: 'shopify', label: "Shopify", count: "20+" },
        { icon: 'webapp', label: "Web Apps", count: "30+" },
        { icon: 'uiux', label: "UI/UX", count: "50+" },
        { icon: 'seo', label: "SEO", count: "25+" },
    ];

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
            {/* Animated Gradient Orbs */}
            <motion.div
                style={{ y: y1 }}
                className="absolute top-20 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-cyan-100/30 rounded-full blur-3xl"
            />
            <motion.div
                style={{ y: y2 }}
                className="absolute bottom-0 -right-40 w-[800px] h-[800px] bg-gradient-to-tl from-blue-100/40 to-indigo-100/30 rounded-full blur-3xl"
            />

            <div className="container-custom relative z-10 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* LEFT: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            <span className="text-sm font-bold text-blue-900">Trusted by 50+ Brands Worldwide</span>
                        </motion.div>

                        {/* Main Headline */}
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="text-6xl lg:text-8xl xl:text-9xl font-black leading-[0.95] text-gray-900"
                            >
                                We build Brands
                                <br />
                                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                                    That Customer Trust
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-xl lg:text-2xl text-gray-700 font-medium leading-relaxed max-w-xl"
                            >
                                Premium web apps, Shopify stores & AI solutions designed to drive real revenue.
                                <span className="text-blue-600 font-bold"> From concept to launch in weeks.</span>
                            </motion.p>
                        </div>

                        {/* CTAs - Updated & Animated */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="flex flex-wrap gap-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <Link
                                    href="/book-meeting"
                                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-black text-white text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow flex items-center gap-2"
                                >
                                    <FiCalendar className="w-5 h-5" />
                                    Book Meeting
                                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            >
                                <Link
                                    href="/order"
                                    className="px-8 py-4 bg-white border-2 border-blue-600 rounded-xl font-bold text-blue-600 text-lg hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <FiShoppingCart className="w-5 h-5" />
                                    Order Now
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Trust Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200"
                        >
                            <div>
                                <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">50+</div>
                                <div className="text-sm text-gray-600 font-medium">Projects Built</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">5.0</div>
                                <div className="text-sm text-gray-600 font-medium">Client Rating</div>
                            </div>
                            <div>
                                <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">24/7</div>
                                <div className="text-sm text-gray-600 font-medium">Support</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* RIGHT: 3D Browser Mockup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="relative h-[650px] md:h-[600px] lg:h-[750px] overflow-visible"
                    >
                        {/* Main Browser Window */}
                        <motion.div
                            style={{ y: y1 }}
                            className="absolute left-0 top-0 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-[90%] sm:max-w-[380px] md:max-w-[480px] lg:max-w-[580px] pl-4 md:pl-0"
                        >
                            <div className="relative group">
                                {/* Glow */}
                                <div className="absolute -inset-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-[2.5rem] opacity-30 blur-3xl group-hover:opacity-45 transition-opacity duration-700 animate-pulse" />

                                {/* Browser */}
                                <div className="relative bg-white rounded-2xl lg:rounded-[2.5rem] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.3)] border-2 border-gray-200 overflow-hidden">
                                    {/* Browser Chrome */}
                                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 md:px-6 md:py-5 border-b-2 border-gray-200 flex items-center gap-2 md:gap-3">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500"></div>
                                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-500"></div>
                                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="flex-1 bg-white rounded-lg md:rounded-xl px-3 py-2 md:px-5 md:py-2.5 text-xs md:text-sm text-gray-500 font-semibold border border-gray-200 truncate">
                                            atherweb.agency
                                        </div>
                                    </div>

                                    {/* Dashboard Content */}
                                    <div className="p-6 md:p-8 lg:p-10 space-y-5 md:space-y-7 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
                                        {/* Animated Shopify Logo - BOTTOM TO TOP */}
                                        <motion.div
                                            initial={{ y: 0, opacity: 0, bottom: '1rem' }}
                                            animate={{ y: -200, opacity: 1 }}
                                            transition={{
                                                delay: 0.5,
                                                duration: 2,
                                                type: "spring",
                                                stiffness: 40,
                                                damping: 20
                                            }}
                                            className="absolute right-4 md:right-8 w-16 h-16 md:w-20 md:h-20 z-10"
                                            style={{ bottom: '1rem' }}
                                        >
                                            <motion.div
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    delay: 2.5
                                                }}
                                            >
                                                <Image
                                                    src="/team/shopify-app-icon-on-transparent-background-free-png.webp"
                                                    alt="Shopify"
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-contain drop-shadow-2xl"
                                                />
                                                {/* Counter Badge - 0 to 60 */}
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
                                                    className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full px-2 py-1 flex flex-col items-center justify-center font-black text-xs shadow-lg"
                                                >
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 2.7 }}
                                                        className="text-sm md:text-base"
                                                    >
                                                        {Math.floor(useCounter(60, 1500))}
                                                    </motion.span>
                                                    <span className="text-[8px] md:text-[9px] font-semibold opacity-90">Projects</span>
                                                </motion.div>
                                            </motion.div>
                                        </motion.div>

                                        {/* Revenue */}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="text-xs md:text-sm text-gray-600 font-bold mb-1 md:mb-2">Total Revenue</div>
                                                <div className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                                                    ${revenue}K
                                                </div>
                                                <div className="flex items-center gap-1 md:gap-2 mt-2 md:mt-3">
                                                    <span className="text-green-600 font-black text-base md:text-xl">↗ +127%</span>
                                                    <span className="text-gray-500 text-xs md:text-sm font-medium">this month</span>
                                                </div>
                                            </div>
                                            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white px-4 py-2 md:px-7 md:py-3.5 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-lg whitespace-nowrap">
                                                LIVE
                                            </div>
                                        </div>

                                        {/* Chart */}
                                        <div className="h-32 md:h-44 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 p-4 md:p-6 flex items-end gap-1.5 md:gap-2.5 border-2 border-blue-100">
                                            {[50, 70, 60, 90, 80, 100, 95, 105].map((height, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ scaleY: 0 }}
                                                    animate={{ scaleY: 1 }}
                                                    transition={{
                                                        delay: 0.8 + i * 0.08,
                                                        duration: 0.7,
                                                        type: "spring",
                                                        stiffness: 90
                                                    }}
                                                    className="flex-1 bg-gradient-to-t from-blue-600 via-cyan-500 to-cyan-400 rounded-t-lg md:rounded-t-xl origin-bottom shadow-lg"
                                                    style={{ height: `${Math.min(100, height)}%` }}
                                                />
                                            ))}
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                                            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border-2 border-gray-200 text-center shadow-sm hover:shadow-lg transition-shadow">
                                                <div className="text-2xl md:text-4xl font-black text-gray-900">2.5K</div>
                                                <div className="text-[10px] md:text-xs text-gray-600 mt-1 md:mt-1.5 font-semibold">Users</div>
                                            </div>
                                            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border-2 border-gray-200 text-center shadow-sm hover:shadow-lg transition-shadow">
                                                <div className="text-2xl md:text-4xl font-black text-gray-900">99%</div>
                                                <div className="text-[10px] md:text-xs text-gray-600 mt-1 md:mt-1.5 font-semibold">Uptime</div>
                                            </div>
                                            <div className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 border-2 border-gray-200 text-center shadow-sm hover:shadow-lg transition-shadow">
                                                <div className="text-2xl md:text-4xl font-black text-gray-900">4.9</div>
                                                <div className="text-[10px] md:text-xs text-gray-600 mt-1 md:mt-1.5 font-semibold">Rating</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Service Cards - Real Icons */}
                        {services.map((service, idx) => {
                            const IconComponent =
                                service.icon === 'shopify' ? SiShopify :
                                    service.icon === 'webapp' ? HiCode :
                                        service.icon === 'uiux' ? HiColorSwatch :
                                            HiSearchCircle;

                            return (
                                <motion.div
                                    key={service.label}
                                    initial={{ opacity: 0, y: 40, scale: 0.7 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        delay: 1.5 + idx * 0.15,
                                        duration: 0.7,
                                        type: "spring"
                                    }}
                                    style={{
                                        y: idx % 2 === 0 ? y1 : y2,
                                        position: 'absolute',
                                        ...(idx === 0 && { top: '6%', left: '-10%' }),
                                        ...(idx === 1 && { top: '10%', right: '-10%' }),
                                        ...(idx === 2 && { bottom: '26%', left: '-8%' }),
                                        ...(idx === 3 && { bottom: '16%', right: '-8%' }),
                                    }}
                                    whileHover={{ scale: 1.15, rotate: 3 }}
                                    className="hidden lg:block bg-white rounded-3xl p-5 md:p-7 border-2 border-gray-300 shadow-[0_12px_45px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_25px_70px_-10px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                                            <IconComponent className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="text-blue-600 font-black text-2xl md:text-3xl">{service.count}</div>
                                            <div className="text-gray-800 text-base md:text-lg font-bold">{service.label}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* 5-Star Rating */}
                        <motion.div
                            initial={{ opacity: 0, rotate: -12, scale: 0.7 }}
                            animate={{ opacity: 1, rotate: 0, scale: 1 }}
                            transition={{ delay: 2.2, duration: 0.9, type: "spring" }}
                            style={{ y: y1 }}
                            whileHover={{ scale: 1.12 }}
                            className="hidden lg:block absolute top-[42%] -right-6 md:-right-8 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-5 md:p-7 border-2 border-yellow-400 shadow-[0_18px_55px_-10px_rgba(234,179,8,0.35)]"
                        >
                            <div className="flex items-center gap-1.5 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 2.4 + i * 0.12 }}
                                        className="text-yellow-500 text-3xl md:text-4xl"
                                    >
                                        ★
                                    </motion.span>
                                ))}
                            </div>
                            <div className="text-gray-900 font-black text-xl md:text-2xl">5.0 Rating</div>
                            <div className="text-gray-700 text-sm md:text-base font-bold">50+ Reviews</div>
                        </motion.div>

                        {/* Success Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 2.5, type: "spring" }}
                            style={{ y: y2 }}
                            whileHover={{ scale: 1.08 }}
                            className="hidden lg:block absolute bottom-[36%] -left-8 md:-left-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-5 md:p-6 border-2 border-green-400 shadow-[0_12px_45px_-10px_rgba(34,197,94,0.35)]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-3xl md:text-4xl shadow-lg">
                                    ✓
                                </div>
                                <div>
                                    <div className="text-gray-900 font-black text-xl md:text-2xl">100%</div>
                                    <div className="text-gray-700 text-sm md:text-base font-bold">Success</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
