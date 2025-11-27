import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-workspace.jpg";

const Hero = () => {
  const stats = [
    { label: "Projects Delivered", value: "50+" },
    { label: "Team Members", value: "5-12" },
    { label: "Client Satisfaction", value: "100%" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-dark-overlay opacity-[0.02]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium text-accent">Trusted by 50+ businesses</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              We Build Stores{" "}
              <span className="text-primary">That Customers Trust</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground leading-relaxed">
              Launch a store that sells even when you’re offline — optimized design, fast tech, and AI-driven conversions
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-4">
              {["Web Apps", "Shopify Stores", "UI/UX Design", "SEO & AI"].map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{service}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="group">
                Book Free Audit
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Portfolio
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Animated Service Icons Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[600px] hidden lg:block"
          >
            {/* Background gradient orbs */}
            <div className="absolute inset-0">
              <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Featured Projects Showcase - Horizontal Layout */}
            <div className="relative h-full flex items-center justify-center">
              <div className="flex gap-6 max-w-4xl overflow-hidden">
                {/* Project 1 - Management Platform */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="relative group cursor-pointer flex-shrink-0"
                >
                  <div className="relative w-72 h-[480px] rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-500">
                    <img
                      src="/src/assets/project-1.jpg"
                      alt="Management Talent Platform"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">Management Platform</h3>
                        <p className="text-sm text-gray-200">Modern UI/UX Design</p>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                      Featured
                    </div>
                  </div>
                </motion.div>

                {/* Project 2 - UI Kit */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="relative group cursor-pointer flex-shrink-0"
                >
                  <div className="relative w-72 h-[480px] rounded-2xl overflow-hidden border-2 border-purple-500/20 shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-500">
                    <img
                      src="/src/assets/project-2.jpg"
                      alt="UI Kit Design System"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">UI Kit System</h3>
                        <p className="text-sm text-gray-200">Complete Design System</p>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-purple-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                      New
                    </div>
                  </div>
                </motion.div>

                {/* Project 3 - Agency Website */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="relative group cursor-pointer flex-shrink-0"
                >
                  <div className="relative w-72 h-[480px] rounded-2xl overflow-hidden border-2 border-orange-500/20 shadow-2xl hover:shadow-orange-500/40 hover:scale-105 transition-all duration-500">
                    <img
                      src="/src/assets/project-3.jpg"
                      alt="Agency Website Design"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">Agency Website</h3>
                        <p className="text-sm text-gray-200">Premium Web Design</p>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white">
                      Popular
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Developer Profile */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="absolute -bottom-4 -right-8 group cursor-pointer"
            >
              <div className="relative">
                {/* Animated ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-blue-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity" />

                {/* Blue border container */}
                <div className="relative w-64 h-64 rounded-full border-[3px] border-blue-500 p-2 bg-background/95 backdrop-blur-sm hover:border-primary transition-all duration-300 hover:scale-105 shadow-2xl">
                  <img
                    src="/src/assets/developer-profile.png"
                    alt="Professional Developer"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                {/* Floating tech icons around profile */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  {/* React Icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 backdrop-blur-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#61DAFB">
                      <circle cx="12" cy="12" r="2" />
                      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1" />
                      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(60 12 12)" />
                      <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(120 12 12)" />
                    </svg>
                  </div>

                  {/* Shopify Icon */}
                  <div className="absolute top-1/4 right-0 translate-x-2 w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20 backdrop-blur-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#96bf48">
                      <path d="M16.09 4.54c-.05-.08-.11-.15-.19-.2-.08-.05-.17-.08-.27-.08h-4.8c-.1 0-.19.03-.27.08-.08.05-.14.12-.19.2l-2.4 4.82c-.05.1-.08.2-.08.31v7.23c0 .24.19.43.43.43h9.86c.24 0 .43-.19.43-.43V9.67c0-.11-.03-.21-.08-.31l-2.44-4.82zM14.4 13.5h-1.35v1.35h-.9V13.5h-1.35v-.9h1.35v-1.35h.9v1.35h1.35v.9z" />
                    </svg>
                  </div>

                  {/* Code Icon */}
                  <div className="absolute bottom-1/4 right-0 translate-x-2 w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20 backdrop-blur-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>

                  {/* AI Icon */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center border border-orange-500/20 backdrop-blur-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
                    </svg>
                  </div>

                  {/* Design Icon */}
                  <div className="absolute top-1/4 left-0 -translate-x-2 w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center border border-pink-500/20 backdrop-blur-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
