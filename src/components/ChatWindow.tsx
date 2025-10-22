import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChatWindowProps {
  currentUserId: string;
  otherUserId: string;
  appointmentId?: string;
  isDoctor: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_name?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUserId,
  otherUserId,
  appointmentId,
  isDoctor,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("patient_doctor_messages")
      .select(`
        *,
        sender:sender_id(full_name)
      `)
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens.",
        variant: "destructive",
      });
    } else {
      const formattedMessages = data.map(msg => ({
        ...msg,
        sender_name: (msg.sender as { full_name: string })?.full_name || "Usuário Desconhecido"
      }));
      setMessages(formattedMessages as Message[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat_room_${currentUserId}_${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "patient_doctor_messages",
          filter: `sender_id=eq.${otherUserId}`, // Listen for messages from the other user
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as Message;
            // Fetch sender name for the new message
            supabase.from('profiles').select('full_name').eq('id', newMessage.sender_id).single()
              .then(({ data: senderProfile, error }) => {
                if (!error && senderProfile) {
                  setMessages((prev) => [...prev, { ...newMessage, sender_name: senderProfile.full_name }]);
                } else {
                  setMessages((prev) => [...prev, newMessage]);
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    setSending(true);
    const { data, error } = await supabase
      .from("patient_doctor_messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        appointment_id: appointmentId,
        content: newMessage.trim(),
        is_read: false,
      })
      .select(`
        *,
        sender:sender_id(full_name)
      `);

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } else if (data) {
      const sentMessage = data[0];
      setMessages((prev) => [...prev, { ...sentMessage, sender_name: (sentMessage.sender as { full_name: string })?.full_name || "Você" }]);
      setNewMessage("");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === currentUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender_id === currentUserId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <p className="font-semibold text-sm mb-1">
                {msg.sender_id === currentUserId ? "Você" : msg.sender_name}
              </p>
              <p>{msg.content}</p>
              <span className="block text-xs text-right mt-1 opacity-70">
                {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex p-4 border-t gap-2">
        <Input
          type="text"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          disabled={sending}
        />
        <Button type="submit" disabled={sending}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};