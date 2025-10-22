-- Habilitar RLS na tabela messages (se ainda não estiver habilitado)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para SELECT (se houver alguma que possa conflitar)
DROP POLICY IF EXISTS "Allow authenticated users to read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Allow anon to insert messages" ON public.messages; -- Esta é para INSERT, não SELECT, mas é bom verificar

-- Criar política para que apenas usuários com a função 'doctor' ou 'admin' possam ler as mensagens
CREATE POLICY "Doctors and Admins can read messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND (role = 'doctor'::public.app_role OR role = 'admin'::public.app_role)
  )
);

-- Manter a política de INSERT para que qualquer usuário (anon ou autenticado) possa enviar mensagens
CREATE POLICY "Allow all users to insert messages"
ON public.messages FOR INSERT
WITH CHECK (true);

-- Criar política para que apenas doutores e administradores possam atualizar o status de 'is_read'
CREATE POLICY "Doctors and Admins can update message read status"
ON public.messages FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND (role = 'doctor'::public.app_role OR role = 'admin'::public.app_role)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND (role = 'doctor'::public.app_role OR role = 'admin'::public.app_role)
  )
);