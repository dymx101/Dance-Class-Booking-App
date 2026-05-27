# Payment Idempotency Schema Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `stripePaymentId` to `purchase_records` table for idempotency.

**Architecture:** Use a Supabase migration file to alter the existing `purchase_records` table, adding a `TEXT` column with a `UNIQUE` constraint to prevent duplicate processing of the same Stripe payment.

**Tech Stack:** SQL (PostgreSQL), Supabase

---

### Task 1: Create Migration File

**Files:**
- Create: `supabase/migrations/20260527_payment_idempotency.sql`

- [ ] **Step 1: Create the migration file with the ALTER TABLE statement**

```sql
-- Add stripePaymentId for idempotency
ALTER TABLE purchase_records 
ADD COLUMN stripePaymentId TEXT UNIQUE;
```

- [ ] **Step 2: Commit the migration file**

```bash
git add supabase/migrations/20260527_payment_idempotency.sql
git commit -m "feat(db): add stripePaymentId for idempotency"
```
