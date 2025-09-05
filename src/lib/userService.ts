import { supabase } from './supabase'

export interface UserRole {
  id: string
  user_id: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface UserInfo {
  id: string
  email: string
  role?: 'admin' | 'user'
  created_at: string
}

export class UserService {
  // التحقق من صلاحيات الأدمن للمستخدم الحالي
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.user) {
        return false
      }

      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id)
        .single()

      if (roleError || !userRole) {
        return false
      }

      return userRole.role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  // الحصول على صلاحيات المستخدم الحالي
  static async getCurrentUserRole(): Promise<'admin' | 'user' | null> {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.user) {
        return null
      }

      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user.id)
        .single()

      if (roleError || !userRole) {
        // إذا لم يكن للمستخدم دور محدد، نعطيه دور مستخدم عادي
        return 'user'
      }

      return userRole.role as 'admin' | 'user'
    } catch (error) {
      console.error('Error getting user role:', error)
      return null
    }
  }

  // الحصول على جميع المستخدمين مع أدوارهم (للأدمن فقط)
  static async getAllUsers(): Promise<UserInfo[]> {
    try {
      // التحقق من صلاحيات الأدمن أولاً
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        throw new Error('Access denied: Admin role required')
      }

      const { data: users, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at,
          updated_at
        `)

      if (error) {
        throw error
      }

      // نعتذر، نحتاج للوصول مباشرة لجدول auth.users
      // لكن هذا محدود في Supabase، لذلك سنستخدم معرف المستخدم فقط حالياً
      const userInfos: UserInfo[] = []
      
      for (const userRole of users || []) {
        try {
          // سنستخدم معرف المستخدم كبريد إلكتروني مؤقت حتى نحل هذه المشكلة
          userInfos.push({
            id: userRole.user_id,
            email: `user-${userRole.user_id.slice(0, 8)}`,
            role: userRole.role,
            created_at: userRole.created_at
          })
        } catch (error) {
          console.error('Error processing user info:', error)
        }
      }

      return userInfos
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  }

  // إضافة مستخدم كأدمن بالإيميل
  static async addAdminByEmail(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // التحقق من صلاحيات الأدمن أولاً
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        return { success: false, message: 'Access denied: Admin role required' }
      }

      // البحث عن المستخدم بالإيميل
      const { data: userInfo, error: userError } = await supabase.rpc('get_user_by_email', {
        user_email: email
      })

      if (userError) {
        return { success: false, message: 'Error searching for user' }
      }

      if (!userInfo || userInfo.length === 0) {
        return { success: false, message: 'User not found. Make sure the user has signed up first.' }
      }

      const userId = userInfo[0].id

      // إضافة أو تحديث دور المستخدم
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: userId, 
          role: 'admin' 
        }, { 
          onConflict: 'user_id' 
        })

      if (roleError) {
        return { success: false, message: 'Error updating user role' }
      }

      return { success: true, message: 'User added as admin successfully' }
    } catch (error) {
      console.error('Error adding admin:', error)
      return { success: false, message: 'Unexpected error occurred' }
    }
  }

  // إزالة صلاحيات الأدمن من مستخدم
  static async removeAdminRole(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // التحقق من صلاحيات الأدمن أولاً
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        return { success: false, message: 'Access denied: Admin role required' }
      }

      // التحقق من أن المستخدم لا يحاول إزالة صلاحياته الخاصة
      const { data: currentUser } = await supabase.auth.getUser()
      if (currentUser?.user?.id === userId) {
        return { success: false, message: 'Cannot remove your own admin privileges' }
      }

      // تحديث دور المستخدم إلى مستخدم عادي
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'user' })
        .eq('user_id', userId)

      if (error) {
        return { success: false, message: 'Error updating user role' }
      }

      return { success: true, message: 'Admin privileges removed successfully' }
    } catch (error) {
      console.error('Error removing admin role:', error)
      return { success: false, message: 'Unexpected error occurred' }
    }
  }

  // التحقق من وجود أي أدمن في النظام
  static async hasAnyAdmin(): Promise<boolean> {
    try {
      const { data: adminCount, error } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin')

      if (error) {
        return false
      }

      return (adminCount?.length ?? 0) > 0
    } catch (error) {
      console.error('Error checking for admins:', error)
      return false
    }
  }

  // إنشاء مستخدم أول كأدمن (للتهيئة الأولى فقط)
  static async createFirstAdmin(): Promise<{ success: boolean; message: string }> {
    try {
      // التحقق من عدم وجود أي أدمن في النظام
      const hasAdmin = await this.hasAnyAdmin()
      if (hasAdmin) {
        return { success: false, message: 'Admin already exists in the system' }
      }

      // الحصول على المستخدم الحالي
      const { data: user, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user?.user) {
        return { success: false, message: 'No authenticated user found' }
      }

      // إضافة المستخدم الحالي كأدمن
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: user.user.id, 
          role: 'admin' 
        })

      if (roleError) {
        return { success: false, message: 'Error creating admin role' }
      }

      return { success: true, message: 'First admin created successfully' }
    } catch (error) {
      console.error('Error creating first admin:', error)
      return { success: false, message: 'Unexpected error occurred' }
    }
  }
}
