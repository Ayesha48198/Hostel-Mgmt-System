-- =========================================================
-- Hostel Management System — PostgreSQL schema (raw DDL)
-- Equivalent to what SQLAlchemy's Base.metadata.create_all()
-- generates from app/infrastructure/db/orm_models.py.
-- Run this manually only if you are NOT letting the app
-- auto-create tables on startup (see README).
-- =========================================================

CREATE DATABASE hostel_db;
-- \c hostel_db

CREATE TYPE room_type AS ENUM ('single', 'double', 'triple', 'dormitory');
CREATE TYPE room_status AS ENUM ('available', 'full', 'maintenance');
CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated');
CREATE TYPE fee_status AS ENUM ('pending', 'paid', 'overdue');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'online', 'bank_transfer');
CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'leave');

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type room_type NOT NULL DEFAULT 'single',
    capacity INTEGER NOT NULL DEFAULT 1,
    floor INTEGER NOT NULL DEFAULT 1,
    fee_per_month FLOAT NOT NULL DEFAULT 0,
    occupied_count INTEGER NOT NULL DEFAULT 0,
    status room_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    course VARCHAR(120) NOT NULL,
    year INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    guardian_name VARCHAR(120) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    address TEXT DEFAULT '',
    room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    status student_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_students_email ON students(email);

CREATE TABLE fees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount FLOAT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    due_date DATE NOT NULL,
    status fee_status NOT NULL DEFAULT 'pending',
    paid_date DATE,
    payment_method payment_method,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(80) NOT NULL,
    priority complaint_priority NOT NULL DEFAULT 'medium',
    status complaint_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL DEFAULT 'present',
    marked_by VARCHAR(80) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Sample seed data (optional)
INSERT INTO rooms (room_number, room_type, capacity, floor, fee_per_month) VALUES
 ('A-101', 'single', 1, 1, 5000),
 ('A-102', 'double', 2, 1, 3500),
 ('B-201', 'triple', 3, 2, 2800);
