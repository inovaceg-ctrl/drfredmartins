import { ArrowRight, Award, Users, GraduationCap, Star, Tv, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import drFrederickStory from "@/assets/dr-frederick-2.png";

const StorySection = () => {
  return (
    <section id="about" className="py-12 md:py-20 lg:py-24 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Story Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="inline-block px-4 py-2 bg-white/10 text-white rounded-full font-medium">
                Minha Jornada
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
                Transformando Vidas com
                <span className="block bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  Ciência e Autenticidade
                </span>
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Dr. Frederick Parreira é terapeuta, mestre e doutor em psicanálise, além de sexólogo e espiritualista. 
                Com uma abordagem única e carismática, ele combina saúde mental com conteúdos dinâmicos e divertidos.
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-white/70 leading-relaxed">
                Com mais de 10 anos de experiência clínica, Dr. Frederick construiu uma vasta experiência em trabalhar 
                com indivíduos de diferentes idades e contextos. Ele se dedica a auxiliar seus pacientes a superar 
                desafios emocionais, fortalecer suas relações interpessoais e encontrar significado em suas vidas.
              </p>
              <p className="text-lg text-white/70 leading-relaxed">
                Em 2018, decidiu expandir seu impacto utilizando as redes sociais para atingir um público ainda maior. 
                Hoje, com mais de 1.1 milhão de seguidores no Instagram, ele transforma temas complexos em conteúdo 
                acessível, criando uma conexão profunda com seu público.
              </p>
              <blockquote className="text-xl font-medium text-white italic border-l-4 border-blue-400 pl-6">
                "Transformar e entreter ao mesmo tempo - esse é o meu propósito."
              </blockquote>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-blue-300" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-white text-slate-900 hover:bg-white/90 px-8 py-4 rounded-full text-lg flex items-center gap-3 w-full sm:w-auto"
                onClick={() => {
                  const element = document.getElementById('about'); // Changed to 'about'
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Agende Sua Consulta
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img
                alt="Dr. Frederick Parreira" 
                className="w-full h-auto transform hover:scale-105 transition-transform duration-700" 
                src={drFrederickStory} 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const stats = [
  // Removido o item "PhD Psicanálise"
  {
    icon: Users,
    number: "1.1M+",
    label: "Seguidores"
  },
  {
    icon: Tv,
    number: "Band TV",
    label: "Apresentador"
  },
  {
    icon: Award,
    number: "Prêmios",
    label: "Nacionais"
  }
];

export default StorySection;