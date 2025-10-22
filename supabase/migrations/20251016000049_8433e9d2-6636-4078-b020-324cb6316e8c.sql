-- Create trigger function to mark slot as unavailable when appointment is created
CREATE OR REPLACE FUNCTION public.mark_slot_unavailable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Mark the slot as unavailable
  UPDATE public.availability_slots
  SET is_available = false
  WHERE id = NEW.slot_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically mark slots unavailable on appointment creation
DROP TRIGGER IF EXISTS on_appointment_created_mark_slot ON public.appointments;

CREATE TRIGGER on_appointment_created_mark_slot
AFTER INSERT ON public.appointments
FOR EACH ROW
WHEN (NEW.slot_id IS NOT NULL)
EXECUTE FUNCTION public.mark_slot_unavailable();

-- Create trigger function to make slot available again when appointment is cancelled
CREATE OR REPLACE FUNCTION public.mark_slot_available_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only make slot available if appointment is cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.availability_slots
    SET is_available = true
    WHERE id = NEW.slot_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to make slots available when appointments are cancelled
DROP TRIGGER IF EXISTS on_appointment_cancelled_mark_slot ON public.appointments;

CREATE TRIGGER on_appointment_cancelled_mark_slot
AFTER UPDATE ON public.appointments
FOR EACH ROW
WHEN (NEW.slot_id IS NOT NULL)
EXECUTE FUNCTION public.mark_slot_available_on_cancel();