import AnnouncementBanner from "@/components/AnnouncementBanner";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StorySection from "@/components/StorySection";
import CredentialsSection from "@/components/CredentialsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBanner />
      <Navbar />
      <main>
        <HeroSection />
        <StorySection />
        <CredentialsSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;