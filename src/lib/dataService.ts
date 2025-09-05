import { createClient, type Project } from './supabase' // تم تغيير الاستيراد هنا
import { Category } from '@/content/types'

// Projects CRUD Operations
export class ProjectService {
  // جلب جميع المشاريع
  static async getAll(): Promise<Project[]> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
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

    // تحويل البيانات من قاعدة البيانات إلى تنسيق التطبيق
    return (data || []).map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      coverUrl: item.cover_url,
      images: item.images || [],
      gallery: item.gallery || item.images || [], // Use gallery field if exists, otherwise use images
      scopeItems: item.scope_items || [], // Support scope_items
      duration: item.duration,
      location: item.location,
      tags: item.tags || [],
      content: item.content,
      category_id: item.category_id,
      category: item.category,
      featured: item.featured || false,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
  }

  // جلب مشروع واحد بالـ slug
  static async getBySlug(slug: string): Promise<Project | null> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    if (!data) return null

    // تحويل البيانات من قاعدة البيانات إلى تنسيق التطبيق
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      coverUrl: data.cover_url,
      images: data.images || [],
      gallery: data.gallery || data.images || [], // Use gallery field if exists, otherwise use images
      scopeItems: data.scope_items || [], // Support scope_items
      duration: data.duration,
      location: data.location,
      tags: data.tags || [],
      content: data.content,
      category_id: data.category_id,
      category: data.category,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  // إضافة مشروع جديد
  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        slug: project.slug,
        name: project.name,
        cover_url: project.coverUrl,
        images: project.images,
        gallery: project.gallery || [], // Add gallery support
        scope_items: project.scopeItems || [], // Add scope_items support
        duration: project.duration,
        location: project.location,
        tags: project.tags,
        content: project.content,
        category_id: project.category_id
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return null
    }

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      coverUrl: data.cover_url,
      images: data.images,
      duration: data.duration,
      location: data.location,
      tags: data.tags,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  // تحديث مشروع
  static async update(id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project | null> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const dbUpdates: any = {}
    
    if (updates.slug) dbUpdates.slug = updates.slug
    if (updates.name) dbUpdates.name = updates.name
    if (updates.coverUrl) dbUpdates.cover_url = updates.coverUrl
    if (updates.images) dbUpdates.images = updates.images
    if (updates.gallery !== undefined) dbUpdates.gallery = updates.gallery // Add gallery support
    if (updates.scope_items !== undefined) dbUpdates.scope_items = updates.scope_items // Add scope_items support
    if (updates.duration) dbUpdates.duration = updates.duration
    if (updates.location !== undefined) dbUpdates.location = updates.location
    if (updates.tags) dbUpdates.tags = updates.tags
    if (updates.content !== undefined) dbUpdates.content = updates.content
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id

    const { data, error } = await supabase
      .from('projects')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return null
    }

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      coverUrl: data.cover_url,
      images: data.images,
      gallery: data.gallery,
      scopeItems: data.scope_items,
      duration: data.duration,
      location: data.location,
      tags: data.tags,
      content: data.content,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  // تحديث gallery للمشروع
  static async updateGallery(slug: string, gallery: any[]): Promise<boolean> {
    try {
      const supabase = createClient() // إنشاء عميل جديد لكل طلب
      // Use the proper gallery column
      const { error } = await supabase
        .from('projects')
        .update({ gallery: gallery })
        .eq('slug', slug)

      if (error) {
        console.error('Error updating project gallery:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating project gallery:', error)
      return false
    }
  }

  // حذف مشروع
  static async delete(id: string): Promise<boolean> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      return false
    }

    return true
  }

  // تحديث حالة المشروع المميز
  static async updateFeatured(id: string, featured: boolean): Promise<boolean> {
    try {
      const supabase = createClient() // إنشاء عميل جديد لكل طلب
      const { error } = await supabase
        .from('projects')
        .update({ featured })
        .eq('id', id)

      if (error) {
        console.error('Error updating featured status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating featured status:', error)
      return false
    }
  }

  // جلب المشاريع المميزة
  static async getFeatured(): Promise<Project[]> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6) // أقصى 6 مشاريع

    if (error) {
      console.error('Error fetching featured projects:', error)
      return []
    }

    return (data || []).map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      coverUrl: item.cover_url,
      images: item.images || [],
      gallery: item.gallery || item.images || [],
      scopeItems: item.scope_items || [],
      duration: item.duration,
      location: item.location,
      tags: item.tags || [],
      content: item.content,
      category_id: item.category_id,
      category: item.category,
      featured: item.featured || false,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
  }

  // جلب المشاريع حسب الفئة
  static async getByCategory(categoryId: string): Promise<Project[]> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects by category:', error)
      return []
    }

    return (data || []).map(item => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      coverUrl: item.cover_url,
      images: item.images || [],
      gallery: item.gallery || item.images || [], // Use gallery field if exists, otherwise use images
      scopeItems: item.scope_items || [], // Support scope_items
      duration: item.duration,
      location: item.location,
      tags: item.tags || [],
      content: item.content,
      category_id: item.category_id,
      category: item.category,
      created_at: item.created_at,
      updated_at: item.updated_at
    }))
  }
}

// Categories CRUD Operations
export class CategoryService {
  // جلب جميع الفئات
  static async getAll(): Promise<Category[]> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
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

  // إضافة فئة جديدة
  static async create(category: { name: string; description?: string }): Promise<Category | null> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return null
    }

    return data
  }

  // تحديث فئة
  static async update(id: string, updates: { name?: string; description?: string }): Promise<Category | null> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return null
    }

    return data
  }

  // حذف فئة
  static async delete(id: string): Promise<boolean> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      return false
    }

    return true
  }
}

// Content CRUD Operations
export class ContentService {
  // جلب المحتوى بالـ key
  static async get(key: string): Promise<any> {
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
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
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
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
    const supabase = createClient() // إنشاء عميل جديد لكل طلب
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
    hero?: any;
    brandName?: string;
    socials?: any;
    slideshow?: string[];
  }): Promise<boolean> {
    try {
      const supabase = createClient() // إنشاء عميل جديد لكل طلب
      const updates = [
        content.hero && { key: 'hero', value: content.hero },
        content.brandName && { key: 'brandName', value: content.brandName },
        content.socials && { key: 'socials', value: content.socials },
        content.slideshow && { key: 'slideshow', value: content.slideshow }
      ].filter(Boolean);

      if (updates.length === 0) return true;

      const { error } = await supabase
        .from('content')
        .upsert(updates, { onConflict: 'key' });

      if (error) {
        console.error('Error updating site content:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating site content:', error);
      return false;
    }
  }
}
