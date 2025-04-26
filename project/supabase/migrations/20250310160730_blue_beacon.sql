/*
  # Update dairy records and predictions

  1. Changes
    - Add new columns to dairy_records if they don't exist
    - Create predictions table with proper structure
    - Add RLS policies for predictions

  2. Security
    - Enable RLS on predictions table
    - Add policies for farm members to view predictions
    - Add policies for operators and superusers to manage predictions
*/

-- Safely add new columns to dairy_records if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dairy_records' AND column_name = 'cow_id'
  ) THEN
    ALTER TABLE dairy_records ADD COLUMN cow_id uuid REFERENCES cows(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dairy_records' AND column_name = 'udder_humidity'
  ) THEN
    ALTER TABLE dairy_records ADD COLUMN udder_humidity numeric CHECK (udder_humidity BETWEEN 0 AND 100);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dairy_records' AND column_name = 'weekly_feed_kg'
  ) THEN
    ALTER TABLE dairy_records ADD COLUMN weekly_feed_kg numeric CHECK (weekly_feed_kg >= 0);
  END IF;
END $$;

-- Drop the predictions table if it exists
DROP TABLE IF EXISTS predictions CASCADE;

-- Create predictions table
CREATE TABLE predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cow_id uuid REFERENCES cows(id) NOT NULL,
  predicted_production numeric NOT NULL CHECK (predicted_production >= 0),
  actual_production numeric CHECK (actual_production >= 0),
  prediction_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on predictions table
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Farm members can view predictions"
  ON predictions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cows
    JOIN farm_members ON farm_members.farm_id = cows.farm_id
    WHERE cows.id = predictions.cow_id
    AND farm_members.user_id = auth.uid()
    AND farm_members.status = 'approved'
  ));

CREATE POLICY "Operators and superusers can manage predictions"
  ON predictions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM cows
    JOIN farm_members ON farm_members.farm_id = cows.farm_id
    WHERE cows.id = predictions.cow_id
    AND farm_members.user_id = auth.uid()
    AND farm_members.status = 'approved'
    AND farm_members.role IN ('operator', 'superuser')
  ));