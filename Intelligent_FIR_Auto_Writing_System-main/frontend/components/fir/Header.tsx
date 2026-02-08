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
        <div className="inline-flex items-center gap-6 mb-6 px-10 py-6 rounded-3xl glass-forge ember-emboss animate-ember-border">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/15 relative overflow-hidden bg-ember-gradient">
            <div className="absolute inset-0 animate-ember-shimmer"></div>
            <span className="text-forge-950 text-xl font-serif font-bold tracking-wider relative z-10">FIR</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-serif font-bold tracking-wide text-ember-gradient uppercase">
              {t("header.title")}
            </h1>
            <p className="text-xs text-muted-foreground mt-1.5 tracking-[0.2em] uppercase font-medium">
              {t("header.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-5 mt-5">
          <div className="h-px w-24 ember-separator"></div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border tracking-[0.15em] uppercase ${
              apiStatus === "online"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : apiStatus === "offline"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                apiStatus === "online"
                  ? "bg-emerald-400 animate-pulse"
                  : apiStatus === "offline"
                  ? "bg-red-400"
                  : "bg-muted-foreground animate-pulse"
              }`}
            />
            {apiStatus === "online" ? t("header.online") : apiStatus === "offline" ? t("header.offline") : "..."}
          </span>
          <div className="h-px w-24 ember-separator"></div>
        </div>
      </div>
    </div>
  );
}
