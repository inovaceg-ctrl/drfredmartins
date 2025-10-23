import React, { useRef, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PhoneCall, PhoneOff, Video, VideoOff, Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface VideoCallWindowProps {
  currentUserId: string;
  otherUserId: string;
  appointmentId?: string;
  isInitiator: boolean;
  onEndCall: () => void;
  initialSessionId?: string;
  incomingOffer?: RTCSessionDescriptionInit; // Nova prop para passar a oferta diretamente
}

export const VideoCallWindow: React.FC<VideoCallWindowProps> = ({
  currentUserId,
  otherUserId,
  appointmentId,
  isInitiator,
  onEndCall,
  initialSessionId,
  incomingOffer, // Usar esta prop
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "ringing" | "active" | "ended">("idle");
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const { toast } = useToast();

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const setupPeerConnection = useCallback(async () => {
    console.log("VideoCallWindow: Setting up PeerConnection.");
    peerConnection.current = new RTCPeerConnection(servers);

    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream.current;
      }
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, localStream.current!);
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
      toast({
        title: "Erro de Mídia",
        description: "Não foi possível acessar câmera ou microfone. Verifique as permissões.",
        variant: "destructive",
      });
      throw err; // Propagate error to prevent further connection issues
    }

    peerConnection.current.ontrack = (event) => {
      console.log("VideoCallWindow: Remote track received.");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current.onicecandidate = async (event) => {
      if (event.candidate && sessionId) {
        console.log("VideoCallWindow: ICE candidate generated:", event.candidate);
        // Fetch current ice_candidates to append, not overwrite
        const { data: currentSession, error: fetchError } = await supabase
          .from("video_sessions")
          .select("ice_candidates")
          .eq("id", sessionId)
          .single();

        if (fetchError) {
          console.error("Error fetching current ICE candidates:", fetchError);
          return;
        }

        const existingCandidates = (currentSession?.ice_candidates || []) as any[];
        const updatedCandidates = [...existingCandidates, event.candidate.toJSON()];

        await supabase
          .from("video_sessions")
          .update({
            ice_candidates: updatedCandidates,
          })
          .eq("id", sessionId);
      }
    };
  }, [sessionId, toast]);

  const createOffer = useCallback(async () => {
    if (!peerConnection.current || !sessionId) return;

    console.log("VideoCallWindow: Creating offer.");
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    await supabase
      .from("video_sessions")
      .update({ offer: peerConnection.current.localDescription })
      .eq("id", sessionId);
    console.log("VideoCallWindow: Offer created and saved to Supabase.");
  }, [sessionId]);

  const handleAcceptCall = useCallback(async (incomingSessionId: string, offer: RTCSessionDescriptionInit) => {
    console.log("VideoCallWindow: handleAcceptCall triggered. Session ID:", incomingSessionId, "Offer:", offer);
    setCallStatus("active");
    setSessionId(incomingSessionId);
    
    try {
      await setupPeerConnection();
      
      // Add a small delay to ensure remote description is ready
      await new Promise(resolve => setTimeout(resolve, 500)); 

      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(offer));
      console.log("VideoCallWindow: Remote description set from incoming offer.");

      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      console.log("VideoCallWindow: Local answer created and set.");

      await supabase
        .from("video_sessions")
        .update({ answer: peerConnection.current?.localDescription, status: "active", started_at: new Date().toISOString() })
        .eq("id", incomingSessionId);
      console.log("VideoCallWindow: Answer saved to Supabase, session status updated to active.");

      toast({ title: "Chamada aceita", description: "Conectando..." });
    } catch (err: any) {
      console.error("VideoCallWindow: Error accepting call:", err);
      toast({
        title: "Erro ao aceitar chamada",
        description: err.message || "Não foi possível aceitar a chamada. Verifique o console.",
        variant: "destructive",
      });
      handleEndCall(); // End call on error
    }
  }, [setupPeerConnection, toast, handleEndCall]);

  const handleCall = useCallback(async () => {
    setCallStatus("connecting");
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    console.log("VideoCallWindow: Initiating new call with session ID:", newSessionId);

    try {
      const { error } = await supabase.from("video_sessions").insert({
        id: newSessionId,
        user_id: currentUserId, // Initiator
        patient_id: isInitiator ? currentUserId : otherUserId,
        doctor_id: isInitiator ? otherUserId : currentUserId,
        room_id: newSessionId,
        status: "ringing",
        appointment_id: appointmentId,
        ice_candidates: [], // Initialize with empty array
      });

      if (error) {
        console.error("Error creating video session:", error);
        console.error("Supabase insert error details:", error.message, error.details, error.hint, error.code);
        throw new Error(`Não foi possível iniciar a chamada. Detalhes: ${error.message || "Verifique o console para mais informações."}`);
      }
      console.log("VideoCallWindow: Video session entry created in Supabase.");

      await setupPeerConnection();
      await createOffer();
      toast({ title: "Chamada iniciada", description: "Aguardando o médico aceitar..." });
    } catch (error: any) {
      console.error("VideoCallWindow: Error in handleCall:", error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
      setCallStatus("idle");
      setSessionId(null);
    }
  }, [currentUserId, otherUserId, appointmentId, isInitiator, setupPeerConnection, createOffer, toast]);

  const handleEndCall = useCallback(async () => {
    console.log("VideoCallWindow: Ending call for session:", sessionId);
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (sessionId) {
      await supabase
        .from("video_sessions")
        .update({ status: "ended", ended_at: new Date().toISOString() })
        .eq("id", sessionId);
      console.log("VideoCallWindow: Session status updated to ended in Supabase.");
    }
    setCallStatus("ended");
    setSessionId(null);
    onEndCall();
    toast({ title: "Chamada encerrada" });
  }, [sessionId, onEndCall, toast]);

  const toggleMute = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
      console.log("VideoCallWindow: Audio toggled. Muted:", !isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setIsVideoOff(!isVideoOff);
      console.log("VideoCallWindow: Video toggled. Video Off:", !isVideoOff);
    }
  };

  useEffect(() => {
    console.log("VideoCallWindow useEffect: initialSessionId:", initialSessionId, "isInitiator:", isInitiator, "incomingOffer:", incomingOffer);
    if (initialSessionId && !isInitiator && incomingOffer) {
      console.log("VideoCallWindow useEffect: Doctor joining with initialSessionId and incomingOffer. Calling handleAcceptCall.");
      handleAcceptCall(initialSessionId, incomingOffer);
    } else if (initialSessionId && !isInitiator && !incomingOffer) {
      console.warn("VideoCallWindow useEffect: Doctor joining without incomingOffer. Fetching session data as fallback.");
      const fetchSession = async () => {
        const { data, error } = await supabase
          .from("video_sessions")
          .select("*")
          .eq("id", initialSessionId)
          .single();

        if (error) {
          console.error("VideoCallWindow useEffect: Fallback fetch failed with Supabase error:", error);
          toast({ title: "Erro", description: `Sessão de chamada inválida ou expirada (fallback): ${error.message}`, variant: "destructive" });
          onEndCall();
          return;
        }
        if (!data) {
          console.error("VideoCallWindow useEffect: Fallback fetch failed: No session data found for ID:", initialSessionId);
          toast({ title: "Erro", description: "Sessão de chamada inválida ou expirada (fallback): Nenhuma sessão encontrada.", variant: "destructive" });
          onEndCall();
          return;
        }
        if (!data.offer) {
          console.error("VideoCallWindow useEffect: Fallback fetch failed: Session data found, but no offer present for ID:", initialSessionId, "Data:", data);
          toast({ title: "Erro", description: "Sessão de chamada inválida ou expirada (fallback): Oferta não encontrada na sessão.", variant: "destructive" });
          onEndCall();
          return;
        }
        console.log("VideoCallWindow useEffect: Fallback fetch successful, data.offer:", data.offer);
        handleAcceptCall(initialSessionId, data.offer as RTCSessionDescriptionInit);
      };
      fetchSession();
    } else if (isInitiator && !initialSessionId) {
      console.log("VideoCallWindow useEffect: Initiator mode, waiting for handleCall button click.");
      // Call is initiated via button click, not on mount
    }
  }, [initialSessionId, isInitiator, incomingOffer, handleAcceptCall, onEndCall, toast]);

  useEffect(() => {
    if (!sessionId) return;

    console.log("VideoCallWindow: Subscribing to real-time changes for video_session:", sessionId);
    const channel = supabase
      .channel(`video_session_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_sessions",
          filter: `id=eq.${sessionId}`,
        },
        async (payload) => {
          const updatedSession = payload.new as any;
          console.log("VideoCallWindow: Real-time update received for session:", updatedSession);

          if (updatedSession.status === "active" && callStatus === "connecting") {
            setCallStatus("active");
            toast({ title: "Chamada conectada!" });
          } else if (updatedSession.status === "ended" && callStatus !== "ended") {
            handleEndCall();
          }

          if (peerConnection.current && updatedSession.answer && !peerConnection.current.currentRemoteDescription) {
            console.log("VideoCallWindow: Received answer via real-time, setting remote description.");
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(updatedSession.answer));
          }

          if (peerConnection.current && updatedSession.ice_candidates && updatedSession.ice_candidates.length > 0) {
            console.log("VideoCallWindow: Received ICE candidates via real-time.");
            for (const candidate of updatedSession.ice_candidates) {
              // Check if candidate is already added to avoid duplicates
              // This check is simplified, a more robust solution might involve tracking added candidates
              if (candidate && !peerConnection.current.remoteDescription?.sdp.includes(candidate.candidate)) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("VideoCallWindow: Unsubscribing from real-time channel for session:", sessionId);
      supabase.removeChannel(channel);
    };
  }, [sessionId, callStatus, handleEndCall, toast]);

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg p-4">
      <div className="flex-1 relative bg-black rounded-md overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-32 h-24 md:w-48 md:h-36 object-cover rounded-md border-2 border-white/30"
        />
        {callStatus === "connecting" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-lg">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            Conectando...
          </div>
        )}
        {callStatus === "ringing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-lg">
            <PhoneCall className="h-8 w-8 animate-pulse mr-2" />
            Chamando...
          </div>
        )}
        {callStatus === "idle" && !isInitiator && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-lg">
            Aguardando chamada...
          </div>
        )}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        {callStatus === "idle" && isInitiator && (
          <Button onClick={handleCall} disabled={callStatus !== "idle"}>
            <PhoneCall className="h-5 w-5 mr-2" />
            Iniciar Chamada
          </Button>
        )}
        {callStatus === "active" && (
          <>
            <Button variant="outline" onClick={toggleMute}>
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button variant="outline" onClick={toggleVideo}>
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
            <Button variant="destructive" onClick={handleEndCall}>
              <PhoneOff className="h-5 w-5 mr-2" />
              Encerrar
            </Button>
          </>
        )}
        {(callStatus === "connecting" || callStatus === "ringing") && (
          <Button variant="destructive" onClick={handleEndCall}>
            <PhoneOff className="h-5 w-5 mr-2" />
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};