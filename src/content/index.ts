import { SiteContent } from "./types";

export const contentAR: SiteContent = {
  copy: {
    brandName: "Your Company Name",
    nav: { services: "الخدمات", portfolio: "الأعمال", contact: "تواصل", allProjects: "كل المشاريع" },
    hero: {
      title: "أهلاً وسهلاً بك",
      subtitle: "يرجى إعداد المحتوى من لوحة التحكم",
      ctaPrimary: "ابدأ الآن",
      ctaSecondary: "تعرف علينا",
    },
    services: { title: "خدماتنا" },
    portfolio: { title: "أعمالنا", viewAll: "عرض كل المشاريع" },
    contact: { title: "تواصل معنا", name: "الاسم", phone: "رقم الجوال", description: "وصف المشروع", submit: "إرسال" },
    footer: { followUs: "تابعنا", privacy: "سياسة الخصوصية", copyrightPrefix: "©" },
  },
  socials: {},
  projects: [], // Empty by default, loaded from database
  slideshow: [],
};

export const contentEN: SiteContent = {
  copy: {
    brandName: "Your Company Name",
    nav: { services: "Services", portfolio: "Portfolio", contact: "Contact", allProjects: "All Projects" },
    hero: {
      title: "Welcome",
      subtitle: "Please set up content from admin panel",
      ctaPrimary: "Get Started",
      ctaSecondary: "Learn More",
    },
    services: { title: "Our Services" },
    portfolio: { title: "Our Work", viewAll: "View all projects" },
    contact: { title: "Contact Us", name: "Name", phone: "Phone", description: "Project description", submit: "Send" },
    footer: { followUs: "Follow us", privacy: "Privacy Policy", copyrightPrefix: "©" },
  },
  socials: {},
  projects: [], // Empty by default, loaded from database
  slideshow: [],
};

