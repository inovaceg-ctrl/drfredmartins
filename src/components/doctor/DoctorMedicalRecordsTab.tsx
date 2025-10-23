import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, CalendarDays, BookOpen, MessageSquareText, ClipboardList, CheckCircle, XCircle, Stethoscope, FileText, Edit, LayoutGrid } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EditMedicalRecordDialog } from "./EditMedicalRecordDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Importar Tabs

type PatientProfile = Database['public']['Tables']['profiles']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type MedicalRecord = Database['public']['Tables']['medical_records']['Row'];

interface DoctorMedicalRecordsTabProps {
  currentUserId: string;
}

export const DoctorMedicalRecordsTab: React.FC<DoctorMedicalRecordsTabProps> = ({ currentUserId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [newSessionData, setNewSessionData] = useState({
    session_date: "",
    session_theme: "",
    interventions_used: "",
    notes: "",
    homework: "",
  });
  const [addingSession, setAddingSession] = useState(false);

  const [newMedicalRecordData, setNewMedicalRecordData] = useState({
    diagnosis: "",
    prescription: "",
    notes: "",
  });
  const [addingMedicalRecord, setAddingMedicalRecord] = useState(false);

  const [isEditRecordDialogOpen, setIsEditRecordDialogOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("overview"); // Novo estado para as sub-abas

  // Fetch all patients for the doctor
  const { data: patients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["doctorPatients", currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_patients_for_doctor");
      if (error) throw error;
      return data;
    },
  });

  // Query para buscar a lista de doutores (adicionado para resolver o erro)
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_doctors_public");
      if (error) throw error;
      return data;
    },
  });

  // Fetch selected patient's full profile (including new therapeutic fields)
  const { data: selectedPatientProfile, isLoading: isLoadingSelectedPatient } = useQuery({
    queryKey: ["patientProfile", selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', selectedPatientId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPatientId,
  });

  // Fetch sessions for the selected patient
  const { data: patientSessions, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["patientSessions", selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('patient_id', selectedPatientId)
        .order('session_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPatientId,
  });

  // Fetch medical records for the selected patient
  const { data: patientMedicalRecords, isLoading: isLoadingMedicalRecords } = useQuery({
    queryKey: ["patientMedicalRecords", selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return [];
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', selectedPatientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPatientId,
  });

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !newSessionData.session_date) {
      toast({ title: "Erro", description: "Selecione um paciente e a data da sessão.", variant: "destructive" });
      return;
    }

    if (!currentUserId) {
      toast({ title: "Erro", description: "ID do doutor não disponível. Por favor, faça login novamente.", variant: "destructive" });
      return;
    }

    setAddingSession(true);
    try {
      const sessionToInsert = {
        patient_id: selectedPatientId,
        therapist_id: currentUserId,
        session_date: new Date(newSessionData.session_date).toISOString(),
        session_theme: newSessionData.session_theme || null,
        interventions_used: newSessionData.interventions_used || null,
        notes: newSessionData.notes || null,
        homework: newSessionData.homework || null,
      };

      console.log("Attempting to insert session with data:", sessionToInsert);

      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionToInsert)
        .select(); // Adicionado .select() para obter os dados inseridos de volta

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      console.log("Session inserted successfully:", data);
      toast({ title: "Sucesso", description: "Sessão registrada com sucesso!" });
      setNewSessionData({
        session_date: "",
        session_theme: "",
        interventions_used: "",
        notes: "",
        homework: "",
      });
      queryClient.invalidateQueries({ queryKey: ["patientSessions", selectedPatientId] }); // Refetch sessions
    } catch (error: any) {
      console.error("Error adding session in catch block:", error);
      toast({ title: "Erro", description: error.message || "Não foi possível registrar a sessão.", variant: "destructive" });
    } finally {
      setAddingSession(false);
    }
  };

  const handleAddMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || (!newMedicalRecordData.diagnosis && !newMedicalRecordData.prescription && !newMedicalRecordData.notes)) {
      toast({ title: "Erro", description: "Preencha ao menos um campo (diagnóstico, prescrição ou notas) para o prontuário.", variant: "destructive" });
      return;
    }

    if (!currentUserId) {
      toast({ title: "Erro", description: "ID do doutor não disponível. Por favor, faça login novamente.", variant: "destructive" });
      return;
    }

    setAddingMedicalRecord(true);
    try {
      const recordToInsert = {
        patient_id: selectedPatientId,
        doctor_id: currentUserId,
        diagnosis: newMedicalRecordData.diagnosis || null,
        prescription: newMedicalRecordData.prescription || null,
        notes: newMedicalRecordData.notes || null,
      };

      console.log("Attempting to insert medical record with data:", recordToInsert);

      const { data, error } = await supabase
        .from('medical_records')
        .insert(recordToInsert)
        .select();

      if (error) {
        console.error("Supabase medical record insert error:", error);
        throw error;
      }

      console.log("Medical record inserted successfully:", data);
      toast({ title: "Sucesso", description: "Prontuário médico registrado com sucesso!" });
      setNewMedicalRecordData({
        diagnosis: "",
        prescription: "",
        notes: "",
      });
      queryClient.invalidateQueries({ queryKey: ["patientMedicalRecords", selectedPatientId] }); // Refetch medical records
    } catch (error: any) {
      console.error("Error adding medical record in catch block:", error);
      toast({ title: "Erro", description: error.message || "Não foi possível registrar o prontuário médico.", variant: "destructive" });
    } finally {
      setAddingMedicalRecord(false);
    }
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setRecordToEdit(record);
    setIsEditRecordDialogOpen(true);
  };

  const handleRecordUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["patientMedicalRecords", selectedPatientId] });
  };

  if (isLoadingPatients || isLoadingDoctors) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Selecionar Paciente
          </CardTitle>
          <CardDescription>
            Escolha um paciente para visualizar e gerenciar seu prontuário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedPatientId} value={selectedPatientId || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients?.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPatientId && (
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
          <TabsList className="flex flex-wrap justify-center w-full bg-muted p-1 rounded-lg border">
            <TabsTrigger value="overview" className="px-3 py-2 text-sm whitespace-nowrap">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="add-session" className="px-3 py-2 text-sm whitespace-nowrap">
              <BookOpen className="h-4 w-4 mr-2" />
              Registrar Sessão
            </TabsTrigger>
            <TabsTrigger value="add-medical-record" className="px-3 py-2 text-sm whitespace-nowrap">
              <FileText className="h-4 w-4 mr-2" />
              Registrar Prontuário
            </TabsTrigger>
            <TabsTrigger value="sessions-history" className="px-3 py-2 text-sm whitespace-nowrap">
              <ClipboardList className="h-4 w-4 mr-2" />
              Histórico de Sessões
            </TabsTrigger>
            <TabsTrigger value="medical-records-history" className="px-3 py-2 text-sm whitespace-nowrap">
              <Stethoscope className="h-4 w-4 mr-2" />
              Histórico de Prontuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Patient Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Dados do Paciente
                  </CardTitle>
                  <CardDescription>Informações pessoais e terapêuticas do paciente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {isLoadingSelectedPatient ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : selectedPatientProfile ? (
                    <>
                      <p><span className="font-semibold">Nome:</span> {selectedPatientProfile.full_name}</p>
                      <p><span className="font-semibold">Email:</span> {selectedPatientProfile.email}</p>
                      <p><span className="font-semibold">WhatsApp:</span> {selectedPatientProfile.whatsapp || '-'}</p>
                      <p><span className="font-semibold">Data Nasc.:</span> {selectedPatientProfile.birth_date ? format(new Date(selectedPatientProfile.birth_date), 'dd/MM/yyyy') : '-'}</p>
                      <p><span className="font-semibold">Endereço:</span> {[selectedPatientProfile.street, selectedPatientProfile.street_number, selectedPatientProfile.neighborhood, selectedPatientProfile.city, selectedPatientProfile.state, selectedPatientProfile.zip_code].filter(Boolean).join(', ') || '-'}</p>
                      
                      <h4 className="font-semibold mt-4 border-t pt-3">Histórico Terapêutico</h4>
                      <p><span className="font-semibold">Hist. Saúde Mental:</span> {selectedPatientProfile.mental_health_history || '-'}</p>
                      <p><span className="font-semibold">Queixas Principais:</span> {selectedPatientProfile.main_complaints || '-'}</p>
                      <p><span className="font-semibold">Diagnósticos Anteriores:</span> {selectedPatientProfile.previous_diagnoses || '-'}</p>
                      <p><span className="font-semibold">Medicamentos Atuais:</span> {selectedPatientProfile.current_medications || '-'}</p>
                      <p><span className="font-semibold">Hist. Sessões Passadas:</span> {selectedPatientProfile.past_sessions_history || '-'}</p>
                      <p className="flex items-center gap-2"><span className="font-semibold">Consentimento Assinado:</span> {selectedPatientProfile.consent_status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />} {selectedPatientProfile.consent_date ? `em ${format(new Date(selectedPatientProfile.consent_date), 'dd/MM/yyyy')}` : ''}</p>
                      <p><span className="font-semibold">Terapeuta Principal:</span> {doctors?.find(d => d.id === selectedPatientProfile.therapist_id)?.full_name || '-'}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">Nenhum perfil encontrado.</p>
                  )}
                </CardContent>
              </Card>

              {/* Sessions History Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Histórico de Sessões de Terapia
                  </CardTitle>
                  <CardDescription>Todas as sessões de terapia registradas para este paciente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {isLoadingSessions ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : patientSessions && patientSessions.length > 0 ? (
                    patientSessions.map((session) => (
                      <div key={session.id} className="border rounded-lg p-4 space-y-2">
                        <p className="font-semibold text-lg flex items-center gap-2">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          {format(new Date(session.session_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        {session.session_theme && <p><span className="font-medium">Tema:</span> {session.session_theme}</p>}
                        {session.interventions_used && <p><span className="font-medium">Intervenções:</span> {session.interventions_used}</p>}
                        {session.notes && <p><span className="font-medium">Notas:</span> {session.notes}</p>}
                        {session.homework && <p><span className="font-medium">Tarefas:</span> {session.homework}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhuma sessão registrada para este paciente.</p>
                  )}
                </CardContent>
              </Card>

              {/* Medical Records History Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Histórico de Prontuários Médicos
                  </CardTitle>
                  <CardDescription>Todos os prontuários médicos gerais registrados para este paciente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                  {isLoadingMedicalRecords ? (
                    <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                  ) : patientMedicalRecords && patientMedicalRecords.length > 0 ? (
                    patientMedicalRecords.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-lg flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" />
                            {format(new Date(record.created_at!), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        {record.diagnosis && <p><span className="font-medium">Diagnóstico:</span> {record.diagnosis}</p>}
                        {record.prescription && <p><span className="font-medium">Prescrição:</span> {record.prescription}</p>}
                        {record.notes && <p><span className="font-medium">Notas:</span> {record.notes}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhum prontuário médico registrado para este paciente.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="add-session">
            {/* Add New Session Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Registrar Nova Sessão de Terapia
                </CardTitle>
                <CardDescription>Adicione os detalhes de uma nova sessão de terapia.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSession} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="session_date">Data da Sessão *</Label>
                    <Input
                      id="session_date"
                      type="datetime-local"
                      value={newSessionData.session_date}
                      onChange={(e) => setNewSessionData({ ...newSessionData, session_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session_theme">Tema da Sessão</Label>
                    <Input
                      id="session_theme"
                      value={newSessionData.session_theme}
                      onChange={(e) => setNewSessionData({ ...newSessionData, session_theme: e.target.value })}
                      placeholder="Ex: Ansiedade, Relacionamento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interventions_used">Intervenções Utilizadas</Label>
                    <Textarea
                      id="interventions_used"
                      value={newSessionData.interventions_used}
                      onChange={(e) => setNewSessionData({ ...newSessionData, interventions_used: e.target.value })}
                      placeholder="Técnicas e abordagens utilizadas..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas sobre o Estado Emocional</Label>
                    <Textarea
                      id="notes"
                      value={newSessionData.notes}
                      onChange={(e) => setNewSessionData({ ...newSessionData, notes: e.target.value })}
                      placeholder="Observações sobre o paciente durante a sessão..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homework">Tarefas de Casa</Label>
                    <Textarea
                      id="homework"
                      value={newSessionData.homework}
                      onChange={(e) => setNewSessionData({ ...newSessionData, homework: e.target.value })}
                      placeholder="Atividades ou reflexões recomendadas para o paciente..."
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addingSession}>
                    {addingSession && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Sessão
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-medical-record">
            {/* Add New Medical Record Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Registrar Prontuário Médico
                </CardTitle>
                <CardDescription>Adicione um novo diagnóstico, prescrição ou notas gerais.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddMedicalRecord} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnóstico</Label>
                    <Input
                      id="diagnosis"
                      value={newMedicalRecordData.diagnosis}
                      onChange={(e) => setNewMedicalRecordData({ ...newMedicalRecordData, diagnosis: e.target.value })}
                      placeholder="Ex: Transtorno de Ansiedade Generalizada"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prescription">Prescrição</Label>
                    <Textarea
                      id="prescription"
                      value={newMedicalRecordData.prescription}
                      onChange={(e) => setNewMedicalRecordData({ ...newMedicalRecordData, prescription: e.target.value })}
                      placeholder="Medicamentos, dosagem, frequência..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medical_notes">Notas Médicas Gerais</Label>
                    <Textarea
                      id="medical_notes"
                      value={newMedicalRecordData.notes}
                      onChange={(e) => setNewMedicalRecordData({ ...newMedicalRecordData, notes: e.target.value })}
                      placeholder="Observações gerais sobre o estado de saúde do paciente..."
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addingMedicalRecord}>
                    {addingMedicalRecord && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrar Prontuário
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions-history">
            {/* Sessions History Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Histórico de Sessões de Terapia
                </CardTitle>
                <CardDescription>Todas as sessões de terapia registradas para este paciente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                {isLoadingSessions ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : patientSessions && patientSessions.length > 0 ? (
                  patientSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4 space-y-2">
                      <p className="font-semibold text-lg flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        {format(new Date(session.session_date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {session.session_theme && <p><span className="font-medium">Tema:</span> {session.session_theme}</p>}
                      {session.interventions_used && <p><span className="font-medium">Intervenções:</span> {session.interventions_used}</p>}
                      {session.notes && <p><span className="font-medium">Notas:</span> {session.notes}</p>}
                      {session.homework && <p><span className="font-medium">Tarefas:</span> {session.homework}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhuma sessão registrada para este paciente.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical-records-history">
            {/* Medical Records History Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Histórico de Prontuários Médicos
                </CardTitle>
                <CardDescription>Todos os prontuários médicos gerais registrados para este paciente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
                {isLoadingMedicalRecords ? (
                  <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : patientMedicalRecords && patientMedicalRecords.length > 0 ? (
                  patientMedicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-lg flex items-center gap-2">
                          <CalendarDays className="h-5 w-5 text-muted-foreground" />
                          {format(new Date(record.created_at!), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => handleEditRecord(record)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      {record.diagnosis && <p><span className="font-medium">Diagnóstico:</span> {record.diagnosis}</p>}
                      {record.prescription && <p><span className="font-medium">Prescrição:</span> {record.prescription}</p>}
                      {record.notes && <p><span className="font-medium">Notas:</span> {record.notes}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum prontuário médico registrado para este paciente.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {recordToEdit && (
        <EditMedicalRecordDialog
          record={recordToEdit}
          open={isEditRecordDialogOpen}
          onOpenChange={setIsEditRecordDialogOpen}
          onRecordUpdated={handleRecordUpdated}
        />
      )}
    </div>
  );
};