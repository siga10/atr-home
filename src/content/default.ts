import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  copy: {
    brandName: "Villa Finishings",
    nav: {
      services: "Services",
      portfolio: "Portfolio", 
      contact: "Contact Us",
      allProjects: "All Projects"
    },
    hero: {
      title: "Welcome to Premium Finishings 👋",
      subtitle: "Transform your space with our luxury interior and exterior finishing services",
      ctaPrimary: "View Projects",
      ctaSecondary: "Contact Us"
    },
    services: {
      title: "Our Services"
    },
    portfolio: {
      title: "Our Work",
      viewAll: "View All"
    },
    contact: {
      title: "Contact Us",
      name: "Name",
      phone: "Phone Number",
      description: "Message",
      submit: "Send Message"
    },
    footer: {
      followUs: "Follow Us",
      privacy: "Privacy Policy",
      copyrightPrefix: "All rights reserved"
    }
  },
  socials: {
    whatsapp: "https://wa.me/962791234567",
    instagram: "https://instagram.com/atr_finishings",
    facebook: "https://facebook.com/atr.finishings"
  },
  projects: [],
  slideshow: []
};
