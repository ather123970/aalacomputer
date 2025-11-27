'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiSend, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import emailjs from '@emailjs/browser';

export default function OrderForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', company: '', phone: '', serviceType: '', budget: '', description: '', deadline: '', files: null as FileList | null
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Send email using EmailJS
            const result = await emailjs.send(
                'service_bopwq39', // Your Service ID
                'template_1ubs0z8', // Your Template ID
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    phone: formData.phone || 'Not provided',
                    company: formData.company || 'Not provided',
                    service: formData.serviceType,
                    budget: formData.budget,
                    description: formData.description,
                    deadline: formData.deadline || 'Not specified',
                    order_date: new Date().toLocaleString()
                },
                'NP2Sat5tqcJqQqoQ2' // Your Public Key
            );

            console.log('Email sent successfully:', result.text);
            setIsSubmitting(false);
            setIsSuccess(true);

            // Reset form after 5 seconds
            setTimeout(() => {
                setIsSuccess(false);
                setStep(1);
                setFormData({ name: '', email: '', company: '', phone: '', serviceType: '', budget: '', description: '', deadline: '', files: null });
            }, 5000);
        } catch (error) {
            console.error('Failed to send email:', error);
            setIsSubmitting(false);
            alert('Failed to send order. Please try again or contact us directly.');
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <section id="order" className="py-32 bg-gradient-to-br from-blue-50 to-purple-50 relative">
            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mb-6">
                        Start Project
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Launch Your Vision</h2>
                    <p className="text-xl text-gray-600">Tell us about your project. We'll make it amazing.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden">
                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-100 w-full">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(step / 3) * 100}%` }}
                        />
                    </div>

                    <div className="p-10 md:p-12">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16"
                            >
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FiCheckCircle className="w-12 h-12 text-green-600" />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-3">Request Received!</h3>
                                <p className="text-lg text-gray-600">We'll review your details and get back to you within 24 hours.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                {/* Step 1 */}
                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-900 mb-8">Contact Details</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Full Name *</label>
                                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                    placeholder="John Doe" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Email *</label>
                                                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                    placeholder="john@example.com" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Phone</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                    placeholder="+92 300 1234567" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Company</label>
                                                <input type="text" name="company" value={formData.company} onChange={handleChange}
                                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                                    placeholder="Acme Inc." />
                                            </div>
                                        </div>
                                        <div className="flex justify-end pt-6">
                                            <button type="button" onClick={nextStep}
                                                className="px-10 py-4 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2">
                                                Next <FiArrowRight />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2 */}
                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-900 mb-8">Project Details</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Service *</label>
                                                <select name="serviceType" value={formData.serviceType} onChange={handleChange}
                                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                                                    <option value="">Select Service</option>
                                                    <option value="web-app">Custom Web App</option>
                                                    <option value="shopify">Shopify Store</option>
                                                    <option value="seo">SEO & Growth</option>
                                                    <option value="design">UI/UX Design</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-gray-700">Budget (PKR) *</label>
                                                <select name="budget" value={formData.budget} onChange={handleChange}
                                                    className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium">
                                                    <option value="">Select Budget</option>
                                                    <option value="30k-70k">30k - 70k</option>
                                                    <option value="70k-150k">70k - 150k</option>
                                                    <option value="150k-300k">150k - 300k</option>
                                                    <option value="300k+">300k+</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Description *</label>
                                            <textarea name="description" rows={4} value={formData.description} onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none font-medium"
                                                placeholder="Tell us about your project..." />
                                        </div>
                                        <div className="flex justify-between pt-6">
                                            <button type="button" onClick={prevStep}
                                                className="px-8 py-4 text-gray-600 font-black hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                                                Back
                                            </button>
                                            <button type="button" onClick={nextStep}
                                                className="px-10 py-4 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg flex items-center gap-2">
                                                Next <FiArrowRight />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3 */}
                                {step === 3 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-900 mb-8">Final Details</h3>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Deadline</label>
                                            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange}
                                                className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium" />
                                        </div>

                                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:border-blue-500 transition-all cursor-pointer group">
                                            <FiUpload className="w-10 h-10 text-gray-400 group-hover:text-blue-600 mx-auto mb-4 transition-colors" />
                                            <p className="text-sm text-gray-600 font-bold">
                                                <span className="text-blue-600">Click to upload</span> or drag files
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">PDF, DOC, JPG (Max 10MB)</p>
                                        </div>

                                        <div className="flex justify-between pt-6">
                                            <button type="button" onClick={prevStep}
                                                className="px-8 py-4 text-gray-600 font-black hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                                                Back
                                            </button>
                                            <button type="submit" disabled={isSubmitting}
                                                className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-xl flex items-center gap-2 disabled:opacity-70">
                                                {isSubmitting ? 'Sending...' : 'Submit'}
                                                {!isSubmitting && <FiSend />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
