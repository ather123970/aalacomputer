'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMessageCircle, FiCalendar, FiMapPin } from 'react-icons/fi';
import { fadeInUp } from '@/app/lib/animations';

export default function Contact() {
    return (
        <section id="contact" className="py-20 bg-white relative border-t-2 border-gray-100">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold text-sm mb-6">
                            Get In Touch
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                            Let's Talk <span className="text-gradient-blue">Business</span>
                        </h2>
                        <p className="text-xl text-gray-600">
                            Ready to start? Reach out and let's build something amazing.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Email */}
                        <motion.a
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            href="mailto:muhammadather212437@gmail.com"
                            className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:border-blue-500 transition-all card-hover"
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <FiMail className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600 text-sm mb-4 font-medium">Quick response guaranteed</p>
                            <span className="text-blue-600 font-black text-sm">muhammadather212437@gmail.com</span>
                        </motion.a>

                        {/* WhatsApp */}
                        <motion.a
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            href="https://wa.me/923434153736"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:border-green-500 transition-all card-hover"
                        >
                            <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                <FiMessageCircle className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">WhatsApp</h3>
                            <p className="text-gray-600 text-sm mb-4 font-medium">Chat with us instantly</p>
                            <span className="text-green-600 font-black text-sm">03434153736</span>
                        </motion.a>

                        {/* Book Audit */}
                        <motion.a
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            href="https://calendly.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-8 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white border-2 border-purple-600 hover:shadow-2xl transition-all card-hover"
                        >
                            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FiCalendar className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-xl font-black mb-2">Free Audit Call</h3>
                            <p className="text-purple-100 text-sm mb-4 font-medium">15-min strategy session</p>
                            <span className="font-black text-sm underline decoration-2 underline-offset-4">Book Now →</span>
                        </motion.a>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="mt-12 text-center"
                    >
                        <div className="inline-flex items-center gap-2 text-gray-500 font-medium">
                            <FiMapPin className="w-4 h-4" />
                            <span>Based in Lahore, Pakistan • Serving Global Clients</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
