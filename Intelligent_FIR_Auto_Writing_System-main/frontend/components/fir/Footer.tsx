"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  return (
    <div className="text-center mt-16 pb-8 animate-reveal" style={{ animationDelay: '0.3s' }}>
      <div className="ember-separator mb-6"></div>
      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl glass-forge ember-emboss">
        <div className="w-2 h-2 rounded-full bg-ember-gradient animate-pulse"></div>
        <p className="text-xs text-muted-foreground font-medium tracking-wide">{t("footer.disclaimer")}</p>
      </div>
    </div>
  );
}
