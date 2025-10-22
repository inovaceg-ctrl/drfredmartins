-- Substitua 'fusqpjescampwoyazceu' pelo seu Project ID real do Supabase
-- Este comando recria a função e o trigger, garantindo que estejam atualizados.

-- 1. Recriar a função que chama a Edge Function
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- Substitua 'fusqpjescampwoyazceu' pelo seu Project ID do Supabase
  SUPABASE_PROJECT_ID TEXT := 'fusqpjescampwoyazceu'; 
  FUNCTION_NAME TEXT := 'send-contact-email';
  FUNCTION_URL TEXT;
BEGIN
  FUNCTION_URL := 'https://' || SUPABASE_PROJECT_ID || '.supabase.co/functions/v1/' || FUNCTION_NAME;

  -- Chama a Edge Function com os dados da nova mensagem
  PERFORM http_post(
    FUNCTION_URL,
    json_build_object('record', NEW)::text,
    'application/json'
  );
  
  RETURN NEW;
END;
$$;

-- 2. Recriar o trigger para executar a função após cada INSERT
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();

-- 3. (Opcional) Verificar se a tabela 'messages' existe e tem a estrutura esperada
-- Esta parte não cria a tabela, mas serve como um lembrete do que ela deve conter.
-- Se a tabela não existir, você precisará criá-la primeiro.
-- A estrutura esperada é:
-- CREATE TABLE IF NOT EXISTS public.messages (
--     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--     name TEXT NOT NULL DEFAULT 'Não Informado',
--     email TEXT,
--     phone TEXT NOT NULL DEFAULT 'Não Informado',
--     content TEXT NOT NULL,
--     is_read BOOLEAN NOT NULL DEFAULT FALSE,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;