import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black border-t border-white/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight">Dr. Frederick Parreira</h3>
            <p className="text-white/70 mb-6">
              Terapeuta, Psicanalista e Influenciador Digital. Transformando vidas com ciência, 
              autenticidade e uma abordagem única em saúde mental.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://instagram.com/drfredmartinsjf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/70 hover:text-white transition-colors" 
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight">Navegação</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#about" 
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector('#about');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-white/70 hover:text-white transition-opacity"
                >
                  Sobre
                </a>
              </li>
              <li>
                <a 
                  href="#credentials" 
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector('#credentials');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-white/70 hover:text-white transition-opacity"
                >
                  Formação
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70">
                <Phone size={16} />
                <a href="tel:+553291931779" className="hover:text-white transition-opacity">
                  +55 32 9193-1779
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Mail size={16} />
                <a href="mailto:parcerias@drfredmartins.com.br" className="hover:text-white transition-opacity">
                  parcerias@drfredmartins.com.br
                </a>
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <Instagram size={16} />
                <a 
                  href="https://instagram.com/drfredmartinsjf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-opacity"
                >
                  @drfredmartinsjf
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-6 text-white tracking-tight">Newsletter</h3>
            <p className="text-white/70 mb-4">
              Receba conteúdos exclusivos sobre saúde mental e desenvolvimento pessoal.
            </p>
            <form className="flex flex-col space-y-4">
              <Input
                type="email"
                placeholder="Seu e-mail"
                className="bg-white/5 border-white/10 placeholder:text-white/50 text-white"
              />
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-white/90 rounded-full">
                Inscrever-se
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/70">
            &copy; {new Date().getFullYear()} Dr. Frederick Parreira. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;