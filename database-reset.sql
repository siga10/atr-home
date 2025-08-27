-- تنظيف وإعادة إنشاء جدول user_roles
-- نفذ هذا الملف إذا كان الجدول موجود بالفعل

-- حذف السياسات الموجودة
DROP POLICY IF EXISTS "Anyone can read user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Authenticated users can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can manage user roles" ON public.user_roles;

-- حذف الجدول إذا كان موجود
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- إنشاء الجدول من جديد
CREATE TABLE public.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- ضمان عدم تكرار المستخدم في الجدول
    CONSTRAINT unique_user_role UNIQUE(user_id),
    
    -- ضمان أن الدور من القيم المحددة
    CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
);

-- إضافة المستخدم كمشرف
INSERT INTO public.user_roles (user_id, role) 
VALUES ('713a765d-87ba-4fcf-839e-1d4589833dd7', 'admin');

-- تفعيل RLS بشكل مبسط
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة بسيطة - الجميع يمكنهم القراءة (مؤقتاً للاختبار)
CREATE POLICY "Anyone can read user roles" ON public.user_roles
    FOR SELECT USING (true);

-- سياسة كتابة بسيطة - المستخدمون المسجلون يمكنهم الكتابة (مؤقتاً للاختبار)  
CREATE POLICY "Authenticated users can manage user roles" ON public.user_roles
    FOR ALL USING (auth.role() = 'authenticated');

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- التحقق من النتيجة
SELECT 'Setup completed successfully!' as status;
SELECT * FROM public.user_roles;
