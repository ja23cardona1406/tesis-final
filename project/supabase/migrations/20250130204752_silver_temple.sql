/*
  # Schema for Dairy Production System

  1. New Tables
    - `dairy_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `production_liters` (decimal)
      - `temperature` (decimal)
      - `humidity` (decimal)
      - `feed_amount` (decimal)
      - `created_at` (timestamp)
    - `predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `predicted_production` (decimal)
      - `confidence_level` (decimal)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Dairy Records Table
CREATE TABLE dairy_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  production_liters decimal NOT NULL CHECK (production_liters >= 0),
  temperature decimal NOT NULL,
  humidity decimal NOT NULL CHECK (humidity >= 0 AND humidity <= 100),
  feed_amount decimal NOT NULL CHECK (feed_amount >= 0),
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_temperature CHECK (temperature >= -10 AND temperature <= 50)
);

-- Predictions Table
CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  predicted_production decimal NOT NULL CHECK (predicted_production >= 0),
  confidence_level decimal NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE dairy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Policies for dairy_records
CREATE POLICY "Users can insert their own records"
  ON dairy_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own records"
  ON dairy_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for predictions
CREATE POLICY "Users can view their own predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);