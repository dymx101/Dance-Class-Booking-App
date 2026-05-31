# Private Booking Request Modal & Profile Integration Design

**Goal**: Finalize the private booking flow with a request modal and show these bookings in the user profile.

## UI Components

### 1. `BookingRequestModal` (PrivateCoachingView.tsx)
- **Visuals**: Premium overlay with backdrop blur, matching theme-specific colors.
- **Content**:
    - Summary: Teacher Name, Avatar, Selected Date, Selected Time.
    - Notes: `textarea` for optional training goals/notes.
    - Transaction Info: "Deduct 2 Passes".
- **Actions**:
    - `onCancel`: Close modal.
    - `onConfirm`: Call `requestPrivateSession` RPC.

### 2. `ProfileView` Integration
- **State**: Add `privateBookings` state.
- **Data**: Fetch via `getUserPrivateBookings` on mount.
- **UI**: 
    - New segment in the tabbed block: "私教预约" (Private Coaching).
    - List of private bookings with Teacher name, time, and status.

## Data Flow
1. User selects slot in `PrivateCoachingView`.
2. Modal opens for final confirmation and optional notes.
3. On confirm, `requestPrivateSession` is called.
4. Success toast shown; state reset.
5. User navigates to `ProfileView`.
6. `ProfileView` fetches private bookings and displays them.

## Verification Plan
- **Manual**: Trigger booking and verify RPC call in network tab.
- **Manual**: Check profile view to see the new request.
- **Automated**: Run `npm run lint` and `tsc` (if applicable).
