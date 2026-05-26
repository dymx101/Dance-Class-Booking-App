# Design Spec: Admin Dashboard (Schedule & Teacher Management)

**Date:** 2026-05-26
**Topic:** Admin Dashboard - Production Phase 1
**Status:** Approved

## 1. Goal
Transition the "Dance-Class-Booking-App" prototype into a production-ready application by implementing a robust Admin Dashboard for studio owners to manage their class schedule and teacher database using **Supabase** as the backend.

## 2. Architecture & Data Model
We will use a **Hybrid Scheduling Model** where recurring templates are "published" into concrete class instances.

### 2.1 Supabase Schema
- **`teachers`**: Stores instructor profiles (name, avatar, tags, bio).
- **`class_templates`**: Defines the "Master Schedule" rules (day of week, start/end time, teacher, title, genre).
- **`class_instances`**: The source of truth for the user-facing schedule. Contains specific dates and statuses. Can be generated from templates or created manually (ad-hoc).

### 2.2 The "Publishing" Engine
A background process (Postgres Trigger or Edge Function) will monitor the `class_templates` table and ensure `class_instances` are generated 14 days in advance. 

## 3. UI/UX Design
The Admin Dashboard will be a protected route (`/admin`) with a sidebar-based layout.

### 3.1 Key Views
- **Schedule Management**: A list/table view of all class templates with the ability to "Preview" the generated calendar.
- **Teacher Management**: A CRUD interface for managing instructor data.
- **Instance Override**: A calendar view allowing admins to cancel or modify specific class sessions (e.g., "Substitute teacher for this Tuesday only").

### 3.2 Key Components
- `AdminLayout`: Shell with navigation and role-based access control.
- `TemplateEditor`: Form for creating recurring schedule rules.
- `InstanceCalendar`: View for ad-hoc changes to published classes.

## 4. Security
- **Role-Based Access Control (RBAC)**: Only users with the `admin` role in Supabase metadata can access the `/admin` routes.
- **Row-Level Security (RLS)**: Public can read classes; only admins can write to teachers, templates, and instances.

## 5. Success Criteria
- Admin can create a weekly template that automatically populates the user schedule.
- Admin can manually add a "one-off" workshop not in the template.
- Admin can change the teacher for a specific date without affecting the master template.
