# Villa Finishings - Production Ready

🏗️ **مشروع تشطيبات الفلل - جاهز للنشر**

## 🚀 نشر سريع على Vercel

### 1. رفع على GitHub

```bash
# إنشاء مستودع جديد على GitHub ثم:
git init
git add .
git commit -m "Initial commit - Villa Finishings Production"
git branch -M main
git remote add origin https://github.com/username/ART HOME.git
git push -u origin main
```

### 2. إعداد Supabase

1. انشئ مشروع جديد على [Supabase](https://supabase.com)
2. اذهب إلى SQL Editor ونفذ الملف: `database-setup-en.sql`
3. احصل على:
   - `Project URL`
   - `Anon Key`

### 3. النشر على Vercel

1. اذهب إلى [Vercel](https://vercel.com)
2. اربط مستودع GitHub
3. أضف المتغيرات البيئية:
   - `NEXT_PUBLIC_SUPABASE_URL` = رابط مشروع Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Anon Key من Supabase

## 📋 المميزات المشمولة

✅ **إدارة المشاريع**
- إضافة وتعديل المشاريع
- رفع الصور والفيديوهات  
- معرض الوسائط المتقدم

✅ **المشاريع المميزة** ⭐
- اختيار حتى 6 مشاريع مميزة
- عرض بارز في الصفحة الرئيسية
- إدارة سهلة من لوحة التحكم

✅ **إدارة المحتوى**
- تعديل النصوص والعناوين
- إدارة الروابط الاجتماعية
- رفع شعار الموقع

✅ **نظام المصادقة**
- تسجيل دخول آمن
- لوحة تحكم للإدارة
- إدارة المستخدمين والصلاحيات

✅ **تصميم متجاوب**
- يعمل على جميع الأجهزة
- تحسين لمحركات البحث
- سرعة تحميل عالية

✅ **حماية المحتوى**
- منع النسخ والسكرين شوت
- حماية من أدوات المطور

## 🔧 إعداد محلي (اختياري)

```bash
npm install
cp .env.example .env.local
# أضف معلومات Supabase في .env.local
npm run dev
```

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── admin/          # لوحة التحكم
│   ├── projects/       # صفحات المشاريع
│   └── login/          # تسجيل الدخول
├── components/
│   ├── ui/             # مكونات الواجهة
│   └── MediaLightbox   # معرض الصور المتقدم
├── lib/
│   ├── dataService.ts  # خدمات البيانات
│   └── supabase.ts     # إعدادات قاعدة البيانات
└── content/            # المحتوى الافتراضي
```

## 🎯 الخطوات بعد النشر

1. **إعداد المحتوى الأولي**
   - سجل دخول على `/login`
   - انتقل لـ `/admin`
   - أضف المشاريع الأولى

2. **تخصيص المحتوى**
   - تحديث اسم الشركة
   - رفع الشعار
   - إضافة الروابط الاجتماعية

3. **اختيار المشاريع المميزة**
   - من تبويب "Featured Projects"
   - اختر حتى 6 مشاريع للعرض الرئيسي

## 🆘 الدعم

- 📧 للدعم التقني: [GitHub Issues](https://github.com/username/ART HOME/issues)
- 📚 دليل الإعداد الكامل: `SETUP_GUIDE.md`

---

**🏡 مشروع تشطيبات الفلل - جاهز للاستخدام المهني**

Built with ❤️ using Next.js 14, TypeScript, Tailwind CSS, and Supabase
