import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, UploadCloud, MessageSquareText, Clock, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { formatPhone } from '@/lib/format-phone'; // Importar formatPhone

interface WhatsappTranscriptionFormProps {
  onTranscriptionSuccess?: () => void;
}

export const WhatsappTranscriptionForm: React.FC<WhatsappTranscriptionFormProps> = ({ onTranscriptionSuccess }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [conversationName, setConversationName] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploading(true);

    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem.",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar transcrições.",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const userId = user.data.user.id;
    const fileExtension = selectedFile.name.split('.').pop();
    const filePath = `${userId}/${Date.now()}.${fileExtension}`; // user_id/timestamp.ext

    let imageUrl: string | null = null;

    try {
      // 1. Upload da imagem para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('whatsapp_screenshots')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Obter a URL pública do arquivo (para exibição)
      const { data: publicUrlData } = supabase.storage
        .from('whatsapp_screenshots')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrlData.publicUrl;

      // 3. Inserir os dados da transcrição no banco de dados
      const { error: dbError } = await supabase
        .from('whatsapp_transcriptions')
        .insert({
          user_id: userId,
          original_image_url: imageUrl,
          conversation_name: conversationName || null,
          start_time: startTime ? new Date(startTime).toISOString() : null,
          end_time: endTime ? new Date(endTime).toISOString() : null,
          transcribed_text: transcribedText || null,
        });

      if (dbError) {
        // Se a inserção no DB falhar, tentar remover o arquivo do storage
        if (uploadData?.path) {
          await supabase.storage.from('whatsapp_screenshots').remove([uploadData.path]);
        }
        throw dbError;
      }

      toast({
        title: "Sucesso",
        description: "Transcrição e imagem enviadas com sucesso!",
      });
      
      // Resetar o formulário
      setSelectedFile(null);
      setConversationName('');
      setStartTime('');
      setEndTime('');
      setTranscribedText('');
      if (onTranscriptionSuccess) {
        onTranscriptionSuccess();
      }

    } catch (error: any) {
      console.error('Erro ao enviar transcrição:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a transcrição.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <UploadCloud className="h-6 w-6 text-primary" />
        Nova Transcrição de WhatsApp
      </h2>
      <p className="text-muted-foreground">
        Faça o upload de um print e insira os detalhes da conversa.
      </p>

      <div className="space-y-2">
        <Label htmlFor="screenshot-file">Print da Conversa (Imagem)</Label>
        <Input
          id="screenshot-file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
          className="file:text-primary file:font-medium file:bg-primary/10 file:border-primary/20 file:rounded-md file:px-3 file:py-1.5 file:mr-3"
        />
        {selectedFile && (
          <p className="text-sm text-muted-foreground">Arquivo selecionado: {selectedFile.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="conversation-name">Nome da Conversa/Contato</Label>
        <Input
          id="conversation-name"
          value={conversationName}
          onChange={(e) => setConversationName(e.target.value)}
          placeholder="Ex: João Silva, Grupo Família"
          className="bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time">Hora de Início</Label>
          <Input
            id="start-time"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">Hora Final</Label>
          <Input
            id="end-time"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transcribed-text">Texto Transcrito da Conversa</Label>
        <Textarea
          id="transcribed-text"
          value={transcribedText}
          onChange={(e) => setTranscribedText(e.target.value)}
          placeholder="Cole ou digite aqui o texto da conversa..."
          rows={8}
          className="bg-background"
        />
      </div>

      <Button type="submit" className="w-full" disabled={uploading}>
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <UploadCloud className="mr-2 h-4 w-4" />
            Salvar Transcrição
          </>
        )}
      </Button>
    </form>
  );
};