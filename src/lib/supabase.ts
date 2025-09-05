import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

// هذا الأسلوب يقوم بإنشاء عميل Supabase جديد لكل طلب على الخادم
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )
}

// يمكنك إبقاء تعريف الواجهات (interfaces) في نفس الملف
export interface Project {
  id: string
  slug: string
  name: string
  coverUrl: string
  images: string[]
  gallery?: any[]
  scope_items?: string[]
  scopeItems?: string[]
  duration: string
  location?: string
  tags?: string[]
  content?: string
  category_id?: string
  featured?: boolean
  created_at: string
  updated_at: string
}
