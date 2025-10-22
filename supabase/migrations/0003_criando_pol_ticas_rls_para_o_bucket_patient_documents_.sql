-- Permitir que usuários autenticados façam upload de arquivos para sua própria pasta no bucket 'patient_documents'
CREATE POLICY "Allow authenticated uploads to own folder" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'patient_documents' AND auth.uid() = owner
);

-- Permitir que usuários autenticados visualizem/baixem seus próprios arquivos no bucket 'patient_documents'
CREATE POLICY "Allow authenticated read of own files" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'patient_documents' AND auth.uid() = owner
);

-- Permitir que usuários autenticados deletem seus próprios arquivos no bucket 'patient_documents'
CREATE POLICY "Allow authenticated delete of own files" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'patient_documents' AND auth.uid() = owner
);

-- Permitir que doutores visualizem arquivos de seus pacientes no bucket 'patient_documents'
-- Esta política se conecta à tabela public.documents para verificar o doctor_id
CREATE POLICY "Doctors can view patient documents in storage" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'patient_documents' AND EXISTS (
    SELECT 1
    FROM public.documents
    WHERE public.documents.file_path = name AND public.documents.doctor_id = auth.uid()
  )
);