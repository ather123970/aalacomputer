'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCheck, FiArrowRight, FiShoppingCart } from 'react-icons/fi';
import { SiShopify } from 'react-icons/si';
import { HiCode, HiColorSwatch, HiSearchCircle, HiSparkles } from 'react-icons/hi';

export default function OrderPage() {
    const [selectedService, setSelectedService] = useState<string | null>(null);

    const services = [
        {
            id: 'shopify',
            icon: SiShopify,
            name: 'Shopify Store',
            description: 'Complete e-commerce solution',
            color: 'from-green-500 to-emerald-600',
            packages: [
                {
                    name: 'Starter Store',
                    price: '30,000',
                    features: [
                        'Professional Shopify theme setup',
                        'Up to 50 products',
                        'Payment gateway integration',
                        'Mobile responsive design',
                        'Basic SEO optimization',
                        '1 month support',
                    ],
                    delivery: '2-3 weeks'
                },
                {
                    name: 'Business Store',
                    price: '50,000',
                    features: [
                        'Custom Shopify theme design',
                        'Unlimited products',
                        'Advanced payment integrations',
                        'Custom features & apps',
                        'Advanced SEO & analytics',
                        'Email marketing setup',
                        '3 months support',
                    ],
                    delivery: '3-4 weeks',
                    popular: true
                },
                {
                    name: 'Enterprise Store',
                    price: '85,000',
                    features: [
                        'Fully custom Shopify development',
                        'Multi-vendor marketplace',
                        'Custom app development',
                        'API integrations',
                        'Advanced automation',
                        'Priority support (6 months)',
                    ],
                    delivery: '4-6 weeks'
                }
            ]
        },
        {
            id: 'webapp',
            icon: HiCode,
            name: 'Web Application',
            description: 'Custom web app development',
            color: 'from-blue-500 to-cyan-600',
            packages: [
                {
                    name: 'Basic App',
                    price: '45,000',
                    features: [
                        'Simple dashboard/app',
                        'User authentication',
                        'Database integration',
                        'Responsive design',
                        'Basic features',
                        '1 month support',
                    ],
                    delivery: '3-4 weeks'
                },
                {
                    name: 'Professional App',
                    price: '85,000',
                    features: [
                        'Custom web application',
                        'Advanced user roles',
                        'API development',
                        'Payment integration',
                        'Real-time features',
                        'Admin dashboard',
                        '3 months support',
                    ],
                    delivery: '4-6 weeks',
                    popular: true
                },
                {
                    name: 'Enterprise SaaS',
                    price: '150,000',
                    features: [
                        'Full SaaS platform',
                        'Multi-tenant architecture',
                        'Advanced integrations',
                        'Scalable infrastructure',
                        'AI/ML features',
                        '6 months priority support',
                    ],
                    delivery: '8-12 weeks'
                }
            ]
        },
        {
            id: 'uiux',
            icon: HiColorSwatch,
            name: 'UI/UX Design',
            description: 'Beautiful, user-friendly designs',
            color: 'from-purple-500 to-pink-600',
            packages: [
                {
                    name: 'Landing Page',
                    price: '18,000',
                    features: [
                        '1 landing page design',
                        'Mobile & desktop versions',
                        'Source files included',
                        '3 revisions',
                        'Brand guideline basics',
                    ],
                    delivery: '1 week'
                },
                {
                    name: 'Website Design',
                    price: '45,000',
                    features: [
                        'Up to 5 page designs',
                        'Complete design system',
                        'Responsive mockups',
                        'Interactive prototypes',
                        '5 revisions',
                        'Brand guidelines',
                    ],
                    delivery: '2-3 weeks',
                    popular: true
                },
                {
                    name: 'Complete Branding',
                    price: '75,000',
                    features: [
                        'Full website design (10+ pages)',
                        'Mobile app design',
                        'Complete brand identity',
                        'Design system',
                        'Unlimited revisions',
                        'Developer handoff',
                    ],
                    delivery: '3-4 weeks'
                }
            ]
        },
        {
            id: 'seo',
            icon: HiSearchCircle,
            name: 'SEO Services',
            description: 'Rank higher on Google',
            color: 'from-orange-500 to-red-600',
            packages: [
                {
                    name: 'SEO Audit',
                    price: '12,000',
                    features: [
                        'Complete website audit',
                        'Keyword research',
                        'Competitor analysis',
                        'SEO strategy report',
                        'Action plan',
                    ],
                    delivery: '1 week'
                },
                {
                    name: 'Monthly SEO',
                    price: '38,000',
                    features: [
                        'On-page optimization',
                        'Content optimization',
                        'Technical SEO',
                        'Link building',
                        'Monthly reports',
                        'Keyword tracking',
                    ],
                    delivery: 'Monthly service',
                    popular: true
                },
                {
                    name: 'Enterprise SEO',
                    price: '75,000',
                    features: [
                        'Full SEO management',
                        'Content creation',
                        'Advanced link building',
                        'Local SEO',
                        'Technical audits',
                        'Priority support',
                    ],
                    delivery: 'Monthly service'
                }
            ]
        },
        {
            id: 'ai',
            icon: HiSparkles,
            name: 'AI Solutions',
            description: 'AI-powered automation',
            color: 'from-indigo-500 to-purple-600',
            packages: [
                {
                    name: 'AI Chatbot',
                    price: '35,000',
                    features: [
                        'Custom AI chatbot',
                        'GPT integration',
                        'Website integration',
                        'Training on your data',
                        'Basic analytics',
                    ],
                    delivery: '2 weeks'
                },
                {
                    name: 'AI Automation',
                    price: '65,000',
                    features: [
                        'Custom AI tools',
                        'Process automation',
                        'API integrations',
                        'Advanced workflows',
                        'Dashboard & analytics',
                        '2 months support',
                    ],
                    delivery: '3-4 weeks',
                    popular: true
                },
                {
                    name: 'Enterprise AI',
                    price: '120,000',
                    features: [
                        'Full AI platform',
                        'Custom ML models',
                        'Advanced integrations',
                        'Scalable infrastructure',
                        'Ongoing optimization',
                        'Priority support',
                    ],
                    delivery: '6-8 weeks'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="container-custom py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black">
                        Ather<span className="text-blue-600">Web</span>
                    </Link>
                    <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                        ← Back to Home
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <div className="container-custom py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-6">
                        Choose Your
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Perfect Package</span>
                    </h1>
                    <p className="text-xl text-gray-600">
                        Professional Pakistani web development services with transparent pricing. No hidden fees.
                    </p>
                </motion.div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {services.map((service, idx) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedService(service.id)}
                            className={`cursor-pointer p-8 rounded-2xl border-2 transition-all ${selectedService === service.id
                                    ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                                }`}
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                                <service.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black mb-2">{service.name}</h3>
                            <p className="text-gray-600">{service.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Packages */}
                {selectedService && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <h2 className="text-4xl font-black text-center mb-12">
                            {services.find(s => s.id === selectedService)?.name} Packages
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {services.find(s => s.id === selectedService)?.packages.map((pkg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative p-8 rounded-2xl border-2 ${pkg.popular
                                            ? 'border-blue-600 bg-gradient-to-br from-blue-50 to-white shadow-2xl scale-105'
                                            : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 rounded-full text-sm font-black">
                                            MOST POPULAR
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-black mb-2">{pkg.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                PKR {pkg.price}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-2">Delivery: {pkg.delivery}</p>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {pkg.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <FiCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={`/book-meeting?service=${selectedService}&package=${pkg.name}`}
                                        className={`block w-full py-4 rounded-xl font-black text-center transition-all ${pkg.popular
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="flex items-center justify-center gap-2">
                                            <FiShoppingCart className="w-5 h-5" />
                                            Order Now
                                            <FiArrowRight className="w-5 h-5" />
                                        </span>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-16 px-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl text-white"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                        Not Sure Which Package?
                    </h2>
                    <p className="text-xl mb-8 opacity-90">
                        Book a free consultation and we'll help you choose the perfect solution
                    </p>
                    <Link
                        href="/book-meeting"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-black text-lg hover:scale-105 transition-transform"
                    >
                        Schedule Free Consultation
                        <FiArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
