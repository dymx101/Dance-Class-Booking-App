-- Update status constraint to include no_show
DO $$ 
DECLARE
  con_name TEXT;
BEGIN
  -- Attempt to drop the existing check constraint on status
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'bookings'::regclass AND contype = 'c' 
  AND pg_get_constraintdef(oid) LIKE '%status%';
  
  IF con_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE bookings DROP CONSTRAINT ' || con_name;
  END IF;
  
  ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('booked', 'waiting', 'cancelled', 'attended', 'no_show'));
END $$;


-- Atomic Booking Function
CREATE OR REPLACE FUNCTION public.book_class(p_instance_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_passes INT;
    v_class_record RECORD;
    v_booked_count INT;
    v_status TEXT;
    v_queue_number INT;
    v_booking_id UUID;
    v_existing_status TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Check if user exists and get passes
    SELECT "remainingPasses" INTO v_passes
    FROM public.users
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    IF v_passes <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient passes');
    END IF;

    -- Lock the class instance
    SELECT id, "maxCount", date, "timeStart" INTO v_class_record
    FROM public.class_instances
    WHERE id = p_instance_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Class not found');
    END IF;

    -- Check if already booked or waiting
    SELECT status INTO v_existing_status
    FROM public.bookings
    WHERE "classId" = p_instance_id AND "userId" = v_user_id
    AND status IN ('booked', 'waiting');

    IF FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Already booked or waiting');
    END IF;

    -- Check capacity and waitlist
    SELECT count(*) FILTER (WHERE status = 'booked') as booked_count,
           count(*) FILTER (WHERE status = 'waiting') as waitlist_count
    INTO v_booked_count, v_queue_number
    FROM public.bookings
    WHERE "classId" = p_instance_id;

    IF v_queue_number > 0 OR v_booked_count >= v_class_record."maxCount" THEN
        v_status := 'waiting';
        
        -- Get max queue number
        SELECT COALESCE(MAX("queueNumber"), 0) + 1 INTO v_queue_number
        FROM public.bookings
        WHERE "classId" = p_instance_id AND status = 'waiting';
    ELSE
        v_status := 'booked';
        v_queue_number := NULL;
    END IF;

    -- Deduct pass (freeze pass)
    UPDATE public.users
    SET "remainingPasses" = "remainingPasses" - 1
    WHERE id = v_user_id;

    -- Create booking
    INSERT INTO public.bookings ("classId", "userId", status, "queueNumber")
    VALUES (p_instance_id, v_user_id, v_status, v_queue_number)
    RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object('success', true, 'status', v_status, 'booking_id', v_booking_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'internal_error');
END;
$$;


-- Atomic Cancel Booking Function
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_booking_record RECORD;
    v_class_record RECORD;
    v_class_timestamp TIMESTAMPTZ;
    v_now TIMESTAMPTZ;
    v_refunded BOOLEAN := false;
    v_promoted_booking_id UUID;
    v_promoted_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- 1. Identify classId without locking first to establish lock order
    SELECT "classId", "userId" INTO v_booking_record
    FROM public.bookings
    WHERE id = p_booking_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking not found');
    END IF;

    IF v_booking_record."userId" != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    -- 2. Lock User record (matching book_class order)
    PERFORM 1 FROM public.users WHERE id = v_user_id FOR UPDATE;

    -- 3. Lock Class Instance record (matching book_class order)
    SELECT id, date, "timeStart" INTO v_class_record
    FROM public.class_instances
    WHERE id = v_booking_record."classId"
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Class not found');
    END IF;

    -- 4. Lock the Booking record for update
    SELECT id, "classId", "userId", status INTO v_booking_record
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    -- Verify status again after lock
    IF v_booking_record.status NOT IN ('booked', 'waiting') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Booking already cancelled, attended or no_show');
    END IF;

    -- Combine date and time
    v_class_timestamp := v_class_record.date + v_class_record."timeStart";
    v_now := CURRENT_TIMESTAMP;

    -- Handle cancellation
    IF v_booking_record.status = 'waiting' THEN
        -- Delete waiting booking
        DELETE FROM public.bookings WHERE id = p_booking_id;
        
        -- Refund pass
        UPDATE public.users SET "remainingPasses" = "remainingPasses" + 1 WHERE id = v_user_id;
        v_refunded := true;
        
    ELSE
        -- Vacating a 'booked' spot (either early or late)
        IF v_now <= (v_class_timestamp - INTERVAL '1 hour') THEN
            -- Early cancellation: delete + refund
            DELETE FROM public.bookings WHERE id = p_booking_id;
            UPDATE public.users SET "remainingPasses" = "remainingPasses" + 1 WHERE id = v_user_id;
            v_refunded := true;
        ELSE
            -- Late cancellation: mark 'no_show', no refund
            UPDATE public.bookings SET status = 'no_show' WHERE id = p_booking_id;
            v_refunded := false;
        END IF;

        -- ALWAYS promote someone from waitlist when a 'booked' spot is vacated
        SELECT id, "userId" INTO v_promoted_booking_id, v_promoted_user_id
        FROM public.bookings
        WHERE "classId" = v_booking_record."classId" AND status = 'waiting'
        ORDER BY "queueNumber" ASC
        LIMIT 1
        FOR UPDATE;

        IF FOUND THEN
            UPDATE public.bookings 
            SET status = 'booked', "queueNumber" = NULL 
            WHERE id = v_promoted_booking_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'refunded', v_refunded);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'internal_error');
END;
$$;
