import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const Contact = () => {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone / WhatsApp",
      detail: "+92 343 4153736",
      action: "Call or message us",
      href: "https://wa.me/923434153736",
    },
    {
      icon: Mail,
      title: "Email",
      detail: "muhammadather212437@gmail.com",
      action: "Send us an email",
      href: "mailto:muhammadather212437@gmail.com",
    },
    {
      icon: MapPin,
      title: "Location",
      detail: "Islamabad, Pakistan",
      action: "Visit our office",
      href: "#",
    },
  ];

  return (
    <section id="contact" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Let's build something <span className="text-primary">amazing</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a free 15-minute consultation to discuss your project. We'll analyze your needs and provide a detailed proposal.
            </p>

            {/* Contact Methods */}
            <div className="space-y-4 mb-8">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <motion.a
                    key={method.title}
                    href={method.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover-lift cursor-pointer group">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold mb-1">{method.title}</h3>
                          <p className="text-sm text-muted-foreground">{method.detail}</p>
                        </div>
                        <span className="text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {method.action} →
                        </span>
                      </div>
                    </Card>
                  </motion.a>
                );
              })}
            </div>

            {/* WhatsApp CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-500 border-none text-white">
                <div className="flex items-center space-x-4">
                  <MessageCircle className="w-12 h-12" />
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg mb-1">Quick Response on WhatsApp</h3>
                    <p className="text-sm text-white/90">Get instant replies to your queries</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-4 bg-white text-green-600 hover:bg-white/90"
                  asChild
                >
                  <a href="https://wa.me/923434153736">
                    Chat on WhatsApp
                  </a>
                </Button>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company</label>
                    <Input placeholder="Company name (optional)" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input type="email" placeholder="your.email@example.com" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input type="tel" placeholder="+92 3XX XXXXXXX" />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Service Interest</label>
                  <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
                    <option>Web App Development</option>
                    <option>Shopify Store</option>
                    <option>UI/UX Design</option>
                    <option>SEO Services</option>
                    <option>AI Integration</option>
                    <option>Maintenance & Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Project Details</label>
                  <Textarea
                    placeholder="Tell us about your project, timeline, and budget..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Book Free Audit
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  We'll respond within 24 hours with a detailed proposal
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
