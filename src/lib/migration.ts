import { ProjectService, ContentService } from "./dataService";
import { defaultContent } from "@/content/default";
import type { Project as SupabaseProject } from "./supabase";
import type { SiteContent } from "@/content/types";

export class DataProvider {
  /**
   * جلب المشاريع من Supabase
   */
  static async getProjects(): Promise<SupabaseProject[]> {
    try {
      const projects = await ProjectService.getAll();
      return projects || [];
    } catch (error) {
      console.error("خطأ في جلب المشاريع:", error);
      return [];
    }
  }

  /**
   * جلب المحتوى العام من Supabase
   */
  static async getSiteContent(): Promise<SiteContent> {
    try {
      const content = await ContentService.getSiteContent();
      return content || defaultContent;
    } catch (error) {
      console.error("خطأ في جلب المحتوى:", error);
      return defaultContent;
    }
  }
}
