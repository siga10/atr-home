"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthService, type AuthUser } from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب المستخدم الحالي عند تحميل التطبيق
    AuthService.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // الاستماع لتغييرات المصادقة
    const { data: authListener } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await AuthService.signIn(email, password);
    if (result.user) {
      setUser(result.user);
    }
    setLoading(false);
    return { error: result.error };
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const result = await AuthService.signUp(email, password);
    if (result.user) {
      setUser(result.user);
    }
    setLoading(false);
    return { error: result.error };
  };

  const signOut = async () => {
    setLoading(true);
    await AuthService.signOut();
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
