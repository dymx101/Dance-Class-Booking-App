# Design Spec: Database Schema Expansion (2026-05-26)

## Overview
The goal is to expand the initial Supabase schema to match the application's requirements as defined in `src/types.ts` and to follow Supabase/Postgres best practices for security and performance.

## Data Model

### Existing Tables (Updates)

#### `teachers`
- Add `rating` (DECIMAL) to match `Teacher.rating`.
- Ensure `tags` and `bio` (renamed from `description` in schema?) match. `types.ts` uses `description`.

#### `class_templates`
- Add `difficulty` (INT) - 1 to 5 stars.
- Add `classroom` (TEXT).
- Add `min_people` (INT).
- Add `max_count` (INT).
- Add `class_type` (TEXT) - 'group', 'private', 'series'.

#### `class_instances`
- Add `start_time` (TIME).
- Add `end_time` (TIME).
- Add `title` (TEXT).
- Add `genre` (TEXT).
- Add `classroom` (TEXT).
- Add `difficulty` (INT).
- Add `max_count` (INT).
- Add `min_people` (INT).
- Add `class_type` (TEXT).
- *Rationale:* Instances copy data from templates to ensure stability if the template is modified later.

### New Tables

#### `users`
- `id` UUID PK (Primary Key).
- `name` TEXT.
- `phone` TEXT.
- `avatar_url` TEXT.
- `remaining_passes` INT DEFAULT 0.
- `experience_points` INT DEFAULT 0.
- `total_classes_joined` INT DEFAULT 0.
- `favorite_style` TEXT.
- `streak_days` INT DEFAULT 0.
- `created_at` TIMESTAMPTZ DEFAULT NOW().

#### `bookings`
- `id` UUID PK.
- `class_id` UUID FK (Foreign Key) to `class_instances`.
- `user_id` UUID FK to `users`.
- `status` TEXT ('booked', 'waiting', 'cancelled', 'attended').
- `queue_number` INT.
- `created_at` TIMESTAMPTZ DEFAULT NOW().

#### `payment_cards`
- `id` UUID PK.
- `title` TEXT.
- `price` INT.
- `original_price` INT.
- `passes` INT (-1 for unlimited).
- `valid_days` INT.
- `description` TEXT.
- `badge` TEXT.

#### `purchase_records` (Alignment with `src/types.ts`)
- `id` UUID PK.
- `card_id` UUID FK to `payment_cards`.
- `user_id` UUID FK to `users`.
- `card_name` TEXT.
- `price` INT.
- `passes_added` INT.
- `created_at` TIMESTAMPTZ DEFAULT NOW().

## Performance & Security

### Indexes
- All foreign keys will be indexed to speed up joins.
- `class_instances(date)` will be indexed for efficient schedule queries.

### Security (RLS)
- Row Level Security (RLS) will be enabled for all tables.
- Initial policies:
    - `teachers`, `class_templates`, `class_instances`, `payment_cards`: Publicly readable.
    - `users`: Users can read/update their own profile.
    - `bookings`, `purchase_records`: Users can read their own records.

## Implementation Plan
1. Update `supabase/migrations/20260526_initial_schema.sql` with the expanded schema.
2. Add RLS enablement and policies.
3. Add indexes.
4. Verify by attempting to parse/lint if possible (or just ensure SQL syntax is correct).
5. Commit the changes using `git commit --amend --no-edit`.
