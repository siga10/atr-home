-- ===============================
-- إعداد قاعدة البيانات لنظام إدارة المحتوى
-- ===============================

-- 1. إنشاء جدول user_roles لإدارة أدوار المستخدمين
CREATE TABLE IF NOT EXISTS public.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ضمان عدم تكرار المستخدم في الجدول
    CONSTRAINT unique_user_role UNIQUE(user_id),
    
    -- ضمان أن الدور من القيم المحددة
    CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
);

-- 2. إنشاء جدول المشاريع
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

-- 3. إنشاء جدول المحتوى العام
CREATE TABLE IF NOT EXISTS public.content (
    id BIGSERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================
-- إعدادات الأمان (Row Level Security)
-- ===============================

-- تفعيل RLS على جدول user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة user_roles: المدراء فقط يمكنهم القراءة
CREATE POLICY "Admin can view all user roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- سياسة الكتابة على user_roles: المدراء فقط يمكنهم التعديل
CREATE POLICY "Admin can manage user roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- تفعيل RLS على جدول المشاريع
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة المشاريع: الجميع يمكنهم القراءة
CREATE POLICY "Anyone can view projects" ON public.projects
    FOR SELECT USING (true);

-- سياسة إدخال المشاريع: المدراء فقط
CREATE POLICY "Admin can insert projects" ON public.projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- سياسة تحديث المشاريع: المدراء فقط
CREATE POLICY "Admin can update projects" ON public.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- سياسة حذف المشاريع: المدراء فقط
CREATE POLICY "Admin can delete projects" ON public.projects
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- تفعيل RLS على جدول المحتوى
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة المحتوى: الجميع يمكنهم القراءة
CREATE POLICY "Anyone can view content" ON public.content
    FOR SELECT USING (true);

-- سياسة الكتابة على المحتوى: المدراء فقط
CREATE POLICY "Admin can manage content" ON public.content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- ===============================
-- الدوال المساعدة
-- ===============================

-- دالة للحصول على معلومات المستخدم بالإيميل
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
    -- التحقق من أن المستخدم الحالي مدير
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur 
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
    
    -- إرجاع معلومات المستخدم
    RETURN QUERY
    SELECT au.id, au.email::TEXT, au.created_at
    FROM auth.users au
    WHERE au.email = user_email;
END;
$$;

-- دالة تحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===============================
-- المشغلات (Triggers)
-- ===============================

-- إضافة مشغل لتحديث updated_at في جدول user_roles
DROP TRIGGER IF EXISTS set_updated_at_user_roles ON public.user_roles;
CREATE TRIGGER set_updated_at_user_roles
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- إضافة مشغل لتحديث updated_at في جدول projects
DROP TRIGGER IF EXISTS set_updated_at_projects ON public.projects;
CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- إضافة مشغل لتحديث updated_at في جدول content
DROP TRIGGER IF EXISTS set_updated_at_content ON public.content;
CREATE TRIGGER set_updated_at_content
    BEFORE UPDATE ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ===============================
-- البيانات الأولية
-- ===============================

-- إضافة المستخدم الأول كمدير رئيسي
-- ملاحظة: استبدل 'YOUR_USER_ID_HERE' بمعرف المستخدم الحقيقي
-- يمكنك الحصول عليه من auth.users بعد تسجيل الدخول
INSERT INTO public.user_roles (user_id, role) 
VALUES ('df5422cd-3731-4899-aa6c-fd558ac18740', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- ===============================
-- فهارس الأداء
-- ===============================

-- فهرس للبحث السريع في user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- فهرس للبحث السريع في projects
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- فهرس للبحث السريع في content
CREATE INDEX IF NOT EXISTS idx_content_key ON public.content(key);

-- ===============================
-- إعدادات إضافية
-- ===============================

-- السماح للمستخدمين المسجلين بقراءة معلوماتهم الشخصية
GRANT SELECT ON auth.users TO authenticated;

-- السماح للمدراء بالوصول لجميع المستخدمين (للدالة المساعدة)
GRANT SELECT ON auth.users TO service_role;

-- تعليق يوضح الاستخدام
COMMENT ON TABLE public.user_roles IS 'جدول أدوار المستخدمين - يحدد صلاحيات كل مستخدم';
COMMENT ON TABLE public.projects IS 'جدول المشاريع - يحتوي على تفاصيل جميع المشاريع';
COMMENT ON TABLE public.content IS 'جدول المحتوى العام - يحتوي على إعدادات الموقع والمحتوى المشترك';
