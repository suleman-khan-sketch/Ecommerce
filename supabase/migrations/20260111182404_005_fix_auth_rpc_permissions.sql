/*
  # Fix Authentication RPC Function Permissions

  1. Purpose
    - Ensure get_my_profile RPC function is accessible to authenticated users
    - Add explicit grants for the function
    - Improve error handling in the function

  2. Changes
    - Grant EXECUTE permission on get_my_profile to authenticated users
    - Grant EXECUTE permission on get_my_profile to anon users (for edge cases)
    - Update function to handle edge cases better

  3. Security
    - Function uses SECURITY DEFINER to access staff and customers tables
    - Only returns profile for the currently authenticated user
*/

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION get_my_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_profile() TO anon;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS JSON AS $$
DECLARE
    profile_data JSON;
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get user email
    SELECT email INTO current_user_email
    FROM auth.users
    WHERE id = current_user_id;
    
    IF current_user_email IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- First check if user is staff by email
    SELECT json_build_object(
        'id', s.id,
        'name', s.name,
        'email', s.email,
        'image_url', s.image_url,
        'role', sr.name,
        'published', s.published
    ) INTO profile_data
    FROM staff s
    JOIN staff_roles sr ON s.role_id = sr.id
    WHERE s.email = current_user_email
    AND s.published = true;
    
    IF profile_data IS NOT NULL THEN
        RETURN profile_data;
    END IF;
    
    -- Check if user is customer by user_id
    SELECT json_build_object(
        'id', c.id,
        'name', c.name,
        'email', c.email,
        'image_url', NULL,
        'role', 'customer',
        'store_name', c.store_name,
        'address', c.address,
        'phone', c.phone,
        'ein', c.ein,
        'age_verified', c.age_verified
    ) INTO profile_data
    FROM customers c
    WHERE c.user_id = current_user_id;
    
    RETURN profile_data;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in get_my_profile: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
