import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  Bot, 
  MessageSquare, 
  Brain, 
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

const AIAssistant = () => {
  const features = [
    { icon: Brain, title: "Trained on Your Business", desc: "Custom AI trained on your products and FAQs" },
    { icon: MessageSquare, title: "24/7 Availability", desc: "Instant responses anytime, anywhere" },
    { icon: Zap, title: "Lightning Fast", desc: "Answers in seconds, not hours" },
    { icon: TrendingUp, title: "Conversion Focused", desc: "Guides visitors toward purchase" },
    { icon: Clock, title: "Reduces Support Load", desc: "Handles common questions automatically" },
    { icon: Bot, title: "Easy Integration", desc: "Simple embed on any website" },
  ];

  const benefits = [
    "Reduce customer support tickets by 60%",
    "Improve response time to seconds",
    "Capture leads even when you're offline",
    "Provide instant product recommendations",
    "Answer FAQs automatically",
    "Multilingual support capabilities",
    "Seamless handoff to human agents",
    "Analytics & conversation insights",
  ];

  const useCases = [
    {
      title: "E-commerce Stores",
      desc: "Product recommendations, order tracking, and shopping assistance",
      icon: "🛍️",
    },
    {
      title: "Service Businesses",
      desc: "Appointment booking, service info, and pricing inquiries",
      icon: "💼",
    },
    {
      title: "SaaS Products",
      desc: "Feature explanations, onboarding help, and technical support",
      icon: "💻",
    },
    {
      title: "Educational Sites",
      desc: "Course information, enrollment help, and student queries",
      icon: "📚",
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
              <Bot className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">AI Chat Assistant</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              AI assistant that <span className="text-primary">converts visitors</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Custom-trained AI chat assistant for your website. Answers questions instantly, 
              captures leads, and improves customer support 24/7.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Add AI to Your Site
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                See Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">60%</div>
                <div className="text-sm text-muted-foreground">Fewer support tickets</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Always available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">&lt;2s</div>
                <div className="text-sm text-muted-foreground">Response time</div>
              </div>
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
              Why add an <span className="text-primary">AI assistant</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Transform your website into a 24/7 sales and support powerhouse.
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4">
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

      {/* Use Cases */}
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
              Perfect for <span className="text-primary">any business</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Versatile AI assistant that adapts to your industry and needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover-lift cursor-pointer">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing & Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                What you <span className="text-primary">get</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Everything you need to deploy an intelligent AI assistant on your site.
              </p>
              
              <div className="space-y-3">
                {benefits.map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Setup included:</strong> We train your AI on your 
                  business data, products, FAQs, and brand voice.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="p-8">
                <div className="mb-6">
                  <span className="text-sm text-muted-foreground">One-time setup</span>
                  <div className="text-5xl font-bold text-primary mb-2">PKR 20,000</div>
                  <span className="text-muted-foreground">~USD 71</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Setup time</span>
                    <span className="font-semibold">3-5 days</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Training data</span>
                    <span className="font-semibold">Your content</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Integration</span>
                    <span className="font-semibold">Simple embed code</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Updates</span>
                    <span className="font-semibold">Monthly included</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-4">
                  Add AI Assistant
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Advanced features available: <strong className="text-foreground">Custom pricing</strong>
                  </p>
                </div>
              </Card>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                * Hosting and AI usage costs may apply based on traffic
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
              Ready to add <span className="text-primary">AI to your site</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Transform your customer experience with intelligent, 24/7 AI assistance.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Get Started Now
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Try Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIAssistant;
