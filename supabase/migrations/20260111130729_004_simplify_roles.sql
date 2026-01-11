-- =====================================================
-- SIMPLIFY ROLES
-- =====================================================
-- 
-- FINAL ROLE STRUCTURE:
-- 1. admin - Full access to admin dashboard, can manage everything
-- 2. customer - Can browse products, add to cart, place orders
--
-- =====================================================

-- Step 1: Update all existing staff to use role_id = 2 (admin)
UPDATE staff SET role_id = 2 WHERE role_id IN (1, 3);

-- Step 2: Delete unused roles (super_admin and cashier)
DELETE FROM staff_roles WHERE name IN ('super_admin', 'cashier');

-- Step 3: Update the admin role to be the default for staff
UPDATE staff_roles SET is_default = true WHERE name = 'admin';
UPDATE staff_roles SET is_default = false WHERE name = 'customer';

-- Step 4: Insert default admin user
INSERT INTO staff (name, email, phone, role_id, published) VALUES
    ('Admin', 'admin@zorvex.com', '+1234567890', 
     (SELECT id FROM staff_roles WHERE name = 'admin'), true)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role_id = EXCLUDED.role_id;

-- Delete old test users if they exist
DELETE FROM staff WHERE email IN ('superadmin@zorvex.com', 'cashier@zorvex.com');