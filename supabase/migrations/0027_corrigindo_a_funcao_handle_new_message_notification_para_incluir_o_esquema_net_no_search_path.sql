CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO 'public', 'net'
AS $$
DECLARE
  SUPABASE_PROJECT_ID TEXT := 'fusqpjescampwoyazceu'; -- Seu Project ID real
  FUNCTION_NAME TEXT := 'send-contact-email';
  FUNCTION_URL TEXT;
BEGIN
  FUNCTION_URL := 'https://' || SUPABASE_PROJECT_ID || '.supabase.co/functions/v1/' || FUNCTION_NAME;

  -- Chama a Edge Function com os dados da nova mensagem
  PERFORM net.http_post(
    FUNCTION_URL,
    json_build_object('record', NEW)::jsonb
  );
  
  RETURN NEW;
END;
$$;