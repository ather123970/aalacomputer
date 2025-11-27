import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { 
  TrendingUp, 
  Search, 
  BarChart3, 
  Target,
  FileText,
  Link2,
  CheckCircle2,
  ArrowRight 
} from "lucide-react";

const SEO = () => {
  const features = [
    { icon: Search, title: "Keyword Research", desc: "Data-driven keyword targeting strategy" },
    { icon: FileText, title: "On-Page SEO", desc: "Content optimization and meta tags" },
    { icon: Link2, title: "Link Building", desc: "Quality backlinks from authority sites" },
    { icon: BarChart3, title: "Analytics & Reporting", desc: "Monthly performance reports" },
    { icon: Target, title: "Local SEO", desc: "Google Business Profile optimization" },
    { icon: TrendingUp, title: "Conversion Focus", desc: "Traffic that drives revenue" },
  ];

  const deliverables = [
    "Comprehensive SEO audit",
    "Keyword research & strategy",
    "On-page optimization",
    "Technical SEO fixes",
    "Content recommendations",
    "Link building campaign",
    "Monthly performance reports",
    "Google Analytics setup",
    "Search Console monitoring",
    "Competitor analysis",
  ];

  const results = [
    { metric: "Organic Traffic", value: "+150%", period: "in 6 months" },
    { metric: "Keywords Ranked", value: "50+", period: "in top 10" },
    { metric: "Conversion Rate", value: "+85%", period: "from organic" },
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
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">SEO Optimization Services</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              SEO that drives <span className="text-primary">paying customers</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Not vanity traffic. We focus on keywords that convert, content that ranks, 
              and strategies that deliver real business results.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Get Free SEO Audit
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                View Case Studies
              </Button>
            </div>

            {/* Results Preview */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              {results.map((result) => (
                <div key={result.metric} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">{result.value}</div>
                  <div className="text-sm font-medium mb-1">{result.metric}</div>
                  <div className="text-xs text-muted-foreground">{result.period}</div>
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
              Complete <span className="text-primary">SEO solutions</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to rank higher and attract your ideal customers.
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
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

      {/* Pricing */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Monthly <span className="text-primary">SEO retainer</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Ongoing optimization to maintain and improve your search rankings.
              </p>
              
              <div className="space-y-3">
                {deliverables.map((item) => (
                  <div key={item} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> SEO is a long-term investment. 
                  Most clients see significant results within 3-6 months, with continued growth over time.
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
                  <span className="text-sm text-muted-foreground">Monthly retainer</span>
                  <div className="text-5xl font-bold text-primary mb-2">PKR 30,000</div>
                  <span className="text-muted-foreground">~USD 107/month</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Contract</span>
                    <span className="font-semibold">6 months minimum</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Setup fee</span>
                    <span className="font-semibold">PKR 20,000 (one-time)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Reports</span>
                    <span className="font-semibold">Monthly</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Support</span>
                    <span className="font-semibold">Email & WhatsApp</span>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-4">
                  Start SEO Campaign
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    One-time SEO audit also available: <strong className="text-foreground">PKR 15,000</strong>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process */}
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
              Our <span className="text-primary">SEO process</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              A proven methodology that delivers consistent results.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                month: "Month 1",
                title: "Foundation & Audit",
                tasks: ["Complete technical audit", "Keyword research", "Competitor analysis", "Quick wins implementation"],
              },
              {
                month: "Month 2-3",
                title: "Optimization & Content",
                tasks: ["On-page optimization", "Content creation", "Internal linking", "Initial link building"],
              },
              {
                month: "Month 4-6",
                title: "Growth & Scaling",
                tasks: ["Advanced link building", "Content expansion", "Conversion optimization", "Performance monitoring"],
              },
            ].map((phase, index) => (
              <motion.div
                key={phase.month}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover-lift">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-sm font-medium text-primary">{phase.month}</span>
                      <h3 className="text-xl font-bold">{phase.title}</h3>
                    </div>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {phase.tasks.map((task) => (
                      <li key={task} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                        <span className="text-sm text-muted-foreground">{task}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
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
              Ready to <span className="text-primary">dominate search results</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get a free SEO audit and discover opportunities to outrank your competition.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" className="group">
                Get Free SEO Audit
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                See SEO Results
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SEO;
