import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Palette, 
  Figma, 
  Layers, 
  MousePointer,
  Smartphone,
  Sparkles,
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

const UIUXDesign = () => {
  const features = [
    { icon: Figma, title: "Figma Prototypes", desc: "Interactive prototypes for user testing" },
    { icon: Palette, title: "Brand Integration", desc: "Designs that match your brand identity" },
    { icon: Layers, title: "Design Systems", desc: "Scalable component libraries" },
    { icon: MousePointer, title: "User-Centered", desc: "Research-driven design decisions" },
    { icon: Smartphone, title: "Responsive Design", desc: "Perfect on all screen sizes" },
    { icon: Sparkles, title: "Micro-interactions", desc: "Delightful animations and transitions" },
  ];

  const deliverables = [
    "Complete Figma design files",
    "Interactive clickable prototypes",
    "Design system & style guide",
    "Mobile, tablet & desktop layouts",
    "User flow diagrams",
    "Animation specifications",
    "Developer handoff documentation",
    "2 rounds of revisions",
    "Asset export (SVG, PNG)",
  ];

  const process = [
    {
      phase: "Discovery",
      desc: "Understanding your users, goals, and competition",
      duration: "2-3 days",
    },
    {
      phase: "Wireframing",
      desc: "Low-fidelity layouts to establish structure",
      duration: "3-4 days",
    },
    {
      phase: "Visual Design",
      desc: "High-fidelity mockups with brand elements",
      duration: "5-7 days",
    },
    {
      phase: "Prototyping",
      desc: "Interactive prototypes with animations",
      duration: "3-4 days",
    },
    {
      phase: "Testing",
      desc: "User testing and feedback iterations",
      duration: "2-3 days",
    },
    {
      phase: "Handoff",
      desc: "Developer-ready specifications",
      duration: "1-2 days",
    },
  ];

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
            <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
              <Palette className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">UI/UX Design & Animation</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Beautiful designs that <span className="text-primary">users love</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              From wireframes to pixel-perfect interfaces with smooth animations. 
              We create intuitive experiences that delight users and drive conversions.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Start Design Project
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Design Portfolio
              </Button>
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
              Design excellence in <span className="text-primary">every detail</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive design solutions that combine aesthetics with functionality.
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
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

      {/* Process Timeline */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Our <span className="text-primary">design process</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              A structured approach that ensures quality and aligns with your goals.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {process.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover-lift cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-primary">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{phase.phase}</h3>
                        <p className="text-muted-foreground">{phase.desc}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                      {phase.duration}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Deliverables */}
      <section className="py-24">
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
                Complete design package ready for development implementation.
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
                  <div className="text-5xl font-bold text-primary mb-2">PKR 40,000</div>
                  <span className="text-muted-foreground">~USD 143</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Pages</span>
                    <span className="font-semibold">5-10 screens</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Timeline</span>
                    <span className="font-semibold">2-3 weeks</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Revisions</span>
                    <span className="font-semibold">2 rounds</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Format</span>
                    <span className="font-semibold">Figma files</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-4">
                  Start Design Project
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  * Custom pricing for larger projects
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 text-center">
              Why our <span className="text-primary">design services</span>
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "User-Centered Approach",
                  desc: "Every design decision is backed by user research and testing, ensuring your product meets real user needs.",
                },
                {
                  title: "Conversion Focused",
                  desc: "Beautiful designs that also convert. We optimize layouts, CTAs, and flows to maximize your business goals.",
                },
                {
                  title: "Developer-Friendly",
                  desc: "Clean handoff with detailed specifications, making implementation smooth and efficient for developers.",
                },
                {
                  title: "Iterative Process",
                  desc: "Regular feedback loops and revisions ensure the final design perfectly matches your vision.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to create <span className="text-primary">stunning designs</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let's transform your ideas into beautiful, user-friendly interfaces.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Get Free Design Consultation
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                See Design Portfolio
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UIUXDesign;
