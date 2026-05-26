-- Add spotNumber column to bookings table
ALTER TABLE public.bookings ADD COLUMN "spotNumber" TEXT;

-- Index for performance when checking spot availability
CREATE INDEX IF NOT EXISTS idx_bookings_class_spot ON public.bookings("classId", "spotNumber") WHERE status = 'booked';
