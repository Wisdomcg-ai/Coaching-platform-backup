-- Migration: Create roadmap_progress table
-- This table stores which builds each user has completed

-- Create the table
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    completed_builds JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user_id ON public.roadmap_progress(user_id);

-- Enable Row Level Security
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can only read their own progress
CREATE POLICY "Users can view their own roadmap progress"
    ON public.roadmap_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own roadmap progress"
    ON public.roadmap_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own roadmap progress"
    ON public.roadmap_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roadmap_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_roadmap_progress_timestamp ON public.roadmap_progress;
CREATE TRIGGER update_roadmap_progress_timestamp
    BEFORE UPDATE ON public.roadmap_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_roadmap_progress_updated_at();

-- Grant permissions
GRANT ALL ON public.roadmap_progress TO authenticated;
GRANT ALL ON public.roadmap_progress TO service_role;

-- Sample query to verify table
-- SELECT * FROM public.roadmap_progress WHERE user_id = auth.uid();
