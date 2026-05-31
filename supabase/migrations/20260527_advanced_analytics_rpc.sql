CREATE OR REPLACE FUNCTION public.get_studio_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_revenue_current DECIMAL;
    v_revenue_previous DECIMAL;
    v_signups_current INT;
    v_signups_previous INT;
    v_fill_rate DECIMAL;
    v_no_show_rate DECIMAL;
    v_total_booked_attended INT;
    v_total_no_show INT;
    v_total_capacity INT;
    v_total_booked INT;
BEGIN
    -- 1. Revenue: Last 30 days vs preceding 30 days
    SELECT COALESCE(SUM(price), 0) INTO v_revenue_current
    FROM public.purchase_records
    WHERE date >= (CURRENT_TIMESTAMP - INTERVAL '30 days');

    SELECT COALESCE(SUM(price), 0) INTO v_revenue_previous
    FROM public.purchase_records
    WHERE date >= (CURRENT_TIMESTAMP - INTERVAL '60 days')
      AND date < (CURRENT_TIMESTAMP - INTERVAL '30 days');

    -- 2. Signups: Last 30 days vs preceding 30 days
    SELECT COUNT(*) INTO v_signups_current
    FROM public.users
    WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days');

    SELECT COUNT(*) INTO v_signups_previous
    FROM public.users
    WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '60 days')
      AND created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days');

    -- 3. Fill Rate: Last 30 days
    -- Ratio of (booked + attended) / maxcount for instances in last 30 days
    WITH instance_data AS (
        SELECT id, maxcount 
        FROM public.class_instances 
        WHERE date >= (CURRENT_DATE - INTERVAL '30 days')
          AND date <= CURRENT_DATE
    ),
    booking_counts AS (
        SELECT classid, COUNT(*) as booked_count
        FROM public.bookings
        WHERE status IN ('booked', 'attended')
        GROUP BY classid
    )
    SELECT 
        COALESCE(SUM(id_data.maxcount), 0),
        COALESCE(SUM(bc.booked_count), 0)
    INTO v_total_capacity, v_total_booked
    FROM instance_data id_data
    LEFT JOIN booking_counts bc ON id_data.id = bc.classid;

    IF v_total_capacity > 0 THEN
        v_fill_rate := (v_total_booked::DECIMAL / v_total_capacity::DECIMAL) * 100;
    ELSE
        v_fill_rate := 0;
    END IF;

    -- 4. No-Show Rate: Last 30 days
    -- Ratio of 'no_show' vs ('booked' + 'attended' + 'no_show')
    SELECT 
        COUNT(*) FILTER (WHERE status = 'no_show'),
        COUNT(*) FILTER (WHERE status IN ('booked', 'attended', 'no_show'))
    INTO v_total_no_show, v_total_booked_attended
    FROM public.bookings
    WHERE created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days');

    IF v_total_booked_attended > 0 THEN
        v_no_show_rate := (v_total_no_show::DECIMAL / v_total_booked_attended::DECIMAL) * 100;
    ELSE
        v_no_show_rate := 0;
    END IF;

    RETURN jsonb_build_object(
        'revenue', jsonb_build_object(
            'current', v_revenue_current,
            'previous', v_revenue_previous,
            'growth', CASE WHEN v_revenue_previous > 0 THEN ((v_revenue_current - v_revenue_previous) / v_revenue_previous) * 100 ELSE 0 END
        ),
        'signups', jsonb_build_object(
            'current', v_signups_current,
            'previous', v_signups_previous,
            'growth', CASE WHEN v_signups_previous > 0 THEN ((v_signups_current - v_signups_previous)::DECIMAL / v_signups_previous::DECIMAL) * 100 ELSE 0 END
        ),
        'fillrate', ROUND(v_fill_rate, 2),
        'noshowrate', ROUND(v_no_show_rate, 2)
    );
END;
$$;
