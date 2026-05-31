-- apps/web/supabase/migrations/20260529_cancel_private_rpc.sql

-- Atomic Cancel Private Session Function
CREATE OR REPLACE FUNCTION public.cancel_private_session(p_booking_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_booking_record RECORD;
    v_now TIMESTAMPTZ;
    v_refunded BOOLEAN := false;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
    END IF;

    -- 1. Identify booking and verify ownership
    SELECT id, userid, status, scheduledat INTO v_booking_record
    FROM public.private_bookings
    WHERE id = p_booking_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'booking_not_found');
    END IF;

    IF v_booking_record.userid != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_authorized');
    END IF;

    -- 2. Lock User record
    PERFORM 1 FROM public.users WHERE id = v_user_id FOR UPDATE;

    -- 3. Lock the Booking record for update
    SELECT id, status, scheduledat INTO v_booking_record
    FROM public.private_bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    -- Verify status
    IF v_booking_record.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_cancelled');
    END IF;
    
    IF v_booking_record.status = 'completed' THEN
        RETURN jsonb_build_object('success', false, 'error', 'already_completed');
    END IF;

    v_now := CURRENT_TIMESTAMP;

    -- Handle cancellation logic (24 hour rule for refund)
    IF v_now <= (v_booking_record.scheduledat - INTERVAL '24 hours') THEN
        -- Early cancellation: mark cancelled + refund (2 passes)
        UPDATE public.private_bookings SET status = 'cancelled' WHERE id = p_booking_id;
        UPDATE public.users SET privatepasses = privatepasses + 2 WHERE id = v_user_id;
        v_refunded := true;
    ELSE
        -- Late cancellation: mark cancelled, NO refund
        UPDATE public.private_bookings SET status = 'cancelled' WHERE id = p_booking_id;
        v_refunded := false;
    END IF;

    RETURN jsonb_build_object('success', true, 'refunded', v_refunded);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'internal_error');
END;
$$;
