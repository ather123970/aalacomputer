import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Wrench, 
  MessageSquare, 
  Shield, 
  Zap,
  Clock,
  HeartHandshake,
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

const Maintenance = () => {
  const features = [
    { icon: MessageSquare, title: "Unlimited Chat Support", desc: "Direct WhatsApp & email access to our team" },
    { icon: Wrench, title: "Monthly Small Edits", desc: "Content updates, minor fixes included" },
    { icon: Shield, title: "Security Monitoring", desc: "Regular security checks and updates" },
    { icon: Zap, title: "Performance Optimization", desc: "Speed improvements and monitoring" },
    { icon: Clock, title: "Priority Response", desc: "24-48 hour response time guaranteed" },
    { icon: HeartHandshake, title: "Dedicated Team", desc: "Direct access to developers who built your site" },
  ];

  const included = [
    "Unlimited WhatsApp/email support",
    "Up to 5 hours/month small edits",
    "Content updates (text, images)",
    "Bug fixes and minor tweaks",
    "Security updates",
    "Performance monitoring",
    "Backup management",
    "Uptime monitoring",
    "Monthly reports",
    "Priority support queue",
  ];

  const notIncluded = [
    "New features or pages (quoted separately)",
    "Major design overhauls",
    "Third-party plugin purchases",
    "Domain/hosting renewals",
  ];

  const plans = [
    {
      name: "Basic Support",
      price: "40,000",
      usd: "143",
      hours: "3 hours/month",
      response: "48 hours",
      features: [
        "Email support",
        "3 hours monthly edits",
        "Basic security checks",
        "Monthly reports",
      ],
    },
    {
      name: "Premium Support",
      price: "70,000",
      usd: "249",
      hours: "5 hours/month",
      response: "24 hours",
      features: [
        "WhatsApp + Email support",
        "5 hours monthly edits",
        "Full security monitoring",
        "Performance optimization",
        "Priority queue",
      ],
      popular: true,
    },
    {
      name: "Enterprise Support",
      price: "120,000+",
      usd: "428+",
      hours: "10+ hours/month",
      response: "12 hours",
      features: [
        "24/7 dedicated support",
        "10+ hours monthly edits",
        "Advanced monitoring",
        "SLA guarantees",
        "Dedicated manager",
      ],
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
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <Wrench className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Maintenance & Support</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Unlimited support that <span className="text-primary">keeps you running</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Direct access to our team via WhatsApp & email. Monthly small edits, priority fixes, 
              and ongoing improvements. Your website, always in top shape.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Get Support Plan
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Compare Plans
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
              Support that <span className="text-primary">actually helps</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No ticket queues, no outsourced support. Direct access to real developers.
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-zinc-500 flex items-center justify-center mb-4">
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

      {/* Pricing Plans */}
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
              Choose your <span className="text-primary">support plan</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Flexible monthly retainers to match your needs and budget.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`p-8 h-full relative ${plan.popular ? "ring-2 ring-primary shadow-lg" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-primary">PKR {plan.price}</div>
                    <div className="text-sm text-muted-foreground">~USD {plan.usd}/month</div>
                  </div>

                  <div className="space-y-2 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Edits</span>
                      <span className="font-semibold">{plan.hours}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Response</span>
                      <span className="font-semibold">{plan.response}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Select Plan
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 text-sm text-muted-foreground">
            All plans require a 3-month minimum commitment
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-primary">✓</span> What's included
              </h2>
              
              <div className="space-y-3">
                {included.map((item) => (
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
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-muted-foreground">✗</span> Not included
              </h2>
              
              <div className="space-y-3">
                {notIncluded.map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <div className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground">✗</div>
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Larger projects outside the monthly 
                  hours are quoted separately at discounted rates for existing support clients.
                </p>
              </div>
            </motion.div>
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
              Keep your site <span className="text-primary">running smoothly</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Focus on your business while we handle the technical details.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Start Support Plan
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Maintenance;
