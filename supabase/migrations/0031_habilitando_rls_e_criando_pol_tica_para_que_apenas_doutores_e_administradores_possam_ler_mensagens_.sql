-- Enable RLS on messages table if not already enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for messages table to recreate them with correct permissions
DROP POLICY IF EXISTS "Doctors and Admins can read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all users to insert messages" ON public.messages;
DROP POLICY IF EXISTS "Doctors and Admins can update message read status" ON public.messages;

-- Policy to allow doctors and admins to read messages
CREATE POLICY "Doctors and Admins can read messages" ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND (role = 'doctor'::public.app_role OR role = 'admin'::public.app_role)
  )
);

-- Policy to allow ALL users (authenticated or anonymous) to insert messages
CREATE POLICY "Allow all users to insert messages" ON public.messages
FOR INSERT TO public
WITH CHECK (true);

-- Policy to allow doctors and admins to update message read status
CREATE POLICY "Doctors and Admins can update message read status" ON public.messages
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND (role = 'doctor'::public.app_role OR role = 'admin'::public.app_role)
  )
);