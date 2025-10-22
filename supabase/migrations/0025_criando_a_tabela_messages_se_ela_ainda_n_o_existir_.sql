CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Não Informado',
    email TEXT,
    phone TEXT NOT NULL DEFAULT 'Não Informado',
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- (Opcional) Criar uma política simples para permitir INSERTs anônimos (se for o caso)
-- Isso permite que qualquer pessoa insira uma mensagem, mas ninguém pode ler.
-- CREATE POLICY "Allow anonymous inserts" ON public.messages FOR INSERT WITH CHECK (true);