-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Doctors can manage their own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Patients can view their own medical records" ON public.medical_records;

-- Habilitar RLS (MANDATÓRIO para segurança) - Se já estiver habilitado, este comando não fará mal.
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para medical_records

-- Médicos podem gerenciar (SELECT, INSERT, UPDATE, DELETE) seus próprios prontuários
CREATE POLICY "Doctors can manage their own medical records" ON public.medical_records
FOR ALL TO authenticated USING (auth.uid() = doctor_id);

-- Pacientes podem visualizar seus próprios prontuários
CREATE POLICY "Patients can view their own medical records" ON public.medical_records
FOR SELECT TO authenticated USING (auth.uid() = patient_id);