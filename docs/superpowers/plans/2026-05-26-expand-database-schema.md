# Expand Database Schema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the initial database schema to include all necessary tables and columns for the Dance Class Booking App, aligning with `src/types.ts` and following best practices.

**Architecture:** A single Supabase migration file that sets up tables, relationships, indexes, and RLS policies.

**Tech Stack:** Supabase (PostgreSQL).

---

### Task 1: Update Migration File

**Files:**
- Modify: `supabase/migrations/20260526_initial_schema.sql`

- [ ] **Step 1: Rewrite migration with complete schema**

Write the following content to `supabase/migrations/20260526_initial_schema.sql`:

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    tags TEXT[] DEFAULT '{}',
    bio TEXT,
    rating DECIMAL DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    phone TEXT UNIQUE,
    avatar_url TEXT,
    remaining_passes INT DEFAULT 0,
    experience_points INT DEFAULT 0,
    total_classes_joined INT DEFAULT 0,
    favorite_style TEXT,
    streak_days INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Class templates table
CREATE TABLE IF NOT EXISTS class_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    difficulty INT DEFAULT 3,
    classroom TEXT,
    min_people INT DEFAULT 1,
    max_count INT DEFAULT 20,
    class_type TEXT DEFAULT 'group',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Class instances table
CREATE TABLE IF NOT EXISTS class_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES class_templates(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    classroom TEXT,
    difficulty INT DEFAULT 3,
    max_count INT DEFAULT 20,
    min_people INT DEFAULT 1,
    class_type TEXT DEFAULT 'group',
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES class_instances(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'waiting', 'cancelled', 'attended')),
    queue_number INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payment cards table
CREATE TABLE IF NOT EXISTS payment_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    price INT NOT NULL,
    original_price INT,
    passes INT NOT NULL, -- -1 for unlimited
    valid_days INT NOT NULL,
    description TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Purchase records table
CREATE TABLE IF NOT EXISTS purchase_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID REFERENCES payment_cards(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    card_name TEXT NOT NULL,
    price INT NOT NULL,
    passes_added INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance: Indexes
CREATE INDEX IF NOT EXISTS idx_class_templates_teacher_id ON class_templates(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_instances_template_id ON class_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_class_instances_teacher_id ON class_instances(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_instances_date ON class_instances(date);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_records_card_id ON purchase_records(card_id);
CREATE INDEX IF NOT EXISTS idx_purchase_records_user_id ON purchase_records(user_id);

-- Security: Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_records ENABLE ROW LEVEL SECURITY;

-- Security: RLS Policies (Basic defaults)
-- Publicly readable tables
CREATE POLICY "Public Read Teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Public Read Templates" ON class_templates FOR SELECT USING (true);
CREATE POLICY "Public Read Instances" ON class_instances FOR SELECT USING (true);
CREATE POLICY "Public Read Payment Cards" ON payment_cards FOR SELECT USING (true);

-- User-specific tables
CREATE POLICY "Users Read Own Profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users Update Own Profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users Read Own Bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users Insert Own Bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users Read Own Purchase Records" ON purchase_records FOR SELECT USING (auth.uid() = user_id);
```

- [ ] **Step 2: Commit changes**

Run:
```bash
git add supabase/migrations/20260526_initial_schema.sql
git commit --amend --no-edit
```
