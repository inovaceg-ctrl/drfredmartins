import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Licensee from "./pages/Licensee";
import Owners from "./pages/Owners";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import LicenseDisclosure from "./pages/LicenseDisclosure";
import Accessibility from "./pages/Accessibility";
import CookiePolicy from "./pages/CookiePolicy";
import ReturnsPolicy from "./pages/ReturnsPolicy";
import Redirect from "./pages/Redirect";
import Auth from "./pages/Auth";
import Patient from "./pages/Patient";
import Doctor from "./pages/Doctor";
import { WhatsappTranscriptionsPage } from "./pages/WhatsappTranscriptionsPage"; // Importar a nova página

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/licensee" element={<Licensee />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/redirect" element={<Redirect />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/whatsapp-transcriptions" element={<WhatsappTranscriptionsPage />} /> {/* Nova rota */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/license-disclosure" element={<LicenseDisclosure />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/returns-policy" element={<ReturnsPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
