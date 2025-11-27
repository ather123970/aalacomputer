'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import { NAV_LINKS } from '@/app/lib/constants';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsScrolled(latest > 50);
        });
    }, [scrollY]);

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                    ? 'py-4 bg-white/80 backdrop-blur-md shadow-lg shadow-blue-100/50 border-b border-gray-200/50'
                    : 'py-6 bg-white/60 backdrop-blur-sm'
                    }`}
            >
                <div className="container-custom flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group z-50">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xl group-hover:scale-110 transition-transform">
                                <Image
                                    src="/team/ather.jpg"
                                    alt="Ather"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                        <span className="text-2xl font-black text-gray-900">
                            Ather<span className="text-blue-600">Web</span>
                        </span>
                    </Link>

                    {/* Desktop Nav - Increased spacing from gap-1 to gap-2 */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="hidden lg:block">
                        <a
                            href="#order"
                            className="group relative inline-flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all hover:scale-105 hover:brightness-110"
                        >
                            Order Now
                            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden p-2 text-gray-900 z-50"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-white z-[90] lg:hidden pt-24 px-6"
                    >
                        <div className="flex flex-col gap-6">
                            {NAV_LINKS.map((link, i) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-3xl font-bold text-gray-900 hover:text-blue-600 hover:pl-4 transition-all"
                                >
                                    {link.name}
                                </motion.a>
                            ))}
                            <motion.a
                                href="#order"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="mt-8 block w-full bg-blue-600 text-white text-center py-4 rounded-2xl font-bold text-lg shadow-xl"
                            >
                                Order Now
                            </motion.a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
