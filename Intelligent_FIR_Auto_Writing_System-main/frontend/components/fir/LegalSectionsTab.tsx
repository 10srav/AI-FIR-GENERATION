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
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-amber-500/10" style={{ background: 'rgba(245,158,11,0.03)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10 bg-ember-gradient">
              <span className="text-lg text-forge-950">&#9878;&#65039;</span>
            </div>
            <div>
              <p className="text-sm font-serif font-bold text-foreground tracking-tight">Applicable Legal Sections</p>
              <p className="text-xs text-muted-foreground mt-0.5">Based on detected offence: <span className="text-amber-400 font-bold">{result.offence_type}</span></p>
            </div>
          </div>
          <div className="space-y-3">
            {result.ipc_sections.map((section, idx) => (
              <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl border border-amber-500/8 hover:border-amber-500/20 transition-forge" style={{ background: 'rgba(15,15,18,0.4)' }}>
                <span className="px-3.5 py-1.5 text-amber-400 text-sm font-serif font-bold rounded-xl shadow-lg shadow-amber-500/10 shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))' }}>&#167;{section.section}</span>
                <p className="text-sm text-foreground leading-relaxed">{section.description}</p>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-500/15 text-xs text-amber-400" style={{ background: 'rgba(245,158,11,0.04)' }}>
            <span className="text-base">&#9888;&#65039;</span>
            <p className="leading-relaxed font-medium">These are AI-suggested sections. Final determination should be made by legal authorities.</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl border border-amber-500/10 flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.03)' }}><span className="text-3xl opacity-40">&#9878;&#65039;</span></div>
          <p className="text-sm text-muted-foreground font-medium">No applicable legal sections identified.</p>
        </div>
      )}
    </div>
  );
}
