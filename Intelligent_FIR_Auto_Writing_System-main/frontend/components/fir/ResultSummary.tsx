"use client";

import { FIRResponse } from "./types";

interface ResultSummaryProps {
  result: FIRResponse;
}

export function ResultSummary({ result }: ResultSummaryProps) {
  return (
    <div className="rounded-3xl glass-card card-shadow hover:shadow-lg transition-all duration-300 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 shadow-sm">
            <span className="text-emerald-600 text-lg">&#10003;</span>
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-foreground tracking-tight">FIR Generated Successfully</h2>
            <p className="text-xs text-muted-foreground tracking-wide">Processed in {result.processing_time_seconds?.toFixed(2) || "N/A"}s</p>
          </div>
        </div>
      </div>
      <div className="theme-separator mb-6"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {[{ label: "Date", value: result.date }, { label: "Time", value: result.time }, { label: "Location", value: result.location }, { label: "Persons", value: `${result.extracted_persons?.length || 0} found` }].map((item) => (
          <div key={item.label} className="p-4 rounded-xl border border-blue-100 hover:border-blue-200 transition-all duration-300 bg-blue-50/30">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-widest">{item.label}</p>
            <p className="text-foreground font-bold mt-2">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
