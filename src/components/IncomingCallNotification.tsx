import React from "react";
import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";
import { PhoneCall, PhoneOff } from "lucide-react";

interface IncomingCallNotificationProps {
  sessionId: string;
  callerName: string;
  onAccept: (sessionId: string) => void;
  onReject: (sessionId: string) => void;
}

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  sessionId,
  callerName,
  onAccept,
  onReject,
}) => {
  return sonnerToast.custom((t) => (
    <div className="bg-card p-4 rounded-lg shadow-lg flex items-center justify-between gap-4 w-full max-w-sm">
      <div className="flex items-center gap-3">
        <PhoneCall className="h-6 w-6 text-primary animate-pulse" />
        <div>
          <p className="font-semibold text-foreground">Chamada de {callerName}</p>
          <p className="text-sm text-muted-foreground">Deseja aceitar?</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => { onAccept(sessionId); sonnerToast.dismiss(t); }}>
          Aceitar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => { onReject(sessionId); sonnerToast.dismiss(t); }}>
          <PhoneOff className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ), { id: sessionId, duration: Infinity }); // Keep toast open indefinitely until action is taken
};