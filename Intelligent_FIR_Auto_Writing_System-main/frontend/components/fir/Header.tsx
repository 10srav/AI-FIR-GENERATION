"use client";

import { ApiStatus } from "./types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderProps {
  apiStatus: ApiStatus;
}

export function Header({ apiStatus }: HeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-14 animate-reveal">
      <div className="flex justify-end mb-6">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <div className="inline-flex items-center gap-6 mb-6 px-10 py-6 rounded-3xl glass-card card-shadow border border-blue-100">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/15 relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
            <span className="text-white text-xl font-serif font-bold tracking-wider relative z-10">FIR</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-serif font-bold tracking-wide bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent uppercase">
              {t("header.title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 tracking-[0.2em] uppercase font-medium">
              {t("header.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-5 mt-5">
          <div className="h-px w-24 theme-separator"></div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border tracking-[0.15em] uppercase ${
              apiStatus === "online"
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : apiStatus === "offline"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === "online"
                  ? "bg-emerald-500 animate-pulse"
                  : apiStatus === "offline"
                  ? "bg-red-500"
                  : "bg-muted-foreground animate-pulse"
              }`}
            />
            {apiStatus === "online" ? t("header.online") : apiStatus === "offline" ? t("header.offline") : "..."}
          </span>
          <div className="h-px w-24 theme-separator"></div>
        </div>
      </div>
    </div>
  );
}
