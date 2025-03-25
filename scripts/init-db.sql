-- Insertar usuarios predeterminados
INSERT INTO users (username, password, is_admin) VALUES 
('admin', '123', true),
('Luis Glez', '', false),
('David Glez', '', false),
('Luis Glez Llobet', '', false),
('Martina', '', false),
('Juan', '', false),
('Mº Teresa', '', false)
ON CONFLICT (username) DO NOTHING;

-- Insertar reservas predeterminadas para David Glez (userId 3)
-- 1. Puente de mayo
INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2025-04-30', '2025-05-04', 4, 'Puente de mayo', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2025-04-30' AND end_date = '2025-05-04');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2026-04-30', '2026-05-03', 4, 'Puente de mayo', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2026-04-30' AND end_date = '2026-05-03');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2027-04-30', '2027-05-02', 4, 'Puente de mayo', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2027-04-30' AND end_date = '2027-05-02');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2028-04-30', '2028-05-03', 4, 'Puente de mayo', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2028-04-30' AND end_date = '2028-05-03');

-- 2. Última quincena de Junio
INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2025-06-23', '2025-07-06', 4, 'Última quincena de Junio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2025-06-23' AND end_date = '2025-07-06');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2026-06-22', '2026-07-05', 4, 'Última quincena de Junio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2026-06-22' AND end_date = '2026-07-05');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2027-06-21', '2027-07-03', 4, 'Última quincena de Junio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2027-06-21' AND end_date = '2027-07-03');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2028-06-20', '2028-07-02', 4, 'Última quincena de Junio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2028-06-20' AND end_date = '2028-07-02');

-- 3. Última quincena de Julio
INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2025-07-21', '2025-08-03', 4, 'Última quincena de Julio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2025-07-21' AND end_date = '2025-08-03');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2026-07-20', '2026-08-02', 4, 'Última quincena de Julio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2026-07-20' AND end_date = '2026-08-02');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2027-07-19', '2027-08-01', 4, 'Última quincena de Julio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2027-07-19' AND end_date = '2027-08-01');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2028-07-18', '2028-07-31', 4, 'Última quincena de Julio', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2028-07-18' AND end_date = '2028-07-31');

-- 4. Última quincena de Agosto
INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2025-08-18', '2025-08-31', 4, 'Última quincena de Agosto', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2025-08-18' AND end_date = '2025-08-31');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2026-08-24', '2026-09-06', 4, 'Última quincena de Agosto', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2026-08-24' AND end_date = '2026-09-06');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2027-08-23', '2027-09-05', 4, 'Última quincena de Agosto', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2027-08-23' AND end_date = '2027-09-05');

INSERT INTO reservations (user_id, start_date, end_date, number_of_guests, notes, status, created_at)
SELECT 3, '2028-08-22', '2028-09-04', 4, 'Última quincena de Agosto', 'approved', NOW()
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE user_id = 3 AND start_date = '2028-08-22' AND end_date = '2028-09-04');