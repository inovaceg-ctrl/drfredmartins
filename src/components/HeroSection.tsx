import { useState, useEffect } from "react";
import { ArrowRight, Instagram, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import drFrederickHero from "@/assets/dr-frederick-1.jpg";
const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  const openWhatsApp = () => {
    window.open('https://wa.me/553291931779', '_blank');
  };
  return <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-transparent rounded-full blur-3xl animate-spin-slow" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:50px_50px] opacity-20" />

      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* Left Content */}
          <div className={`space-y-8 order-2 lg:order-1 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            {/* Badge */}
            

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
                Transforme Sua
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Jornada Interior
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 max-w-2xl leading-relaxed">
                Terapeuta, Psicanalista e Influenciador Digital. Combinando ciência, espiritualidade e autoconhecimento para transformar vidas.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-8 py-4 text-lg hover-scale group" onClick={openWhatsApp}>
                Agende Sua Consulta
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-4 text-lg backdrop-blur-sm" onClick={() => window.open('https://instagram.com/drfredmartinsjf', '_blank')}>
                <Instagram className="mr-2 w-5 h-5" />
                Seguir no Instagram
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">1.1M+</div>
                <div className="text-sm text-white/70">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">10+</div>
                <div className="text-sm text-white/70">Anos Clínica</div>
              </div>
              {/* Removido o item "PhD Psicanálise" */}
            </div>
          </div>

          {/* Right Content - Photo */}
          <div className={`order-1 lg:order-2 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{
          animationDelay: '0.3s'
        }}>
            {/* Enhanced Photo Display */}
            <div className="relative group max-w-lg mx-auto lg:max-w-none">
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700" />
              <div className="relative rounded-3xl overflow-hidden border border-white/20 backdrop-blur-sm bg-white/5 hover-scale">
                <img 
                  alt="Dr. Frederick Parreira - Terapeuta e Psicanalista" 
                  className="w-full h-auto object-cover object-center transform group-hover:scale-105 transition-transform duration-700 max-h-[600px] lg:max-h-[700px]" 
                  src={drFrederickHero} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>;
};
export default HeroSection;