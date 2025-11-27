import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  ShoppingBag, 
  Palette, 
  TrendingUp, 
  Smartphone,
  CreditCard,
  Package,
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

const Shopify = () => {
  const features = [
    { icon: Palette, title: "Custom Theme Design", desc: "Beautiful, on-brand Shopify themes" },
    { icon: Smartphone, title: "Mobile Optimized", desc: "Perfect experience on all devices" },
    { icon: CreditCard, title: "Payment Integration", desc: "Multiple payment gateways setup" },
    { icon: Package, title: "Inventory Management", desc: "Product & stock management" },
    { icon: TrendingUp, title: "Conversion Optimization", desc: "Designed to maximize sales" },
    { icon: ShoppingBag, title: "Checkout Enhancement", desc: "Streamlined checkout flow" },
  ];

  const deliverables = [
    "Custom Shopify theme design",
    "Product catalog setup",
    "Payment gateway integration",
    "Shipping & tax configuration",
    "Mobile-responsive design",
    "SEO optimization",
    "Analytics & tracking setup",
    "Admin training session",
    "30-day support included",
  ];

  const packages = [
    {
      name: "Starter Store",
      price: "35,000",
      usd: "125",
      features: [
        "Pre-built theme customization",
        "Up to 50 products",
        "Basic payment setup",
        "Mobile responsive",
        "1 week delivery",
      ],
    },
    {
      name: "Professional Store",
      price: "65,000",
      usd: "232",
      features: [
        "Custom theme design",
        "Up to 200 products",
        "Advanced integrations",
        "Custom features",
        "2-3 weeks delivery",
      ],
      popular: true,
    },
    {
      name: "Enterprise Store",
      price: "120,000+",
      usd: "428+",
      features: [
        "Fully custom theme",
        "Unlimited products",
        "Headless commerce option",
        "Advanced features",
        "4-6 weeks delivery",
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
            <div className="inline-flex items-center space-x-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
              <ShoppingBag className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Shopify E-Commerce Development</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Launch your Shopify store that <span className="text-primary">converts</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              From custom theme design to full e-commerce optimization. We build Shopify stores 
              that deliver exceptional shopping experiences and drive sales.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Start Your Store
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Store Examples
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
              Everything you need for <span className="text-primary">online success</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Complete Shopify solutions designed to help your business thrive online.
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
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

      {/* Pricing Packages */}
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
              Choose your <span className="text-primary">package</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Flexible pricing to match your business needs and budget.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`p-8 h-full relative ${pkg.popular ? "ring-2 ring-primary shadow-lg" : ""}`}>
                  {pkg.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-primary">PKR {pkg.price}</div>
                    <div className="text-sm text-muted-foreground">~USD {pkg.usd}</div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                What's <span className="text-primary">included</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every Shopify store comes with these essential features and services.
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
              className="relative"
            >
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5">
                <h3 className="text-2xl font-bold mb-4">Why Shopify?</h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span>Trusted by 4 million+ businesses worldwide</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span>99.99% uptime with enterprise-level hosting</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span>Built-in payment processing and security</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    </div>
                    <span>Easy to manage with no technical knowledge</span>
                  </li>
                </ul>
              </Card>
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
              Ready to launch your <span className="text-primary">online store</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let's create a beautiful Shopify store that turns visitors into customers.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Get Free Store Audit
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                See Our Stores
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shopify;
