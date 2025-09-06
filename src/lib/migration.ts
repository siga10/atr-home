import { ProjectService, ContentService } from "./dataService";
import { defaultContent } from "@/content/default";
import type { Project as SupabaseProject } from "@/content/types";
import type { SiteContent } from "@/content/types";

interface LocalStorageProject {
  slug: string;
  name: string;
  duration: string;
  location?: string;
  tags?: string[];
  coverUrl: string;
  gallery?: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    caption?: string;
  }>;
  scopeItems?: string[];
}

export class DataMigration {
  /**
   * ترحيل البيانات من localStorage إلى Supabase
   */
  static async migrateFromLocalStorage(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log("بدء عملية ترحيل البيانات...");
      
      // جلب البيانات من localStorage
      const localData = this.getLocalStorageData();
      
      if (!localData) {
        return {
          success: false,
          message: "لا توجد بيانات في localStorage للترحيل"
        };
      }

      const results = {
        projects: { migrated: 0, failed: 0 },
        content: { migrated: 0, failed: 0 }
      };

      // ترحيل المشاريع
      if (localData.projects && localData.projects.length > 0) {
        console.log(`جاري ترحيل ${localData.projects.length} مشروع...`);
        
        for (const project of localData.projects) {
          try {
            const supabaseProject: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'> = {
              slug: project.slug,
              name: project.name,
              duration: project.duration,
              location: project.location,
              tags: project.tags || [],
              coverUrl: project.coverUrl,
              images: project.gallery?.map(item => item.url) || [],
              gallery: project.gallery || [],
              scopeItems: project.scopeItems || [],
              content: project.scopeItems ? JSON.stringify({ scopeItems: project.scopeItems }) : undefined,
              category_id: undefined,
              featured: false
            };

            const created = await ProjectService.create(supabaseProject);
            
            if (created) {
              results.projects.migrated++;
              console.log(`تم ترحيل المشروع: ${project.name}`);
            } else {
              results.projects.failed++;
              console.warn(`فشل في ترحيل المشروع: ${project.name}`);
            }
          } catch (error) {
            results.projects.failed++;
            console.error(`خطأ في ترحيل المشروع ${project.name}:`, error);
          }
        }
      }

      // ترحيل المحتوى العام
      try {
        const contentToMigrate = {
          hero: localData.copy?.hero || defaultContent.copy.hero,
          brandName: localData.copy?.brandName || defaultContent.copy.brandName,
          socials: localData.socials || defaultContent.socials,
          slideshow: localData.slideshow || []
        };

        await ContentService.updateSiteContent(contentToMigrate);
        results.content.migrated++;
        console.log("تم ترحيل المحتوى العام");
      } catch (error) {
        results.content.failed++;
        console.error("خطأ في ترحيل المحتوى العام:", error);
      }

      const totalMigrated = results.projects.migrated + results.content.migrated;
      const totalFailed = results.projects.failed + results.content.failed;

      if (totalMigrated > 0 && totalFailed === 0) {
        // نسخ احتياطي من localStorage قبل المسح
        this.backupLocalStorage();
        
        return {
          success: true,
          message: `تم ترحيل جميع البيانات بنجاح! (${totalMigrated} عنصر)`,
          details: results
        };
      } else if (totalMigrated > 0) {
        return {
          success: true,
          message: `تم ترحيل ${totalMigrated} عنصر بنجاح، فشل في ${totalFailed} عنصر`,
          details: results
        };
      } else {
        return {
          success: false,
          message: "فشل في ترحيل جميع البيانات",
          details: results
        };
      }

    } catch (error) {
      console.error("خطأ عام في عملية الترحيل:", error);
      return {
        success: false,
        message: "حدث خطأ غير متوقع أثناء الترحيل: " + (error as Error).message
      };
    }
  }

  /**
   * استرداد البيانات فقط من قاعدة البيانات
   */
  static async fetchFromDatabase(): Promise<{
    success: boolean;
    projects?: any[];
    content?: any;
    message?: string;
  }> {
    try {
      // جلب المشاريع من قاعدة البيانات
      const projects = await ProjectService.getAll();
      // جلب المحتوى العام من قاعدة البيانات
      const content = await ContentService.getAll();

      return {
        success: true,
        projects,
        content,
        message: "تم الاسترداد بنجاح من قاعدة البيانات فقط"
      };
    } catch (error) {
      return {
        success: false,
        message: "حدث خطأ أثناء الاسترداد من قاعدة البيانات: " + (error as Error).message
      };
    }
  }

  /**
   * جلب البيانات من localStorage
   */
  private static getLocalStorageData(): SiteContent | null {
    try {
      // البحث عن البيانات في مفاتيح localStorage المختلفة
      const possibleKeys = [
        'ART HOME-content',
        'site-content',
        'content',
        'ART HOME-content-ar',
        'ART HOME-content-en'
      ];

      for (const key of possibleKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          console.log(`وُجدت بيانات في localStorage تحت مفتاح: ${key}`);
          return JSON.parse(data);
        }
      }

      console.log("لم توجد بيانات في localStorage");
      return null;
    } catch (error) {
      console.error("خطأ في قراءة البيانات من localStorage:", error);
      return null;
    }
  }

  /**
   * إنشاء نسخة احتياطية من localStorage
   */
  private static backupLocalStorage(): void {
    try {
      const backup: Record<string, any> = {};
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('ART HOME')) {
          backup[key] = localStorage.getItem(key);
        }
      }

      const backupKey = `ART HOME-backup-${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      console.log(`تم إنشاء نسخة احتياطية في localStorage تحت مفتاح: ${backupKey}`);
    } catch (error) {
      console.error("خطأ في إنشاء النسخة الاحتياطية:", error);
    }
  }

  /**
   * مسح البيانات القديمة من localStorage
   */
  static clearLocalStorageData(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('ART HOME-content') ||
          key.includes('site-content')
        ) && !key.includes('backup')) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`تم مسح ${keysToRemove.length} مفتاح من localStorage`);
    } catch (error) {
      console.error("خطأ في مسح بيانات localStorage:", error);
    }
  }

  /**
   * التحقق من وجود بيانات في localStorage
   */
  static hasLocalStorageData(): boolean {
    return this.getLocalStorageData() !== null;
  }

  /**
   * عرض معلومات البيانات الموجودة في localStorage
   */
  static getLocalStorageInfo(): {
    hasData: boolean;
    projectsCount: number;
    contentKeys: string[];
  } {
    const data = this.getLocalStorageData();
    
    return {
      hasData: data !== null,
      projectsCount: data?.projects?.length || 0,
      contentKeys: data ? Object.keys(data) : []
    };
  }
}
