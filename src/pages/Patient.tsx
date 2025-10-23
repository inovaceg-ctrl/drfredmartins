import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, FileText, LogOut, Video, LayoutGrid, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { OnlineConsultationTab } from "@/components/OnlineConsultationTab";
import PatientDocumentsPage from "@/pages/PatientDocumentsPage";

// Importar os novos componentes modulares
import { PatientOverviewTab } from "@/components/patient/PatientOverviewTab";
import { PatientScheduleTab } from "@/components/patient/PatientScheduleTab";
import { PatientAppointmentsTab } from "@/components/patient/PatientAppointmentsTab";

const Patient = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const { toast } = useToast();

  const fetchPatientProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error("Patient.tsx: Error fetching patient profile:", error);
      toast({
        title: "Erro ao carregar perfil do paciente",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setPatientProfile(data);
    }
  }, [toast]);

  // Centralized auth state management for this component
  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_OUT') {
        setPatientProfile(null);
        navigate("/auth");
      } else if (session?.user) {
        await fetchPatientProfile(session.user.id);
      } else {
        navigate("/auth");
      }
    };

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        await fetchPatientProfile(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, fetchPatientProfile]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Você foi desconectado(a).",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Portal do Paciente</h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo(a), {patientProfile?.full_name || user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-col bg-muted p-1 rounded-lg border md:flex-row md:flex-nowrap md:overflow-x-auto md:scrollbar-hide md:justify-start">
            <TabsTrigger value="overview" className="px-3 py-2 text-sm whitespace-nowrap md:w-auto md:px-6 md:py-3 md:text-base">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Início
            </TabsTrigger>
            <TabsTrigger value="schedule" className="px-3 py-2 text-sm whitespace-nowrap md:w-auto md:px-6 md:py-3 md:text-base">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </TabsTrigger>
            <TabsTrigger value="appointments" className="px-3 py-2 text-sm whitespace-nowrap md:w-auto md:px-6 md:py-3 md:text-base">
              <Clock className="h-4 w-4 mr-2" />
              Consultas
            </TabsTrigger>
            <TabsTrigger value="online-consultation" className="px-3 py-2 text-sm whitespace-nowrap md:w-auto md:px-6 md:py-3 md:text-base">
              <MessageSquare className="h-4 w-4 mr-2" />
              Consulta Online
            </TabsTrigger>
            <TabsTrigger value="documents" className="px-3 py-2 text-sm whitespace-nowrap md:w-auto md:px-6 md:py-3 md:text-base">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <PatientOverviewTab setActiveTab={setActiveTab} />
          </TabsContent>

          <TabsContent value="schedule">
            <PatientScheduleTab
              user={user}
              setActiveTab={setActiveTab}
              onAppointmentBooked={() => {
                // This callback will trigger a re-fetch in PatientAppointmentsTab
                // by changing the key or directly calling a refetch function if passed down.
                // For simplicity, we'll just rely on the Appointments tab re-fetching on mount/tab change.
              }}
            />
          </TabsContent>

          <TabsContent value="appointments">
            <PatientAppointmentsTab
              user={user}
              onAppointmentsChanged={() => {
                // This callback can be used to refresh data in other tabs if needed
                // For now, it just ensures the appointments tab itself refreshes.
              }}
            />
          </TabsContent>

          <TabsContent value="online-consultation">
            {user && <OnlineConsultationTab currentUserId={user.id} />}
          </TabsContent>

          <TabsContent value="documents">
            {user && <PatientDocumentsPage />}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Patient;