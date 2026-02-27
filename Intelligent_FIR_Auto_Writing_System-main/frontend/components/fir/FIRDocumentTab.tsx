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
        <span className="px-4 py-2 text-blue-600 text-xs font-mono font-bold rounded-xl border border-blue-200 shadow-sm tracking-wider bg-blue-50">{result.fir_id}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCopy} className={`text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-xl ${copied ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"}`}>{copied ? `\u2713 ${t("results.copied")}` : `\uD83D\uDCCB ${t("results.copyToClipboard")}`}</Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="text-xs font-bold uppercase tracking-wider border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-xl">&#128196; PDF</Button>
          <Button variant="outline" size="sm" onClick={onPrint} className="text-xs font-bold uppercase tracking-wider border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 rounded-xl">&#128424; Print</Button>
        </div>
      </div>
      <div className="border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 border-b border-blue-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-blue-100/50">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-100"><span className="text-blue-600 text-xs font-bold">&#167;</span></div>
          <span className="text-xs font-serif font-bold text-blue-600 tracking-widest uppercase">FIR Document</span>
        </div>
        <pre className="p-6 text-xs text-foreground font-mono whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed bg-white">{result.fir_text}</pre>
      </div>
    </div>
  );
}
