-- ===============================
-- Database Setup for Content Management System
-- Villa Finishings Project
-- ===============================

-- 1. Create user_roles table for user permissions management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure no duplicate user in the table
    CONSTRAINT unique_user_role UNIQUE(user_id),
    
    -- Ensure role is one of the valid values
    CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
);

-- 2. Create categories table for project organization
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    cover_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    duration TEXT,
    location TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    scope_items JSONB DEFAULT '[]'::jsonb,
    gallery JSONB DEFAULT '[]'::jsonb, -- Support for images and videos
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create general content table
CREATE TABLE IF NOT EXISTS public.content (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- Security Settings (Row Level Security)
-- ===============================

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Read policy for user_roles: Only admins can read
CREATE POLICY "Admin can view all user roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Write policy for user_roles: Only admins can modify
CREATE POLICY "Admin can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Read policy for categories: Everyone can read
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

-- Write policy for categories: Only admins can modify
CREATE POLICY "Admin can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Read policy for projects: Everyone can read
CREATE POLICY "Anyone can view projects" ON public.projects
    FOR SELECT USING (true);

-- Write policy for projects: Only admins can modify
CREATE POLICY "Admin can manage projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Enable RLS on content table
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Read policy for content: Everyone can read
CREATE POLICY "Anyone can view content" ON public.content
    FOR SELECT USING (true);

-- Write policy for content: Only admins can modify
CREATE POLICY "Admin can manage content" ON public.content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- ===============================
-- Helper Functions
-- ===============================

-- Function to get user information by email
CREATE OR REPLACE FUNCTION public.get_user_by_email(user_email TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Return user information
    RETURN QUERY
    SELECT au.id, au.email::TEXT, au.created_at
    FROM auth.users au
    WHERE au.email = user_email;
END;
$$;

-- Function to get all users with their roles (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
    id UUID,
    email TEXT,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- Return users with roles
    RETURN QUERY
    SELECT 
        au.id, 
        au.email::TEXT, 
        COALESCE(ur.role, 'user'::TEXT) as role,
        au.created_at
    FROM auth.users au
    LEFT JOIN public.user_roles ur ON au.id = ur.user_id
    ORDER BY au.created_at DESC;
END;
$$;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- Triggers
-- ===============================

-- Add trigger to update updated_at in user_roles table
DROP TRIGGER IF EXISTS set_updated_at_user_roles ON public.user_roles;
CREATE TRIGGER set_updated_at_user_roles
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger to update updated_at in categories table
DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger to update updated_at in projects table
DROP TRIGGER IF EXISTS set_updated_at_projects ON public.projects;
CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add trigger to update updated_at in content table
DROP TRIGGER IF EXISTS set_updated_at_content ON public.content;
CREATE TRIGGER set_updated_at_content
    BEFORE UPDATE ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ===============================
-- Initial Data
-- ===============================

-- Add default categories
INSERT INTO public.categories (name, description) VALUES
    ('Villas', 'Luxury villa finishing projects'),
    ('Hotels', 'Hotel and hospitality finishing projects'),
    ('Commercial', 'Commercial building finishing projects'),
    ('Residential', 'Residential apartment finishing projects'),
    ('Office', 'Office space finishing projects')
ON CONFLICT (name) DO NOTHING;

-- Add sample projects with English content
INSERT INTO public.projects (slug, name, cover_url, duration, location, tags, scope_items, category_id) 
SELECT 
    'villa-al-noor',
    'Villa Al Noor',
    '/api/placeholder/800/600',
    '3 months',
    'Amman, Jordan',
    '["Interior Finishing", "Gypsum", "Luxury Paint"]'::jsonb,
    '["Suspended ceilings", "Luxury paints", "Porcelain flooring", "Kitchen installation"]'::jsonb,
    c.id
FROM public.categories c 
WHERE c.name = 'Villas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.projects (slug, name, cover_url, duration, location, tags, scope_items, category_id) 
SELECT 
    'villa-al-rawda',
    'Villa Al Rawda', 
    '/api/placeholder/800/600',
    '5 months',
    'Zarqa, Jordan',
    '["Exterior Finishing", "Stone Facade", "Insulation"]'::jsonb,
    '["Stone cladding", "Natural stone facade", "Thermal insulation", "Waterproofing"]'::jsonb,
    c.id
FROM public.categories c 
WHERE c.name = 'Villas'
ON CONFLICT (slug) DO NOTHING;

-- Add default content settings
INSERT INTO public.content (key, value) VALUES
    ('site_settings', '{
        "brandName": "Villa Finishings",
        "logoUrl": null,
        "faviconUrl": null
    }'::jsonb),
    ('hero_content', '{
        "title": "Welcome to Premium Finishings 👋",
        "subtitle": "Transform your space with our luxury interior and exterior finishing services",
        "ctaPrimary": "View Projects",
        "ctaSecondary": "Contact Us"
    }'::jsonb),
    ('navigation', '{
        "services": "Services",
        "portfolio": "Portfolio",
        "contact": "Contact Us",
        "allProjects": "All Projects"
    }'::jsonb),
    ('sections', '{
        "services": {"title": "Our Services"},
        "portfolio": {"title": "Our Work", "viewAll": "View All"},
        "contact": {
            "title": "Contact Us",
            "name": "Name",
            "phone": "Phone Number", 
            "description": "Message",
            "submit": "Send Message"
        },
        "footer": {
            "followUs": "Follow Us",
            "privacy": "Privacy Policy",
            "copyrightPrefix": "All rights reserved"
        }
    }'::jsonb),
    ('social_links', '{
        "whatsapp": "https://wa.me/962791234567",
        "instagram": "https://instagram.com/villa_finishings",
        "facebook": "https://facebook.com/villa.finishings",
        "tiktok": null
    }'::jsonb),
    ('slideshow_images', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ===============================
-- Performance Indexes
-- ===============================

-- Indexes for quick search in user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Indexes for quick search in categories
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- Indexes for quick search in projects
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects(category_id);

-- Indexes for quick search in content
CREATE INDEX IF NOT EXISTS idx_content_key ON public.content(key);

-- ===============================
-- Additional Settings
-- ===============================

-- Allow authenticated users to read their own information
GRANT SELECT ON auth.users TO authenticated;

-- Allow admins to access all users (for helper functions)
GRANT SELECT ON auth.users TO service_role;

-- Table comments for documentation
COMMENT ON TABLE public.user_roles IS 'User roles table - defines permissions for each user';
COMMENT ON TABLE public.categories IS 'Project categories table - helps organize projects by type';
COMMENT ON TABLE public.projects IS 'Projects table - contains details of all projects with media gallery support';
COMMENT ON TABLE public.content IS 'General content table - contains site settings and shared content';

-- Column comments
COMMENT ON COLUMN public.projects.gallery IS 'JSONB array containing images and videos with metadata (type, url, caption, variant)';
COMMENT ON COLUMN public.projects.scope_items IS 'JSONB array of work scope items/deliverables';
COMMENT ON COLUMN public.projects.tags IS 'JSONB array of project tags for filtering and categorization';

-- ===============================
-- Views for easier data access
-- ===============================

-- View for projects with category information
CREATE OR REPLACE VIEW public.projects_with_categories AS
SELECT 
    p.*,
    c.name as category_name,
    c.description as category_description
FROM public.projects p
LEFT JOIN public.categories c ON p.category_id = c.id;

-- View for user information with roles
CREATE OR REPLACE VIEW public.users_with_roles AS
SELECT 
    au.id,
    au.email,
    au.created_at,
    COALESCE(ur.role, 'user') as role,
    ur.updated_at as role_updated_at
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id;

-- Grant access to views
GRANT SELECT ON public.projects_with_categories TO authenticated, anon;
GRANT SELECT ON public.users_with_roles TO authenticated;

-- ===============================
-- Success Message
-- ===============================
DO $$
BEGIN
    RAISE NOTICE 'Database setup completed successfully!';
    RAISE NOTICE 'Features included:';
    RAISE NOTICE '- User roles and permissions';
    RAISE NOTICE '- Project categories';
    RAISE NOTICE '- Enhanced projects with video/image gallery';
    RAISE NOTICE '- Site content management';
    RAISE NOTICE '- Social media links';
    RAISE NOTICE '- Performance indexes';
    RAISE NOTICE '- Helper functions and views';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Add your user ID to user_roles table as admin';
    RAISE NOTICE '2. Update social media links in content table';
    RAISE NOTICE '3. Upload your logo and favicon through admin panel';
END $$;
