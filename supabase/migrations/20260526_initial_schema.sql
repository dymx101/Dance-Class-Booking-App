-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    avatar TEXT, -- Matches Teacher.avatar
    tags TEXT[] DEFAULT '{}',
    rating DECIMAL DEFAULT 5.0,
    description TEXT, -- Matches Teacher.description
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    phone TEXT UNIQUE,
    avatar TEXT, -- Matches User.avatar
    remainingPasses INT DEFAULT 0, -- Matches User.remainingPasses
    experiencePoints INT DEFAULT 0, -- Matches User.experiencePoints
    totalClassesJoined INT DEFAULT 0, -- Matches User.totalClassesJoined
    favoriteStyle TEXT, -- Matches User.favoriteStyle
    streakDays INT DEFAULT 0, -- Matches User.streakDays
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Class templates table
CREATE TABLE IF NOT EXISTS class_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    dayOfWeek INTEGER NOT NULL CHECK (dayOfWeek BETWEEN 0 AND 6),
    timeStart TIME NOT NULL, -- Matches DanceClass.timeStart
    timeEnd TIME NOT NULL, -- Matches DanceClass.timeEnd
    teacherId UUID REFERENCES teachers(id) ON DELETE CASCADE,
    difficulty INT DEFAULT 3,
    classroom TEXT,
    minPeople INT DEFAULT 1,
    maxCount INT DEFAULT 20,
    type TEXT DEFAULT 'group', -- Matches DanceClass.type
    isActive BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Class instances table
CREATE TABLE IF NOT EXISTS class_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    templateId UUID REFERENCES class_templates(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    teacherId UUID REFERENCES teachers(id) ON DELETE CASCADE,
    timeStart TIME NOT NULL, -- Matches DanceClass.timeStart
    timeEnd TIME NOT NULL, -- Matches DanceClass.timeEnd
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    classroom TEXT,
    difficulty INT DEFAULT 3,
    maxCount INT DEFAULT 20,
    minPeople INT DEFAULT 1,
    type TEXT DEFAULT 'group', -- Matches DanceClass.type
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classId UUID REFERENCES class_instances(id) ON DELETE CASCADE, -- Matches Booking.classId
    userId UUID REFERENCES users(id) ON DELETE CASCADE, -- Matches Booking.userId
    status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'waiting', 'cancelled', 'attended')),
    queueNumber INT, -- Matches Booking.queueNumber
    timestamp TIMESTAMPTZ DEFAULT NOW(), -- Matches Booking.timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payment cards table
CREATE TABLE IF NOT EXISTS payment_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    price INT NOT NULL,
    originalPrice INT, -- Matches PaymentCard.originalPrice
    passes INT NOT NULL, -- -1 for unlimited
    validDays INT NOT NULL, -- Matches PaymentCard.validDays
    description TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Purchase records table
CREATE TABLE IF NOT EXISTS purchase_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cardId UUID REFERENCES payment_cards(id) ON DELETE SET NULL, -- Matches PurchaseRecord.cardId
    userId UUID REFERENCES users(id) ON DELETE CASCADE,
    cardName TEXT NOT NULL, -- Matches PurchaseRecord.cardName
    price INT NOT NULL,
    passesAdded INT NOT NULL, -- Matches PurchaseRecord.passesAdded
    date TIMESTAMPTZ DEFAULT NOW(), -- Matches PurchaseRecord.date
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance: Indexes
CREATE INDEX IF NOT EXISTS idx_class_templates_teacherId ON class_templates(teacherId);
CREATE INDEX IF NOT EXISTS idx_class_instances_templateId ON class_instances(templateId);
CREATE INDEX IF NOT EXISTS idx_class_instances_teacherId ON class_instances(teacherId);
CREATE INDEX IF NOT EXISTS idx_class_instances_date ON class_instances(date);
CREATE INDEX IF NOT EXISTS idx_bookings_classId ON bookings(classId);
CREATE INDEX IF NOT EXISTS idx_bookings_userId ON bookings(userId);
CREATE INDEX IF NOT EXISTS idx_purchase_records_cardId ON purchase_records(cardId);
CREATE INDEX IF NOT EXISTS idx_purchase_records_userId ON purchase_records(userId);

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

CREATE POLICY "Users Read Own Bookings" ON bookings FOR SELECT USING (auth.uid() = userId);
CREATE POLICY "Users Insert Own Bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = userId);

CREATE POLICY "Users Read Own Purchase Records" ON purchase_records FOR SELECT USING (auth.uid() = userId);
