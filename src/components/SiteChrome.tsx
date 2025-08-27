"use client";

import { useContent } from "@/components/ContentProvider";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SocialIcons from "@/components/SocialIcons";
import Header from "@/components/Header";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const { content } = useContent();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="pt-20">
        {children}
      </div>
      <footer className="border-t" style={{ borderColor: "#c8a94a" }}>
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm flex items-center justify-between">
          <LanguageSwitcher />
          <div className="flex items-center gap-4">
            <span>{content.copy.footer.followUs}</span>
            <SocialIcons
              whatsapp={content.socials.whatsapp}
              instagram={content.socials.instagram}
              facebook={content.socials.facebook}
              tiktok={content.socials.tiktok}
            />
          </div>
        </div>
      </footer>
    </div>
  );
}

