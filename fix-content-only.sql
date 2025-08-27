-- إنشاء جدول المحتوى فقط (تجاهل الأخطاء إذا كانت الأشياء موجودة)

-- حذف السياسات الموجودة للمحتوى (إذا كانت موجودة)
DROP POLICY IF EXISTS "Anyone can read content" ON public.content;
DROP POLICY IF EXISTS "Authenticated users can manage content" ON public.content;

-- إنشاء جدول المحتوى إذا لم يكن موجود
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
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- فهرس للأداء
CREATE INDEX IF NOT EXISTS idx_content_key ON public.content(key);

-- التحقق من النتيجة
SELECT 'Content table setup completed!' as status;
SELECT COUNT(*) as content_rows FROM public.content;
