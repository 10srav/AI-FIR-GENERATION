"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Header,
  ComplaintForm,
  ResultSummary,
  ResultTabs,
  ErrorMessage,
  Footer,
  FIRResponse,
  RealtimeAnalysis,
  TabType,
  ApiStatus,
  API_BASE_URL,
} from "@/components/fir";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { language } = useLanguage();

  // Form state
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [witnessName, setWitnessName] = useState("");
  const [witnessContact, setWitnessContact] = useState("");
  const [showWitness, setShowWitness] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  // Result state
  const [result, setResult] = useState<FIRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("fir");

  // Analysis state
  const [realtimeAnalysis, setRealtimeAnalysis] = useState<RealtimeAnalysis | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  // Refs
  const resultRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        setApiStatus(data.status === "healthy" ? "online" : "offline");
      } catch {
        setApiStatus("offline");
      }
    };
    checkHealth();
  }, []);

  useEffect(() => {
    const regenerateFIR = async () => {
      if (!result || !name || !description || loading) return;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/generate_fir`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, contact, description, witness_name: witnessName, witness_contact: witnessContact, language }),
        });
        const data: FIRResponse = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Failed to generate FIR");
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while regenerating FIR.");
      } finally {
        setLoading(false);
      }
    };
    regenerateFIR();
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const analyzeRealtime = useCallback(async (text: string) => {
    if (text.length < 20) { setRealtimeAnalysis(null); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/analyze_realtime`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.success) setRealtimeAnalysis(data);
    } catch { /* silent */ }
  }, []);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setDescription(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyzeRealtime(text), 500);
  };

  const handleAudioTranscribed = (text: string) => {
    setDescription(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => analyzeRealtime(text), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null); setCopied(false);
    try {
      let response: Response;
      if (evidenceFiles.length > 0) {
        const formData = new FormData();
        formData.append("name", name); formData.append("contact", contact);
        formData.append("description", description); formData.append("witness_name", witnessName);
        formData.append("witness_contact", witnessContact); formData.append("language", language);
        evidenceFiles.forEach((file) => formData.append("evidence_files", file));
        response = await fetch(`${API_BASE_URL}/generate_fir`, { method: "POST", body: formData });
      } else {
        response = await fetch(`${API_BASE_URL}/generate_fir`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, contact, description, witness_name: witnessName, witness_contact: witnessContact, language }),
        });
      }
      const data: FIRResponse = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Failed to generate FIR");
      setResult(data); setActiveTab("fir");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  const handleCopyFIR = async () => {
    if (result?.fir_text) {
      try { await navigator.clipboard.writeText(result.fir_text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
      catch { setError("Failed to copy to clipboard"); }
    }
  };

  const handlePrint = () => {
    if (result?.fir_text) {
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<html><head><title>FIR - ${result.fir_id}</title><style>body{font-family:monospace;white-space:pre-wrap;padding:20px}</style></head><body>${result.fir_text}</body></html>`);
        w.document.close(); w.print();
      }
    }
  };

  const handleClearForm = () => {
    setName(""); setContact(""); setDescription(""); setWitnessName(""); setWitnessContact("");
    setResult(null); setError(""); setCopied(false); setRealtimeAnalysis(null); setShowWitness(false); setEvidenceFiles([]);
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: '#08080A' }}>

      {/* ═══ LIVING FORGE BACKGROUND ═══ */}
      <div className="fixed inset-0 -z-50 overflow-hidden">
        <div className="absolute animate-aurora-1" style={{ top: '-15%', left: '-10%', width: '800px', height: '800px', borderRadius: '50%', filter: 'blur(150px)', background: 'radial-gradient(circle, rgba(245,158,11,0.22) 0%, rgba(217,119,6,0.08) 40%, transparent 70%)' }} />
        <div className="absolute animate-aurora-2" style={{ bottom: '-15%', right: '-10%', width: '700px', height: '700px', borderRadius: '50%', filter: 'blur(130px)', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(8,145,178,0.04) 40%, transparent 70%)' }} />
        <div className="absolute animate-aurora-3" style={{ top: '50%', left: '50%', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(120px)', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 60%)' }} />
      </div>

      <div className="fixed inset-0 -z-40 bg-noise pointer-events-none" />
      <div className="fixed inset-0 -z-40 bg-grid-forge" />

      {/* Floating geometric shapes */}
      <div className="fixed -z-30 animate-float-diamond delay-0" style={{ top: '12%', left: '6%' }}><div className="w-6 h-6 border border-amber-500/20 rotate-45" /></div>
      <div className="fixed -z-30 animate-float-diamond delay-3" style={{ top: '55%', right: '10%' }}><div className="w-10 h-10 border border-amber-500/12 rotate-45" /></div>
      <div className="fixed -z-30 animate-float-ring delay-1" style={{ top: '25%', right: '18%' }}><div className="w-8 h-8 border border-cyan-500/12 rounded-full" /></div>
      <div className="fixed -z-30 animate-float-ring delay-4" style={{ bottom: '18%', left: '12%' }}><div className="w-14 h-14 border border-cyan-500/8 rounded-full" /></div>
      <div className="fixed -z-30 animate-float-diamond delay-5" style={{ bottom: '35%', right: '25%' }}><div className="w-4 h-4 border border-amber-500/15 rotate-45" /></div>
      <div className="fixed -z-30 animate-float-ring delay-2" style={{ top: '70%', left: '30%' }}><div className="w-6 h-6 border border-amber-500/10 rounded-full" /></div>

      <div className="fixed left-0 right-0 h-px -z-20 animate-scan-sweep" style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(245,158,11,0.15) 50%, transparent 90%)' }} />

      <div className="fixed top-0 right-0 -z-30 animate-corner-glow" style={{ width: '250px', height: '250px', filter: 'blur(100px)', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 left-0 -z-30 animate-corner-glow delay-4" style={{ width: '250px', height: '250px', filter: 'blur(100px)', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />

      <div className="fixed top-0 left-0 right-0 h-px -z-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)' }} />

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-3xl mx-auto relative z-10 py-12 px-4">
        <Header apiStatus={apiStatus} />
        <ComplaintForm name={name} setName={setName} contact={contact} setContact={setContact} description={description} onDescriptionChange={handleDescriptionChange} witnessName={witnessName} setWitnessName={setWitnessName} witnessContact={witnessContact} setWitnessContact={setWitnessContact} showWitness={showWitness} setShowWitness={setShowWitness} realtimeAnalysis={realtimeAnalysis} loading={loading} apiStatus={apiStatus} onSubmit={handleSubmit} onClear={handleClearForm} onAudioTranscribed={handleAudioTranscribed} evidenceFiles={evidenceFiles} setEvidenceFiles={setEvidenceFiles} />

        {error && <ErrorMessage error={error} />}

        {result && (
          <div ref={resultRef} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultSummary result={result} />
            <ResultTabs result={result} activeTab={activeTab} setActiveTab={setActiveTab} copied={copied} onCopy={handleCopyFIR} onPrint={handlePrint} />
            <div className="text-center">
              <Button variant="outline" onClick={handleClearForm} className="px-8 py-5 h-auto rounded-2xl border-2 border-amber-500/15 text-amber-400 hover:bg-amber-500/8 hover:border-amber-500/30 hover:shadow-ember transition-forge font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2"><span>&#10010;</span><span className="font-serif">Generate New FIR</span></span>
              </Button>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
