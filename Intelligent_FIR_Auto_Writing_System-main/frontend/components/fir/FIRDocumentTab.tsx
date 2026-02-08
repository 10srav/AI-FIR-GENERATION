"use client";

import { FIRResponse } from "./types";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { useLanguage } from "@/contexts/LanguageContext";

interface FIRDocumentTabProps {
  result: FIRResponse;
  copied: boolean;
  onCopy: () => void;
  onPrint: () => void;
}

export function FIRDocumentTab({ result, copied, onCopy, onPrint }: FIRDocumentTabProps) {
  const { t } = useLanguage();
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const lines = result.fir_text.split('\n');
    lines.forEach((line: string) => {
      if (yPos > pageHeight - margin) { doc.addPage(); yPos = margin; }
      if (line.length > 80) {
        const wrappedLines = doc.splitTextToSize(line, contentWidth);
        wrappedLines.forEach((wrappedLine: string) => { if (yPos > pageHeight - margin) { doc.addPage(); yPos = margin; } doc.text(wrappedLine, margin, yPos); yPos += 4; });
      } else { doc.text(line, margin, yPos); yPos += 4; }
    });
    doc.save(`FIR_${result.fir_id}_${result.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="px-4 py-2 text-amber-400 text-xs font-mono font-bold rounded-xl border border-amber-500/15 shadow-sm tracking-wider" style={{ background: 'rgba(245,158,11,0.06)' }}>{result.fir_id}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopy} className={`text-xs font-bold uppercase tracking-wider transition-forge rounded-xl ${copied ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "border-amber-500/15 text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/25"}`}>{copied ? `\u2713 ${t("results.copied")}` : `\uD83D\uDCCB ${t("results.copyToClipboard")}`}</Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="text-xs font-bold uppercase tracking-wider border-amber-500/15 text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/25 transition-forge rounded-xl">&#128196; PDF</Button>
          <Button variant="outline" size="sm" onClick={onPrint} className="text-xs font-bold uppercase tracking-wider border-amber-500/15 text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/25 transition-forge rounded-xl">&#128424; Print</Button>
        </div>
      </div>
      <div className="border border-amber-500/10 rounded-2xl overflow-hidden shadow-forge">
        <div className="px-6 py-3.5 border-b border-amber-500/10 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.12)' }}><span className="text-amber-400 text-xs font-bold">&#167;</span></div>
          <span className="text-xs font-serif font-bold text-amber-400 tracking-widest uppercase">FIR Document</span>
        </div>
        <pre className="p-6 text-xs text-foreground font-mono whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed" style={{ background: 'rgba(8,8,10,0.5)' }}>{result.fir_text}</pre>
      </div>
    </div>
  );
}
