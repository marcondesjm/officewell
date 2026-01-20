import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Install from "./pages/Install";
import HRAdmin from "./pages/HRAdmin";
import PartnersAdmin from "./pages/PartnersAdmin";
import Termos from "./pages/Termos";
import Landing from "./pages/Landing";
import Goals from "./pages/Goals";
import Demo from "./pages/Demo";
import Privacidade from "./pages/Privacidade";
import Ergonomia from "./pages/Ergonomia";
import PushAdmin from "./pages/PushAdmin";
import PlansAdmin from "./pages/PlansAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/install" element={<Install />} />
              <Route path="/rh" element={<HRAdmin />} />
              <Route path="/metas" element={<Goals />} />
              <Route path="/parceiros" element={<PartnersAdmin />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/termos" element={<Termos />} />
              <Route path="/ergonomia" element={<Ergonomia />} />
              <Route path="/push" element={<PushAdmin />} />
              <Route path="/plans-admin" element={<PlansAdmin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
