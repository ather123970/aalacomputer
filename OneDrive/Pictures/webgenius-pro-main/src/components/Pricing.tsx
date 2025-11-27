import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const Pricing = () => {
  const [currency, setCurrency] = useState<"PKR" | "USD">("PKR");

  const packages = [
    {
      name: "Starter",
      description: "Perfect for small businesses launching their first digital presence",
      pricePKR: "50,000",
      priceUSD: "178",
      features: [
        "5-page responsive website",
        "Mobile-first design",
        "Basic SEO setup",
        "Contact form integration",
        "1 month support",
        "Google Analytics setup",
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Growth",
      description: "For growing businesses ready to scale with e-commerce",
      pricePKR: "120,000",
      priceUSD: "428",
      features: [
        "Custom Shopify store",
        "10+ product listings",
        "Payment gateway integration",
        "Inventory management",
        "Email marketing setup",
        "3 months priority support",
        "SEO optimization",
        "Analytics & reporting",
      ],
      gradient: "from-purple-500 to-pink-500",
      popular: true,
    },
    {
      name: "Premium",
      description: "Full-stack solution with AI features and unlimited support",
      pricePKR: "250,000",
      priceUSD: "892",
      features: [
        "Everything in Growth",
        "Custom web application",
        "AI chatbot integration",
        "Advanced animations",
        "Custom admin dashboard",
        "API integrations",
        "Unlimited chat support",
        "6 months dedicated support",
        "Training & documentation",
      ],
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const convertPrice = (pkr: string, usd: string) => {
    return currency === "PKR" ? `PKR ${pkr}` : `$${usd}`;
  };

  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Transparent <span className="text-primary">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Choose a package that fits your needs. All prices are starting estimates.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex items-center bg-background border rounded-full p-1">
            <button
              onClick={() => setCurrency("PKR")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                currency === "PKR"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PKR (Pakistan)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                currency === "USD"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              USD (International)
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`p-8 h-full flex flex-col relative overflow-hidden hover-lift ${
                  pkg.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Package Header */}
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${pkg.gradient} flex items-center justify-center mb-4`}>
                    <span className="text-2xl font-bold text-white">
                      {pkg.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-primary mb-1">
                    {convertPrice(pkg.pricePKR, pkg.priceUSD)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currency === "PKR" ? `~$${pkg.priceUSD} USD` : `~PKR ${pkg.pricePKR}`}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
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

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            Custom quotes available for enterprise projects. Contact us for detailed pricing.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
