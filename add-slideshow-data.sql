-- إضافة بيانات السلايد شو إلى قاعدة البيانات

-- إضافة بيانات السلايد شو
INSERT INTO public.content (key, value) VALUES 
('slideshow', '[
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1920&h=1080&fit=crop",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1920&h=1080&fit=crop"
]'),
('slideshowItems', '[
  {
    "url": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop",
    "type": "image"
  },
  {
    "url": "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1920&h=1080&fit=crop", 
    "type": "image"
  },
  {
    "url": "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1920&h=1080&fit=crop",
    "type": "image"
  }
]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- التحقق من النتيجة
SELECT key, value FROM public.content WHERE key IN ('slideshow', 'slideshowItems');
