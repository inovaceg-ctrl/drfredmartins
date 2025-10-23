-- Add street column if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='street') THEN
        ALTER TABLE public.messages ADD COLUMN street TEXT;
    END IF;
END $$;

-- Add street_number column if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='street_number') THEN
        ALTER TABLE public.messages ADD COLUMN street_number TEXT;
    END IF;
END $$;

-- Add neighborhood column if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='neighborhood') THEN
        ALTER TABLE public.messages ADD COLUMN neighborhood TEXT;
    END IF;
END $$;