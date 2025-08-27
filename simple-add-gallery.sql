-- Add gallery column to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;

-- Add scope_items column as well
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS scope_items JSONB DEFAULT '[]'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_gallery ON public.projects USING GIN (gallery);
CREATE INDEX IF NOT EXISTS idx_projects_scope_items ON public.projects USING GIN (scope_items);

-- Add documentation comments
COMMENT ON COLUMN public.projects.gallery IS 'Array of media items (images/videos) with metadata like type, url, caption, id';
COMMENT ON COLUMN public.projects.scope_items IS 'Array of scope items/features for the project';

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;
