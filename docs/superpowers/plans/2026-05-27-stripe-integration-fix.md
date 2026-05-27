# Stripe Integration Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical flaws in Stripe frontend integration: use real card IDs, disable local discounts, and handle success redirect.

**Architecture:** 
- Fetch real `payment_cards` from Supabase in `StoreView.tsx`.
- Mark coupon selection as "Coming Soon" in the UI.
- Handle `session_id` URL param in `App.tsx` for redirect and status update.

**Tech Stack:** React (TypeScript), Supabase Client, Lucide React (icons), Motion (animations).

---

### Task 1: Update `StoreView.tsx` to use real Card IDs

**Files:**
- Modify: `src/components/StoreView.tsx`

- [ ] **Step 1: Fetch cards from Supabase**
Update `StoreView` to fetch `payment_cards` table on mount.

```tsx
// Inside StoreView component
const [dbCards, setDbCards] = useState<PaymentCard[]>([]);

useEffect(() => {
  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('payment_cards')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Error fetching cards:', error);
      // Fallback to PAYMENT_CARDS if DB fetch fails
      setDbCards(PAYMENT_CARDS);
    } else if (data) {
      setDbCards(data as PaymentCard[]);
    }
  };
  fetchCards();
}, []);
```

- [ ] **Step 2: Use `dbCards` in the render**
Replace `PAYMENT_CARDS.map` with `dbCards.map`. Ensure a loading state or default is handled.

- [ ] **Step 3: Verify card rendering**
Run the app and check if cards are displayed. (Manual verification).

- [ ] **Step 4: Commit**
```bash
git add src/components/StoreView.tsx
git commit -m "feat: use real card IDs from database in StoreView"
```

### Task 2: Disable local discounts in `StoreView.tsx`

**Files:**
- Modify: `src/components/StoreView.tsx`

- [ ] **Step 1: Mark coupon picker as Coming Soon**
Update the coupon picker UI to be disabled and show "Coming Soon".

```tsx
// In the coupon picker section
<div className="grid grid-cols-3 gap-2 opacity-60 pointer-events-none">
  {/* ... buttons ... */}
</div>
<div className="text-center mt-2">
  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
    卡券系统即将上线 (Coming Soon)
  </span>
</div>
```

- [ ] **Step 2: Force "NONE" coupon selection**
Ensure `selectedCouponCode` is always 'NONE' for now.

- [ ] **Step 3: Commit**
```bash
git add src/components/StoreView.tsx
git commit -m "feat: disable local discounts in StoreView (coming soon)"
```

### Task 3: Handle success redirect in `App.tsx`

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add effect to handle `session_id`**
Check for `session_id` in URL parameters on mount.

```tsx
// Inside App component
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  
  if (sessionId) {
    // Switch to profile tab
    setActiveTab('profile');
    
    // Show success toast
    addToast('支付成功！您的课点已更新。(Payment successful! Passes updated.)', 'success');
    
    // Refresh user data (passes)
    fetchClassesAndBookings();
    
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, [user]); // Run when user is available
```

- [ ] **Step 2: Verify redirect logic**
Manually test by appending `?session_id=test` to the app URL.

- [ ] **Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: handle Stripe success redirect in App.tsx"
```

### Task 4: Final Verification and Commit Amend

**Files:**
- Commands: `git add`, `git commit --amend`

- [ ] **Step 1: Final check of the flow**
Ensure everything works as expected.

- [ ] **Step 2: Commit amend**
```bash
git add src/components/StoreView.tsx src/App.tsx
git commit --amend --no-edit
```
