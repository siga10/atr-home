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

  // جلب مشروع واحد بالـ slug
  static async getBySlug(slug: string): Promise<Project | null> {
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

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      coverUrl: data.cover_url,
      images: Array.isArray(data.images) ? data.images : [],
      gallery: Array.isArray(data.gallery) ? data.gallery : (Array.isArray(data.images) ? data.images : []),
      scopeItems: Array.isArray(data.scope_items) ? data.scope_items : [],
      duration: data.duration,
      location: data.location,
      tags: Array.isArray(data.tags) ? data.tags : [],
      content: data.content,
      category_id: data.category_id,
      category: data.category,
      featured: data.featured || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  // إضافة مشروع جديد
  static async create(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        slug: project.slug,
        name: project.name,
        cover_url: project.coverUrl,
        images: project.images,
        gallery: project.gallery || [],
        scope_items: project.scopeItems || [],
        duration: project.duration,
        location: project.location,
        tags: project.tags,
        content: project.content,
        category_id: project.category_id,
        featured: project.featured || false
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
      images: Array.isArray(data.images) ? data.images : [],
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      scopeItems: Array.isArray(data.scope_items) ? data.scope_items : [],
      duration: data.duration,
      location: data.location,
      tags: Array.isArray(data.tags) ? data.tags : [],
      content: data.content,
      category_id: data.category_id,
      category: data.category,
      featured: data.featured || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  // تحديث مشروع
  static async update(id: string, updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project | null> {
    const dbUpdates: any = {}

    if (updates.slug) dbUpdates.slug = updates.slug
    if (updates.name) dbUpdates.name = updates.name
    if (updates.coverUrl) dbUpdates.cover_url = updates.coverUrl
    if (updates.images) dbUpdates.images = updates.images
    if (updates.gallery !== undefined) dbUpdates.gallery = updates.gallery
    if (updates.scopeItems !== undefined) dbUpdates.scope_items = updates.scopeItems
    if (updates.duration) dbUpdates.duration = updates.duration
    if (updates.location !== undefined) dbUpdates.location = updates.location
    if (updates.tags) dbUpdates.tags = updates.tags
    if (updates.content !== undefined) dbUpdates.content = updates.content
    if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id
    if (updates.featured !== undefined) dbUpdates.featured = updates.featured

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
      images: Array.isArray(data.images) ? data.images : [],
      gallery: Array.isArray(data.gallery) ? data.gallery : [],
      scopeItems: Array.isArray(data.scope_items) ? data.scope_items : [],
      duration: data.duration,
      location: data.location,
      tags: Array.isArray(data.tags) ? data.tags : [],
      content: data.content,
      category_id: data.category_id,
      category: data.category,
      featured: data.featured || false,
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  // تحديث gallery للمشروع
  static async updateGallery(id: string, gallery: any[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ gallery })
        .eq('id', id)

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

  // تحديث حالة المشروع المميز
  static async updateFeatured(id: string, featured: boolean): Promise<boolean> {
    try {
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
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching featured projects:', error)
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

  // جلب المشاريع حسب الفئة
  static async getByCategory(categoryId: string): Promise<Project[]> {
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
      images: Array.isArray(item.images) ? item.images : [],
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
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
}
