-- Permitir que usuários autenticados vejam as roles de médicos
-- Isso é necessário para que pacientes possam ver a lista de médicos disponíveis
CREATE POLICY "Users can view doctor roles"
ON user_roles
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND role = 'doctor'
);