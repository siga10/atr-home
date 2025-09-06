"use client";

import Image from "next/image";
import RevealOnScroll from "@/components/RevealOnScroll";
import { useContent } from "@/components/ContentProvider";
import HeroSlideshow from "@/components/HeroSlideshow";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { content } = useContent();
  return (
    <div className="font-sans min-h-screen">

      <main>
        {/* Hero with slideshow background */}
        <section className="relative h-[50vh] md:h-[70vh] overflow-hidden border-b" style={{ borderColor: "#c8a94a" }}>
          <HeroSlideshow 
            images={content.slideshow || ["/vercel.svg", "/globe.svg", "/window.svg"]} 
            heightClass="h-full"
            buttons={content.slideButtons || [
              { text: content.copy.hero.ctaPrimary, link: "#contact", type: "primary" },
              { text: content.copy.hero.ctaSecondary, link: "#portfolio", type: "secondary" }
            ]}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 max-w-6xl mx-auto px-6 flex items-center">
            <div className="text-white space-y-4 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold leading-[1.2]">{content.copy.hero.title}</h1>
              <p className="text-base md:text-lg">{content.copy.hero.subtitle}</p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="services">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <RevealOnScroll animation="fadeUp" duration={700}>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">{content.copy.services.title}</h2>
            </RevealOnScroll>
            
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { title: "Interior Finishing", desc: "Suspended ceilings, luxury paints, flooring and kitchens." },
                { title: "Exterior Finishing", desc: "Stone facades, marble, aluminum cladding, and thermal insulation." },
                { title: "Design & Supervision", desc: "3D interior design with complete supervision and execution." },
              ].map((item, index) => (
                <RevealOnScroll 
                  key={item.title} 
                  animation={index === 0 ? 'fadeLeft' : index === 2 ? 'fadeRight' : 'fadeUp'}
                  delay={index * 150}
                >
                  <div className="p-5 rounded-lg border bg-background hover:shadow-lg transition-all duration-300 hover:-translate-y-1" style={{ borderColor: "#c8a94a" }}>
                    <div className="text-lg font-semibold mb-1">{item.title}</div>
                    <div className="text-sm">{item.desc}</div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Custom Hero Section */}
        {content.heroSection && content.heroSection.enabled && (
          <section className="py-16" style={{ backgroundColor: content.heroSection.backgroundColor || '#f8f9fa' }}>
            <div className="max-w-6xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Image */}
                <div className="order-2 md:order-1">
                  <RevealOnScroll animation="fadeLeft" duration={700}>
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <Image 
                        src={content.heroSection.image || '/vercel.svg'} 
                        alt={content.heroSection.title || 'Hero Image'} 
                        fill 
                        className="object-cover" 
                      />
                    </div>
                  </RevealOnScroll>
                </div>
                
                {/* Content */}
                <div className="order-1 md:order-2 space-y-6">
                  <RevealOnScroll animation="fadeRight" duration={700}>
                    <h2 className="text-3xl md:text-4xl font-bold" style={{ color: content.heroSection.titleColor || '#1a1a1a' }}>
                      {content.heroSection.title}
                    </h2>
                    <p className="text-lg" style={{ color: content.heroSection.textColor || '#666' }}>
                      {content.heroSection.description}
                    </p>
                    {content.heroSection.buttonText && content.heroSection.buttonLink && (
                      <a 
                        href={content.heroSection.buttonLink}
                        className="inline-block px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 hover:opacity-90"
                        style={{ 
                          backgroundColor: content.heroSection.buttonColor || '#c8a94a', 
                          color: content.heroSection.buttonTextColor || '#0a0a0a' 
                        }}
                      >
                        {content.heroSection.buttonText}
                      </a>
                    )}
                  </RevealOnScroll>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Portfolio */}
        <section id="portfolio">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <RevealOnScroll animation="fadeUp" duration={700}>
              <h2 className="text-2xl md:text-3xl font-bold mb-8">{content.copy.portfolio.title}</h2>
            </RevealOnScroll>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {content.projects.slice(0, 6).map((project, index) => (
                <RevealOnScroll 
                  key={project.slug} 
                  animation={index % 3 === 0 ? 'fadeLeft' : index % 3 === 1 ? 'fadeUp' : 'fadeRight'}
                  delay={index * 100}
                >
                  <a href={`/projects/${project.slug}`} className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-white border hover:shadow-xl transition-all duration-500 hover:-translate-y-2 block" style={{ borderColor: "#c8a94a" }}>
                    <div className="h-full relative">
                      <Image 
                        src={project.coverUrl} 
                        alt={project.name} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
                      
                      {/* Project Details Overlay - Hidden by default, shown on hover */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold leading-tight">{project.name}</h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full bg-green-400"></span>
                              <span>Duration: {project.duration}</span>
                            </div>
                          </div>
                          {project.location && (
                            <div className="flex items-center space-x-1 text-sm">
                              <span>📍</span>
                              <span>{project.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Hover Icon */}
                      <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-200">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </a>
                </RevealOnScroll>
              ))}
            </div>
            
            <RevealOnScroll animation="fadeUp" delay={300}>
              <div className="text-center mt-8">
                <a 
                  href="/projects" 
                  className="inline-block px-6 py-2 rounded-md text-sm hover:underline transition-all duration-200"
                  style={{ backgroundColor: "#c8a94a", color: "#0a0a0a" }}
                >
                  {content.copy.portfolio.viewAll}
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </section>

        {/* Contact */}
        <section id="contact">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">{content.copy.contact.title}</h2>
            <form className="grid gap-4 md:max-w-xl">
              <input className="border rounded-md px-3 py-2 bg-background" style={{ borderColor: "#c8a94a" }} placeholder={content.copy.contact.name} />
              <input className="border rounded-md px-3 py-2 bg-background" style={{ borderColor: "#c8a94a" }} placeholder={content.copy.contact.phone} />
              <textarea className="border rounded-md px-3 py-2 bg-background" style={{ borderColor: "#c8a94a" }} rows={4} placeholder={content.copy.contact.description} />
              <button className="px-5 py-2 rounded-md text-sm w-fit" style={{ backgroundColor: "#c8a94a", color: "#0a0a0a" }}>{content.copy.contact.submit}</button>
            </form>
          </div>
        </section>
      </main>

    </div>
  );
}
