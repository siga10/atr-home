"use client";

import Image from "next/image";
import Link from "next/link";
import { getProjectBySlug } from "@/data/projects"; // Fallback for local data
import { useEffect, useState } from "react";
import { useContent } from "@/components/ContentProvider";
import { MediaGallery } from "@/components/MediaLightbox";

type Props = { params: Promise<{ slug: string }> };

export default function ProjectDetailPage({ params }: Props) {
  const { content, loading } = useContent();
  const [resolvedSlug, setResolvedSlug] = useState<string | null>(null);
  
  // Debug: Log project data
  console.log('Content loading:', loading);
  console.log('Available projects:', content.projects);
  console.log('Resolved slug:', resolvedSlug);
  
  // Handle params Promise from Next 15 app router
  useEffect(() => {
    (async () => {
      const p = await params;
      setResolvedSlug(p.slug);
    })();
  }, [params]);

  // Find project from content.projects (loaded from database) or fallback to local data
  let project = resolvedSlug ? content.projects.find(p => p.slug === resolvedSlug) : undefined;
  
  // Fallback to local data if no project found in database
  if (!project && resolvedSlug) {
    console.log('No project found in database, falling back to local data');
    project = getProjectBySlug(resolvedSlug);
  }
  
  // Show loading state while data is being fetched
  if (loading || !resolvedSlug) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-lg">Project not found.</div>
        <Link href="/projects" className="underline">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <Link href="/projects" className="text-sm underline" style={{ color: "#c8a94a" }}>{content.copy.nav.allProjects}</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="p-4 rounded-lg border bg-background" style={{ borderColor: "#c8a94a" }}>
          <div className="text-sm text-black/70 dark:text-white/70">Duration</div>
          <div className="font-semibold">{project.duration}</div>
        </div>
        {project.location && (
          <div className="p-4 rounded-lg border bg-background" style={{ borderColor: "#c8a94a" }}>
            <div className="text-sm text-black/70 dark:text-white/70">Location</div>
            <div className="font-semibold">{project.location}</div>
          </div>
        )}
        <div className="p-4 rounded-lg border bg-background" style={{ borderColor: "#c8a94a" }}>
          <div className="text-sm text-black/70 dark:text-white/70">Scope Items</div>
          <ul className="list-disc pl-5 text-sm">
            {project.scopeItems.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <FilterableMediaGallery slug={project.slug} />
    </div>
  );
}

type FilterKey = "all" | "image" | "video" | "before" | "after";

function FilterableMediaGallery({ slug }: { slug: string }) {
  const { content } = useContent();
  let project = content.projects.find(p => p.slug === slug);
  
  // Fallback to local data if no project found in database
  if (!project) {
    project = getProjectBySlug(slug);
  }
  
  if (!project || !project.gallery || project.gallery.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mt-8 mb-4">Media Gallery</h2>
        <p className="text-gray-500">No media available for this project.</p>
      </div>
    );
  }
  
  const hasBeforeAfter = project.gallery.some((m) => m.variant === "before" || m.variant === "after");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = project.gallery.filter((m) => {
    if (filter === "all") return true;
    if (filter === "image" || filter === "video") return m.type === filter;
    if (filter === "before" || filter === "after") return m.variant === filter;
    return true;
  });

  return (
    <div>
      {hasBeforeAfter && (
        <BeforeAfterGrid slug={slug} />
      )}
      <h2 className="text-xl font-semibold mt-8 mb-4">Media Gallery</h2>
      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
        {(
          [
            { key: "all", label: "All" },
            { key: "image", label: "Images" },
            { key: "video", label: "Videos" },
            { key: "before", label: "Before" },
            { key: "after", label: "After" },
          ] as { key: FilterKey; label: string }[]
        ).map((b) => (
          <button
            key={b.key}
            onClick={() => setFilter(b.key)}
            className={`px-3 py-1 rounded-md border ${filter === b.key ? "" : ""}`}
            style={{
              borderColor: "#c8a94a",
              backgroundColor: filter === b.key ? "#c8a94a" : "transparent",
              color: filter === b.key ? "#0a0a0a" : "#b3b3b3",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
      {/* New Gallery with Lightbox */}
      <MediaGallery media={filtered} className="mt-6" />
      
      {/* Gallery Statistics */}
      {filtered.length > 0 && (
        <div className="flex justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
          <div>
            Images: {filtered.filter(m => m.type === 'image').length} | 
            Videos: {filtered.filter(m => m.type === 'video').length}
          </div>
          <div>
            Before: {filtered.filter(m => m.variant === 'before').length} | 
            After: {filtered.filter(m => m.variant === 'after').length} | 
            General: {filtered.filter(m => !m.variant).length}
          </div>
        </div>
      )}
    </div>
  );
}

function BeforeAfterGrid({ slug }: { slug: string }) {
  const { content } = useContent();
  let project = content.projects.find(p => p.slug === slug);
  
  // Fallback to local data if no project found in database
  if (!project) {
    project = getProjectBySlug(slug);
  }
  
  if (!project || !project.gallery) {
    return null;
  }
  
  const before = project.gallery.filter((m) => m.variant === "before");
  const after = project.gallery.filter((m) => m.variant === "after");

  if (before.length === 0 && after.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Before / After Comparison</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {before.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-red-600">Before</h3>
            <MediaGallery media={before} className="" />
          </div>
        )}
        {after.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3 text-green-600">After</h3>
            <MediaGallery media={after} className="" />
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t text-sm text-gray-500 text-center">
        Click on any image to view it in full size and navigate through the gallery
      </div>
    </div>
  );
}

