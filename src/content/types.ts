export type MediaVariant = "before" | "after" | undefined;

export type ProjectMedia = {
  id: string;
  type: "image" | "video";
  url: string;
  variant?: MediaVariant;
  caption?: string;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type Project = {
  slug: string;
  name: string;
  duration: string;
  location?: string;
  tags?: string[];
  scopeItems: string[];
  coverUrl: string;
  gallery: ProjectMedia[];
  category_id?: string;
  category?: Category;
};

export type SocialLinks = {
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
};

export type SiteCopy = {
  brandName: string;
  nav: { services: string; portfolio: string; contact: string; allProjects: string };
  hero: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string };
  services: { title: string };
  portfolio: { title: string; viewAll: string };
  contact: { title: string; name: string; phone: string; description: string; submit: string };
  footer: { followUs: string; privacy: string; copyrightPrefix: string };
};

export type SiteContent = {
  copy: SiteCopy;
  socials: SocialLinks;
  projects: Project[];
  slideshow?: string[];
};

