import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!


export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (سنضيفها لاحقاً حسب الجداول)
export interface Project {
  id: string
  slug: string
  name: string
  coverUrl: string
  images: string[] // Legacy field - for backward compatibility
  gallery?: any[] // JSONB array for images and videos with metadata
  scope_items?: string[] // JSONB array of project scope items (database field)
  scopeItems?: string[] // camelCase version for frontend compatibility
  duration: string
  location?: string
  tags?: string[]
  content?: string
  category_id?: string
  category?: any // Category object from join
  featured?: boolean // Whether project is featured on homepage
  created_at: string
  updated_at: string
}
