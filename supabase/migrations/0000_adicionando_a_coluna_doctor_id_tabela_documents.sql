ALTER TABLE public.documents
ADD COLUMN doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;