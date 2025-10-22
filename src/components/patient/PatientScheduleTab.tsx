import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PatientScheduleTab = () => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotStartTime, setSelectedSlotStartTime] = useState<string | null>(null);
  const [selectedSlotEndTime, setSelectedSlotEndTime] = useState<string | null>(null);

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_doctors_public");
      if (error) throw error;
      return data;
    },
  });

  const { data: availableDates, isLoading: isLoadingAvailableDates } = useQuery({
    queryKey: ["availableDates", selectedDoctorId],
    queryFn: async () => {
      if (!selectedDoctorId) return [];
      const { data, error } = await supabase.rpc("get_doctor_available_dates", {
        _doctor_id: selectedDoctorId,
      });
      if (error) throw error;
      return data.map((d: string) => new Date(d)); // Convert string dates to Date objects
    },
    enabled: !!selectedDoctorId,
  });

  const { data: availableSlots, isLoading: isLoadingSlots } = useQuery({
    queryKey: ["availableSlots", selectedDoctorId, selectedDate],
    queryFn: async () => {
      if (!selectedDoctorId || !selectedDate) return [];
      const { data, error } = await supabase.rpc("get_truly_available_slots", {
        _doctor_id: selectedDoctorId,
        _start_time_gte: selectedDate.toISOString(),
      });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedDoctorId && !!selectedDate,
  });

  const handleScheduleAppointment = async () => {
    if (!selectedDoctorId || !selectedSlotId || !selectedSlotStartTime || !selectedSlotEndTime) {
      toast.error("Por favor, selecione um profissional, uma data e um horário.");
      return;
    }

    const { data: userSession, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !userSession.session) {
      toast.error("Você precisa estar logado para agendar uma consulta.");
      return;
    }

    const patientId = userSession.session.user.id;

    try {
      const { data, error } = await supabase.rpc("book_slot_and_create_appointment", {
        _slot_id: selectedSlotId,
        _patient_id: patientId,
        _doctor_id: selectedDoctorId,
        _start_time: selectedSlotStartTime,
        _end_time: selectedSlotEndTime,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      toast.success("Consulta agendada com sucesso!");
      setSelectedSlotId(null);
      setSelectedSlotStartTime(null);
      setSelectedSlotEndTime(null);
      // Optionally, refetch slots to update availability
      // queryClient.invalidateQueries(["availableSlots", selectedDoctorId, selectedDate]);
    } catch (error) {
      console.error("Erro ao agendar consulta:", error);
      // toast.error("Erro ao agendar consulta. Tente novamente.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione um profissional</CardTitle>
        <CardDescription>Escolha o profissional para ver os horários disponíveis</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <label htmlFor="doctor-select" className="text-sm font-medium">
            Profissional
          </label>
          <Select
            onValueChange={(value) => {
              setSelectedDoctorId(value);
              setSelectedSlotId(null); // Reset slot when doctor changes
              setSelectedSlotStartTime(null);
              setSelectedSlotEndTime(null);
            }}
            value={selectedDoctorId || ""}
            disabled={isLoadingDoctors}
          >
            <SelectTrigger id="doctor-select">
              <SelectValue placeholder="Selecione um profissional" />
            </SelectTrigger>
            <SelectContent>
              {doctors?.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label htmlFor="date-picker" className="text-sm font-medium">
            Data
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
                disabled={!selectedDoctorId}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedSlotId(null); // Reset slot when date changes
                  setSelectedSlotStartTime(null);
                  setSelectedSlotEndTime(null);
                }}
                initialFocus
                locale={ptBR}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Normaliza para o início do dia

                  // Desabilita datas no passado
                  if (date < today) {
                    return true;
                  }

                  // Se um profissional foi selecionado e temos datas disponíveis,
                  // desabilita as datas que não estão na lista de datas disponíveis.
                  if (selectedDoctorId && availableDates) {
                    const dateString = format(date, 'yyyy-MM-dd');
                    return !availableDates.some(d => format(d, 'yyyy-MM-dd') === dateString);
                  }

                  // Se nenhum profissional foi selecionado, ou as datas disponíveis estão carregando,
                  // apenas desabilita datas passadas.
                  return false;
                }}
                modifiers={{
                  available: availableDates, // Passa o array de objetos Date
                }}
                modifiersStyles={{
                  available: { fontWeight: 'bold', color: 'hsl(var(--primary))' }, // Usa a cor primária do Tailwind
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid gap-2">
          <label htmlFor="time-slot-select" className="text-sm font-medium">
            Horário
          </label>
          <Select
            onValueChange={(value) => {
              const [slotId, startTime, endTime] = value.split("|");
              setSelectedSlotId(slotId);
              setSelectedSlotStartTime(startTime);
              setSelectedSlotEndTime(endTime);
            }}
            value={selectedSlotId ? `${selectedSlotId}|${selectedSlotStartTime}|${selectedSlotEndTime}` : ""}
            disabled={!selectedDoctorId || !selectedDate || isLoadingSlots || (availableSlots?.length === 0 && !isLoadingSlots)}
          >
            <SelectTrigger id="time-slot-select">
              <SelectValue placeholder={isLoadingSlots ? "Carregando horários..." : (availableSlots?.length === 0 ? "Nenhum horário disponível" : "Selecione um horário")} />
            </SelectTrigger>
            <SelectContent>
              {availableSlots?.map((slot) => (
                <SelectItem
                  key={slot.id}
                  value={`${slot.id}|${slot.start_time}|${slot.end_time}`}
                >
                  {format(new Date(slot.start_time), "HH:mm", { locale: ptBR })} - {format(new Date(slot.end_time), "HH:mm", { locale: ptBR })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleScheduleAppointment}
          disabled={!selectedDoctorId || !selectedDate || !selectedSlotId}
          className="w-full"
        >
          Agendar Consulta
        </Button>
      </CardContent>
    </Card>
  );
};