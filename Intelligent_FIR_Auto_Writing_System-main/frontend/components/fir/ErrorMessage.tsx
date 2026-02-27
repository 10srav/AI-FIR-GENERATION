"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface ErrorMessageProps {
  error: string;
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-3xl border border-red-200 p-6 mb-6 shadow-sm bg-red-50">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-100">
          <span className="text-red-600 text-lg">&#9888;</span>
        </div>
        <div>
          <p className="text-red-600 text-sm font-bold uppercase tracking-wider">{t("error.title")}</p>
          <p className="text-red-500 text-sm mt-1.5 leading-relaxed">{error}</p>
          <p className="text-red-400 text-xs mt-2">{t("error.tryAgain")}</p>
        </div>
      </div>
    </div>
  );
}
