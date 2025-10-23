-- Remove o trigger existente na tabela 'messages' se ele existir
DROP TRIGGER IF EXISTS on_new_message ON public.messages;

-- Cria um novo trigger na tabela 'contact_submissions'
CREATE TRIGGER on_new_contact_submission
AFTER INSERT ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.handle_new_message_notification();