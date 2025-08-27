"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { UserService } from "@/lib/userService";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!loading && !user) {
      // إذا لم يكن هناك مستخدم مسجل دخوله، توجيهه إلى صفحة تسجيل الدخول
      router.push("/login");
      return;
    }

    // إذا كانت صفحة الأدمن مطلوبة، فحص الصلاحيات
    if (requireAdmin && user && !loading) {
      if (mounted) setCheckingAdmin(true);
      
      UserService.isCurrentUserAdmin()
        .then((adminStatus) => {
          if (mounted) {
            setIsAdmin(adminStatus);
          }
        })
        .catch((error) => {
          console.error('Error checking admin status:', error);
          if (mounted) {
            setIsAdmin(false);
          }
        })
        .finally(() => {
          if (mounted) {
            setCheckingAdmin(false);
          }
        });
    }

    return () => {
      mounted = false;
    };
  }, [user, loading, router, requireAdmin]);

  // إذا كان يتم تحميل حالة المصادقة أو فحص صلاحيات الأدمن
  if (loading || (requireAdmin && checkingAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">
            {loading ? 'جاري التحقق من المصادقة...' : 'جاري فحص الصلاحيات...'}
          </p>
        </div>
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخوله
  if (!user) {
    return null; // سيتم التوجيه إلى صفحة تسجيل الدخول
  }

  // إذا كانت صفحة الأدمن مطلوبة وليس لديه صلاحيات
  if (requireAdmin && isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">وصول مرفوض</h3>
                  <p>ليس لديك صلاحيات للوصول إلى لوحة الإدارة. هذه الصفحة مخصصة للمدراء فقط.</p>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-red-700 mb-3">
                    <strong>المستخدم الحالي:</strong> {user.email}
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => router.push('/')}
                      variant="outline"
                      size="sm"
                    >
                      العودة للرئيسية
                    </Button>
                    <Button
                      onClick={() => {
                        // إعادة فحص الصلاحيات
                        setIsAdmin(null);
                        setCheckingAdmin(true);
                        UserService.isCurrentUserAdmin()
                          .then(setIsAdmin)
                          .finally(() => setCheckingAdmin(false));
                      }}
                      size="sm"
                    >
                      إعادة فحص الصلاحيات
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // إذا كان المستخدم مسجل دخوله ولديه الصلاحيات المطلوبة، عرض المحتوى
  return <>{children}</>;
}
