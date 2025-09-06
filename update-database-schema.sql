-- ===============================
-- تحديث مخطط قاعدة البيانات لدعم الحقول المفقودة
-- ===============================

-- إضافة الحقول المفقودة إلى جدول المشاريع
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scope_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS category_id UUID,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- إنشاء جدول الفئات إذا لم يكن موجود
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة مفتاح خارجي للفئات
ALTER TABLE public.projects 
ADD CONSTRAINT fk_projects_category 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- تفعيل RLS على جدول الفئات
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- سياسات الفئات
CREATE POLICY "Anyone can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage categories" ON public.categories
    FOR ALL USING (auth.role() = 'authenticated');

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_projects_gallery ON public.projects USING GIN (gallery);
CREATE INDEX IF NOT EXISTS idx_projects_scope_items ON public.projects USING GIN (scope_items);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON public.projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- إضافة مشغل لتحديث updated_at في جدول الفئات
DROP TRIGGER IF EXISTS set_updated_at_categories ON public.categories;
CREATE TRIGGER set_updated_at_categories
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- إضافة تعليقات للتوثيق
COMMENT ON COLUMN public.projects.gallery IS 'Array of media items (images/videos) with metadata like type, url, caption, id';
COMMENT ON COLUMN public.projects.scope_items IS 'Array of scope items/features for the project';
COMMENT ON COLUMN public.projects.category_id IS 'Foreign key reference to categories table';
COMMENT ON COLUMN public.projects.featured IS 'Whether project is featured on homepage';

-- إضافة بيانات تجريبية للفئات
INSERT INTO public.categories (id, name, description) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Interior Finishing', 'Interior design and finishing services'),
('550e8400-e29b-41d4-a716-446655440002', 'Exterior Finishing', 'Exterior design and finishing services'),
('550e8400-e29b-41d4-a716-446655440003', 'Design & Supervision', 'Design and supervision services')
ON CONFLICT (id) DO NOTHING;

-- عرض النتائج
SELECT 'Database schema updated successfully!' as status;
SELECT 'Added columns: gallery, scope_items, category_id, featured' as added_columns;
SELECT 'Created categories table with sample data' as categories_info;
