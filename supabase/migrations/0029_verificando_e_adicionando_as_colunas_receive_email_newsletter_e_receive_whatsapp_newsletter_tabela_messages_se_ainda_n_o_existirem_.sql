ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS receive_email_newsletter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS receive_whatsapp_newsletter BOOLEAN DEFAULT FALSE;