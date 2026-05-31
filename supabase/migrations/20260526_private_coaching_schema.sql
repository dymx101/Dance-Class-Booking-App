-- apps/web/supabase/migrations/20260526_private_coaching_schema.sql

-- Add privatepasses to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privatepasses INTEGER DEFAULT 0;

-- Create teacher_availability table
CREATE TABLE IF NOT EXISTS public.teacher_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacherid UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    dayofweek INTEGER NOT NULL CHECK (dayofweek BETWEEN 0 AND 6),
    timestart TIME NOT NULL,
    timeend TIME NOT NULL,
    createdat TIMESTAMPTZ DEFAULT NOW()
);

-- Create private_bookings table
CREATE TABLE IF NOT EXISTS public.private_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    teacherid UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    scheduledat TIMESTAMPTZ NOT NULL,
    durationminutes INTEGER NOT NULL DEFAULT 60,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    createdat TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teacher_availability_teacherid ON public.teacher_availability(teacherid);
CREATE INDEX IF NOT EXISTS idx_private_bookings_userid ON public.private_bookings(userid);
CREATE INDEX IF NOT EXISTS idx_private_bookings_teacherid ON public.private_bookings(teacherid);
CREATE INDEX IF NOT EXISTS idx_private_bookings_scheduledat ON public.private_bookings(scheduledat);

-- Enable RLS
ALTER TABLE public.teacher_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read teacher availability" ON public.teacher_availability FOR SELECT USING (true);
CREATE POLICY "Admin full access to teacher availability" ON public.teacher_availability FOR ALL USING (public.is_admin());

CREATE POLICY "Users read own private bookings" ON public.private_bookings FOR SELECT USING (auth.uid() = userid);
CREATE POLICY "Teachers see assigned bookings" ON public.private_bookings FOR SELECT USING (EXISTS (SELECT 1 FROM teachers WHERE id = private_bookings.teacherid AND userid = auth.uid()));
CREATE POLICY "Admin full access to private bookings" ON public.private_bookings FOR ALL USING (public.is_admin());

-- Secure users table privatepasses and remainingpasses
DROP POLICY IF EXISTS "Users Update Own Profile" ON public.users;
CREATE POLICY "Users Update Own Profile" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND
        (privatepasses = (SELECT privatepasses FROM public.users WHERE id = auth.uid())) AND
        (remainingpasses = (SELECT remainingpasses FROM public.users WHERE id = auth.uid()))
    );

-- Atomic RPC function for requesting a private session
CREATE OR REPLACE FUNCTION public.request_private_session(
    p_teacherid UUID,
    p_scheduledat TIMESTAMPTZ,
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
    v_dayofweek INT;
    v_time TIME;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
    END IF;

    IF p_scheduledat <= now() THEN
        RETURN jsonb_build_object('success', false, 'error', 'past_date');
    END IF;

    -- 1. Check Availability
    v_dayofweek := extract(dow from p_scheduledat);
    v_time := p_scheduledat::time;
    
    IF NOT EXISTS (
        SELECT 1 FROM public.teacher_availability 
        WHERE teacherid = p_teacherid 
          AND dayofweek = v_dayofweek 
          AND v_time >= timestart 
          AND v_time < timeend
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'teacher_not_available');
    END IF;

    -- 2. Check Overlaps
    IF EXISTS (
        SELECT 1 FROM public.private_bookings 
        WHERE teacherid = p_teacherid 
          AND status IN ('requested', 'confirmed')
          AND scheduledat = p_scheduledat
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'slot_occupied');
    END IF;

    -- 3. Lock user and check passes (Deduct 2 per session)
    SELECT privatepasses INTO v_passes FROM public.users WHERE id = v_user_id FOR UPDATE;
    IF v_passes < 2 THEN
        RETURN jsonb_build_object('success', false, 'error', 'insufficient_private_passes');
    END IF;

    UPDATE public.users SET privatepasses = privatepasses - 2 WHERE id = v_user_id;

    -- 4. Insert booking
    INSERT INTO public.private_bookings (userid, teacherid, scheduledat, notes)
    VALUES (v_user_id, p_teacherid, p_scheduledat, p_notes)
    RETURNING id INTO v_booking_id;

    RETURN jsonb_build_object('success', true, 'booking_id', v_booking_id);

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', 'internal_error');
END;
$$;
