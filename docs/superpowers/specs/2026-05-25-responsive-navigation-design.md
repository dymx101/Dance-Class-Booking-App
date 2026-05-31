# Responsive Navigation Design

## Goal
Implement a responsive navigation system with a vertical Sidebar for desktop (> md) and a fixed TabBar for mobile (< md).

## Architecture
The navigation will be encapsulated in a single `Navigation` component to ensure consistency and ease of maintenance.

### Components
- **Navigation.tsx**:
    - **Desktop Sidebar**:
        - Position: Left-aligned, fixed height (100vh).
        - Styling: `bg-slate-900`, `text-slate-300`.
        - Content:
            - Brand: "PLAN A" logo.
            - Nav Links: Home, Schedule, Store, Profile (Vertical list).
            - Notifications: Integrated bell icon with unread count.
    - **Mobile TabBar**:
        - Position: Bottom-aligned, fixed width.
        - Styling: Existing theme-based background (vibrant, mint, midnight).
        - Content: Home, Schedule, Store, Profile (Horizontal list).

## Tech Stack
- React 19
- Tailwind CSS 4
- Lucide React (Icons)
- Motion (Animations)

## Data Flow
- Props:
    - `activeTab`: Current active view.
    - `setActiveTab`: Callback to change view.
    - `unreadCount`: Number of unread notifications.
    - `onOpenNotifications`: Callback to open notification center.

## Integration in App.tsx
- Refactor the main layout from `flex flex-col` to `flex flex-row` on desktop.
- On desktop: `<Navigation />` then `<div className="flex-1 overflow-y-auto">...content...</div>`.
- On mobile: `<div className="flex-1 overflow-y-auto">...content...</div>` then `<Navigation />`.
