import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WebApps from "./pages/services/WebApps";
import Shopify from "./pages/services/Shopify";
import UIUXDesign from "./pages/services/UIUXDesign";
import SEO from "./pages/services/SEO";
import AIAssistant from "./pages/services/AIAssistant";
import Maintenance from "./pages/services/Maintenance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services/web-apps" element={<WebApps />} />
          <Route path="/services/shopify" element={<Shopify />} />
          <Route path="/services/ui-ux-design" element={<UIUXDesign />} />
          <Route path="/services/seo" element={<SEO />} />
          <Route path="/services/ai-assistant" element={<AIAssistant />} />
          <Route path="/services/maintenance" element={<Maintenance />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
