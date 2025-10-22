import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { WhatsappTranscriptionForm } from '@/components/WhatsappTranscriptionForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquareText, Image, Clock, CalendarDays, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type WhatsappTranscription = Database['public']['Tables']['whatsapp_transcriptions']['Row'];

export const WhatsappTranscriptionsPage: React.FC = () => {
  const { toast } = useToast();
  const [transcriptions, setTranscriptions] = useState<WhatsappTranscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTranscriptions = async () => {
    setLoading(true);
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para ver as transcrições.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('whatsapp_transcriptions')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar transcrições:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transcrições.",
        variant: "destructive",
      });
    } else {
      setTranscriptions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const handleTranscriptionSuccess = () => {
    fetchTranscriptions();
  };

  const handleDeleteTranscription = async (id: string, imageUrl: string | null) => {
    setDeletingId(id);
    try {
      // 1. Deletar a entrada do banco de dados
      const { error: dbError } = await supabase
        .from('whatsapp_transcriptions')
        .delete()
        .eq('id', id);

      if (dbError) {
        throw dbError;
      }

      // 2. Se houver uma imagem associada, tentar deletá-la do storage
      if (imageUrl) {
        const filePath = imageUrl.split('whatsapp_screenshots/')[1]; // Extrai o caminho do arquivo
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('whatsapp_screenshots')
            .remove([filePath]);

          if (storageError) {
            console.warn('Aviso: Erro ao deletar imagem do storage, mas a transcrição foi removida do DB:', storageError);
          }
        }
      }

      toast({
        title: "Sucesso",
        description: "Transcrição deletada com sucesso!",
      });
      fetchTranscriptions(); // Atualiza a lista
    } catch (error: any) {
      console.error('Erro ao deletar transcrição:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível deletar a transcrição.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <WhatsappTranscriptionForm onTranscriptionSuccess={handleTranscriptionSuccess} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-6 w-6 text-primary" />
            Minhas Transcrições
          </CardTitle>
          <CardDescription>
            Visualize e gerencie suas transcrições de conversas do WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : transcriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma transcrição encontrada. Comece enviando uma acima!
            </p>
          ) : (
            <div className="space-y-4">
              {transcriptions.map((transcription) => (
                <div key={transcription.id} className="border rounded-lg p-4 shadow-sm bg-background">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{transcription.conversation_name || 'Conversa Sem Nome'}</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTranscription(transcription.id, transcription.original_image_url)}
                      disabled={deletingId === transcription.id}
                    >
                      {deletingId === transcription.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {transcription.start_time && (
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Início: {format(new Date(transcription.start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                    {transcription.end_time && (
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Fim: {format(new Date(transcription.end_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                    {transcription.original_image_url && (
                      <p className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-primary" />
                        <a 
                          href={transcription.original_image_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          Ver Print Original
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <p className="font-medium text-foreground mb-2">Texto Transcrito:</p>
                    <p className="text-sm whitespace-pre-wrap">{transcription.transcribed_text || 'Nenhum texto transcrito.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};