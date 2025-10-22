import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, User as UserIcon } from "lucide-react";
import { BRAZILIAN_STATES } from "@/lib/brazilian-states";
import { formatPhone, unformatPhone } from "@/lib/format-phone";
import { format } from "date-fns";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  birth_date: z.string().optional(),
  street: z.string().optional(),
  street_number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface DoctorProfileFormProps {
  userId: string;
  onProfileUpdated: () => void;
}

export function DoctorProfileForm({ userId, onProfileUpdated }: DoctorProfileFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]); // Mantido para o Select de cidade, mas será preenchido automaticamente
  const [loadingCities, setLoadingCities] = useState(false); // Mantido para o Select de cidade
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      whatsapp: "",
      birth_date: "",
      street: "",
      street_number: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        form.reset({
          full_name: data.full_name || "",
          phone: data.phone ? formatPhone(data.phone) : "",
          whatsapp: data.whatsapp ? formatPhone(data.whatsapp) : "",
          birth_date: data.birth_date ? format(new Date(data.birth_date), "yyyy-MM-dd") : "",
          street: data.street || "",
          street_number: data.street_number || "",
          neighborhood: data.neighborhood || "",
          city: data.city || "",
          state: data.state || "",
          zip_code: data.zip_code || "",
        });
        // Se houver estado no perfil, buscar as cidades para preencher o Select
        if (data.state) {
          fetchCities(data.state);
        }
      }
      setLoading(false);
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, form, toast]);

  const fetchCities = async (stateCode: string) => {
    setLoadingCities(true);
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`
      );
      const data = await response.json();
      setCities(data.map((city: any) => city.nome).sort());
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleZipCodeLookup = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, '');
    form.setValue("zip_code", cleanedCep);

    if (cleanedCep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        const data = await response.json();

        if (data.erro) {
          toast({
            title: "CEP não encontrado",
            description: "Verifique o CEP digitado e tente novamente.",
            variant: "destructive",
          });
          form.setValue("state", "");
          form.setValue("city", "");
          setCities([]); // Limpa as cidades se o CEP não for encontrado
        } else {
          form.setValue("state", data.uf);
          form.setValue("city", data.localidade);
          fetchCities(data.uf); // Busca as cidades para o estado encontrado para o Select
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast({
          title: "Erro na consulta de CEP",
          description: "Não foi possível buscar o CEP. Tente novamente mais tarde.",
          variant: "destructive",
        });
        form.setValue("state", "");
        form.setValue("city", "");
        setCities([]);
      } finally {
        setIsFetchingCep(false);
      }
    } else if (cleanedCep.length < 8) {
      form.setValue("state", "");
      form.setValue("city", "");
      setCities([]);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: values.full_name,
        phone: values.phone ? unformatPhone(values.phone) : null,
        whatsapp: values.whatsapp ? unformatPhone(values.whatsapp) : null,
        birth_date: values.birth_date || null,
        street: values.street || null,
        street_number: values.street_number || null,
        neighborhood: values.neighborhood || null,
        city: values.city || null,
        state: values.state || null,
        zip_code: values.zip_code || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Seu perfil foi atualizado com sucesso!",
      });
      onProfileUpdated();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <UserIcon className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Meu Perfil</h2>
          <p className="text-muted-foreground">Atualize suas informações pessoais e profissionais.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="99-9-9999-9999"
                      maxLength={15}
                      {...field}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="99-9-9999-9999"
                      maxLength={15}
                      {...field}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="birth_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <h3 className="font-semibold text-lg mt-8 mb-4">Endereço</h3>

          <FormField
            control={form.control}
            name="zip_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input
                    placeholder="00000-000"
                    maxLength={9}
                    {...field}
                    onChange={(e) => handleZipCodeLookup(e.target.value)}
                    onBlur={(e) => handleZipCodeLookup(e.target.value)}
                    disabled={isFetchingCep}
                  />
                </FormControl>
                {isFetchingCep && <p className="text-xs text-muted-foreground mt-1">Buscando CEP...</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Estado"
                      readOnly
                      disabled={isFetchingCep}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cidade"
                      readOnly
                      disabled={isFetchingCep}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rua/Avenida</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da rua ou avenida" {...field} disabled={isFetchingCep} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="street_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} disabled={isFetchingCep} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do bairro" {...field} disabled={isFetchingCep} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || isFetchingCep}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </form>
      </Form>
    </div>
  );
}