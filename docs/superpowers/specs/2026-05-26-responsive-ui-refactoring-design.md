# Design Spec: Responsive UI Refactoring

**Date:** 2026-05-26
**Topic:** UI/UX Evolution - Phase 10
**Status:** Approved

## 1. Goal
Refactor the "Dance-Class-Booking-App" to remove the simulated mobile phone container and implement a fluid, responsive layout that adapts seamlessly to Mobile, Tablet, and Desktop screen sizes.

## 2. Layout & Navigation Strategy

### 2.1 Removing the "Emulator"
- **Task:** Strip away the fixed `max-w-[412px]`, `h-[860px]`, and `border-[12px]` styles from the main `App.tsx` container.
- **Result:** The application will fill the entire browser viewport on all devices.

### 2.2 Adaptive Navigation
We will implement a context-aware navigation system using Tailwind breakpoints:
- **Mobile (< 768px):** Continue using the fixed **Bottom TabBar**.
- **Tablet & Desktop (> 768px):** Move navigation to a persistent **Vertical Sidebar** on the left side of the screen.
- **Top Bar:** The notch/status bar simulator will be replaced by a clean, responsive header showing the current view title and notification bell.

### 2.3 Fluid Content Grids
Components will be updated to use CSS Grid and Flexbox for adaptive density:
- **ScheduleView**:
  - Mobile: 1 column list.
  - Tablet: 2 columns.
  - Desktop: 3 columns.
- **StoreView**:
  - Mobile: 1 column cards.
  - Desktop: Multi-column grid.

## 3. Visual Styling
- **Backgrounds:** The "Outer Sand" background will be removed or used as the global page background.
- **Borders:** Component cards will use consistent rounding (`rounded-3xl` or `rounded-[2.5rem]`) and subtle borders without the constraint of the phone bezel.

## 4. Breakpoints (Tailwind Defaults)
- `sm`: 640px
- `md`: 768px (Switch to Sidebar Navigation)
- `lg`: 1024px
- `xl`: 1280px (Max-width container for content)

## 5. Success Criteria
- The app fills the screen edge-to-edge on mobile devices.
- On desktop, the sidebar navigation is clear and utilizes horizontal space efficiently.
- No "dead space" or large empty margins on larger screens.
- All interactive elements (buttons, inputs) remain accessible and properly sized across breakpoints.
