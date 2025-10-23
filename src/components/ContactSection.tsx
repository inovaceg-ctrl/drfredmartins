import { Mail, Phone, Instagram } from "lucide-react";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatPhone } from "@/lib/format-phone";
import { Checkbox } from "@/components/ui/checkbox";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "", // Apenas WhatsApp
    date_of_birth: "",
    zip_code: "",
    state: "",
    city: "",
    street: "",
    neighborhood: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhone(e.target.value);
    setFormData((prev) => ({ ...prev, whatsapp: formattedValue }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, zip_code: cep }));

    if (cep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.erro) {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado e tente novamente.",
            variant: "destructive",
          });
          setFormData((prev) => ({ ...prev, state: "", city: "", street: "", neighborhood: "" }));
        } else {
          setFormData((prev) => ({
            ...prev,
            state: data.uf,
            city: data.localidade,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
          }));
        }
      } catch (error: any) {
        console.error("Erro ao buscar CEP:", error);
        toast({
          title: "Erro na consulta de CEP",
          description: `Não foi possível buscar o CEP. ${error.message || 'Tente novamente mais tarde.'}`,
          variant: "destructive",
        });
        setFormData((prev) => ({ ...prev, state: "", city: "", street: "", neighborhood: "" }));
      } finally {
        setIsFetchingCep(false);
      }
    } else if (cep.length < 8) {
      setFormData((prev) => ({ ...prev, state: "", city: "", street: "", neighborhood: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);

    const whatsappFormatted = formData.whatsapp.replace(/\D/g, '');

    const dataToInsert = {
      name: formData.name || 'Não Informado',
      whatsapp: whatsappFormatted || null,
      date_of_birth: formData.date_of_birth || null,
      zip_code: formData.zip_code || null,
      state: formData.state || null, // Pode ser null se não preenchido
      city: formData.city || null,   // Pode ser null se não preenchido
      street: formData.street || null,
      neighborhood: formData.neighborhood || null,
      content: formData.message,
    };

    console.log("Dados sendo enviados para o Supabase (contact_submissions):", dataToInsert);

    try {
      const { data, error } = await supabase
        .from('contact_submissions') // Alterado para a nova tabela
        .insert(dataToInsert)
        .select();

      if (error) {
        console.error("Erro detalhado do Supabase (contact_submissions):", error);
        console.error("Supabase error message:", error.message);
        console.error("Supabase error details:", error.details);
        console.error("Supabase error hint:", error.hint);
        console.error("Supabase error code:", error.code);
        throw error;
      }

      console.log("Mensagem enviada com sucesso para contact_submissions:", data);
      toast({
        title: "Mensagem Enviada!",
        description: "Sua mensagem foi enviada com sucesso. Em breve entraremos em contato.",
      });
      setFormData({
        name: "",
        whatsapp: "",
        date_of_birth: "",
        zip_code: "",
        state: "",
        city: "",
        street: "",
        neighborhood: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Erro ao enviar mensagem para o Supabase (contact_submissions - catch):", error);
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
              
              {/* Campo WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-foreground mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleWhatsAppChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="99-9-9999-9999"
                  maxLength={15}
                />
              </div>

              {/* Campo Data de Nascimento */}
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

              {/* Campos: CEP, Estado, Cidade */}
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
                    onBlur={handleCepChange}
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
                    readOnly
                    disabled={isFetchingCep}
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
                  readOnly
                  disabled={isFetchingCep}
                />
              </div>

              {/* Campos: Rua, Bairro (sem número da rua) */}
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-foreground mb-2">
                  Rua/Avenida
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome da rua ou avenida"
                  readOnly
                  disabled={isFetchingCep}
                />
              </div>
              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-foreground mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nome do bairro"
                  readOnly
                  disabled={isFetchingCep}
                />
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