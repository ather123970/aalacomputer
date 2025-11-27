'use client';

import { motion } from 'framer-motion';
import { TEAM_MEMBERS } from '@/app/lib/constants';
import Image from 'next/image';

export default function Team() {
    const founder = TEAM_MEMBERS[0];
    const otherMembers = TEAM_MEMBERS.slice(1);

    return (
        <section id="team" className="py-32 bg-gradient-to-b from-white via-blue-50/30 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block px-5 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 font-bold text-sm mb-6 shadow-sm"
                    >
                        👥 Our Team
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-6xl font-black text-gray-900 mb-6"
                    >
                        Meet The <span className="text-gradient-blue">Team</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-600"
                    >
                        Talented experts bringing your digital vision to life.
                    </motion.p>
                </div>

                {/* Founder - Featured at Top Center with Special Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        duration: 0.8
                    }}
                    className="max-w-2xl mx-auto mb-20"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.02, 1],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                        whileHover={{ scale: 1.03 }}
                        className="relative bg-white rounded-3xl p-12 shadow-xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-2xl"
                    >
                        {/* Founder Badge */}
                        <motion.div
                            animate={{
                                y: [0, -5, 0],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut"
                            }}
                            className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-black shadow-lg"
                        >
                            FOUNDER & LEAD DEVELOPER
                        </motion.div>

                        <div className="flex flex-col items-center text-center pl-8">
                            {/* Circular Image - Moved to right with pl-8 */}
                            <div className="relative mb-6 group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl"
                                >
                                    <Image
                                        src="/team/ather.jpg"
                                        alt="Ather"
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        priority
                                    />
                                </motion.div>
                            </div>

                            {/* Name & Role */}
                            <h3 className="text-4xl font-black text-gray-900 mb-2">Ather</h3>
                            <p className="text-xl font-bold text-blue-600 mb-6">Founder & Lead Developer</p>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-6 mb-8 w-full max-w-md">
                                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">50+</div>
                                    <div className="text-sm text-gray-600 font-bold mt-1">Projects</div>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                                    <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">5.0</div>
                                    <div className="text-sm text-gray-600 font-bold mt-1">Rating</div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-3 justify-center">
                                {founder.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 text-blue-700 text-sm rounded-xl font-black hover:scale-105 transition-transform"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Other Team Members - Names & Skills Only */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {otherMembers.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all shadow-lg hover:shadow-xl"
                        >
                            {/* Name & Role */}
                            <div className="text-center mb-4 pb-4 border-b-2 border-gray-100">
                                <h4 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {member.name}
                                </h4>
                                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">
                                    {member.role}
                                </p>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-2 justify-center">
                                {member.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 text-xs rounded-lg font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
