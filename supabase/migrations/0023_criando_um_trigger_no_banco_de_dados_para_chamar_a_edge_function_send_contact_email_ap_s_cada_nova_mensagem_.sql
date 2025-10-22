-- Criar a função que será chamada pelo trigger
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

  PERFORM http_post(
    FUNCTION_URL,
    json_build_object('record', NEW)::text,
    'application/json'
  );
  
  RETURN NEW;
END;
$$;

-- Criar o trigger que executa a função após cada INSERT na tabela messages
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();