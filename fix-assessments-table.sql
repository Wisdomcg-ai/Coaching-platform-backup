-- ============================================================================
-- FIX ASSESSMENTS TABLE SCHEMA
-- Update assessments table to match what the application code expects
-- ============================================================================

-- Drop the old minimal table if it exists
DROP TABLE IF EXISTS assessments CASCADE;

-- Create the full assessments table with all required columns
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Assessment answers and scores
  answers JSONB NOT NULL DEFAULT '{}',
  total_score INTEGER NOT NULL DEFAULT 0,
  percentage INTEGER NOT NULL DEFAULT 0,
  health_status TEXT,

  -- Section scores (actual points earned)
  foundation_score INTEGER DEFAULT 0,
  strategic_wheel_score INTEGER DEFAULT 0,
  profitability_score INTEGER DEFAULT 0,
  engines_score INTEGER DEFAULT 0,
  disciplines_score INTEGER DEFAULT 0,

  -- Section maximum scores (for percentage calculations)
  foundation_max INTEGER DEFAULT 50,
  strategic_wheel_max INTEGER DEFAULT 70,
  profitability_max INTEGER DEFAULT 0,
  engines_max INTEGER DEFAULT 180,
  disciplines_max INTEGER DEFAULT 0,
  total_max INTEGER DEFAULT 300,

  -- Status and timestamps
  status TEXT DEFAULT 'completed',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_assessments_status ON assessments(status);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update own assessments" ON assessments;

CREATE POLICY "Users can read own assessments"
ON assessments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
ON assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
ON assessments FOR UPDATE
USING (auth.uid() = user_id);

-- Add helpful comment
COMMENT ON TABLE assessments IS 'Business assessment results - stores user responses and calculated scores';
