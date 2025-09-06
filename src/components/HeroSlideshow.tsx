"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function HeroSlideshow({
  images,
  intervalMs = 4000,
  heightClass = "h-[48vh] md:h-[60vh]",
  buttons = [],
}: {
  images: string[];
  intervalMs?: number;
  heightClass?: string;
  buttons?: Array<{ text: string; link: string; type: 'primary' | 'secondary' }>;
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
      {/* Custom Buttons */}
      {buttons.length > 0 && (
        <div className="absolute inset-0 max-w-6xl mx-auto px-6 flex items-center">
          <div className="text-white space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              {buttons.map((button, i) => (
                <a
                  key={i}
                  href={button.link}
                  className={`px-5 py-2 rounded-md text-sm transition-all duration-200 hover:opacity-90 ${
                    button.type === 'primary'
                      ? 'text-black'
                      : 'border border-white/30 text-white hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: button.type === 'primary' ? '#c8a94a' : 'transparent'
                  }}
                >
                  {button.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      
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

