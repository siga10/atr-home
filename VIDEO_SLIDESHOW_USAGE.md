# استخدام الفيديوهات في Hero Slideshow

تم تحديث مكون HeroSlideshow لدعم كل من الصور والفيديوهات. 

## الاستخدام الجديد

```tsx
import HeroSlideshow from "@/components/HeroSlideshow";

// مع الوضع الجديد - دعم الصور والفيديوهات
<HeroSlideshow 
  items={[
    { url: "/images/hero1.jpg", type: "image" },
    { url: "/videos/intro.mp4", type: "video" },
    { url: "/images/hero2.jpg", type: "image" },
    { url: "/videos/construction.mp4", type: "video" }
  ]}
/>

// الوضع القديم لا يزال يعمل (للتوافق مع النسخة القديمة)
<HeroSlideshow images={["/hero1.jpg", "/hero2.jpg"]} />
```

## الميزات الجديدة

- ✅ دعم الفيديو والصور معاً
- ✅ تشغيل تلقائي للفيديو مع كتم الصوت
- ✅ مؤشر بصري للفيديوهات في نقاط التنقل
- ✅ أزرار التنقل يدوياً
- ✅ انتقالات سلسة بين الشرائح
- ✅ متوافق مع النسخة القديمة

## إضافة فيديوهات في المحتوى

في ملف content:

```json
{
  "slideshowItems": [
    { "url": "/images/hero1.jpg", "type": "image" },
    { "url": "/videos/intro.mp4", "type": "video" },
    { "url": "/images/hero2.jpg", "type": "image" }
  ]
}
```

## خصائص الفيديو

- `autoPlay`: تشغيل تلقائي
- `muted`: مكتوم الصوت
- `loop`: تكرار
- `playsInline`: تشغيل في المكان (للموبايل)

## مدعوم في:

- الصفحة الرئيسية
- يمكن استخدامه في أي مكان آخر
- متوافق مع جميع المتصفحات الحديثة
