-- Add indexes to support analytics queries
CREATE INDEX IF NOT EXISTS idx_purchase_records_date ON public.purchase_records(date);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);
