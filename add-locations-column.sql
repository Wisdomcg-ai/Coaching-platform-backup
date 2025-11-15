-- Add locations column to business_profiles table
-- This stores an array of location/service area strings

ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS locations TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN business_profiles.locations IS 'Array of business locations or service areas';
