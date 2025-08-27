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

const STORAGE_KEY = "site-content-overrides";
const LANG_KEY = "site-lang";

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [overrides, setOverrides] = useState<Partial<Record<Lang, SiteContent>>>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // تحميل البيانات من Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        // تحميل المشاريع
        const projectsData = await ProjectService.getAll();
        setProjects(projectsData);

        // تحميل إعدادات المحتوى المحفوظة
        const contentOverrides: Partial<Record<Lang, SiteContent>> = {};
        
        // جلب المحتوى لكل لغة
        const arContent = await ContentService.get('content-overrides-ar');
        const enContent = await ContentService.get('content-overrides-en');
        
        if (arContent) contentOverrides.ar = arContent;
        if (enContent) contentOverrides.en = enContent;
        
        if (Object.keys(contentOverrides).length > 0) {
          setOverrides(contentOverrides);
        }

        // تحميل اللغة المحفوظة
        const savedLang = await ContentService.get('site-lang');
        if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
          setLangState(savedLang);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback to localStorage
        const savedLang = (typeof window !== "undefined" && (localStorage.getItem(LANG_KEY) as Lang)) || null;
        if (savedLang) setLangState(savedLang);
        const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (raw) {
          try {
            setOverrides(JSON.parse(raw));
          } catch {}
        }
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
    // حفظ اللغة في Supabase
    await ContentService.set('site-lang', l);
    // Fallback to localStorage
    if (typeof window !== "undefined") localStorage.setItem(LANG_KEY, l);
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
    
    // حفظ المحتوى في Supabase
    await ContentService.set(`content-overrides-${lang}`, c);
    // Fallback to localStorage
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo(() => ({ 
    lang, 
    setLang, 
    content, 
    setContent, 
    loading, 
    refreshProjects: async () => {
      const projectsData = await ProjectService.getAll();
      setProjects(projectsData);
    }
  }), [lang, content, loading]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

