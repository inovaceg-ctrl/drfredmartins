import { Mail, Phone, Instagram } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast"; // Importar useToast
import { supabase } from "@/integrations/supabase/client"; // Importar o cliente Supabase
import { formatPhone } from "@/lib/format-phone"; // Importar a função de formatação de telefone
import { Checkbox } from "@/components/ui/checkbox"; // Importar Checkbox

const ContactSection = () => {
  const { toast } = useToast(); // Inicializar o hook de toast
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "", // Novo campo
    date_of_birth: "", // Novo campo
    zip_code: "", // Novo campo
    state: "", // Novo campo
    city: "", // Novo campo
    receive_email_newsletter: false, // Novo campo
    receive_whatsapp_newsletter: false, // Novo campo
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formattedValue }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, whatsapp: formattedValue }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData((prev) => ({ ...prev, zip_code: cep }));

    if (cep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado e tente novamente.",
            variant: "destructive",
          });
          setFormData((prev) => ({ ...prev, state: "", city: "" }));
        } else {
          setFormData((prev) => ({
            ...prev,
            state: data.uf,
            city: data.localidade,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast({
          title: "Erro na consulta de CEP",
          description: "Não foi possível buscar o CEP. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setFormData((prev) => ({ ...prev, state: "", city: "" }));
      } finally {
        setIsFetchingCep(false);
      }
    } else if (cep.length < 8) {
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''), // Salva apenas números
          whatsapp: formData.whatsapp.replace(/\D/g, ''), // Salva apenas números
          date_of_birth: formData.date_of_birth || null, // Salva como null se vazio
          zip_code: formData.zip_code || null,
          state: formData.state || null,
          city: formData.city || null,
          receive_email_newsletter: formData.receive_email_newsletter,
          receive_whatsapp_newsletter: formData.receive_whatsapp_newsletter,
          content: formData.message,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Mensagem Enviada!",
        description: "Sua mensagem foi enviada com sucesso. Em breve entraremos em contato.",
      });
      setFormData({ // Limpar formulário
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        date_of_birth: "",
        zip_code: "",
        state: "",
        city: "",
        receive_email_newsletter: false,
        receive_whatsapp_newsletter: false,
        message: "",
      });
    } catch (error: any) {
      console.error("Erro ao enviar mensagem para o Supabase:", error);
      toast({
        title: "Erro ao Enviar Mensagem",
        description: error.message || "Ocorreu um erro ao tentar enviar sua mensagem. Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <span className="inline-block px-4 py-2 bg-accent text-accent-foreground rounded-full font-medium mb-4">
              Entre em Contato
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Pronto Para Começar Sua Jornada?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Entre em contato para agendar uma consulta ou tirar dúvidas sobre terapia, 
              psicanálise ou parcerias profissionais.
            </p>
            
            <div className="space-y-8">

              {/* WhatsApp */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Phone size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">WhatsApp</h3>
                  <a 
                    href="https://wa.me/553291931779" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    +55 32 9193-1779
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Mail size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">E-mail (Parcerias)</h3>
                  <a 
                    href="mailto:parcerias@drfredmartins.com.br" 
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    parcerias@drfredmartins.com.br
                  </a>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Instagram size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Instagram</h3>
                  <a 
                    href="https://instagram.com/drfredmartinsjf" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    @drfredmartinsjf
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Envie Uma Mensagem</h3>
            <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg shadow-lg p-8 border border-border">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Seu nome"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Telefone (Fixo/Celular)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange} // Usando handlePhoneChange
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="99-9-9999-9999"
                  maxLength={15} // Adicionado maxLength
                />
              </div>

              {/* Novo campo: WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-foreground mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="99-9-9999-9999"
                  maxLength={15}
                />
              </div>

              {/* Novo campo: Data de Nascimento */}
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-foreground mb-2">
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Novos campos: CEP, Estado, Cidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-foreground mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleCepChange}
                    onBlur={handleCepChange} // Trigger on blur as well
                    maxLength={9}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="00000-000"
                    disabled={isFetchingCep}
                  />
                  {isFetchingCep && <p className="text-xs text-muted-foreground mt-1">Buscando CEP...</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Estado"
                    readOnly // Preenchido automaticamente
                    disabled={isFetchingCep} // Desabilitado durante a busca
                  />
                </div>
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Cidade"
                  readOnly // Preenchido automaticamente
                  disabled={isFetchingCep} // Desabilitado durante a busca
                />
              </div>

              {/* Novos campos: Preferências de Newsletter */}
              <div className="space-y-3">
                <p className="block text-sm font-medium text-foreground">
                  Deseja receber informativos sobre saúde mental?
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receive_email_newsletter"
                    name="receive_email_newsletter"
                    checked={formData.receive_email_newsletter}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, receive_email_newsletter: checked as boolean }))}
                  />
                  <label
                    htmlFor="receive_email_newsletter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Via E-mail
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="receive_whatsapp_newsletter"
                    name="receive_whatsapp_newsletter"
                    checked={formData.receive_whatsapp_newsletter}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, receive_whatsapp_newsletter: checked as boolean }))}
                  />
                  <label
                    htmlFor="receive_whatsapp_newsletter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Via WhatsApp
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Conte-me um pouco sobre o que você está buscando..."
                />
              </div>
              
              <button
                type="submit"
                disabled={isSending || isFetchingCep}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;