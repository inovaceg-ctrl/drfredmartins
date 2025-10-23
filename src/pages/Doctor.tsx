import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, Clock, FileText, LogOut, Users, Video, BarChart3, Loader2, Edit, User as UserIcon, MessageSquare, Trash2, CheckCircle, XCircle, MessageSquareText, MapPin, Phone, Mail, BookOpen, Menu } from "lucide-react"; // Adicionado Menu
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EditPatientDialog } from "@/components/EditPatientDialog";
import { formatPhone } from "@/lib/format-phone"; // Importar formatPhone
import { DoctorProfileForm } from "@/components/DoctorProfileForm";
import { DoctorOnlineConsultationTab } from "@/components/DoctorOnlineConsultationTab";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Database } from "@/integrations/supabase/types";
import { WhatsappTranscriptionsPage } from "@/pages/WhatsappTranscriptionsPage";
import { DoctorFormResponsesTab } from "@/components/DoctorFormResponsesTab";
import { DoctorMedicalRecordsTab } from "@/components/doctor/DoctorMedicalRecordsTab"; // Importar o novo componente
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const Doctor = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Estado para controlar o Drawer
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Doctor.tsx: Auth state change event:", event, "session:", session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          fetchDoctorProfile(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Doctor.tsx: Initial getSession result:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchDoctorProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchDoctorProfile = async (userId: string) => {
    console.log("Doctor.tsx: Fetching doctor profile for userId:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Doctor.tsx: Error fetching doctor profile:", error);
      toast({
        title: "Erro ao carregar perfil do doutor",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      console.log("Doctor.tsx: Doctor profile fetched:", data);
      setDoctorProfile(data);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      console.log("Doctor.tsx: User not authenticated, navigating to /auth");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && activeTab === "schedule" && selectedDate) {
      console.log("Doctor.tsx: Fetching slots for selected date:", selectedDate);
      fetchSlots();
      setSelectedSlotIds([]);
    }
  }, [user, selectedDate, activeTab]);

  useEffect(() => {
    if (user && activeTab === "appointments") {
      console.log("Doctor.tsx: Fetching appointments.");
      fetchAppointments();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && activeTab === "patients") {
      console.log("Doctor.tsx: Fetching patients.");
      fetchPatients();
    }
  }, [user, activeTab]);

  const fetchSlots = async () => {
    if (!user || !selectedDate) {
      console.log("Doctor.tsx: Skipping fetchSlots, user or selectedDate is missing.");
      return;
    }
    
    setLoadingSlots(true);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Doctor.tsx: Fetching slots for doctor ${user.id} from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);
    const { data, error } = await supabase
      .from('availability_slots')
      .select('*')
      .eq('doctor_id', user.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: true });

    if (error) {
      console.error("Doctor.tsx: Error fetching slots:", error);
      toast({
        title: "Erro ao carregar horários",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log("Doctor.tsx: Slots fetched:", data);
      setSlots(data || []);
    }
    setLoadingSlots(false);
  };

  const createDefaultSlots = async () => {
    if (!user || !selectedDate) {
      console.log("Doctor.tsx: Skipping createDefaultSlots, user or selectedDate is missing.");
      return;
    }
    
    setLoadingSlots(true);
    const newSlots: Database['public']['Tables']['availability_slots']['Insert'][] = []; // Type assertion
    const date = new Date(selectedDate);
    
    // Inicia às 8:15
    let currentSlotTime = new Date(date);
    currentSlotTime.setHours(8, 15, 0, 0);
    
    // Termina às 20:00
    const endOfDayLimit = new Date(date);
    endOfDayLimit.setHours(20, 0, 0, 0);

    // Definir o intervalo de pausa
    const breakStart = new Date(date);
    breakStart.setHours(15, 45, 0, 0);
    const breakEnd = new Date(date);
    breakEnd.setHours(16, 15, 0, 0);

    console.log("Doctor.tsx: Attempting to create slots for:", selectedDate.toISOString());
    console.log("Doctor.tsx: Doctor ID:", user.id);

    while (currentSlotTime.getTime() < endOfDayLimit.getTime()) {
      const startTime = new Date(currentSlotTime);
      const endTime = new Date(currentSlotTime.getTime() + 45 * 60 * 1000); // Adiciona 45 minutos

      // Verifica se o slot atual se sobrepõe ao intervalo de pausa
      const overlapsBreak = (startTime.getTime() < breakEnd.getTime() && endTime.getTime() > breakStart.getTime());

      if (overlapsBreak) {
        // Se o slot se sobrepõe, pula para o final do intervalo de pausa
        currentSlotTime = new Date(breakEnd);
        continue; // Pula para a próxima iteração do loop
      }

      // Se o final do slot exceder o limite de 20:00, não cria este slot
      if (endTime.getTime() > endOfDayLimit.getTime()) {
        break;
      }
      
      newSlots.push({
        doctor_id: user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_available: true,
      });
      
      currentSlotTime = endTime; // O próximo slot começa onde este termina
    }

    console.log("Doctor.tsx: Slots to insert:", newSlots);

    const { data, error } = await supabase
      .from('availability_slots')
      .insert(newSlots)
      .select(); // Adicionado .select() para ver os dados inseridos

    if (error) {
      console.error("Doctor.tsx: Error creating slots:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log("Doctor.tsx: Slots created successfully:", data);
      toast({
        title: "Sucesso",
        description: "Horários criados com sucesso!",
      });
      fetchSlots();
    }
    setLoadingSlots(false);
  };

  const toggleSlotAvailability = async (slotId: string, currentStatus: boolean) => {
    console.log(`Doctor.tsx: Toggling slot ${slotId} from ${currentStatus} to ${!currentStatus}`);
    const { data, error } = await supabase
      .from('availability_slots')
      .update({ is_available: !currentStatus })
      .eq('id', slotId)
      .select(); // Adicionado .select() para ver os dados atualizados

    if (error) {
      console.error("Doctor.tsx: Error toggling slot availability:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log("Doctor.tsx: Slot availability updated:", data);
      fetchSlots();
    }
  };

  // Handlers para seleção múltipla
  const handleSelectSlot = (slotId: string, isSelected: boolean) => {
    setSelectedSlotIds((prev) =>
      isSelected ? [...prev, slotId] : prev.filter((id) => id !== slotId)
    );
  };

  const handleSelectAllSlots = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedSlotIds(slots.map(slot => slot.id));
    } else {
      setSelectedSlotIds([]);
    }
  };

  // Ações em massa
  const handleBulkDeleteSlots = async () => {
    if (selectedSlotIds.length === 0) return;
    setLoadingSlots(true);
    console.log("Doctor.tsx: Attempting to delete slots:", selectedSlotIds);
    const { data, error } = await supabase
      .from('availability_slots')
      .delete()
      .in('id', selectedSlotIds);

    if (error) {
      console.error("Doctor.tsx: Error deleting bulk slots:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os horários selecionados.",
        variant: "destructive",
      });
    } else {
      console.log("Doctor.tsx: Slots deleted successfully:", data);
      toast({
        title: "Sucesso",
        description: `${selectedSlotIds.length} horários excluídos com sucesso!`,
      });
      setSelectedSlotIds([]);
      fetchSlots();
    }
    setLoadingSlots(false);
  };

  const handleBulkToggleAvailability = async (makeAvailable: boolean) => {
    if (selectedSlotIds.length === 0) return;
    setLoadingSlots(true);
    console.log(`Doctor.tsx: Attempting to set availability for slots ${selectedSlotIds} to ${makeAvailable}`);
    const { data, error } = await supabase
      .from('availability_slots')
      .update({ is_available: makeAvailable })
      .in('id', selectedSlotIds)
      .select(); // Adicionado .select() para ver os dados atualizados

    if (error) {
      console.error("Doctor.tsx: Error bulk toggling availability:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a disponibilidade dos horários selecionados.",
        variant: "destructive",
      });
    } else {
      console.log("Doctor.tsx: Bulk slot availability updated:", data);
      toast({
        title: "Sucesso",
        description: `${selectedSlotIds.length} horários marcados como ${makeAvailable ? 'disponíveis' : 'indisponíveis'}!`,
      });
      setSelectedSlotIds([]);
      fetchSlots();
    }
    setLoadingSlots(false);
  };

  const fetchAppointments = async () => {
    console.log("Doctor.tsx: Fetching appointments for doctor.");
    const { data: appts, error } = await supabase
      .rpc('get_appointments_for_doctor');

    if (error) {
      console.error("Doctor.tsx: Error fetching appointments:", error);
      toast({
        title: "Erro ao carregar consultas",
        description: error.message,
        variant: "destructive",
      });
    } else if (appts && appts.length > 0) {
      const withPatients = appts.map((a: any) => ({
        ...a,
        patient_profile: { 
          id: a.patient_id, 
          full_name: a.patient_full_name,
          whatsapp: a.patient_whatsapp,
          street: a.patient_street,
          street_number: a.patient_street_number,
          neighborhood: a.patient_neighborhood,
          city: a.patient_city,
          state: a.patient_state,
          zip_code: a.patient_zip_code,
        }
      }));
      console.log("Doctor.tsx: Appointments fetched:", withPatients);
      setAppointments(withPatients);
    } else {
      console.log("Doctor.tsx: No appointments found.");
      setAppointments([]);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    console.log(`Doctor.tsx: Updating appointment ${id} status to ${status}`);
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select(); // Adicionado .select() para ver os dados atualizados

    if (error) {
      console.error("Doctor.tsx: Error updating appointment status:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log("Doctor.tsx: Appointment status updated:", data);
      toast({
        title: "Sucesso",
        description: "Status atualizado!",
      });
      fetchAppointments();
    }
  };

  const fetchPatients = async () => {
    if (!user) {
      console.log("Doctor.tsx: Skipping fetchPatients, user is missing.");
      return;
    }

    console.log('Doctor.tsx: Fetching patients for doctor:', user.id);
    const { data: patientsData, error } = await supabase
      .rpc('get_patients_for_doctor');

    if (error) {
      console.error('Doctor.tsx: Error fetching patients:', error);
      toast({
        title: "Erro ao carregar pacientes",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('Doctor.tsx: Patients fetched:', patientsData);
      setPatients(patientsData || []);
    }
  };

  const handleSignOut = async () => {
    console.log("Doctor.tsx: Attempting to sign out.");
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsDrawerOpen(false); // Fecha o drawer ao selecionar uma aba
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Portal do Profissional</h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo(a), {doctorProfile?.full_name || user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          {/* Desktop TabsList */}
          <TabsList className="hidden md:flex w-full bg-muted p-1 rounded-lg border space-x-1">
            <TabsTrigger value="overview" className="px-3 py-2 text-sm whitespace-nowrap">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="profile" className="px-3 py-2 text-sm whitespace-nowrap">
              <UserIcon className="h-4 w-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="schedule" className="px-3 py-2 text-sm whitespace-nowrap">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="appointments" className="px-3 py-2 text-sm whitespace-nowrap">
              <Clock className="h-4 w-4 mr-2" />
              Consultas
            </TabsTrigger>
            <TabsTrigger value="patients" className="px-3 py-2 text-sm whitespace-nowrap">
              <Users className="h-4 w-4 mr-2" />
              Pacientes
            </TabsTrigger>
            <TabsTrigger value="medical-records" className="px-3 py-2 text-sm whitespace-nowrap">
              <BookOpen className="h-4 w-4 mr-2" />
              Prontuários
            </TabsTrigger>
            <TabsTrigger value="online-consultation" className="px-3 py-2 text-sm whitespace-nowrap">
              <MessageSquare className="h-4 w-4 mr-2" />
              Consulta Online
            </TabsTrigger>
            <TabsTrigger value="whatsapp-transcriptions" className="px-3 py-2 text-sm whitespace-nowrap">
              <MessageSquareText className="h-4 w-4 mr-2" />
              Transcrições WhatsApp
            </TabsTrigger>
            <TabsTrigger value="form-responses" className="px-3 py-2 text-sm whitespace-nowrap">
              <Mail className="h-4 w-4 mr-2" />
              Respostas Formulário
            </TabsTrigger>
          </TabsList>

          {/* Mobile Drawer Menu */}
          <div className="md:hidden mb-4">
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Menu className="h-4 w-4 mr-2" />
                  {activeTab === "overview" && "Visão Geral"}
                  {activeTab === "profile" && "Perfil"}
                  {activeTab === "schedule" && "Agenda"}
                  {activeTab === "appointments" && "Consultas"}
                  {activeTab === "patients" && "Pacientes"}
                  {activeTab === "medical-records" && "Prontuários"}
                  {activeTab === "online-consultation" && "Consulta Online"}
                  {activeTab === "whatsapp-transcriptions" && "Transcrições WhatsApp"}
                  {activeTab === "form-responses" && "Respostas Formulário"}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh] rounded-t-[10px] flex flex-col">
                <DrawerHeader className="text-left">
                  <DrawerTitle>Navegação do Portal</DrawerTitle>
                  <DrawerDescription>Selecione uma opção abaixo</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 flex-1 overflow-y-auto">
                  <TabsList className="flex flex-col w-full bg-muted p-1 rounded-lg border space-y-1">
                    <TabsTrigger value="overview" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("overview")}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("profile")}>
                      <UserIcon className="h-4 w-4 mr-2" />
                      Perfil
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("schedule")}>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Agenda
                    </TabsTrigger>
                    <TabsTrigger value="appointments" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("appointments")}>
                      <Clock className="h-4 w-4 mr-2" />
                      Consultas
                    </TabsTrigger>
                    <TabsTrigger value="patients" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("patients")}>
                      <Users className="h-4 w-4 mr-2" />
                      Pacientes
                    </TabsTrigger>
                    <TabsTrigger value="medical-records" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("medical-records")}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Prontuários
                    </TabsTrigger>
                    <TabsTrigger value="online-consultation" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("online-consultation")}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Consulta Online
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp-transcriptions" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("whatsapp-transcriptions")}>
                      <MessageSquareText className="h-4 w-4 mr-2" />
                      Transcrições WhatsApp
                    </TabsTrigger>
                    <TabsTrigger value="form-responses" className="w-full justify-start px-4 py-3 text-base whitespace-nowrap text-left" onClick={() => handleTabChange("form-responses")}>
                      <Mail className="h-4 w-4 mr-2" />
                      Respostas Formulário
                    </TabsTrigger>
                  </TabsList>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Fechar</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTabChange("profile")}>
                <CardHeader>
                  <UserIcon className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Meu Perfil</CardTitle>
                  <CardDescription>
                    Atualize seus dados pessoais e especialidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Editar Perfil</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTabChange("schedule")}>
                <CardHeader>
                  <CalendarIcon className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Gerenciar Agenda</CardTitle>
                  <CardDescription>
                    Configure seus horários disponíveis para consultas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Configurar Horários</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTabChange("appointments")}>
                <CardHeader>
                  <Clock className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Consultas Agendadas</CardTitle>
                  <CardDescription>
                    Veja e gerencie suas consultas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Ver Agenda</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTabChange("patients")}>
                <CardHeader>
                  <Users className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Meus Pacientes</CardTitle>
                  <CardDescription>
                    Acesse a lista e histórico de seus pacientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Ver Pacientes</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTabChange("medical-records")}>
                <CardHeader>
                  <BookOpen className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Prontuários</CardTitle>
                  <CardDescription>
                    Acesse e edite prontuários e sessões dos pacientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Ver Prontuários</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTabChange("online-consultation")}>
                <CardHeader>
                  <Video className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Consulta Online</CardTitle>
                  <CardDescription>
                    Inicie consultas por vídeo chamada ou chat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Iniciar Consulta</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/whatsapp-transcriptions")}>
                <CardHeader>
                  <MessageSquareText className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Transcrições WhatsApp</CardTitle>
                  <CardDescription>
                    Gerencie prints de conversas do WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Ver Transcrições</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTabChange("form-responses")}>
                <CardHeader>
                  <Mail className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>Respostas Formulário</CardTitle>
                  <CardDescription>
                    Visualize mensagens enviadas pelo formulário de contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">Ver Mensagens</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardContent className="p-6">
                {user?.id && <DoctorProfileForm userId={user.id} onProfileUpdated={() => {
                  console.log("Doctor profile updated!");
                  fetchDoctorProfile(user.id);
                }} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Selecione uma Data</CardTitle>
                  <CardDescription>Escolha o dia para gerenciar sua agenda</CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={ptBR}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    Horários para {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : ""}
                  </CardTitle>
                  <CardDescription>
                    {slots.length > 0 ? "Selecione horários para ações em massa" : "Nenhum horário cadastrado"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingSlots ? (
                    <div className="flex justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {slots.length > 0 && (
                        <div className="flex items-center justify-between pb-2 border-b">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="select-all-slots"
                              checked={selectedSlotIds.length === slots.length && slots.length > 0}
                              onCheckedChange={(checked) => handleSelectAllSlots(checked as boolean)}
                            />
                            <Label htmlFor="select-all-slots">Selecionar Todos</Label>
                          </div>
                          {selectedSlotIds.length > 0 && (
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkDeleteSlots}
                                disabled={loadingSlots}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir ({selectedSlotIds.length})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkToggleAvailability(true)}
                                disabled={loadingSlots}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Disponibilizar ({selectedSlotIds.length})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBulkToggleAvailability(false)}
                                disabled={loadingSlots}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Indisponibilizar ({selectedSlotIds.length})
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {slots.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {slots.map((slot) => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`slot-${slot.id}`}
                                  checked={selectedSlotIds.includes(slot.id)}
                                  onCheckedChange={(checked) => handleSelectSlot(slot.id, checked as boolean)}
                                />
                                <Label htmlFor={`slot-${slot.id}`} className="font-medium">
                                  {format(new Date(slot.start_time), "HH:mm")} - {format(new Date(slot.end_time), "HH:mm")}
                                </Label>
                              </div>
                              <Button
                                variant={slot.is_available ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}
                              >
                                {slot.is_available ? "Disponível" : "Indisponível"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            Nenhum horário cadastrado para esta data
                          </p>
                          <Button onClick={createDefaultSlots} disabled={loadingSlots}>
                            Gerar Horários Padrão (8:15-20:00, 45min)
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Consultas Agendadas</CardTitle>
                <CardDescription>Gerencie suas consultas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma consulta agendada
                  </p>
                ) : (
                  appointments.map((apt) => (
                    <div key={apt.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-lg">
                            {apt.patient_profile?.full_name || 'Paciente Desconhecido'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.start_time), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <Badge variant={
                          apt.status === 'confirmed' ? 'default' :
                          apt.status === 'pending' ? 'secondary' :
                          apt.status === 'completed' ? 'outline' : 'destructive'
                        }>
                          {apt.status === 'pending' ? 'Pendente' : 
                           apt.status === 'confirmed' ? 'Confirmada' : 
                           apt.status === 'completed' ? 'Concluída' : 'Cancelada'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        {apt.patient_profile?.whatsapp && (
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            WhatsApp: <a href={`https://wa.me/${apt.patient_profile.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              {formatPhone(apt.patient_profile.whatsapp)}
                            </a>
                          </p>
                        )}
                        {(apt.patient_profile?.street || apt.patient_profile?.city) && (
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Endereço: {[
                              apt.patient_profile.street && `${apt.patient_profile.street}${apt.patient_profile.street_number ? ', ' + apt.patient_profile.street_number : ''}`,
                              apt.patient_profile.neighborhood,
                              apt.patient_profile.city,
                              apt.patient_profile.state
                            ].filter(Boolean).join(' - ')}
                            {apt.patient_profile.zip_code && ` - CEP: ${apt.patient_profile.zip_code}`}
                          </p>
                        )}
                      </div>

                      {apt.notes && (
                        <p className="text-sm mb-3">
                          <span className="font-medium">Observações:</span> {apt.notes}
                        </p>
                      )}
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <Button size="sm" onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}>
                            Confirmar
                          </Button>
                        )}
                        {apt.status === 'confirmed' && (
                          <Button size="sm" onClick={() => updateAppointmentStatus(apt.id, 'completed')}>
                            Concluir
                          </Button>
                        )}
                        {(apt.status === 'pending' || apt.status === 'confirmed') && (
                          <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Meus Pacientes</CardTitle>
                <CardDescription>Lista completa de pacientes com todos os dados</CardDescription>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum paciente encontrado
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {patients.map((patient) => (
                      <div key={patient.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-lg mb-3">{patient.full_name}</p>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-muted-foreground flex-shrink-0">Data de Cadastro:</span>
                                <span className="flex-grow">{patient.created_at ? format(new Date(patient.created_at), "dd/MM/yyyy", { locale: ptBR }) : '-'}</span>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-muted-foreground flex-shrink-0">WhatsApp:</span>
                                <span className="flex-grow">{patient.whatsapp ? formatPhone(patient.whatsapp) : '-'}</span>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-muted-foreground flex-shrink-0">Endereço:</span>
                                <span className="flex-grow">
                                  {[
                                        patient.street && `${patient.street}${patient.street_number ? ', ' + patient.street_number : ''}`,
                                        patient.neighborhood,
                                        patient.city,
                                        patient.state
                                      ].filter(Boolean).join(' - ')}
                                      {patient.zip_code && ` - CEP: ${patient.zip_code}`}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPatient(patient);
                              setEditDialogOpen(true);
                            }}
                            className="ml-4 flex-shrink-0"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical-records">
            {user && <DoctorMedicalRecordsTab currentUserId={user.id} />}
          </TabsContent>

          <TabsContent value="online-consultation">
            {user && <DoctorOnlineConsultationTab currentUserId={user.id} />}
          </TabsContent>

          <TabsContent value="whatsapp-transcriptions">
            <WhatsappTranscriptionsPage />
          </TabsContent>

          <TabsContent value="form-responses">
            {user && <DoctorFormResponsesTab />}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      
      {selectedPatient && (
        <EditPatientDialog
          patient={selectedPatient}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onPatientUpdated={async () => {
            console.log('onPatientUpdated called');
            await fetchPatients();
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default Doctor;