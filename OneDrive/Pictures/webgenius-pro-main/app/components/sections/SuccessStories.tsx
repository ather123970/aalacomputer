'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';

interface Project {
    id: string;
    name: string;
    url: string;
    description: string;
}

const LIVE_PROJECTS: Project[] = [
    {
        id: 'watchstore',
        name: 'Watch Store PK',
        url: 'http://watchstorepk.onrender.com',
        description: 'Premium luxury watch boutique'
    }
];

export default function SuccessStories() {
    return (
        <section id="success-stories" className="relative py-12 bg-gray-50">
            <div className="container mx-auto px-6">
                {/* Section Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                        Live Projects
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Explore our working projects serving real customers
                    </p>
                </motion.div>

                <div className="max-w-2xl mx-auto">
                    {LIVE_PROJECTS.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                                {/* Live Website iframe - No loading overlay */}
                                <div className="relative h-96 bg-gray-100">
                                    <iframe
                                        src={project.url}
                                        className="w-full h-full border-0"
                                        title={`${project.name} Preview`}
                                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Minimal Info Bar */}
                                <div className="p-4 bg-white border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{project.name}</h3>
                                            <p className="text-sm text-gray-600">{project.description}</p>
                                        </div>
                                        <motion.a
                                            href={project.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <FiExternalLink className="text-base" />
                                            Open
                                        </motion.a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
