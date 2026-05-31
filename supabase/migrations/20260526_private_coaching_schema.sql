-- Helper function for Admin identification (if not already defined)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use JWT app_metadata for secure role check
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add privatepasses to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS privatepasses INTEGER DEFAULT 0;

-- Create teacher_availability table
CREATE TABLE IF NOT EXISTS public.teacher_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacherid UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    dayofweek INTEGER NOT NULL CHECK (dayofweek BETWEEN 0 AND 6),
    timestart TIME NOT NULL,
    timeend TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create private_bookings table
CREATE TABLE IF NOT EXISTS public.private_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    teacherid UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    scheduledat TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
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

-- teacher_availability
CREATE POLICY "Public read teacher availability" ON public.teacher_availability FOR SELECT USING (true);
CREATE POLICY "Admin full access to teacher availability" ON public.teacher_availability
    FOR ALL USING (public.is_admin());

-- private_bookings
CREATE POLICY "Users read own private bookings" ON public.private_bookings FOR SELECT USING (auth.uid() = userid);
-- Users insert policy dropped: All bookings must use request_private_session RPC
CREATE POLICY "Users update own private bookings" ON public.private_bookings
    FOR UPDATE USING (auth.uid() = userid)
    WITH CHECK (auth.uid() = userid AND status = 'cancelled');
CREATE POLICY "Teachers see assigned bookings" ON public.private_bookings
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.teachers WHERE id = private_bookings.teacherid AND userid = auth.uid()));
CREATE POLICY "Admin full access to private bookings" ON public.private_bookings
    FOR ALL USING (public.is_admin());

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
        status,
        notes
    ) VALUES (
        v_user_id,
        p_teacher_id,
        p_scheduled_at,
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
