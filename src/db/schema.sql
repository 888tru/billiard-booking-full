-- ============================================
-- Billiard Club Booking System
-- PostgreSQL Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLUBS
-- ============================================
CREATE TABLE clubs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    address     TEXT NOT NULL,
    phone       TEXT NOT NULL,
    open_time   TIME NOT NULL DEFAULT '12:00',
    close_time  TIME NOT NULL DEFAULT '04:00',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- HALLS
-- ============================================
CREATE TABLE halls (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,           -- "Основной зал", "VIP зал"
    sort_order  INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_halls_club ON halls(club_id);

-- ============================================
-- TABLES
-- ============================================
CREATE TABLE tables (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hall_id         UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,           -- "Стол 1", "VIP 1"
    image_url       TEXT,
    price_per_hour  INT NOT NULL DEFAULT 3000,  -- in tenge
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed" || echo "Port 3000 was free"lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed" || echo "Port 3000 was free"lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed" || echo "Port 3000 was free"lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed" || echo "Port 3000 was free"lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed" || echo "Port 3000 was free"lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed" || echo "Port 3000 was free"lsof -ti:3000 | xargs kill -9 2>/dev/null && echo "Port 3000 freed" || echo "Port 3000 was free"    status          TEXT NOT NULL DEFAULT 'free'
                    CHECK (status IN ('free', 'reserved', 'playing', 'paused')),
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tables_hall ON tables(hall_id);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id        UUID NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
    customer_name   TEXT NOT NULL,
    phone           TEXT NOT NULL,
    date            DATE NOT NULL,
    start_time      TIME NOT NULL,
    duration        INT NOT NULL,                   -- in hours (0 = open time)
    end_time        TIME GENERATED ALWAYS AS (
                        CASE WHEN duration > 0
                             THEN start_time + (duration || ' hours')::INTERVAL
                             ELSE NULL
                        END
                    ) STORED,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_price     INT NOT NULL DEFAULT 0,         -- in tenge
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_table_date ON bookings(table_id, date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(date);

-- Prevent overlapping confirmed bookings on the same table + date
-- Application-level check is also required for complex overnight logic
CREATE INDEX idx_bookings_overlap ON bookings(table_id, date, start_time)
    WHERE status IN ('pending', 'confirmed');

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount          INT NOT NULL,               -- in tenge
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    provider        TEXT NOT NULL
                    CHECK (provider IN ('kaspi', 'apple_pay', 'google_pay', 'cash')),
    provider_tx_id  TEXT,                       -- external transaction ID
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- SLOT LOCKS (Prevent double booking)
-- ============================================
CREATE TABLE slot_locks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id    UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    date        DATE NOT NULL,
    start_time  TIME NOT NULL,
    duration    INT NOT NULL DEFAULT 1,
    locked_by   TEXT,                           -- session ID or user identifier
    expires_at  TIMESTAMPTZ NOT NULL,           -- lock TTL (NOW() + 5 min)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_slot_locks_table_date ON slot_locks(table_id, date);
CREATE INDEX idx_slot_locks_expires ON slot_locks(expires_at);

-- Unique constraint to prevent duplicate locks
CREATE UNIQUE INDEX idx_slot_locks_unique
    ON slot_locks(table_id, date, start_time)
    WHERE expires_at > NOW();

-- ============================================
-- SESSIONS (Table game sessions)
-- ============================================
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id        UUID NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
    booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
    client          TEXT NOT NULL,
    start_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration        INT NOT NULL DEFAULT 0,         -- in hours (0 = open time)
    mode            TEXT NOT NULL DEFAULT 'open'
                    CHECK (mode IN ('open', '1h', '2h', '3h', 'custom')),
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'finished')),
    pauses          JSONB NOT NULL DEFAULT '[]',    -- [{start, end}]
    finished_at     TIMESTAMPTZ,
    total_price     INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_table ON sessions(table_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_created ON sessions(created_at);

-- ============================================
-- SEED DATA
-- ============================================

-- Club
INSERT INTO clubs (id, name, address, phone, open_time, close_time)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'BILLIARD CLUB',
    'ул. Ауэзова 123, Алматы',
    '+7 (777) 123-45-67',
    '12:00',
    '04:00'
);

-- Halls
INSERT INTO halls (id, club_id, name, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Основной зал', 1),
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'VIP зал', 2);

-- Tables
INSERT INTO tables (id, hall_id, name, price_per_hour, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000010', 'Стол 1', 3000, 1),
    ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010', 'Стол 2', 3000, 2),
    ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000010', 'Стол 3', 3000, 3),
    ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000010', 'Стол 4', 3000, 4),
    ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000010', 'Стол 5', 3000, 5),
    ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000010', 'Стол 6', 3500, 6),
    ('00000000-0000-0000-0000-000000000200', '00000000-0000-0000-0000-000000000011', 'VIP 1', 5000, 1),
    ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000011', 'VIP 2', 5000, 2),
    ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000011', 'VIP 3', 6000, 3);

-- ============================================
-- CLEANUP JOB (run via pg_cron or app cron)
-- Expires old slot locks
-- ============================================
-- DELETE FROM slot_locks WHERE expires_at < NOW();

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get available slots for a table on a date:
--
-- SELECT generate_series(
--     club.open_time,
--     club.close_time - interval '30 minutes',
--     interval '30 minutes'
-- )::time AS slot_time
-- FROM clubs club
-- WHERE club.id = $1
-- EXCEPT
-- SELECT start_time + (n * interval '30 minutes')
-- FROM bookings b, generate_series(0, b.duration * 2 - 1) AS n
-- WHERE b.table_id = $2
--   AND b.date = $3
--   AND b.status IN ('pending', 'confirmed')
-- EXCEPT
-- SELECT start_time + (n * interval '30 minutes')
-- FROM slot_locks sl, generate_series(0, sl.duration * 2 - 1) AS n
-- WHERE sl.table_id = $2
--   AND sl.date = $3
--   AND sl.expires_at > NOW();

