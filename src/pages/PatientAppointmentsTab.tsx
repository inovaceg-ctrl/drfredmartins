import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle, Hourglass, XCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User } from "@supabase/supabase-js";
import { formatPhone } from "@/lib/format-phone"; // Importar formatPhone

interface PatientAppointmentsTabProps {
  user: User;
  onAppointmentsChanged: () => void; // Callback to notify parent of changes
}

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  doctor_profile?: {
    id: string;
    full_name: string;
    specialty?: string;
  };
}

export const PatientAppointmentsTab: React.FC<PatientAppointmentsTabProps> = ({ user, onAppointmentsChanged }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { toast } = useToast();

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    
    const { data: appointmentsData, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', user.id)
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error("PatientAppointmentsTab: Error fetching patient appointments:", error);
      toast({
        title: "Erro ao carregar consultas",
        description: error.message,
        variant: "destructive",
      });
    } else if (appointmentsData && appointmentsData.length > 0) {
      const doctorIds = [...new Set(appointmentsData.map((a: any) => a.doctor_id))];
      const { data: doctorProfiles, error: doctorError } = await supabase
        .rpc('get_doctor_profiles_by_ids', { _ids: doctorIds });

      if (doctorError) {
        console.error("PatientAppointmentsTab: Error fetching doctor profiles for appointments:", doctorError);
        toast({
          title: "Erro ao carregar perfis de médicos",
          description: doctorError.message,
          variant: "destructive",
        });
      }
      const appointmentsWithDoctors = appointmentsData.map((apt: any) => ({
        ...apt,
        doctor_profile: doctorProfiles?.find((p: any) => p.id === apt.doctor_id)
      }));
      setAppointments(appointmentsWithDoctors);
    } else {
      setAppointments([]);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const deleteAppointment = useCallback(async (appointmentId: string, slotId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para excluir agendamentos.",
        variant: "destructive",
      });
      return;
    }

    // First, delete the appointment
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('patient_id', user.id);

    if (deleteError) {
      console.error("PatientAppointmentsTab: Error deleting appointment:", deleteError);
      toast({
        title: "Erro ao excluir",
        description: deleteError.message || "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Agendamento Excluído",
        description: "Sua consulta foi excluída com sucesso.",
      });
      // If deletion is successful, also mark the slot as available again
      if (slotId) {
        const { error: slotUpdateError } = await supabase
          .from('availability_slots')
          .update({ is_available: true })
          .eq('id', slotId);
        
        if (slotUpdateError) {
          console.error("PatientAppointmentsTab: Error reverting slot availability:", slotUpdateError);
          toast({
            title: "Aviso",
            description: "Agendamento excluído, mas houve um erro ao liberar o horário. Contate o suporte.",
            variant: "destructive",
          });
        }
      }
      onAppointmentsChanged(); // Notify parent to refresh
    }
  }, [user, toast, onAppointmentsChanged]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Hourglass className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minhas Consultas</CardTitle>
        <CardDescription>Visualize suas consultas agendadas e seus detalhes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg shadow-sm"
          >
            <div className="space-y-1 mb-2 sm:mb-0">
              <p className="font-semibold text-lg">
                Dr(a). {apt.doctor_profile?.full_name || 'Médico Desconhecido'}
              </p>
              {apt.doctor_profile?.specialty && (
                <p className="text-sm text-muted-foreground">
                  Especialidade: {apt.doctor_profile.specialty}
                </p>
              )}
              <p className="text-md">
                <Calendar className="inline-block h-4 w-4 mr-1 text-primary" />
                Data: {format(new Date(apt.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <p className="text-md">
                <Clock className="inline-block h-4 w-4 mr-1 text-primary" />
                Horário: {format(new Date(apt.start_time), "HH:mm")} - {format(new Date(apt.end_time), "HH:mm")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(apt.status)}
              <p className="text-md font-medium">
                Status: {getStatusText(apt.status)}
              </p>
              {apt.status === 'pending' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteAppointment(apt.id, apt.slot_id)}
                  className="ml-4"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Excluir
                </Button>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma consulta agendada. Agende sua primeira consulta na aba "Agendar"!
          </p>
        )}
      </CardContent>
    </Card>
  );
};