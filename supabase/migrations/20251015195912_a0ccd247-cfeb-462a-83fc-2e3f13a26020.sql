-- Primeiro remover a política existente e recriar
DROP POLICY IF EXISTS "Users can view doctor profiles" ON public.profiles;

-- Permitir que todos os usuários autenticados vejam perfis dos médicos
CREATE POLICY "Users can view doctor profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = profiles.id 
    AND user_roles.role = 'doctor'
  )
);