"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function HeroSlideshow({
  images,
  intervalMs = 4000,
  heightClass = "h-[48vh] md:h-[60vh]",
}: {
  images: string[];
  intervalMs?: number;
  heightClass?: string;
}) {
  const validImages = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (validImages.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % validImages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [validImages, intervalMs]);

  if (validImages.length === 0) return null;

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden border-b`} style={{ borderColor: "#c8a94a" }}>
      {validImages.map((src, i) => (
        <div
          key={src + i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image src={src} alt="slide" fill className="object-cover" priority={i === 0} />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {validImages.map((_, i) => (
          <span
            key={i}
            className="block w-2 h-2 rounded-full border"
            style={{
              borderColor: "#c8a94a",
              backgroundColor: i === index ? "#c8a94a" : "transparent",
            }}
          />
        ))}
      </div>
    </div>
  );
}

