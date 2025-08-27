"use client";

import { useEffect } from 'react';
import { useContent } from './ContentProvider';
import { usePathname } from 'next/navigation';

interface DynamicTitleProps {
  suffix?: string;
}

export function DynamicTitle({ suffix }: DynamicTitleProps) {
  const { content } = useContent();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document !== "undefined") {
      const brandName = content?.copy?.brandName || "Villa Finishings";
      
      let pageTitle = brandName;
      
      if (pathname === '/admin') {
        pageTitle = `${brandName} | Admin Dashboard`;
      } else if (pathname === '/projects') {
        pageTitle = `${brandName} | Projects`;
      } else if (pathname.startsWith('/projects/')) {
        pageTitle = `${brandName} | Project Details`;
      } else if (suffix) {
        pageTitle = `${brandName} | ${suffix}`;
      }
      
      document.title = pageTitle;
    }
  }, [content?.copy?.brandName, pathname, suffix]);

  return null; // This component doesn't render anything
}
