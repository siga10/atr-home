"use client";

import { useContent } from "@/components/ContentProvider";

export default function LanguageSwitcher() {
  const { lang, setLang } = useContent();
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="text-sm underline"
      style={{ color: "#c8a94a" }}
      aria-label="Switch language"
    >
      {lang === "ar" ? "English" : "العربية"}
    </button>
  );
}

