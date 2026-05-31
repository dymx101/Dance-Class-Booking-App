-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    userid UUID REFERENCES auth.users(id), -- Link to auth user
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
    remainingpasses INT DEFAULT 0, -- Matches User.remainingPasses
    experiencepoints INT DEFAULT 0, -- Matches User.experiencePoints
    totalclassesjoined INT DEFAULT 0, -- Matches User.totalClassesJoined
    favoritestyle TEXT, -- Matches User.favoriteStyle
    streakdays INT DEFAULT 0, -- Matches User.streakDays
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Class templates table
CREATE TABLE IF NOT EXISTS class_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    dayofweek INTEGER NOT NULL CHECK (dayofweek BETWEEN 0 AND 6),
    timestart TIME NOT NULL, -- Matches DanceClass.timeStart
    timeend TIME NOT NULL, -- Matches DanceClass.timeEnd
    teacherid UUID REFERENCES teachers(id) ON DELETE CASCADE,
    difficulty INT DEFAULT 3,
    classroom TEXT,
    minpeople INT DEFAULT 1,
    maxcount INT DEFAULT 20,
    type TEXT DEFAULT 'group', -- Matches DanceClass.type
    isactive BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Class instances table
CREATE TABLE IF NOT EXISTS class_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    templateid UUID REFERENCES class_templates(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    teacherid UUID REFERENCES teachers(id) ON DELETE CASCADE,
    timestart TIME NOT NULL, -- Matches DanceClass.timeStart
    timeend TIME NOT NULL, -- Matches DanceClass.timeEnd
    title TEXT NOT NULL,
    genre TEXT NOT NULL,
    classroom TEXT,
    difficulty INT DEFAULT 3,
    maxcount INT DEFAULT 20,
    minpeople INT DEFAULT 1,
    bookedcount INTEGER DEFAULT 0,
    type TEXT DEFAULT 'group', -- Matches DanceClass.type
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classid UUID REFERENCES class_instances(id) ON DELETE CASCADE, -- Matches Booking.classId
    userid UUID REFERENCES users(id) ON DELETE CASCADE, -- Matches Booking.userId
    status TEXT DEFAULT 'booked' CHECK (status IN ('booked', 'waiting', 'cancelled', 'attended')),
    queuenumber INT, -- Matches Booking.queueNumber
    timestamp TIMESTAMPTZ DEFAULT NOW(), -- Matches Booking.timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Payment cards table
CREATE TABLE IF NOT EXISTS payment_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    price INT NOT NULL,
    originalprice INT, -- Matches PaymentCard.originalPrice
    passes INT NOT NULL, -- -1 for unlimited
    validdays INT NOT NULL, -- Matches PaymentCard.validDays
    description TEXT,
    badge TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Purchase records table
CREATE TABLE IF NOT EXISTS purchase_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cardid UUID REFERENCES payment_cards(id) ON DELETE SET NULL, -- Matches PurchaseRecord.cardId
    userid UUID REFERENCES users(id) ON DELETE CASCADE,
    cardname TEXT NOT NULL, -- Matches PurchaseRecord.cardName
    price INT NOT NULL,
    passesadded INT NOT NULL, -- Matches PurchaseRecord.passesAdded
    date TIMESTAMPTZ DEFAULT NOW(), -- Matches PurchaseRecord.date
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance: Indexes
CREATE INDEX IF NOT EXISTS idx_class_templates_teacherid ON class_templates(teacherid);
CREATE INDEX IF NOT EXISTS idx_class_instances_templateid ON class_instances(templateid);
CREATE INDEX IF NOT EXISTS idx_class_instances_teacherid ON class_instances(teacherid);
CREATE INDEX IF NOT EXISTS idx_class_instances_date ON class_instances(date);
CREATE INDEX IF NOT EXISTS idx_bookings_classid ON bookings(classid);
CREATE INDEX IF NOT EXISTS idx_bookings_userid ON bookings(userid);
CREATE INDEX IF NOT EXISTS idx_purchase_records_cardid ON purchase_records(cardid);
CREATE INDEX IF NOT EXISTS idx_purchase_records_userid ON purchase_records(userid);

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

CREATE POLICY "Users Read Own Bookings" ON bookings FOR SELECT USING (auth.uid() = userid);
CREATE POLICY "Users Insert Own Bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = userid);

CREATE POLICY "Users Read Own Purchase Records" ON purchase_records FOR SELECT USING (auth.uid() = userid);
