-- Add stripePaymentId for idempotency
ALTER TABLE purchase_records 
ADD COLUMN stripePaymentId TEXT UNIQUE;
