UPDATE public.profiles
SET
    full_name = 'Novo Nome do Médico', -- Por favor, ajuste este valor
    avatar_url = 'https://example.com/new_avatar.jpg', -- Por favor, ajuste este valor
    updated_at = NOW()
WHERE
    id = '1e5157b3-4f29-4adc-9698-66ad1eed044b';