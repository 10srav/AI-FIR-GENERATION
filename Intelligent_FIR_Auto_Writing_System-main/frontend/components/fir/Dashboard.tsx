"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Header,
  ComplaintForm,
  ResultSummary,
  ResultTabs,
  ErrorMessage,
  Footer,
  FIRResponse,
  TabType,
  ApiStatus,
  API_BASE_URL,
} from "@/components/fir";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogOut, FileText, BarChart3 } from "lucide-react";
import FIRAnalytics from "./FIRAnalytics";

interface DashboardProps {
  currentUser: string;
  onLogout: () => void;
}

type DashboardTab = "generator" | "analytics";

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const { language } = useLanguage();
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("generator");

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

  // API state
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  // Refs
  const resultRef = useRef<HTMLDivElement>(null);

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

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleAudioTranscribed = (text: string) => {
    setDescription(text);
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
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const doc = printWindow.document;
        const html = doc.createElement("html");
        const head = doc.createElement("head");
        const title = doc.createElement("title");
        title.textContent = `FIR - ${result.fir_id}`;
        const style = doc.createElement("style");
        style.textContent = "body{font-family:monospace;white-space:pre-wrap;padding:20px}";
        head.appendChild(title);
        head.appendChild(style);
        const body = doc.createElement("body");
        body.textContent = result.fir_text;
        html.appendChild(head);
        html.appendChild(body);
        doc.appendChild(html);
        doc.close();
        printWindow.print();
      }
    }
  };

  const handleClearForm = () => {
    setName(""); setContact(""); setDescription(""); setWitnessName(""); setWitnessContact("");
    setResult(null); setError(""); setCopied(false); setShowWitness(false); setEvidenceFiles([]);
  };

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: '#F8FAFC' }}>
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute animate-aurora-1" style={{ top: '-15%', left: '-10%', width: '800px', height: '800px', borderRadius: '50%', filter: 'blur(150px)', background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 40%, transparent 70%)' }} />
        <div className="absolute animate-aurora-2" style={{ bottom: '-15%', right: '-10%', width: '700px', height: '700px', borderRadius: '50%', filter: 'blur(130px)', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, rgba(59,130,246,0.01) 40%, transparent 70%)' }} />
      </div>
      <div className="fixed inset-0 -z-5 bg-grid-light" />

      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b border-blue-100 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              <span className="text-white text-xs font-serif font-bold">FIR</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Welcome, <span className="text-blue-600 font-bold">{currentUser}</span>
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all duration-300 border border-transparent hover:border-red-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="flex gap-2 p-1 rounded-2xl bg-white border border-blue-100 shadow-sm w-fit">
          <button
            onClick={() => setDashboardTab("generator")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              dashboardTab === "generator"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-blue-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            FIR Generator
          </button>
          <button
            onClick={() => setDashboardTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              dashboardTab === "analytics"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-blue-50"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            FIR Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto relative z-10 py-8 px-4">
        {dashboardTab === "generator" ? (
          <>
            <Header apiStatus={apiStatus} />
            <ComplaintForm
              name={name} setName={setName} contact={contact} setContact={setContact}
              description={description} onDescriptionChange={handleDescriptionChange}
              witnessName={witnessName} setWitnessName={setWitnessName}
              witnessContact={witnessContact} setWitnessContact={setWitnessContact}
              showWitness={showWitness} setShowWitness={setShowWitness}
              loading={loading} apiStatus={apiStatus}
              onSubmit={handleSubmit} onClear={handleClearForm}
              onAudioTranscribed={handleAudioTranscribed}
              evidenceFiles={evidenceFiles} setEvidenceFiles={setEvidenceFiles}
            />

            {error && <ErrorMessage error={error} />}

            {result && (
              <div ref={resultRef} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResultSummary result={result} />
                <ResultTabs result={result} activeTab={activeTab} setActiveTab={setActiveTab} copied={copied} onCopy={handleCopyFIR} onPrint={handlePrint} />
                <div className="text-center">
                  <Button variant="outline" onClick={handleClearForm} className="px-8 py-5 h-auto rounded-2xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-2"><span>&#10010;</span><span className="font-serif">Generate New FIR</span></span>
                  </Button>
                </div>
              </div>
            )}

            <Footer />
          </>
        ) : (
          <>
            <div className="mb-8 animate-reveal">
              <div className="text-center">
                <h2 className="text-2xl font-serif font-bold tracking-wide bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent uppercase">
                  FIR Analytics Dashboard
                </h2>
                <p className="text-sm text-muted-foreground mt-2 tracking-wide">
                  Analysis of FIR data across 15 areas over 2 years (Jan 2023 - Dec 2024)
                </p>
              </div>
            </div>
            <FIRAnalytics />
            <Footer />
          </>
        )}
      </div>
    </main>
  );
}
