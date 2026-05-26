-- Add spotnumber column to bookings table
ALTER TABLE public.bookings ADD COLUMN spotnumber TEXT;

-- Index for performance when checking spot availability
CREATE INDEX IF NOT EXISTS idx_bookings_class_spot ON public.bookings(classid, spotnumber) WHERE status = 'booked';
