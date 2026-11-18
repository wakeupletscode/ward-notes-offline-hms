-- =========================================
-- MedCare HMS — schema.sql
-- PostgreSQL database schema
-- =========================================

-- Create database (run manually once)
-- CREATE DATABASE medcare_hms;

-- =========================================
-- 1. DOCTORS table
-- =========================================
CREATE TABLE IF NOT EXISTS doctors (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    specialty   VARCHAR(80)   NOT NULL,
    phone       VARCHAR(20),
    email       VARCHAR(100),
    on_duty     BOOLEAN       DEFAULT TRUE,
    created_at  TIMESTAMP     DEFAULT NOW()
);

-- =========================================
-- 2. PATIENTS table
-- =========================================
CREATE TABLE IF NOT EXISTS patients (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    dob         DATE,
    blood_type  VARCHAR(3),
    phone       VARCHAR(20),
    email       VARCHAR(100),
    doctor_id   INT           REFERENCES doctors(id) ON DELETE SET NULL,
    status      VARCHAR(20)   DEFAULT 'Active'
                              CHECK (status IN ('Active','Admitted','Discharged')),
    created_at  TIMESTAMP     DEFAULT NOW()
);

-- =========================================
-- 3. APPOINTMENTS table
-- =========================================
CREATE TABLE IF NOT EXISTS appointments (
    id          SERIAL PRIMARY KEY,
    patient_id  INT           NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id   INT           NOT NULL REFERENCES doctors(id)  ON DELETE CASCADE,
    appt_date   DATE          NOT NULL,
    appt_time   TIME          NOT NULL,
    reason      TEXT,
    status      VARCHAR(20)   DEFAULT 'Scheduled'
                              CHECK (status IN ('Scheduled','Completed','Cancelled')),
    created_at  TIMESTAMP     DEFAULT NOW()
);

-- =========================================
-- 4. BILLS table
-- =========================================
CREATE TABLE IF NOT EXISTS bills (
    id          SERIAL PRIMARY KEY,
    patient_id  INT             NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    amount      NUMERIC(10,2)   NOT NULL CHECK (amount > 0),
    bill_type   VARCHAR(50),
    status      VARCHAR(20)     DEFAULT 'Pending'
                                CHECK (status IN ('Pending','Paid')),
    bill_date   DATE            DEFAULT CURRENT_DATE
);

-- =========================================
-- Indexes for performance
-- =========================================
CREATE INDEX IF NOT EXISTS idx_patients_status    ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_doctor    ON patients(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appts_date         ON appointments(appt_date);
CREATE INDEX IF NOT EXISTS idx_appts_patient      ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appts_status       ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_bills_patient      ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_status       ON bills(status);

-- =========================================
-- Seed data (sample records)
-- =========================================
INSERT INTO doctors (name, specialty, phone, email, on_duty) VALUES
  ('Dr. Ramesh Patel',  'Cardiology',   '+91 9812345670', 'r.patel@medcare.in',  TRUE),
  ('Dr. Sunita Rao',    'Neurology',    '+91 9823456781', 's.rao@medcare.in',    TRUE),
  ('Dr. Arjun Mehta',   'Orthopedics',  '+91 9834567892', 'a.mehta@medcare.in', FALSE),
  ('Dr. Kavita Nair',   'Pediatrics',   '+91 9845678903', 'k.nair@medcare.in',  TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO patients (name, dob, blood_type, phone, email, doctor_id, status) VALUES
  ('Priya Sharma', '1985-03-12', 'O+',  '+91 9898765432', 'priya@email.com', 1, 'Active'),
  ('Rajan Kumar',  '1970-07-22', 'A+',  '+91 9887654321', 'rajan@email.com', 2, 'Admitted'),
  ('Meena Iyer',   '1992-11-05', 'B-',  '+91 9876543210', 'meena@email.com', 1, 'Active'),
  ('Vivek Singh',  '1960-01-30', 'AB+', '+91 9865432109', 'vivek@email.com', 3, 'Discharged')
ON CONFLICT DO NOTHING;

INSERT INTO appointments (patient_id, doctor_id, appt_date, appt_time, reason, status) VALUES
  (1, 1, CURRENT_DATE, '09:00', 'Annual checkup',  'Scheduled'),
  (2, 2, CURRENT_DATE, '10:30', 'MRI follow-up',   'Completed'),
  (3, 1, CURRENT_DATE + 2, '11:00', 'ECG review',  'Scheduled')
ON CONFLICT DO NOTHING;

INSERT INTO bills (patient_id, amount, bill_type, status) VALUES
  (1, 3500.00,  'Consultation', 'Paid'),
  (2, 45000.00, 'Surgery',      'Pending'),
  (3, 1200.00,  'Lab Tests',    'Pending')
ON CONFLICT DO NOTHING;

-- =========================================
-- Useful queries for reporting
-- =========================================

-- Dashboard summary
-- SELECT
--   (SELECT COUNT(*) FROM patients)               AS total_patients,
--   (SELECT COUNT(*) FROM doctors WHERE on_duty)  AS doctors_on_duty,
--   (SELECT COUNT(*) FROM appointments WHERE appt_date = CURRENT_DATE AND status='Scheduled') AS today_pending,
--   (SELECT COALESCE(SUM(amount),0) FROM bills WHERE status='Pending') AS outstanding_amount;
