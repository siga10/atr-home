-- إعداد قاعدة البيانات البسيط
-- نسخ هذا الكود وتشغيله في SQL Editor في Supabase

-- 1. إنشاء جدول user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_role UNIQUE(user_id),
    CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
);

-- 2. إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول المشاريع
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    cover_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    duration TEXT,
    location TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    content TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء جدول المحتوى العام
CREATE TABLE IF NOT EXISTS public.content (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. تفعيل Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- 6. سياسات الأمان لـ user_roles
CREATE POLICY "Admin can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- 7. سياسات الأمان لـ categories
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- 8. سياسات الأمان لـ projects
CREATE POLICY "Anyone can view projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage projects" ON public.projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- 9. سياسات الأمان لـ content
CREATE POLICY "Anyone can view content" ON public.content
    FOR SELECT USING (true);

CREATE POLICY "Admin can manage content" ON public.content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- 10. إضافة فئات افتراضية
INSERT INTO public.categories (name, description) VALUES 
    ('Villas', 'Luxury villa projects with premium finishings'),
    ('Hotels', 'Hotel and hospitality projects'),
    ('Commercial', 'Commercial buildings and offices'),
    ('Residential', 'Residential apartments and compounds')
ON CONFLICT (name) DO NOTHING;

-- 11. إضافة المستخدم الأول كأدمن
-- ملاحظة: استبدل YOUR_USER_ID_HERE بمعرف المستخدم الحقيقي
-- يمكنك الحصول على معرف المستخدم من هنا:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- بعد الحصول على معرف المستخدم، قم بتشغيل هذا:
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 12. فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_content_key ON public.content(key);

-- تم الانتهاء من الإعداد!
