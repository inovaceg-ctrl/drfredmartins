import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatWindow } from "@/components/ChatWindow";
import { VideoCallWindow } from "@/components/VideoCallWindow";

interface OnlineConsultationTabProps {
  currentUserId: string;
}

interface DoctorProfile {
  id: string;
  full_name: string;
}

export const OnlineConsultationTab: React.FC<OnlineConsultationTabProps> = ({ currentUserId }) => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [mode, setMode] = useState<"idle" | "chat" | "video">("idle"); // idle, chat, video
  const [activeVideoSessionId, setActiveVideoSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      const { data, error } = await (supabase as any)
        .rpc('get_doctors_public');

      if (error) {
        console.error("Error fetching doctors:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de médicos.",
          variant: "destructive",
        });
      } else {
        setDoctors(data || []);
      }
      setLoadingDoctors(false);
    };

    fetchDoctors();
  }, [toast]);

  const handleStartChat = () => {
    if (!selectedDoctorId) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um médico para iniciar o chat.",
        variant: "default",
      });
      return;
    }
    setMode("chat");
  };

  const handleStartVideoCall = () => {
    if (!selectedDoctorId) {
      toast({
        title: "Atenção",
        description: "Por favor, selecione um médico para iniciar a videochamada.",
        variant: "default",
      });
      return;
    }
    setMode("video");
  };

  const handleEndVideoCall = () => {
    setMode("idle");
    setActiveVideoSessionId(null);
  };

  if (loadingDoctors) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mode === "chat" && selectedDoctorId) {
    return (
      <div className="h-[600px]">
        <ChatWindow
          currentUserId={currentUserId}
          otherUserId={selectedDoctorId}
          isDoctor={false}
        />
        <Button variant="outline" onClick={() => setMode("idle")} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  if (mode === "video" && selectedDoctorId) {
    return (
      <div className="h-[600px]">
        <VideoCallWindow
          currentUserId={currentUserId}
          otherUserId={selectedDoctorId}
          isInitiator={true}
          onEndCall={handleEndVideoCall}
          initialSessionId={activeVideoSessionId}
        />
        <Button variant="outline" onClick={handleEndVideoCall} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar Consulta Online</CardTitle>
        <CardDescription>
          Selecione um médico para iniciar um chat ou uma videochamada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={setSelectedDoctorId} value={selectedDoctorId || ""}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um médico" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr(a). {doctor.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-4">
          <Button onClick={handleStartChat} disabled={!selectedDoctorId} className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Iniciar Chat
          </Button>
          <Button onClick={handleStartVideoCall} disabled={!selectedDoctorId} className="flex-1">
            <Video className="h-4 w-4 mr-2" />
            Iniciar Videochamada
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};