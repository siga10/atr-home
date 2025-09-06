import { supabase } from './supabase'
import { Category, Project } from '@/content/types'

// Projects CRUD Operations
export class ProjectService {
  // جلب جميع المشاريع
  static async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    return (data || []).map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      coverUrl: item.cover_url,
      images: Array.isArray(item.images) ? item.images : [],
      gallery: Array.isArray(item.gallery) ? item.gallery : (Array.isArray(item.images) ? item.images : []),
      scopeItems: Array.isArray(item.scope_items) ? item.scope_items : [],
      duration: item.duration,
      location: item.location,
      tags: Array.isArray(item.tags) ? item.tags : [],
      content: item.content,
      category_id: item.category_id,
      category: item.category,
      featured: item.featured || false,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
  }

  // باقي الميثودز: getBySlug, create, update, delete ... (عندك شغالين بنفس النسخة السابقة)
}

// Categories CRUD Operations
export class CategoryService {
  static async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  }

  // باقي الميثودز create, update, delete ...
}

// Content CRUD Operations
export class ContentService {
  // جلب المحتوى بالـ key
  static async get(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('content')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
      console.error('Error fetching content:', error)
      return null
    }

    return data?.value
  }

  // حفظ أو تحديث المحتوى
  static async set(key: string, value: any): Promise<boolean> {
    const { error } = await supabase
      .from('content')
      .upsert([{ key, value }], { onConflict: 'key' })

    if (error) {
      console.error('Error saving content:', error)
      return false
    }

    return true
  }

  // جلب جميع المحتويات
  static async getAll(): Promise<Record<string, any>> {
    const { data, error } = await supabase
      .from('content')
      .select('key, value')

    if (error) {
      console.error('Error fetching all content:', error)
      return {}
    }

    const result: Record<string, any> = {}
    data?.forEach(item => {
      result[item.key] = item.value
    })

    return result
  }

  // تحديث محتوى الموقع العام
  static async updateSiteContent(content: {
    hero?: any
    brandName?: string
    socials?: any
    slideshow?: string[]
  }): Promise<boolean> {
    try {
      const updates = [
        content.hero && { key: 'hero', value: content.hero },
        content.brandName && { key: 'brandName', value: content.brandName },
        content.socials && { key: 'socials', value: content.socials },
        content.slideshow && { key: 'slideshow', value: content.slideshow }
      ].filter(Boolean)

      if (updates.length === 0) return true

      const { error } = await supabase
        .from('content')
        .upsert(updates, { onConflict: 'key' })

      if (error) {
        console.error('Error updating site content:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating site content:', error)
      return false
    }
  }
}
