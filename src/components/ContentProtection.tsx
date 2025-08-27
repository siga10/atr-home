"use client";

import { useEffect } from "react";

export function ContentProtection() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts
    const handleKeydown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'a') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 'c')
        // 🔴 شلت (e.key === 'PrintScreen') عشان ما يعطل السكرين شوت
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Detect screenshot attempts (مُعطَّل)
    const detectScreenshot = () => {
      // 🔴 علقت كل الأكواد اللي كانت تعمل blur
      document.addEventListener('visibilitychange', () => {
        document.body.style.filter = 'none';
      });

      window.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
          // 🔴 ألغيت التغبيش
          document.body.style.filter = 'none';
        }
      });
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Initialize screenshot detection
    detectScreenshot();

    // Disable developer tools detection (مُعطَّل التغبيش)
    const devToolsDetector = () => {
      const threshold = 160;
      const detectDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
          // 🔴 ألغيت التغبيش
          document.body.style.filter = 'none';
        }
      };

      setInterval(detectDevTools, 1000);
    };

    devToolsDetector();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.body.style.filter = 'none';
    };
  }, []);

  return null;
}
