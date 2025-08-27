export type ProjectMedia = {
  id: string;
  type: "image" | "video";
  url: string;
  variant?: "before" | "after";
  caption?: string;
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
};

export const projects: Project[] = [
  {
    slug: "villa-alnoor",
    name: "Villa Al Noor",
    duration: "3 months",
    location: "Amman",
    tags: ["Interior Finishing", "Gypsum", "Paint"],
    scopeItems: ["Suspended ceilings", "Luxury paints", "Porcelain flooring"],
    coverUrl: "/window.svg",
    gallery: [
      { id: "1", type: "image", url: "/globe.svg", variant: "before", caption: "Before" },
      { id: "2", type: "image", url: "/globe.svg", variant: "after", caption: "After" },
      { id: "3", type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4", caption: "Tour" },
    ],
  },
  {
    slug: "villa-alrawda",
    name: "Villa Al Rawda",
    duration: "5 months",
    location: "Zarqa",
    tags: ["Exterior", "Facades", "Insulation"],
    scopeItems: ["Cladding", "Natural stone", "Thermal insulation"],
    coverUrl: "/file.svg",
    gallery: [
      { id: "1", type: "image", url: "/globe.svg", variant: "before" },
      { id: "2", type: "image", url: "/globe.svg", variant: "after" },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

