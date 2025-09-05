"use client";

import Image from "next/image";
import RevealOnScroll from "@/components/RevealOnScroll";
import HeroSlideshow from "@/components/HeroSlideshow";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { createClient } from "@/lib/supabase"; // لازم تتأكد عندك هذي الدالة

export default async function HomePage() {
  const supabase = createClient();

  // SSR → جلب البيانات من الداتابيس
  const { data: company, error } = await supabase
    .from("company")
    .select("*")
    .single();

  if (error) {
    console.error(error);
    return <p>فشل تحميل البيانات</p>;
  }

  return (
    <div className="font-sans min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="relative h-[50vh] md:h-[70vh] overflow-hidden border-b" style={{ borderColor: "#c8a94a" }}>
          <HeroSlideshow
            images={company.slideshow || ["/vercel.svg", "/globe.svg", "/window.svg"]}
            heightClass="h-full"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 max-w-6xl mx-auto px-6 flex items-center">
            <div className="text-white space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold leading-[1.2]">{company.name}</h1>
              <p className="text-base md:text-lg">{company.description}</p>
              <div className="flex items-center gap-3">
                <a href="#contact" className="px-5 py-2 rounded-md text-sm" style={{ backgroundColor: "#c8a94a", color: "#0a0a0a" }}>
                  Contact Us
                </a>
                <a href="#portfolio" className="px-5 py-2 rounded-md text-sm border border-white/30 text-white hover:bg-white/10">
                  View Projects
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* باقي السكاشن (Services, Portfolio, Contact) زي ما عندك */}
      </main>
    </div>
  );
}
