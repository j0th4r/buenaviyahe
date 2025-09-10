-- Migration: Add user roles to the profiles table
-- Run this migration in your Supabase SQL editor

-- Add role column to profiles table
ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'business_owner'));

-- Add indexes for better performance
CREATE INDEX idx_profiles_role ON profiles (role);

-- Create a function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid uuid)
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER;

-- Update RLS policies for admin access
-- Allow admins to see all spots
DROP POLICY IF EXISTS "Enable read access for all users" ON spots;
CREATE POLICY "Enable read access for all users" ON spots
FOR SELECT USING (true);

-- Allow business owners and admins to manage spots
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON spots;
CREATE POLICY "Enable insert for business owners" ON spots
FOR INSERT WITH CHECK (
  get_user_role(auth.uid()) IN ('admin', 'business_owner')
);

CREATE POLICY "Enable update for business owners" ON spots
FOR UPDATE USING (
  get_user_role(auth.uid()) IN ('admin', 'business_owner')
);

CREATE POLICY "Enable delete for business owners" ON spots
FOR DELETE USING (
  get_user_role(auth.uid()) IN ('admin', 'business_owner')
);

-- Allow business owners and admins to manage reviews
CREATE POLICY "Enable admins to manage all reviews" ON reviews
FOR ALL USING (
  get_user_role(auth.uid()) IN ('admin', 'business_owner')
);

-- Update profiles RLS to allow admins to see all profiles
CREATE POLICY "Enable admins to view all profiles" ON profiles
FOR SELECT USING (
  auth.uid() = id OR get_user_role(auth.uid()) IN ('admin', 'business_owner')
);

-- Allow admins to update any profile
CREATE POLICY "Enable admins to update profiles" ON profiles
FOR UPDATE USING (
  auth.uid() = id OR get_user_role(auth.uid()) = 'admin'
);

-- Create an admin user (update the email to your admin email)
-- INSERT INTO auth.users (email, role) VALUES ('admin@buenaviyahe.com', 'authenticated');
-- You'll need to set this up through the Supabase auth UI or your application

-- To make an existing user an admin, update their profile:
-- UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here';

-- To make an existing user a business owner:
-- UPDATE profiles SET role = 'business_owner' WHERE id = 'your-user-id-here';
