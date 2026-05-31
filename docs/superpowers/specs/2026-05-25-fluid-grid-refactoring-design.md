# Design Doc: Fluid Grid Refactoring for Dance-Class-Booking-App

## Overview
Refactor the core views of the web application to ensure fluid responsiveness across different screen sizes using Tailwind CSS responsive grids and breakpoints.

## Target Components

### 1. ScheduleView.tsx
- **Current State:** Class cards are listed in a vertical stack using `space-y-3`.
- **Proposed Change:** Refactor the container to use a responsive grid.
- **Breakpoints:**
  - Default: 1 column
  - `md`: 2 columns
  - `lg`: 3 columns
  - `xl`: 4 columns
- **Grid Gap:** `gap-4`.

### 2. HomeView.tsx
- **Banner:**
  - **Proposed Change:** Increase banner height on larger screens for better visual impact.
  - **Breakpoints:** `h-40 md:h-64 lg:h-80`.
- **Featured Sections (Shortcuts):**
  - **Proposed Change:** Adjust grid layout for featured shortcuts.
  - **Breakpoints:** `grid-cols-3 lg:grid-cols-3` (keeping it 3 for now as it fits the content, but adjusting padding).
- **Video Showcase:**
  - **Proposed Change:** Refactor video grid to show more items on larger screens.
  - **Breakpoints:** `grid-cols-2 lg:grid-cols-4`.
- **General Layout:**
  - Adjust margins and paddings for desktop to prevent content from being too stretched.

### 3. StoreView.tsx
- **Current State:** Membership cards are listed in a vertical stack using `space-y-4`.
- **Proposed Change:** Refactor the container to use a responsive grid.
- **Breakpoints:**
  - Default: 1 column
  - `md`: 2 columns
  - `xl`: 3 columns
- **Grid Gap:** `gap-4`.

## Aesthetic & Standards
- Maintain high-contrast brand aesthetic (vibrant-light, midnight-cyber, cool-mint themes).
- Use standard Tailwind breakpoints (`md`, `lg`, `xl`).
- Ensure balanced card layouts at each breakpoint.

## Verification Strategy
- Manually inspect layout at different viewport widths (simulated in development).
- Ensure no layout breakage or overlapping elements.
