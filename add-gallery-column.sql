-- ===============================
-- Add gallery column to projects table
-- ===============================

-- Add gallery column to store media items (images/videos) with metadata
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;

-- Add scope_items column as well (since it's used in the code)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS scope_items JSONB DEFAULT '[]'::jsonb;

-- Create index for better performance when querying gallery
CREATE INDEX IF NOT EXISTS idx_projects_gallery ON public.projects USING GIN (gallery);
CREATE INDEX IF NOT EXISTS idx_projects_scope_items ON public.projects USING GIN (scope_items);

-- Add comments for documentation
COMMENT ON COLUMN public.projects.gallery IS 'Array of media items (images/videos) with metadata like type, url, caption, id';
COMMENT ON COLUMN public.projects.scope_items IS 'Array of scope items/features for the project';

-- Optional: Migrate data from images column to gallery column if needed
-- This converts the old images array format to the new gallery format
-- Note: Handle both text[] and jsonb types for images column
UPDATE public.projects 
SET gallery = (
    CASE 
        -- If images is jsonb type
        WHEN pg_typeof(images) = 'jsonb'::regtype THEN (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'id', (EXTRACT(EPOCH FROM NOW()) * 1000 + ROW_NUMBER() OVER())::TEXT,
                    'type', 'image',
                    'url', image_url,
                    'caption', 'Migrated image'
                )
            )
            FROM JSONB_ARRAY_ELEMENTS_TEXT(images) AS image_url
            WHERE image_url IS NOT NULL AND image_url != ''
        )
        -- If images is text[] type
        ELSE (
            SELECT JSONB_AGG(
                JSONB_BUILD_OBJECT(
                    'id', (EXTRACT(EPOCH FROM NOW()) * 1000 + ROW_NUMBER() OVER())::TEXT,
                    'type', 'image', 
                    'url', image_url,
                    'caption', 'Migrated image'
                )
            )
            FROM UNNEST(images::text[]) AS image_url
            WHERE image_url IS NOT NULL AND image_url != ''
        )
    END
)
WHERE images IS NOT NULL 
  AND (
    (pg_typeof(images) = 'jsonb'::regtype AND images != '[]'::jsonb) OR
    (pg_typeof(images) = 'text[]'::regtype AND array_length(images::text[], 1) > 0)
  )
  AND (gallery IS NULL OR gallery = '[]'::jsonb);

-- Show the migration results
SELECT 
    slug,
    name,
    CASE 
        WHEN pg_typeof(images) = 'jsonb'::regtype THEN JSONB_ARRAY_LENGTH(COALESCE(images, '[]'::jsonb))
        ELSE COALESCE(array_length(images::text[], 1), 0)
    END as old_images_count,
    JSONB_ARRAY_LENGTH(COALESCE(gallery, '[]'::jsonb)) as new_gallery_count
FROM public.projects
WHERE images IS NOT NULL;
