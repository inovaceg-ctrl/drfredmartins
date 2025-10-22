import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Video, Loader2, PhoneCall, PhoneOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatWindow } from "@/components/ChatWindow";
import { VideoCallWindow } from "@/components/VideoCallWindow";
import { IncomingCallNotification } from "@/components/IncomingCallNotification";
import { toast as sonnerToast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DoctorOnlineConsultationTabProps {
  currentUserId: string;
}

interface PatientProfile {
  id: string;
  full_name: string;
}

interface ActiveSession {
  id: string;
  patient_id: string;
  doctor_id: string;
  room_id: string;
  status: string;
  created_at: string;
  patient_profile?: PatientProfile;
  offer?: any;
}

export const DoctorOnlineConsultationTab: React.FC<DoctorOnlineConsultationTabProps> = ({ currentUserId }) => {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [mode, setMode] = useState<"idle" | "chat" | "video">("idle"); // idle, chat, video
  const { toast } = useToast();

  const fetchActiveSessions = useCallback(async () => {
    setLoadingSessions(true);
    const { data, error } = await supabase
      .from("video_sessions")
      .select(`
        *,
        patient_profile:patient_id(full_name)
      `)
      .eq("doctor_id", currentUserId)
      .in("status", ["ringing", "active"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active sessions:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as sessões ativas.",
        variant: "destructive",
      });
    } else {
      setActiveSessions(data as ActiveSession[]);
    }
    setLoadingSessions(false);
  }, [currentUserId, toast]);

  useEffect(() => {
    fetchActiveSessions();

    const channel = supabase
      .channel(`doctor_sessions_${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_sessions",
          filter: `doctor_id=eq.${currentUserId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newSession = payload.new as ActiveSession;
            if (newSession.status === "ringing") {
              // Show notification for incoming call
              IncomingCallNotification({
                sessionId: newSession.id,
                callerName: (newSession.patient_profile as PatientProfile)?.full_name || "Paciente Desconhecido",
                onAccept: (id) => handleAcceptCall(id, newSession.offer),
                onReject: handleRejectCall,
              });
            }
            fetchActiveSessions(); // Re-fetch to update list
          } else if (payload.eventType === "DELETE") {
            fetchActiveSessions();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchActiveSessions, toast]);

  const handleAcceptCall = useCallback(async (sessionId: string, offer: any) => {
    const sessionToAccept = activeSessions.find(s => s.id === sessionId);
    if (sessionToAccept) {
      setSelectedSession(sessionToAccept);
      setMode("video");
      // The VideoCallWindow component will handle the actual WebRTC acceptance
    }
  }, [activeSessions]);

  const handleRejectCall = useCallback(async (sessionId: string) => {
    const { error } = await supabase
      .from("video_sessions")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      console.error("Error rejecting call:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a chamada.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Chamada rejeitada" });
      fetchActiveSessions();
    }
  }, [fetchActiveSessions, toast]);

  const handleEndVideoCall = useCallback(() => {
    setMode("idle");
    setSelectedSession(null);
    fetchActiveSessions(); // Refresh sessions after call ends
  }, [fetchActiveSessions]);

  const handleOpenChat = (session: ActiveSession) => {
    setSelectedSession(session);
    setMode("chat");
  };

  const handleOpenVideo = (session: ActiveSession) => {
    setSelectedSession(session);
    setMode("video");
  };

  if (loadingSessions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mode === "chat" && selectedSession) {
    return (
      <div className="h-[600px]">
        <ChatWindow
          currentUserId={currentUserId}
          otherUserId={selectedSession.patient_id}
          appointmentId={selectedSession.appointment_id || undefined}
          isDoctor={true}
        />
        <Button variant="outline" onClick={() => setMode("idle")} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  if (mode === "video" && selectedSession) {
    return (
      <div className="h-[600px]">
        <VideoCallWindow
          currentUserId={currentUserId}
          otherUserId={selectedSession.patient_id}
          isInitiator={false} // Doctor is not the initiator when accepting
          onEndCall={handleEndVideoCall}
          initialSessionId={selectedSession.id}
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
        <CardTitle>Consultas Online</CardTitle>
        <CardDescription>
          Gerencie suas sessões de chat e videochamada com pacientes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma sessão online ativa no momento.
          </p>
        ) : (
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {session.patient_profile?.full_name || "Paciente Desconhecido"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {session.status === "ringing" ? "Chamando" : "Ativa"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Iniciada em: {format(new Date(session.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {session.status === "ringing" && (
                    <Button size="sm" onClick={() => handleAcceptCall(session.id, session.offer)}>
                      <PhoneCall className="h-4 w-4 mr-2" />
                      Aceitar
                    </Button>
                  )}
                  {session.status === "active" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleOpenChat(session)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => handleOpenVideo(session)}>
                        <Video className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleRejectCall(session.id)}>
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};