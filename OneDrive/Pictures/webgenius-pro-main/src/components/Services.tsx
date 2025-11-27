import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Globe, 
  ShoppingBag, 
  Palette, 
  TrendingUp, 
  Bot, 
  Wrench 
} from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Globe,
      title: "Web Apps & SaaS",
      description: "Custom web applications built with modern frameworks. Scalable, secure, and user-friendly.",
      price: "From PKR 80,000",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: ShoppingBag,
      title: "Shopify Stores",
      description: "Complete e-commerce solutions with custom themes, checkout optimization, and inventory management.",
      price: "From PKR 35,000",
      gradient: "from-green-500 to-emerald-500",
      featured: true,
    },
    {
      icon: Palette,
      title: "UI/UX Design",
      description: "Beautiful, intuitive designs that convert. From wireframes to interactive prototypes with smooth animations.",
      price: "From PKR 40,000",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: TrendingUp,
      title: "SEO Optimization",
      description: "Data-driven SEO that drives paying customers, not vanity traffic. Monthly retainer available.",
      price: "PKR 30,000/month",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "On-site AI chat assistant trained on your business. Improve customer support and conversions.",
      price: "From PKR 20,000",
      gradient: "from-indigo-500 to-violet-500",
    },
    {
      icon: Wrench,
      title: "Maintenance & Support",
      description: "Unlimited chat support with monthly small edits, priority fixes, and ongoing improvements.",
      price: "PKR 70,000/month",
      gradient: "from-slate-500 to-zinc-500",
    },
  ];

  return (
    <section id="services" className="py-24 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Services that <span className="text-primary">scale your business</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From concept to launch, we handle everything. Choose individual services or complete packages.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`p-6 h-full hover-lift cursor-pointer relative overflow-hidden ${
                    service.featured ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {service.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Icon with gradient background */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Price */}
                  <div className="mt-auto pt-4 border-t">
                    <span className="text-lg font-bold text-primary">{service.price}</span>
                    <span className="text-xs text-muted-foreground ml-2">(~USD available)</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>All prices include consultation, strategy, and post-launch support</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
