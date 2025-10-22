CREATE OR REPLACE FUNCTION public.book_slot_and_create_appointment(
    _slot_id uuid,
    _patient_id uuid,
    _doctor_id uuid,
    _start_time timestamp with time zone,
    _end_time timestamp with time zone
)
RETURNS TABLE(appointment_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER -- Isso permite que a função ignore as políticas RLS nas tabelas que ela modifica
AS $$
DECLARE
    booked_slot_id uuid;
    new_appointment_id uuid;
BEGIN
    -- Inicia uma transação
    BEGIN
        -- 1. Verifica se o horário está disponível e o marca como indisponível
        -- Usa FOR UPDATE para bloquear a linha e prevenir condições de corrida
        UPDATE public.availability_slots
        SET is_available = FALSE, updated_at = NOW()
        WHERE id = _slot_id AND doctor_id = _doctor_id AND is_available = TRUE
        RETURNING id INTO booked_slot_id;

        -- Se nenhuma linha foi atualizada, o horário já estava ocupado ou não existia
        IF booked_slot_id IS NULL THEN
            RAISE EXCEPTION 'Este horário acabou de ser reservado por outra pessoa. Por favor, escolha outro.';
        END IF;

        -- 2. Cria o agendamento
        INSERT INTO public.appointments (patient_id, doctor_id, slot_id, start_time, end_time, status)
        VALUES (_patient_id, _doctor_id, _slot_id, _start_time, _end_time, 'pending')
        RETURNING id INTO new_appointment_id;

        -- Retorna o ID do novo agendamento
        RETURN QUERY SELECT new_appointment_id;

    EXCEPTION
        WHEN OTHERS THEN
            -- Se ocorrer qualquer erro, a transação será revertida
            RAISE;
    END;
END;
$$;

-- Concede permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.book_slot_and_create_appointment(uuid, uuid, uuid, timestamp with time zone, timestamp with time zone) TO authenticated;