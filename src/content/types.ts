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
  id?: string;
  slug: string;
  name: string;
  duration: string;
  location?: string;
  tags?: string[];
  scopeItems: string[];
  coverUrl: string;
  images?: string[]; // Legacy field for backward compatibility
  gallery: ProjectMedia[];
  category_id?: string;
  category?: Category;
  featured?: boolean;
  content?: string;
  created_at?: string;
  updated_at?: string;
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

export type HeroSection = {
  enabled: boolean;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
};

export type SlideButton = {
  text: string;
  link: string;
  type: 'primary' | 'secondary';
};

export type SiteContent = {
  copy: SiteCopy;
  socials: SocialLinks;
  projects: Project[];
  slideshow?: string[];
  heroSection?: HeroSection;
  slideButtons?: SlideButton[];
};

