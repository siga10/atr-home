-- Quick fix for missing categories table
-- Run this in Supabase SQL Editor if you want a minimal fix first

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Read policy for categories: Everyone can read
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- Write policy for categories: Allow all for now (you can restrict later)
CREATE POLICY "Anyone can manage categories for now" ON public.categories
    FOR ALL USING (true);

-- Add some sample categories
INSERT INTO public.categories (name, description) VALUES
    ('Villas', 'Luxury villa finishing projects'),
    ('Hotels', 'Hotel and hospitality finishing projects'),
    ('Commercial', 'Commercial building finishing projects'),
    ('Residential', 'Residential apartment finishing projects'),
    ('Office', 'Office space finishing projects')
ON CONFLICT (name) DO NOTHING;

-- Add category_id column to projects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='projects' AND column_name='category_id') THEN
        ALTER TABLE public.projects ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Success message
SELECT 'Categories table created successfully! Your app should work now.' as status;
