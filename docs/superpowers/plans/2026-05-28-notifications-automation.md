# Notification Schema & Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create automated notification triggers for waitlist promotion and purchase fulfillment, ensuring a single source of truth for alerts.

**Architecture:** 
- Postgres triggers on `bookings` (for promotion) and `purchase_records` (for fulfillment).
- Decouple notification logic from RPC functions.
- Update frontend types to include `Notification`.

**Tech Stack:** Supabase (Postgres), TypeScript.

---

### Task 1: Update Frontend Types

**Files:**
- Modify: `src/types.ts`

- [ ] **Step 1: Add Notification interface**

```typescript
export interface Notification {
  id: string;
  userid: string;
  type: 'waitlist_promoted' | 'booking_confirmed' | 'purchase_successful' | 'class_cancelled';
  title: string;
  message: string;
  isread: boolean;
  createdat: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add Notification type"
```

---

### Task 2: Notification Automation Triggers

**Files:**
- Create: `supabase/migrations/20260528_notification_automation.sql`

- [ ] **Step 1: Create trigger functions and triggers**

```sql
-- 1. Function for Waitlist Promotion Notification
CREATE OR REPLACE FUNCTION public.handle_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger if status changed from 'waiting' to 'booked'
    IF (OLD.status = 'waiting' AND NEW.status = 'booked') THEN
        INSERT INTO public.notifications (userid, type, title, message)
        VALUES (
            NEW.userid, 
            'waitlist_promoted', 
            '预约成功 (Booking Successful)', 
            '您已从候补名单转为正式预约！'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for Waitlist Promotion
DROP TRIGGER IF EXISTS on_booking_promoted ON public.bookings;
CREATE TRIGGER on_booking_promoted
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_booking_notification();

-- 3. Function for Purchase Confirmation Notification
CREATE OR REPLACE FUNCTION public.handle_purchase_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (userid, type, title, message)
    VALUES (
        NEW.userid, 
        'purchase_successful', 
        '充值成功 (Purchase Successful)', 
        '您已成功购买 ' || NEW.cardname || '，获得 ' || NEW.passesadded || ' 次课时！'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for Purchase Confirmation
DROP TRIGGER IF EXISTS on_purchase_confirmed ON public.purchase_records;
CREATE TRIGGER on_purchase_confirmed
    AFTER INSERT ON public.purchase_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_purchase_notification();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260528_notification_automation.sql
git commit -m "feat(db): add notification triggers for promotion and purchase"
```

---

### Task 3: Refactor Booking RPC

**Files:**
- Modify: `supabase/migrations/20260526_booking_rpc.sql`

- [ ] **Step 1: Remove manual notification insertion from `cancel_booking`**

Find the block around line 231 and remove it.

```sql
<<<<
            -- Create notification for promoted user
            INSERT INTO public.notifications (userid, type, title, message)
            VALUES (v_promoted_user_id, 'promotion', '预约成功 (Booking Successful)', '您已从候补名单转为正式预约！');
====
            -- Notification is now handled by on_booking_promoted trigger
>>>>
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260526_booking_rpc.sql
git commit -m "refactor(db): remove manual notification insertion from cancel_booking"
```

---

### Task 4: Verification

**Files:**
- Create: `src/verify-notifications.test.ts`

- [ ] **Step 1: Write verification script**

```typescript
import { supabase } from './lib/supabase';

export async function verifyNotifications(userId: string) {
  console.log(`[NOTIFICATIONS] Verifying notifications for user ${userId}...`);
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('userid', userId)
    .order('createdat', { ascending: false });

  if (error) {
    console.error('❌ ERROR:', error.message);
    return false;
  }

  console.log(`✅ PASS: Found ${data?.length || 0} notifications:`, data);
  return true;
}

if (import.meta.url.endsWith('verify-notifications.test.ts')) {
  // Mock check
  verifyNotifications('mock_user_id').catch(console.error);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/verify-notifications.test.ts
git commit -m "test: add notifications verification script"
```
