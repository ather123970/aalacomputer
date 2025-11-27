'use client';

import React from 'react';
import { FiMail, FiMapPin, FiGithub, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        company: [
            { label: 'About Us', href: '#about' },
            { label: 'Services', href: '#services' },
            { label: 'Portfolio', href: '#portfolio' },
            { label: 'Process', href: '#process' },
        ],
        resources: [
            { label: 'Pricing', href: '#pricing' },
            { label: 'Blog', href: '#blog' },
            { label: 'Case Studies', href: '#portfolio' },
            { label: 'Contact', href: '#contact' },
        ],
        legal: [
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Policy', href: '/cookies' },
        ],
    };

    const socialLinks = [
        { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
        { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' },
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
            <div className="container-custom">
                {/* Main Footer */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 py-20 border-b border-white/10">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                                A
                            </div>
                            <span className="text-2xl font-black">
                                Ather<span className="text-blue-400">Web</span>
                            </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed font-medium">
                            Building digital magic with world-class web development and stunning design.
                        </p>

                        {/* Contact */}
                        <div className="space-y-3">
                            <a href="mailto:muhammadather212437@gmail.com" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors font-medium">
                                <FiMail className="w-4 h-4 text-blue-400" />
                                muhammadather212437@gmail.com
                            </a>
                            <div className="flex items-center gap-2 text-gray-300 font-medium">
                                <FiMapPin className="w-4 h-4 text-blue-400" />
                                Lahore, Pakistan
                            </div>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-black text-white mb-6 text-lg">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors font-medium">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-black text-white mb-6 text-lg">Resources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors font-medium">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal & Social */}
                    <div>
                        <h4 className="font-black text-white mb-6 text-lg">Legal</h4>
                        <ul className="space-y-3 mb-8">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors font-medium">
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Social */}
                        <div>
                            <h5 className="font-black text-white text-sm mb-4">Follow Us</h5>
                            <div className="flex gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;
                                    return (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all hover:scale-110"
                                        >
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400">
                    <p className="font-medium">
                        © {currentYear} AtherWeb. All rights reserved.
                    </p>
                    <p className="font-medium">
                        Crafted with 💙 using Next.js & Tailwind
                    </p>
                </div>
            </div>
        </footer>
    );
}
