-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a wrapper function to trigger the report securely
CREATE OR REPLACE FUNCTION public.trigger_studio_report(report_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net
AS $$
DECLARE
  v_secret TEXT := current_setting('app.report_secret', true);
  v_project_url TEXT := current_setting('app.supabase_url', true);
BEGIN
  IF v_secret IS NULL OR v_project_url IS NULL THEN
    RAISE EXCEPTION 'Report secret or Supabase URL not configured in Postgres settings';
  END IF;

  PERFORM net.http_post(
    url := v_project_url || '/functions/v1/generate-report',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_secret
    ),
    body := jsonb_build_object('type', report_type)
  );
END;
$$;

-- Revoke all privileges from public and grant only to postgres and service_role
REVOKE ALL ON FUNCTION public.trigger_studio_report(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trigger_studio_report(TEXT) TO postgres, service_role;

-- Weekly Report (Monday 8AM)
SELECT cron.schedule('weekly-studio-report', '0 8 * * 1', 'SELECT public.trigger_studio_report(''weekly'')');

-- Monthly Report (1st of month 9AM)
SELECT cron.schedule('monthly-studio-report', '0 9 1 * *', 'SELECT public.trigger_studio_report(''monthly'')');
