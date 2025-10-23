import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { BRAZILIAN_STATES } from "@/lib/brazilian-states";
import { formatPhone, unformatPhone } from "@/lib/format-phone";
import { useQuery } from "@tanstack/react-query";
import { formatDateToDisplay, parseDateFromInput } from "@/lib/utils"; // Import from utils

interface EditPatientDialogProps {
  patient: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientUpdated: () => void;
}

export function EditPatientDialog({ patient, open, onOpenChange, onPatientUpdated }: EditPatientDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    street: "",
    street_number: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    birth_date: "", // Will store dd/mm/yyyy string
    mental_health_history: "",
    main_complaints: "",
    previous_diagnoses: "",
    current_medications: "",
    past_sessions_history: "",
    therapist_id: "",
    consent_status: false,
    consent_date: "",
  });
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState("");
  const [existingNotes, setExistingNotes] = useState<any[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Query para buscar a lista de doutores
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_doctors_public");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (patient && open) {
      setFormData({
        full_name: patient.full_name || "",
        phone: patient.phone ? formatPhone(patient.phone) : "",
        whatsapp: patient.whatsapp ? formatPhone(patient.whatsapp) : "",
        street: patient.street || "",
        street_number: patient.street_number || "",
        neighborhood: patient.neighborhood || "",
        city: patient.city || "",
        state: patient.state || "",
        zip_code: patient.zip_code || "",
        birth_date: patient.birth_date ? formatDateToDisplay(patient.birth_date) : "", // Format for display
        mental_health_history: patient.mental_health_history || "",
        main_complaints: patient.main_complaints || "",
        previous_diagnoses: patient.previous_diagnoses || "",
        current_medications: patient.current_medications || "",
        past_sessions_history: patient.past_sessions_history || "",
        therapist_id: patient.therapist_id || "",
        consent_status: patient.consent_status || false,
        consent_date: patient.consent_status ? (patient.consent_date ? format(new Date(patient.consent_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")) : "",
      });
      fetchDoctorNotes();
    }
  }, [patient, open]);

  const handleZipCodeLookup = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, '');
    setFormData((prev) => ({ ...prev, zip_code: cleanedCep }));

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
          setFormData((prev) => ({ ...prev, state: "", city: "", street: "", neighborhood: "" }));
        } else {
          setFormData((prev) => ({
            ...prev,
            state: data.uf,
            city: data.localidade,
            street: data.logradouro,
            neighborhood: data.bairro,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast({
          title: "Erro na consulta de CEP",
          description: "Não foi possível buscar o CEP. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setFormData((prev) => ({ ...prev, state: "", city: "", street: "", neighborhood: "" }));
      } finally {
        setIsFetchingCep(false);
      }
    } else if (cleanedCep.length < 8) {
      setFormData((prev) => ({ ...prev, state: "", city: "", street: "", neighborhood: "" }));
    }
  };

  const fetchDoctorNotes = async () => {
    if (!patient) return;
    
    setLoadingNotes(true);
    const { data } = await (supabase as any)
      .from('doctor_notes')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });
    
    setExistingNotes(data || []);
    setLoadingNotes(false);
  };

  // New: Input mask for date field
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    let formattedValue = '';

    if (value.length > 0) {
      formattedValue += value.substring(0, 2);
      if (value.length > 2) {
        formattedValue += '/' + value.substring(2, 4);
      }
      if (value.length > 4) {
        formattedValue += '/' + value.substring(4, 8);
      }
    }
    setFormData((prev) => ({ ...prev, birth_date: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse birth_date from dd/mm/yyyy to yyyy-MM-dd for Supabase
      const parsedBirthDate = parseDateFromInput(formData.birth_date);

      // Add validation feedback for birth_date
      if (formData.birth_date && !parsedBirthDate) {
        toast({
          title: "Erro de Data",
          description: "O formato da data de nascimento deve ser DD/MM/AAAA e ser uma data válida.",
          variant: "destructive",
        });
        setLoading(false);
        return; // Stop submission if date is invalid
      }

      // Update profile
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: unformatPhone(formData.phone),
          whatsapp: unformatPhone(formData.whatsapp),
          street: formData.street,
          street_number: formData.street_number,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          birth_date: parsedBirthDate, // Use parsed date for DB
          mental_health_history: formData.mental_health_history || null,
          main_complaints: formData.main_complaints || null,
          previous_diagnoses: formData.previous_diagnoses || null,
          current_medications: formData.current_medications || null,
          past_sessions_history: formData.past_sessions_history || null,
          therapist_id: formData.therapist_id || null,
          consent_status: formData.consent_status,
          consent_date: formData.consent_status ? (formData.consent_date || new Date().toISOString()) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', patient.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Add doctor note if there's text
      if (doctorNotes.trim()) {
        const user = await supabase.auth.getUser();
        const { error: notesError } = await (supabase as any)
          .from('doctor_notes')
          .insert({
            patient_id: patient.id,
            doctor_id: user.data.user?.id,
            notes: doctorNotes.trim(),
          });

        if (notesError) {
          console.error('Notes insert error:', notesError);
          throw notesError;
        }
      }

      toast({
        title: "Sucesso",
        description: "Dados do paciente atualizados com sucesso!",
      });

      await onPatientUpdated();
      
      onOpenChange(false);
      setDoctorNotes("");
    } catch (error: any) {
      console.error('Error updating patient:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Dados do Paciente</DialogTitle>
          <DialogDescription>
            Atualize as informações do paciente e adicione observações
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-semibold text-lg mt-4">Informações Pessoais</h3>
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                placeholder="99-9-9999-9999"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: formatPhone(e.target.value) })}
                placeholder="99-9-9999-9999"
                maxLength={15}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento (DD/MM/AAAA)</Label>
            <Input
              id="birth_date"
              type="text"
              value={formData.birth_date}
              onChange={handleDateInputChange} // Using the new input mask handler
              placeholder="DD/MM/AAAA"
              maxLength={10} // Max length for dd/mm/yyyy
            />
          </div>

          <h3 className="font-semibold text-lg mt-8">Endereço</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) => handleZipCodeLookup(e.target.value)}
                onBlur={(e) => handleZipCodeLookup(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                disabled={isFetchingCep}
              />
              {isFetchingCep && <p className="text-xs text-muted-foreground mt-1">Buscando CEP...</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Estado"
                readOnly
                disabled={isFetchingCep}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Cidade"
              readOnly
              disabled={isFetchingCep}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua/Avenida</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Nome da rua ou avenida"
              readOnly
              disabled={isFetchingCep}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street_number">Número</Label>
              <Input
                id="street_number"
                value={formData.street_number}
                onChange={(e) => setFormData({ ...formData, street_number: e.target.value })}
                placeholder="123"
                disabled={isFetchingCep}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Nome do bairro"
                readOnly
                disabled={isFetchingCep}
              />
            </div>
          </div>

          <h3 className="font-semibold text-lg mt-8">Informações Terapêuticas</h3>
          <div className="space-y-2">
            <Label htmlFor="mental_health_history">Histórico de Saúde Mental</Label>
            <Textarea
              id="mental_health_history"
              value={formData.mental_health_history}
              onChange={(e) => setFormData({ ...formData, mental_health_history: e.target.value })}
              placeholder="Histórico de saúde mental do paciente..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="main_complaints">Queixas Principais</Label>
            <Textarea
              id="main_complaints"
              value={formData.main_complaints}
              onChange={(e) => setFormData({ ...formData, main_complaints: e.target.value })}
              placeholder="Queixas principais do paciente..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="previous_diagnoses">Diagnósticos Anteriores</Label>
            <Textarea
              id="previous_diagnoses"
              value={formData.previous_diagnoses}
              onChange={(e) => setFormData({ ...formData, previous_diagnoses: e.target.value })}
              placeholder="Diagnósticos anteriores (se houver)..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current_medications">Medicamentos Atuais</Label>
            <Textarea
              id="current_medications"
              value={formData.current_medications}
              onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
              placeholder="Medicamentos que o paciente está tomando atualmente..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="past_sessions_history">Histórico de Sessões Passadas (Resumo)</Label>
            <Textarea
              id="past_sessions_history"
              value={formData.past_sessions_history}
              onChange={(e) => setFormData({ ...formData, past_sessions_history: e.target.value })}
              placeholder="Resumo do histórico de sessões passadas (se houver registros externos)..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="therapist_id">Terapeuta Principal</Label>
            <Select
              value={formData.therapist_id}
              onValueChange={(value) => setFormData({ ...formData, therapist_id: value })}
              disabled={isLoadingDoctors}
            >
              <SelectTrigger id="therapist_id" className="bg-background">
                <SelectValue placeholder={isLoadingDoctors ? "Carregando terapeutas..." : "Selecione um terapeuta"} />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {doctors?.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <h3 className="font-semibold text-lg mt-8">Termo de Consentimento</h3>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="consent_status"
              checked={formData.consent_status}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, consent_status: checked as boolean, consent_date: checked ? (prev.consent_date || format(new Date(), "yyyy-MM-dd")) : "" }))}
            />
            <Label htmlFor="consent_status">Consentimento Assinado</Label>
          </div>
          {formData.consent_status && (
            <div className="space-y-2">
              <Label htmlFor="consent_date">Data do Consentimento</Label>
              <Input
                id="consent_date"
                type="date"
                value={formData.consent_date}
                onChange={(e) => setFormData({ ...formData, consent_date: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Adicionar Observação Médica</Label>
            <Textarea
              id="notes"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Escreva suas observações sobre o paciente..."
              rows={4}
            />
          </div>

          {existingNotes.length > 0 && (
            <div className="space-y-2">
              <Label>Observações Anteriores</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {loadingNotes ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  existingNotes.map((note) => (
                    <div key={note.id} className="border-b pb-2 last:border-b-0">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(note.created_at), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                      <p className="text-sm mt-1">{note.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || isFetchingCep}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}