
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-slate-900 to-blue-900 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-white/5 text-white rounded-full font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            O Que Dizem Meus Pacientes
          </h2>
          <p className="text-lg text-white/80">
            Histórias reais de transformação e autoconhecimento através da terapia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/10 border-white/10 backdrop-blur-md hover:border-blue-400/30 transition-all">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill="#3b82f6" color="#3b82f6" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden mr-4 flex-shrink-0">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.role}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.role}</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

const testimonials = [
  {
    quote: "O Dr. Frederick transformou minha vida! Suas sessões são profundas e ao mesmo tempo leves. Consegui superar traumas que carregava há anos.",
    role: "Paciente - Terapia Individual",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256"
  },
  {
    quote: "Acompanho o Dr. Frederick no Instagram e decidi marcar uma consulta. Foi a melhor decisão! Ele é autêntico e realmente se importa com seus pacientes.",
    role: "Paciente - Saúde Mental",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256"
  },
  {
    quote: "O trabalho do Dr. Frederick em sexologia salvou meu relacionamento. Ele tem uma abordagem única que combina ciência com humanidade.",
    role: "Paciente - Terapia de Casal",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=256"
  }
];

export default TestimonialsSection;
