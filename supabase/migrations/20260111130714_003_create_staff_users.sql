-- =====================================================
-- CREATE STAFF USERS
-- =====================================================

-- Insert staff users (these will need Auth users created manually)
INSERT INTO staff (name, email, phone, role_id, published) VALUES
    ('Super Admin', 'superadmin@zorvex.com', '+1111111111', 1, true),
    ('Admin User', 'admin@zorvex.com', '+2222222222', 2, true),
    ('Cashier User', 'cashier@zorvex.com', '+3333333333', 3, true)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role_id = EXCLUDED.role_id;