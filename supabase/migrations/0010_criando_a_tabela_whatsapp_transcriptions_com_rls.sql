-- Tabela para armazenar as transcrições de conversas do WhatsApp
CREATE TABLE public.whatsapp_transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  original_image_url TEXT, -- URL do print no Supabase Storage
  conversation_name TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  transcribed_text TEXT, -- O texto completo extraído do print
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) para a tabela whatsapp_transcriptions
ALTER TABLE public.whatsapp_transcriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para whatsapp_transcriptions
-- Usuários podem ver suas próprias transcrições
CREATE POLICY "Users can view their own whatsapp transcriptions" ON public.whatsapp_transcriptions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Usuários podem inserir suas próprias transcrições
CREATE POLICY "Users can insert their own whatsapp transcriptions" ON public.whatsapp_transcriptions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias transcrições
CREATE POLICY "Users can update their own whatsapp transcriptions" ON public.whatsapp_transcriptions
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias transcrições
CREATE POLICY "Users can delete their own whatsapp transcriptions" ON public.whatsapp_transcriptions
FOR DELETE TO authenticated USING (auth.uid() = user_id);