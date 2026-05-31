-- Step 1: Update Schema
ALTER TABLE public.private_bookings ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- Step 2: Harden request_private_session RPC
CREATE OR REPLACE FUNCTION public.request_private_session(
    p_teacher_id UUID,
    p_scheduled_at TIMESTAMPTZ,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_passes INT;
    v_booking_id UUID;
    v_day_of_week INT;
    v_start_time TIME;
    v_end_time TIME;
    v_duration INT := 60; -- Current default duration
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
    END IF;

    -- Check if scheduled date is in the past
    IF p_scheduled_at <= now() THEN
        RETURN jsonb_build_object('success', false, 'error', 'past_date');
    END IF;

    -- Check if teacher exists
    IF NOT EXISTS (SELECT 1 FROM public.teachers WHERE id = p_teacher_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'teacher_not_found');
    END IF;

    -- Extract day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    v_day_of_week := EXTRACT(DOW FROM p_scheduled_at);
    v_start_time := p_scheduled_at::TIME;
    v_end_time := (p_scheduled_at + (v_duration || ' minutes')::INTERVAL)::TIME;

    -- Check Availability
    -- Note: This assumes availability windows do not cross midnight.
    IF NOT EXISTS (
        SELECT 1 FROM public.teacher_availability
        WHERE teacherid = p_teacher_id
          AND dayofweek = v_day_of_week
          AND timestart <= v_start_time
          AND timeend >= v_end_time
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'teacher_not_available');
    END IF;

    -- Check Overlaps
    IF EXISTS (
        SELECT 1 FROM public.private_bookings
        WHERE teacherid = p_teacher_id
          AND status IN ('requested', 'confirmed')
          AND (
            (p_scheduled_at, (v_duration || ' minutes')::INTERVAL) OVERLAPS 
            (scheduledat, (duration_minutes || ' minutes')::INTERVAL)
          )
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'slot_occupied');
    END IF;

    -- Lock the user's record and check passes
    SELECT privatepasses INTO v_passes
    FROM public.users
    WHERE id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'user_not_found');
    END IF;

    IF v_passes <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'insufficient_private_passes');
    END IF;

    -- Deduct 1 pass
    UPDATE public.users
    SET privatepasses = privatepasses - 1
    WHERE id = v_user_id;

    -- Insert the request into private_bookings
    INSERT INTO public.private_bookings (
        userid,
        teacherid,
        scheduledat,
        duration_minutes,
        status,
        notes
    ) VALUES (
        v_user_id,
        p_teacher_id,
        p_scheduled_at,
        v_duration,
        'requested',
        p_notes
    )
    RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'internal_error', 'message', SQLERRM);
END;
$$;
