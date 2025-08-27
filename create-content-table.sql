-- إنشاء جدول المحتوى المفقود
CREATE TABLE IF NOT EXISTS public.content (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة - الجميع يمكنهم القراءة
CREATE POLICY "Anyone can read content" ON public.content
    FOR SELECT USING (true);

-- سياسة كتابة - المستخدمون المسجلون يمكنهم الكتابة
CREATE POLICY "Authenticated users can manage content" ON public.content
    FOR ALL USING (auth.role() = 'authenticated');

-- إضافة بيانات تجريبية
INSERT INTO public.content (key, value) VALUES 
('content-overrides-ar', '{}'),
('content-overrides-en', '{}'),
('site-settings', '{}')
ON CONFLICT (key) DO NOTHING;

-- إنشاء جدول المشاريع إذا لم يكن موجود
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS على جدول المشاريع
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- سياسات المشاريع
CREATE POLICY "Anyone can view projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage projects" ON public.projects
    FOR ALL USING (auth.role() = 'authenticated');

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_content_key ON public.content(key);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

SELECT 'Content and Projects tables created successfully!' as status;
