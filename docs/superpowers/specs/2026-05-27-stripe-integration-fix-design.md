# Design: Fix Stripe Integration

## 1. Real Card IDs in `StoreView.tsx`
- Currently, `StoreView.tsx` uses `PAYMENT_CARDS` from `src/data.ts` which has mock IDs (`c1`, `c2`, etc.).
- I will modify `StoreView.tsx` to fetch the real `payment_cards` from Supabase on mount.
- This ensures the `card_id` passed to `create-checkout` matches a UUID in the database.

## 2. Disable Local Discounts
- The backend doesn't support coupons yet, but the UI calculates them locally.
- I will disable the coupon selection in `StoreView.tsx` and mark it as "即将上线 (Coming Soon)".
- This prevents price mismatches between the frontend and Stripe.

## 3. Handle Success Redirect in `App.tsx`
- Stripe redirects back to the app with a `session_id` on success.
- I will add a `useEffect` in `App.tsx` to check for the `session_id` URL parameter.
- If present, I will:
    - Switch the active tab to `profile`.
    - Show a success toast.
    - Refresh the user's passes.
    - Clean up the URL.

## 4. Verification
- Verify that `StoreView` correctly fetches and displays cards from the DB.
- Verify that the coupon UI is disabled.
- Verify that manual addition of `?session_id=test` to the URL triggers the redirect and toast in `App.tsx`.

## 5. Commit
- `git add src/components/StoreView.tsx src/App.tsx`
- `git commit --amend --no-edit`
