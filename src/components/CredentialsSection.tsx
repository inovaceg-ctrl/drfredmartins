import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

const CredentialsSection = () => {
  const credentialText = "Reconhecido 5 vezes em premiações como melhor terapeuta em São Paulo. mãos e Mentes Brilhantes. Profissional do ano destaque de 2023. Premio raimundo nonato , personalidades 2023, 2024 e 2025.";

  return (
    <section id="credentials" className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-slate-900 to-blue-900 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-white/5 text-white rounded-full font-medium mb-4">
            Reconhecimentos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Credenciais e Reconhecimentos
          </h2>
          <p className="text-lg text-white/80">
            Minha trajetória e as honrarias que marcam meu compromisso com a excelência.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto"> {/* Usando grid para consistência, mesmo com 1 item */}
          <Card className="bg-white/10 border-white/10 backdrop-blur-md hover:border-blue-400/30 transition-all">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Award size={32} className="text-blue-400 mb-4" />
              <p className="font-semibold text-xl text-white/80 mb-2">
                {credentialText}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CredentialsSection;