import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
}

export class AuthService {
  // تسجيل الدخول
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!
          },
          error: null
        }
      }

      return { user: null, error: 'Login failed' }
    } catch (error) {
      return { user: null, error: 'Network error occurred' }
    }
  }

  // إنشاء حساب جديد
  static async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!
          },
          error: null
        }
      }

      return { user: null, error: 'Signup failed' }
    } catch (error) {
      return { user: null, error: 'Network error occurred' }
    }
  }

  // تسجيل الخروج
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { error: error.message }
      }
      return { error: null }
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  // جلب المستخدم الحالي
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase.auth.getUser()
      
      if (error || !data.user) {
        return null
      }

      return {
        id: data.user.id,
        email: data.user.email!
      }
    } catch (error) {
      return null
    }
  }

  // الاستماع لتغييرات المصادقة
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!
        })
      } else {
        callback(null)
      }
    })
  }
}
