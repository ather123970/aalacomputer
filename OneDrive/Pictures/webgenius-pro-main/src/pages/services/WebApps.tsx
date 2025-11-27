import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Globe, 
  Code, 
  Database, 
  Zap, 
  Shield, 
  Cloud,
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

const WebApps = () => {
  const features = [
    { icon: Code, title: "Custom Development", desc: "Tailored solutions built with modern frameworks" },
    { icon: Database, title: "Database Design", desc: "Scalable database architecture" },
    { icon: Zap, title: "Performance Optimized", desc: "Lightning-fast load times" },
    { icon: Shield, title: "Security First", desc: "Enterprise-grade security measures" },
    { icon: Cloud, title: "Cloud Deployment", desc: "Reliable hosting on leading platforms" },
    { icon: Globe, title: "API Integration", desc: "Seamless third-party integrations" },
  ];

  const deliverables = [
    "Complete source code with documentation",
    "Responsive design for all devices",
    "Admin dashboard with analytics",
    "User authentication & authorization",
    "Database setup & API endpoints",
    "30-day post-launch support",
    "Performance optimization",
    "SEO-friendly architecture",
  ];

  const techStack = ["React", "Node.js", "PostgreSQL", "TypeScript", "Tailwind CSS", "AWS/Vercel"];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 gradient-dark-overlay opacity-[0.02]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Web Apps & SaaS Development</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Build powerful web applications that <span className="text-primary">scale</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              From MVPs to enterprise solutions, we craft custom web applications with modern tech stacks. 
              Scalable, secure, and designed for growth.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Start Your Project
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Portfolio
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              {techStack.map((tech) => (
                <div key={tech} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Why choose our <span className="text-primary">web app development</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              We combine technical excellence with business understanding to deliver solutions that drive results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover-lift cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.desc}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing & Deliverables */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                What you'll <span className="text-primary">receive</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                A complete, production-ready web application with all the essentials included.
              </p>
              
              <div className="space-y-3">
                {deliverables.map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8 h-full">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">Starting from</span>
                  <div className="text-5xl font-bold text-primary mb-2">PKR 80,000</div>
                  <span className="text-muted-foreground">~USD 285</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Timeline</span>
                    <span className="font-semibold">2-4 weeks</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="font-semibold">50% upfront</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Revisions</span>
                    <span className="font-semibold">2 rounds included</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Support</span>
                    <span className="font-semibold">30 days free</span>
                  </div>
                </div>

                <Button size="lg" className="w-full">
                  Get Started
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Our <span className="text-primary">development process</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              A transparent, collaborative approach from concept to launch.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {[
              { step: "01", title: "Discovery & Planning", desc: "Understanding your requirements and defining project scope" },
              { step: "02", title: "Design & Prototyping", desc: "Creating wireframes and interactive prototypes" },
              { step: "03", title: "Development", desc: "Building your application with clean, maintainable code" },
              { step: "04", title: "Testing & QA", desc: "Rigorous testing across devices and browsers" },
              { step: "05", title: "Deployment", desc: "Launching your app on production servers" },
              { step: "06", title: "Support & Maintenance", desc: "Ongoing updates and technical support" },
            ].map((phase, index) => (
              <motion.div
                key={phase.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start space-x-6 mb-8"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{phase.step}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
                  <p className="text-muted-foreground">{phase.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to build your <span className="text-primary">web application</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let's discuss your project and create a custom solution that meets your needs.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Schedule Free Consultation
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Case Studies
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WebApps;
