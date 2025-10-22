CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public, extensions -- Adicionado 'extensions' ao search_path
AS $$
DECLARE
  -- Substitua 'SEU_PROJECT_ID_AQUI' pelo seu Project ID do Supabase
  SUPABASE_PROJECT_ID TEXT := 'fusqpjescampwoyazceu'; -- Substituído pelo seu Project ID real
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