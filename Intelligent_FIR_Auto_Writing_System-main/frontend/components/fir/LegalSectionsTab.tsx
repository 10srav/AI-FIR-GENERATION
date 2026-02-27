"use client";

import { FIRResponse } from "./types";

interface LegalSectionsTabProps {
  result: FIRResponse;
}

export function LegalSectionsTab({ result }: LegalSectionsTabProps) {
  return (
    <div>
      {result.ipc_sections?.length > 0 ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-blue-100 bg-blue-50/30">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-500 to-blue-600">
              <span className="text-lg text-white">&#9878;&#65039;</span>
            </div>
            <div>
              <p className="text-sm font-serif font-bold text-foreground tracking-tight">Applicable Legal Sections</p>
              <p className="text-xs text-muted-foreground mt-0.5">Based on detected offence: <span className="text-blue-600 font-bold">{result.offence_type}</span></p>
            </div>
          </div>
          <div className="space-y-3">
            {result.ipc_sections.map((section, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 bg-white">
                <span className="px-3.5 py-1.5 text-blue-600 text-sm font-serif font-bold rounded-xl shadow-sm shrink-0 bg-blue-50 border border-blue-100">&#167;{section.section}</span>
                <p className="text-sm text-foreground leading-relaxed">{section.description}</p>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 text-xs text-amber-700 bg-amber-50">
            <span className="text-base">&#9888;&#65039;</span>
            <p className="leading-relaxed font-medium">These are AI-suggested sections. Final determination should be made by legal authorities.</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-blue-100 flex items-center justify-center bg-blue-50/50"><span className="text-3xl opacity-40">&#9878;&#65039;</span></div>
          <p className="text-sm text-muted-foreground font-medium">No applicable legal sections identified.</p>
        </div>
      )}
    </div>
  );
}
