import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, CheckCircle, Eye, EyeOff, Phone, MessageSquare, CalendarDays, MapPin, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPhone } from "@/lib/format-phone"; // Importar formatPhone
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Message = Database['public']['Tables']['messages']['Row'];

export const DoctorFormResponsesTab: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("unread");

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter === "unread") {
      query = query.eq('is_read', false);
    } else if (filter === "read") {
      query = query.eq('is_read', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens do formulário.",
        variant: "destructive",
      });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }, [filter, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleMarkAsRead = async (messageId: string, currentStatus: boolean) => {
    setUpdatingMessageId(messageId);
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: !currentStatus })
        .eq('id', messageId);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Mensagem marcada como ${!currentStatus ? 'lida' : 'não lida'}.`,
      });
      fetchMessages(); // Recarrega as mensagens para refletir a mudança
    } catch (error: any) {
      console.error('Erro ao atualizar status da mensagem:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o status da mensagem.",
        variant: "destructive",
      });
    } finally {
      setUpdatingMessageId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          Respostas do Formulário de Contato
        </CardTitle>
        <CardDescription>
          Visualize e gerencie as mensagens enviadas através do formulário do site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <ToggleGroup type="single" value={filter} onValueChange={(value: "all" | "unread" | "read") => setFilter(value)} className="bg-muted rounded-md p-1">
            <ToggleGroupItem value="unread" aria-label="Mostrar não lidas">
              <EyeOff className="h-4 w-4 mr-2" /> Não Lidas
            </ToggleGroupItem>
            <ToggleGroupItem value="read" aria-label="Mostrar lidas">
              <Eye className="h-4 w-4 mr-2" /> Lidas
            </ToggleGroupItem>
            <ToggleGroupItem value="all" aria-label="Mostrar todas">
              Todas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma mensagem encontrada com o filtro atual.
          </p>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
            {messages.map((message) => (
              <Card key={message.id} className="border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    {message.name || 'Nome não informado'}
                  </CardTitle>
                  <Badge variant={message.is_read ? "secondary" : "default"}>
                    {message.is_read ? "Lida" : "Não Lida"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Enviado em: {format(new Date(message.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {message.whatsapp && (
                      <p className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        WhatsApp: <a href={`https://wa.me/${message.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{formatPhone(message.whatsapp)}</a>
                      </p>
                    )}
                    {message.date_of_birth && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Nascimento: {format(new Date(message.date_of_birth), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                    {(message.street || message.neighborhood) && (
                      <p className="flex items-center gap-2 col-span-full">
                        <MapPin className="h-4 w-4 text-primary" />
                        Endereço: {[message.street, message.neighborhood].filter(Boolean).join(', ') || '-'}
                      </p>
                    )}
                    {(message.city || message.state) && (
                      <p className="flex items-center gap-2 col-span-full">
                        <MapPin className="h-4 w-4 text-primary" />
                        Localização: {message.city}{message.city && message.state ? ', ' : ''}{message.state} {message.zip_code && `(${message.zip_code})`}
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <p className="font-medium text-foreground mb-2">Mensagem:</p>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant={message.is_read ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleMarkAsRead(message.id, message.is_read || false)}
                      disabled={updatingMessageId === message.id}
                    >
                      {updatingMessageId === message.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : message.is_read ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" /> Marcar como Não Lida
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" /> Marcar como Lida
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};