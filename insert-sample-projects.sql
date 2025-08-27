-- ===============================
-- Insert Sample Projects Data
-- ===============================

-- أولاً نتأكد من وجود عمود gallery و scope_items
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS scope_items JSONB DEFAULT '[]'::jsonb;

-- إدراج بيانات المشاريع التجريبية
INSERT INTO public.projects (
    slug, 
    name, 
    duration, 
    location, 
    tags, 
    cover_url, 
    images,
    gallery,
    scope_items
) VALUES 
(
    'villa-alnoor',
    'Villa Al Noor',
    '3 months',
    'Amman',
    '["Interior Finishing", "Gypsum", "Paint"]'::jsonb,
    '/window.svg',
    '["/globe.svg", "/file.svg", "/vercel.svg"]'::jsonb,
    '[
        {
            "id": "1",
            "type": "image",
            "url": "/globe.svg",
            "variant": "before",
            "caption": "Before renovation"
        },
        {
            "id": "2",
            "type": "image",
            "url": "/file.svg",
            "variant": "after",
            "caption": "After renovation"
        },
        {
            "id": "3",
            "type": "video",
            "url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "caption": "Project tour video"
        }
    ]'::jsonb,
    '["Suspended ceilings", "Luxury paints", "Porcelain flooring"]'::jsonb
),
(
    'villa-alrawda',
    'Villa Al Rawda',
    '5 months',
    'Zarqa',
    '["Exterior", "Facades", "Insulation"]'::jsonb,
    '/file.svg',
    '["/vercel.svg", "/globe.svg"]'::jsonb,
    '[
        {
            "id": "1",
            "type": "image",
            "url": "/vercel.svg",
            "variant": "before",
            "caption": "Original facade"
        },
        {
            "id": "2",
            "type": "image",
            "url": "/globe.svg",
            "variant": "after",
            "caption": "New modern facade"
        },
        {
            "id": "3",
            "type": "image",
            "url": "/window.svg",
            "caption": "Detail work"
        }
    ]'::jsonb,
    '["Cladding", "Natural stone", "Thermal insulation"]'::jsonb
),
(
    'modern-apartment',
    'Modern Apartment',
    '2 months',
    'Amman',
    '["Interior", "Modern Design", "Lighting"]'::jsonb,
    '/vercel.svg',
    '["/window.svg", "/globe.svg"]'::jsonb,
    '[
        {
            "id": "1",
            "type": "image",
            "url": "/window.svg",
            "caption": "Living room design"
        },
        {
            "id": "2",
            "type": "image",
            "url": "/globe.svg",
            "caption": "Kitchen renovation"
        }
    ]'::jsonb,
    '["Floor tiles", "LED lighting", "Built-in wardrobes"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    duration = EXCLUDED.duration,
    location = EXCLUDED.location,
    tags = EXCLUDED.tags,
    cover_url = EXCLUDED.cover_url,
    images = EXCLUDED.images,
    gallery = EXCLUDED.gallery,
    scope_items = EXCLUDED.scope_items;

-- التحقق من النتائج
SELECT 
    slug, 
    name, 
    duration, 
    location,
    JSONB_ARRAY_LENGTH(COALESCE(gallery, '[]'::jsonb)) as gallery_count,
    JSONB_ARRAY_LENGTH(COALESCE(scope_items, '[]'::jsonb)) as scope_items_count
FROM public.projects 
ORDER BY created_at DESC;
