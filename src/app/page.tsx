"use client";

import Image from "next/image";
import RevealOnScroll from "@/components/RevealOnScroll";
import HeroSlideshow from "@/components/HeroSlideshow";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { supabase } from "@/lib/supabase";

export default async function HomePage() {
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
        <section
          className="relative h-[50vh] md:h-[70vh] overflow-hidden border-b"
          style={{ borderColor: "#c8a94a" }}
        >
          <HeroSlideshow
            images={company.slideshow || ["/logo.png"]}
            heightClass="h-full"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 max-w-6xl mx-auto px-6 flex items-center">
            <div className="text-white space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold leading-[1.2]">
                {company.name}
              </h1>
              <p className="text-base md:text-lg">{company.description}</p>
              <div className="flex items-center gap-3">
                <a
                  href="#contact"
                  className="px-5 py-2 rounded-md text-sm"
                  style={{ backgroundColor: "#c8a94a", color: "#0a0a0a" }}
                >
                  Contact Us
                </a>
                <a
                  href="#portfolio"
                  className="px-5 py-2 rounded-md text-sm border border-white/30 text-white hover:bg-white/10"
                >
                  View Projects
                </a>
              </div>
            </div>
          </div>
        </section>


        {/* Projects Section */}
        <section id="portfolio" className="py-16 bg-[#0a0a0a] text-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
              Our Projects
            </h2>
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                  <RevealOnScroll key={project.id}>
                    <div className="bg-[#111] rounded-xl overflow-hidden shadow-lg border border-white/10">
                      <img
                        src={project.coverUrl || "/vercel.svg"}
                        alt={project.name}
                        className="w-full h-56 object-cover"
                      />
                      <div className="p-5">
                        <h3 className="text-xl font-semibold mb-2">
                          {project.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-3">
                          {project.content || "No description available."}
                        </p>
                        <a
                          href={`/projects/${project.slug}`}
                          className="inline-block px-4 py-2 text-sm rounded-md"
                          style={{ backgroundColor: "#c8a94a", color: "#0a0a0a" }}
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400">No projects found.</p>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 border-t border-[#c8a94a]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Get in Touch
            </h2>
            <p className="text-gray-300 mb-6">
              We’d love to hear from you! Whether it’s a project inquiry or just
              a question.
            </p>
            <a
              href="mailto:info@arthomeco.com"
              className="px-6 py-3 rounded-md text-lg"
              style={{ backgroundColor: "#c8a94a", color: "#0a0a0a" }}
            >
              info@arthomeco.com
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
