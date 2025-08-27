-- ===============================
-- Fix RLS Policies for Project Creation
-- ===============================

-- Drop the existing catch-all policy for projects
DROP POLICY IF EXISTS "Admin can manage projects" ON public.projects;

-- Create specific policies for different operations

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

-- Verify policies are correctly applied
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- Add comment for documentation
COMMENT ON TABLE public.projects IS 'Projects table with fixed RLS policies for proper admin access control';
