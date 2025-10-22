-- Criar o bucket de armazenamento para prints do WhatsApp
INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp_screenshots', 'whatsapp_screenshots', FALSE); -- FALSE para que não seja público por padrão

-- Habilitar RLS para o bucket whatsapp_screenshots (já habilitado por padrão ao criar via SQL)

-- Políticas de RLS para storage.objects no bucket 'whatsapp_screenshots'
-- Permitir que usuários autenticados façam upload de arquivos para sua própria pasta (baseada no user_id)
CREATE POLICY "Allow authenticated uploads to own whatsapp_screenshots folder" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'whatsapp_screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários autenticados visualizem/baixem seus próprios arquivos no bucket 'whatsapp_screenshots'
CREATE POLICY "Allow authenticated read of own whatsapp_screenshots files" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'whatsapp_screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir que usuários autenticados deletem seus próprios arquivos no bucket 'whatsapp_screenshots'
CREATE POLICY "Allow authenticated delete of own whatsapp_screenshots files" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'whatsapp_screenshots' AND auth.uid()::text = (storage.foldername(name))[1]
);