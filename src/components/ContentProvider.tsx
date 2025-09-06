"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SiteContent } from "@/content/types";
import { contentAR, contentEN } from "@/content";
import { ContentService, ProjectService } from "@/lib/dataService";

type Lang = "ar" | "en";

type ContentContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  content: SiteContent;
  setContent: (c: SiteContent) => void;
  loading: boolean;
  refreshProjects: () => Promise<void>;
};

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

// تم إزالة localStorage - نعتمد على قاعدة البيانات فقط

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [overrides, setOverrides] = useState<Partial<Record<Lang, SiteContent>>>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // تحميل البيانات من Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data from Supabase...');
        
        // تحميل المشاريع
        const projectsData = await ProjectService.getAll();
        console.log('Loaded projects:', projectsData.length);
        setProjects(projectsData);

        // تحميل إعدادات المحتوى المحفوظة
        const contentOverrides: Partial<Record<Lang, SiteContent>> = {};
        
        // جلب المحتوى لكل لغة
        const arContent = await ContentService.get('content-overrides-ar');
        const enContent = await ContentService.get('content-overrides-en');
        
        if (arContent) {
          contentOverrides.ar = arContent;
          console.log('Loaded Arabic content overrides');
        }
        if (enContent) {
          contentOverrides.en = enContent;
          console.log('Loaded English content overrides');
        }
        
        if (Object.keys(contentOverrides).length > 0) {
          setOverrides(contentOverrides);
        }

        // تحميل اللغة المحفوظة
        const savedLang = await ContentService.get('site-lang');
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
          setLangState(savedLang);
          console.log('Loaded saved language:', savedLang);
        }
        
        console.log('Data loaded successfully from Supabase');
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // لا نستخدم localStorage كـ fallback - نعتمد على قاعدة البيانات فقط
        console.warn('Falling back to default content due to database error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = async (l: Lang) => {
    setLangState(l);
    try {
      // حفظ اللغة في Supabase
      await ContentService.set('site-lang', l);
      console.log('Language saved to Supabase:', l);
    } catch (error) {
      console.error('Error saving language to Supabase:', error);
    }
  };

  const base = useMemo<SiteContent>(() => (lang === "ar" ? contentAR : contentEN), [lang]);
  const content = useMemo<SiteContent>(() => ({
    ...base,
    ...(overrides[lang] || {}),
    projects, // إضافة المشاريع من Supabase
  } as SiteContent), [base, overrides, lang, projects]);

  const setContent = async (c: SiteContent) => {
    const next = { ...overrides, [lang]: c } as Partial<Record<Lang, SiteContent>>;
    setOverrides(next);
    
    try {
      // حفظ المحتوى في Supabase
      await ContentService.set(`content-overrides-${lang}`, c);
      console.log('Content saved to Supabase for language:', lang);
    } catch (error) {
      console.error('Error saving content to Supabase:', error);
    }
  };

  const value = useMemo(() => ({ 
    lang, 
    setLang, 
    content, 
    setContent, 
    loading, 
    refreshProjects: async () => {
      try {
        console.log('Refreshing projects from Supabase...');
        const projectsData = await ProjectService.getAll();
        setProjects(projectsData);
        console.log('Projects refreshed successfully:', projectsData.length);
      } catch (error) {
        console.error('Error refreshing projects:', error);
      }
    }
  }), [lang, content, loading]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

