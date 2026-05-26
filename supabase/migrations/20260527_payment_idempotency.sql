-- Add stripepaymentid for idempotency with explicit constraint naming
ALTER TABLE purchase_records 
ADD COLUMN stripepaymentid TEXT;

ALTER TABLE purchase_records
ADD CONSTRAINT purchase_records_stripe_payment_id_unique UNIQUE (stripepaymentid);

CREATE INDEX IF NOT EXISTS idx_purchase_records_stripe_payment_id ON purchase_records(stripepaymentid);
