'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiCalendar, FiUser, FiMail, FiPhone, FiMessageSquare, FiArrowRight, FiCheck, FiBriefcase } from 'react-icons/fi';
import emailjs from '@emailjs/browser';

export default function BookMeetingPage() {
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        service: searchParams.get('service') || '',
        package: searchParams.get('package') || '',
        message: '',
        preferredDate: '',
        preferredTime: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Send email via EmailJS (same credentials as OrderForm)
            const result = await emailjs.send(
                'service_bopwq39', // Your Service ID
                'template_1ubs0z8', // Your Template ID
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    phone: formData.phone,
                    company: formData.company || 'Not provided',
                    service: formData.service || 'Not specified',
                    budget: formData.package || 'Not specified',
                    description: formData.message || 'No additional message',
                    deadline: `${formData.preferredDate || 'Flexible'} at ${formData.preferredTime || 'Flexible time'}`,
                    order_date: new Date().toLocaleString(),
                    meeting_type: 'Consultation Meeting Request'
                },
                'NP2Sat5tqcJqQqoQ2' // Your Public Key
            );

            console.log('Meeting request sent via email:', result.text);
            setIsSubmitting(false);
            setIsSuccess(true);

            // Optionally redirect to home after 3 seconds
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);

        } catch (error) {
            console.error('Failed to send meeting request:', error);
            setIsSubmitting(false);
            alert('Failed to send meeting request. Please try again or contact us directly via WhatsApp.');
        }
    };

    const services = [
        'Shopify Store',
        'Web Application',
        'UI/UX Design',
        'SEO Services',
        'AI Solutions',
        'Support & Maintenance',
        'Other'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

            <div className="container-custom py-20">
                {isSuccess ? (
                    // Success Message
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto text-center"
                    >
                        <div className="bg-white rounded-3xl shadow-2xl border-2 border-green-200 p-16">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiCheck className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-4">Meeting Request Sent! 🎉</h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Thank you for reaching out! We've received your consultation request and will contact you via email within 24 hours to confirm your meeting time.
                            </p>
                            <p className="text-sm text-gray-500">Redirecting to home...</p>
                        </div>
                    </motion.div>
                ) : (
                    // Booking Form
                    <div className="max-w-4xl mx-auto">
                        {/* Hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center mb-12"
                        >
                            <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
                                <FiCalendar className="inline w-4 h-4 mr-2" />
                                Schedule Your Free Consultation
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black mb-6">
                                Let's Discuss Your
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Project</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Book a free 30-minute consultation call. We'll discuss your needs and show you exactly how we can help.
                            </p>
                        </motion.div>

                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="p-8 md:p-12">
                                <div className="space-y-6">
                                    {/* Personal Info */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <FiUser className="w-4 h-4" />
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                placeholder="Muhammad Ather"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <FiMail className="w-4 h-4" />
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                placeholder="your@email.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <FiPhone className="w-4 h-4" />
                                                WhatsApp Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                placeholder="+92 300 1234567"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <FiBriefcase className="w-4 h-4" />
                                                Company/Business
                                            </label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>

                                    {/* Service Selection */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">
                                                Service Interested In
                                            </label>
                                            <select
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                            >
                                                <option value="">Select a service</option>
                                                {services.map(service => (
                                                    <option key={service} value={service}>{service}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">
                                                Package (if known)
                                            </label>
                                            <input
                                                type="text"
                                                name="package"
                                                value={formData.package}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>

                                    {/* Meeting Time */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <FiCalendar className="w-4 h-4" />
                                                Preferred Date
                                            </label>
                                            <input
                                                type="date"
                                                name="preferredDate"
                                                value={formData.preferredDate}
                                                onChange={handleChange}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">
                                                Preferred Time
                                            </label>
                                            <select
                                                name="preferredTime"
                                                value={formData.preferredTime}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                            >
                                                <option value="">Select time</option>
                                                <option value="morning">Morning (9am - 12pm)</option>
                                                <option value="afternoon">Afternoon (12pm - 5pm)</option>
                                                <option value="evening">Evening (5pm - 8pm)</option>
                                                <option value="flexible">Flexible</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                            <FiMessageSquare className="w-4 h-4" />
                                            Tell us about your project
                                        </label>
                                        <textarea
                                            name="message"
                                            rows={5}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none font-medium"
                                            placeholder="Briefly describe what you need help with..."
                                        />
                                    </div>

                                    {/* Info Box */}
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                                        <div className="flex items-start gap-3">
                                            <FiCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm text-blue-900">
                                                <div className="font-black mb-1">What happens next?</div>
                                                <div className="font-medium">
                                                    After submitting, we'll contact you on WhatsApp within 24 hours to confirm the meeting time and send you a calendar invite.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            'Submitting...'
                                        ) : (
                                            <>
                                                Schedule Free Consultation
                                                <FiArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>

                        {/* Benefits */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-12 grid md:grid-cols-3 gap-6 text-center"
                        >
                            <div className="p-6 bg-white rounded-2xl border border-gray-200">
                                <div className="text-4xl mb-2">⚡</div>
                                <div className="font-black text-gray-900 mb-1">Quick Response</div>
                                <div className="text-sm text-gray-600">Reply within 24 hours</div>
                            </div>
                            <div className="p-6 bg-white rounded-2xl border border-gray-200">
                                <div className="text-4xl mb-2">💯</div>
                                <div className="font-black text-gray-900 mb-1">No Commitment</div>
                                <div className="text-sm text-gray-600">Free consultation, no strings attached</div>
                            </div>
                            <div className="p-6 bg-white rounded-2xl border border-gray-200">
                                <div className="text-4xl mb-2">🎯</div>
                                <div className="font-black text-gray-900 mb-1">Expert Advice</div>
                                <div className="text-sm text-gray-600">Get actionable insights</div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
