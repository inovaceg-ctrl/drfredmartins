CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  -- Substitua 'SEU_PROJECT_ID_AQUI' pelo seu Project ID do Supabase
  SUPABASE_PROJECT_ID TEXT := 'fusqpjescampwoyazceu'; -- Seu Project ID real
  FUNCTION_NAME TEXT := 'send-contact-email';
  FUNCTION_URL TEXT;
BEGIN
  FUNCTION_URL := 'https://' || SUPABASE_PROJECT_ID || '.supabase.co/functions/v1/' || FUNCTION_NAME;

  -- Chama a Edge Function com os dados da nova mensagem
  -- O corpo agora é explicitamente convertido para jsonb
  -- E o cabeçalho 'Content-Type: application/json' é usado por padrão pela função http_post
  PERFORM net.http_post(
    FUNCTION_URL,
    json_build_object('record', NEW)::jsonb -- Corrigido para jsonb
  );
  
  RETURN NEW;
END;
$$;