"use client";

import { FIRResponse, TabType } from "./types";
import { FIRDocumentTab } from "./FIRDocumentTab";
import { EntitiesTab } from "./EntitiesTab";
import { LegalSectionsTab } from "./LegalSectionsTab";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResultTabsProps {
  result: FIRResponse;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  copied: boolean;
  onCopy: () => void;
  onPrint: () => void;
}

export function ResultTabs({ result, activeTab, setActiveTab, copied, onCopy, onPrint }: ResultTabsProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-3xl glass-card card-shadow overflow-hidden">
      <div className="flex border-b border-blue-100 overflow-x-auto bg-blue-50/50">
        {([{ key: "fir" as TabType, icon: "\uD83D\uDCC4", label: t("results.tabs.fir") }, { key: "entities" as TabType, icon: "\uD83C\uDFF7\uFE0F", label: t("results.tabs.entities") }, { key: "legal" as TabType, icon: "\u2696\uFE0F", label: t("results.tabs.legalSections") }]).map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 px-5 py-4 text-xs font-bold transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 relative uppercase tracking-widest ${activeTab === tab.key ? "text-blue-600 bg-white" : "text-muted-foreground hover:text-foreground hover:bg-blue-50"}`}>
            <span className={activeTab === tab.key ? "" : "opacity-60"}>{tab.icon}</span>{tab.label}
            {activeTab === tab.key && <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></span>}
          </button>
        ))}
      </div>
      <div className="p-8">
        {activeTab === "fir" && <FIRDocumentTab result={result} copied={copied} onCopy={onCopy} onPrint={onPrint} />}
        {activeTab === "entities" && <EntitiesTab result={result} />}
        {activeTab === "legal" && <LegalSectionsTab result={result} />}
      </div>
    </div>
  );
}
