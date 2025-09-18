/*
  # Initial Schema for Smart Parking System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `member_since` (timestamp)
    
    - `vehicles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `license_plate` (text, unique)
      - `make` (text)
      - `model` (text)
      - `color` (text)
      - `created_at` (timestamp)
    
    - `parking_spots`
      - `id` (uuid, primary key)
      - `spot_number` (text, unique)
      - `is_occupied` (boolean)
      - `vehicle_id` (uuid, foreign key to vehicles)
      - `updated_at` (timestamp)
    
    - `parking_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `vehicle_id` (uuid, foreign key to vehicles)
      - `parking_spot_id` (uuid, foreign key to parking_spots)
      - `start_time` (timestamp)
      - `end_time` (timestamp)
      - `status` (text)
      - `amount` (decimal)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own data
    - Add policies for staff to manage all data
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  member_since timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  license_plate text UNIQUE NOT NULL,
  make text DEFAULT '',
  model text DEFAULT '',
  color text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create parking spots table
CREATE TABLE IF NOT EXISTS parking_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_number text UNIQUE NOT NULL,
  is_occupied boolean DEFAULT false,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

-- Create parking sessions table
CREATE TABLE IF NOT EXISTS parking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  parking_spot_id uuid REFERENCES parking_spots(id) ON DELETE SET NULL,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  amount decimal DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'staff'
    )
  );

-- Policies for vehicles
CREATE POLICY "Users can manage own vehicles"
  ON vehicles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can read all vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'staff'
    )
  );

-- Policies for parking spots
CREATE POLICY "Anyone can read parking spots"
  ON parking_spots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage parking spots"
  ON parking_spots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'staff'
    )
  );

-- Policies for parking sessions
CREATE POLICY "Users can read own sessions"
  ON parking_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON parking_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can manage all sessions"
  ON parking_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'staff'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'staff'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS vehicles_user_id_idx ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS vehicles_license_plate_idx ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS parking_sessions_user_id_idx ON parking_sessions(user_id);
CREATE INDEX IF NOT EXISTS parking_sessions_vehicle_id_idx ON parking_sessions(vehicle_id);
CREATE INDEX IF NOT EXISTS parking_sessions_status_idx ON parking_sessions(status);

-- Insert sample parking spots
INSERT INTO parking_spots (spot_number) VALUES
  ('A-001'), ('A-002'), ('A-003'), ('A-004'), ('A-005'),
  ('A-006'), ('A-007'), ('A-008'), ('A-009'), ('A-010'),
  ('B-001'), ('B-002'), ('B-003'), ('B-004'), ('B-005'),
  ('B-006'), ('B-007'), ('B-008'), ('B-009'), ('B-010'),
  ('C-001'), ('C-002'), ('C-003'), ('C-004'), ('C-005'),
  ('C-006'), ('C-007'), ('C-008'), ('C-009'), ('C-010')
ON CONFLICT (spot_number) DO NOTHING;