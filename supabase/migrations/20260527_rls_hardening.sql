-- 1. Helper function for Admin identification
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple logic for the prototype: check if email contains 'admin' 
  -- or if the user profile name is 'Admin'
  RETURN (
    SELECT EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND (name = 'Admin' OR name ILIKE '%管理员%')
    ) OR (
      auth.jwt() ->> 'email' LIKE '%admin%'
    )
  );
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

-- 8. Bookings table: User cancellation + Admin view all
CREATE POLICY "Users Update Own Bookings" ON bookings 
    FOR UPDATE USING (auth.uid() = userId) 
    WITH CHECK (auth.uid() = userId);

CREATE POLICY "Admins Manage All Bookings" ON bookings 
    FOR ALL USING (public.is_admin());

-- 9. Purchase records table: Admin view all
CREATE POLICY "Admins Read All Purchase Records" ON purchase_records 
    FOR SELECT USING (public.is_admin());

-- 10. Robustness: Add index on users.name for the is_admin check
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
