-- Remover políticas existentes para evitar conflitos
    DROP POLICY IF EXISTS "Patients can view their own documents" ON public.documents;
    DROP POLICY IF EXISTS "Patients can upload documents for their doctor" ON public.documents;
    DROP POLICY IF EXISTS "Patients can update their own documents" ON public.documents;
    DROP POLICY IF EXISTS "Patients can delete their own documents" ON public.documents;
    DROP POLICY IF EXISTS "Doctors can view documents for their patients or appointments" ON public.documents;
    DROP POLICY IF EXISTS "Doctors can manage documents they are associated with" ON public.documents;

    -- Política para pacientes visualizarem seus próprios documentos
    CREATE POLICY "Patients can view their own documents" ON public.documents
    FOR SELECT TO authenticated USING (auth.uid() = patient_id);

    -- Política para pacientes inserirem documentos, garantindo que o patient_id seja o deles e o doctor_id seja fornecido
    CREATE POLICY "Patients can upload documents for their doctor" ON public.documents
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_id AND doctor_id IS NOT NULL);

    -- Política para pacientes atualizarem seus próprios documentos
    CREATE POLICY "Patients can update their own documents" ON public.documents
    FOR UPDATE TO authenticated USING (auth.uid() = patient_id);

    -- Política para pacientes deletarem seus próprios documentos
    CREATE POLICY "Patients can delete their own documents" ON public.documents
    FOR DELETE TO authenticated USING (auth.uid() = patient_id);

    -- Política para doutores visualizarem documentos associados a eles ou a suas consultas
    CREATE POLICY "Doctors can view documents for their patients or appointments" ON public.documents
    FOR SELECT TO authenticated USING (
        (auth.uid() = doctor_id) OR
        (EXISTS (
            SELECT 1
            FROM public.appointments
            WHERE (appointments.id = documents.appointment_id AND appointments.doctor_id = auth.uid())
        ))
    );

    -- Política para doutores gerenciarem documentos que estão associados a eles (opcional, mas útil para gestão)
    CREATE POLICY "Doctors can manage documents they are associated with" ON public.documents
    FOR ALL TO authenticated USING (auth.uid() = doctor_id);