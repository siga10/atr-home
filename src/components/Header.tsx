"use client";

import Link from "next/link";
import { useContent } from "@/components/ContentProvider";

export default function Header() {
  const { content } = useContent();
  
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40 bg-background/95 border-b backdrop-blur-md shadow-sm" 
      style={{ borderColor: "#c8a94a" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {(content as any).siteSettings?.logoUrl && (
            <Link href="/" className="flex items-center gap-3">
              <img 
                src={(content as any).siteSettings.logoUrl} 
                alt={content.copy.brandName + " Logo"} 
                className="h-8 w-auto object-contain"
              />
            </Link>
          )}
          <Link 
            href="/" 
            className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
          >
            {content.copy.brandName}
          </Link>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/#services" className="hover:underline transition-colors">
            {content.copy.nav.services}
          </Link>
          <Link href="/#portfolio" className="hover:underline transition-colors">
            {content.copy.nav.portfolio}
          </Link>
          <Link href="/#contact" className="hover:underline transition-colors">
            {content.copy.nav.contact}
          </Link>
          <Link href="/projects" className="hover:underline transition-colors">
            {content.copy.nav.allProjects}
          </Link>
        </nav>
      </div>
    </header>
  );
}
