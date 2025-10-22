ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS mental_health_history TEXT,
ADD COLUMN IF NOT EXISTS main_complaints TEXT,
ADD COLUMN IF NOT EXISTS previous_diagnoses TEXT,
ADD COLUMN IF NOT EXISTS current_medications TEXT,
ADD COLUMN IF NOT EXISTS past_sessions_history TEXT,
ADD COLUMN IF NOT EXISTS therapist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS consent_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS consent_date TIMESTAMP WITH TIME ZONE;

-- Opcional: Adicionar RLS para a nova coluna therapist_id se necessário,
-- mas as políticas existentes para 'profiles' já devem cobrir o acesso geral.
-- Se você precisar de políticas mais granulares para 'therapist_id', me avise.