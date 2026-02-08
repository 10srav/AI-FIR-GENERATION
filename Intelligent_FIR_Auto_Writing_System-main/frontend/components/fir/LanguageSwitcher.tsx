"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const toggleLanguage = () => { setLanguage(language === "en" ? "te" : "en"); };
  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage} className="flex items-center gap-2 shadow-sm rounded-xl border-amber-500/15 text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/25 transition-forge" aria-label="Switch language">
      <Languages className="h-4 w-4" />
      <span className="font-bold tracking-wide">{language === "en" ? "\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41" : "English"}</span>
    </Button>
  );
}
