"use client";

import Link from "next/link";
import Image from "next/image";
import { useContent } from "@/components/ContentProvider";

export default function ProjectsPage() {
  const { content } = useContent();
  return (
    <div className="font-sans min-h-screen">
      
      <main>
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-6">{content.copy.nav.allProjects}</h1>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.projects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="group block rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <Image 
                    src={p.coverUrl} 
                    alt={p.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  
                  {/* Project Details Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold leading-tight">{p.name}</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          <span>Duration: {p.duration}</span>
                        </div>
                      </div>
                      {p.location && (
                        <div className="flex items-center space-x-1 text-sm">
                          <span>📍</span>
                          <span>{p.location}</span>
                        </div>
                      )}
                      {p.tags && p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {p.tags.slice(0, 3).map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
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
                
                {/* Bottom Card Content */}
                <div className="p-6 bg-white group-hover:bg-gray-50 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 group-hover:text-gray-600 transition-colors">{p.name}</h4>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      View Project
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      
    </div>
  );
}

