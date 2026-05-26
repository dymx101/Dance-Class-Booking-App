-- 1. Helper function for Admin identification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Use JWT app_metadata for secure role check
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Hardening: Restrict public reading to authenticated users (Optional but recommended)
-- For this app, we'll keep them public but add Admin override for management.

-- 3. Teachers table: Admin management
CREATE POLICY "Admins Manage Teachers" ON teachers 
    FOR ALL USING (public.is_admin());

-- 4. Class templates table: Admin management
CREATE POLICY "Admins Manage Templates" ON class_templates 
    FOR ALL USING (public.is_admin());

-- 5. Class instances table: Admin management
CREATE POLICY "Admins Manage Instances" ON class_instances 
    FOR ALL USING (public.is_admin());

-- 6. Payment cards table: Admin management
CREATE POLICY "Admins Manage Payment Cards" ON payment_cards 
    FOR ALL USING (public.is_admin());

-- 7. Users table: Admin view all
CREATE POLICY "Admins Read All Profiles" ON users 
    FOR SELECT USING (public.is_admin());

-- 8. Bookings table: User READ-ONLY + Admin FULL CONTROL
-- Drop direct modification policies for users
DROP POLICY IF EXISTS "Users Insert Own Bookings" ON bookings;
DROP POLICY IF EXISTS "Users Update Own Bookings" ON bookings;

CREATE POLICY "Admins Manage All Bookings" ON bookings 
    FOR ALL USING (public.is_admin());

-- 9. Purchase records table: Admin view all
CREATE POLICY "Admins Read All Purchase Records" ON purchase_records 
    FOR SELECT USING (public.is_admin());

-- 10. Robustness: Add index on users.name for the is_admin check
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
