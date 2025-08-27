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
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 's') || // Disable Ctrl+S (Save)
        (e.ctrlKey && e.key === 'a') || // Disable Ctrl+A (Select All)
        (e.ctrlKey && e.key === 'p') || // Disable Ctrl+P (Print)
        (e.ctrlKey && e.key === 'c') || // Disable Ctrl+C (Copy)
        (e.key === 'PrintScreen') // Disable Print Screen
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Detect screenshot attempts
    const detectScreenshot = () => {
      // Blur the content when focus is lost (potential screenshot)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          document.body.style.filter = 'blur(10px)';
        } else {
          document.body.style.filter = 'none';
        }
      });

      // Detect print screen key
      let printScreenPressed = false;
      window.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
          printScreenPressed = true;
          // Blur content temporarily
          document.body.style.filter = 'blur(10px)';
          setTimeout(() => {
            document.body.style.filter = 'none';
            printScreenPressed = false;
          }, 1000);
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

    // Disable developer tools detection
    const devToolsDetector = () => {
      const threshold = 160;
      const detectDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
          // DevTools might be open, blur content
          document.body.style.filter = 'blur(10px)';
          setTimeout(() => {
            document.body.style.filter = 'none';
          }, 2000);
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

  return null; // This component doesn't render anything
}
