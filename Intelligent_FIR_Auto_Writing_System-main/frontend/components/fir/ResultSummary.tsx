"use client";

import { FIRResponse } from "./types";
import { getConfidenceColor, getOffenceIcon } from "./utils";

interface ResultSummaryProps {
  result: FIRResponse;
}

export function ResultSummary({ result }: ResultSummaryProps) {
  return (
    <div className="rounded-3xl glass-forge ember-emboss hover:shadow-forge-hover transition-forge p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))' }}>
            <span className="text-emerald-400 text-lg">&#10003;</span>
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-foreground tracking-tight">Analysis Complete</h2>
            <p className="text-xs text-muted-foreground tracking-wide">Processed in {result.processing_time_seconds?.toFixed(2) || "N/A"}s</p>
          </div>
        </div>
      </div>
      <div className="ember-separator mb-6"></div>
      <div className="mb-6 p-6 rounded-2xl border border-amber-500/10 relative overflow-hidden" style={{ background: 'rgba(245,158,11,0.03)' }}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-ember-gradient rounded-l-2xl"></div>
        <div className="flex items-center justify-between pl-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-amber-500/15" style={{ background: 'rgba(245,158,11,0.06)' }}>
              <span className="text-2xl">{getOffenceIcon(result.offence_type)}</span>
            </div>
            <div>
              <p className="text-xs text-amber-400 uppercase tracking-widest font-bold">Detected Offence</p>
              <p className="text-xl font-serif font-bold text-foreground mt-1">{result.offence_type}</p>
            </div>
          </div>
          <div className={`px-5 py-2.5 rounded-xl border text-sm font-bold ${getConfidenceColor(result.confidence_level)}`}>{(result.confidence * 100).toFixed(0)}%</div>
        </div>
        {result.all_offence_scores && (
          <div className="mt-5 pt-5 border-t border-amber-500/10 pl-4">
            <p className="text-xs text-amber-400 mb-3 uppercase tracking-widest font-bold">Classification Scores</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(result.all_offence_scores).sort(([, a], [, b]) => b - a).map(([offence, score]) => (
                <div key={offence} className="text-xs">
                  <div className="flex justify-between text-muted-foreground"><span>{offence}</span><span className="font-bold text-foreground">{(score * 100).toFixed(0)}%</span></div>
                  <div className="mt-1.5 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(245,158,11,0.08)' }}><div className="h-full bg-ember-gradient rounded-full transition-all duration-700" style={{ width: `${score * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[{ label: "Date", value: result.date }, { label: "Time", value: result.time }, { label: "Location", value: result.location }, { label: "Persons", value: `${result.extracted_persons?.length || 0} found` }].map((item) => (
          <div key={item.label} className="p-4 rounded-xl border border-amber-500/8 hover:border-amber-500/20 transition-forge" style={{ background: 'rgba(15,15,18,0.4)' }}>
            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">{item.label}</p>
            <p className="text-foreground font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
