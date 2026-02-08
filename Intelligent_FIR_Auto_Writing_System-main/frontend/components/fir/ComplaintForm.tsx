"use client";

import { RealtimeAnalysis } from "./types";
import { getConfidenceColor } from "./utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic, MicOff, Upload, Paperclip, FileText, X } from "lucide-react";
import { useState, useRef } from "react";

interface ComplaintFormProps {
  name: string;
  setName: (value: string) => void;
  contact: string;
  setContact: (value: string) => void;
  description: string;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  witnessName: string;
  setWitnessName: (value: string) => void;
  witnessContact: string;
  setWitnessContact: (value: string) => void;
  showWitness: boolean;
  setShowWitness: (value: boolean) => void;
  realtimeAnalysis: RealtimeAnalysis | null;
  loading: boolean;
  apiStatus: "checking" | "online" | "offline";
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onAudioTranscribed?: (text: string) => void;
  evidenceFiles: File[];
  setEvidenceFiles: (files: File[]) => void;
}

export function ComplaintForm({ name, setName, contact, setContact, description, onDescriptionChange, witnessName, setWitnessName, witnessContact, setWitnessContact, showWitness, setShowWitness, realtimeAnalysis, loading, apiStatus, onSubmit, onClear, onAudioTranscribed, evidenceFiles, setEvidenceFiles }: ComplaintFormProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = async () => { const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" }); await transcribeAudio(audioBlob); stream.getTracks().forEach((track) => track.stop()); };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) { console.error("Error accessing microphone:", error); alert("Unable to access microphone. Please check permissions."); }
  };

  const stopRecording = () => { if (mediaRecorderRef.current && isRecording) { mediaRecorderRef.current.stop(); setIsRecording(false); } };

  const transcribeAudio = async (audioBlob: Blob) => {
    setAudioLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      const response = await fetch("http://127.0.0.1:5000/transcribe_audio", { method: "POST", body: formData });
      const data = await response.json();
      if (data.success && data.text) {
        const newText = description ? `${description}\n${data.text}` : data.text;
        if (onAudioTranscribed) onAudioTranscribed(newText);
      } else { alert("Failed to transcribe audio: " + (data.error || "Unknown error")); }
    } catch (error) { console.error("Error transcribing audio:", error); alert("Error transcribing audio. Please try again."); }
    finally { setAudioLoading(false); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; await transcribeAudio(file); event.target.value = ""; };
  const handleEvidenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => { const files = event.target.files; if (!files) return; setEvidenceFiles([...evidenceFiles, ...Array.from(files)]); event.target.value = ""; };
  const removeEvidenceFile = (index: number) => { setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index)); };

  return (
    <div className="rounded-3xl glass-forge ember-emboss hover:shadow-forge-hover transition-forge p-8 mb-8 animate-reveal" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center gap-4 mb-7 pb-5 border-b border-amber-500/10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/10 bg-ember-gradient">
          <span className="text-forge-950 text-sm font-serif font-bold">01</span>
        </div>
        <div>
          <h2 className="text-base font-serif font-bold text-foreground tracking-tight uppercase">{t("form.title")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">Fill in the details below to generate a formal FIR</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-ember-gradient"></span>{t("form.name")}</Label>
            <Input id="name" type="text" placeholder={t("form.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} required className="input-forge rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-ember-gradient"></span>{t("form.contact")}</Label>
            <Input id="contact" type="tel" placeholder={t("form.contactPlaceholder")} value={contact} onChange={(e) => setContact(e.target.value)} required className="input-forge rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{t("form.description")}</Label>
          <Textarea id="description" placeholder={t("form.descriptionPlaceholder")} value={description} onChange={onDescriptionChange} required rows={10} className="input-forge rounded-xl resize-none leading-relaxed" />
          <div className="flex items-center gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={isRecording ? stopRecording : startRecording} disabled={audioLoading || loading} className={`flex items-center gap-2 rounded-xl ${isRecording ? "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/25" : "bg-amber-500/5 border-amber-500/15 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/25"}`}>
              {isRecording ? <><MicOff className="w-4 h-4" /><span>Stop Recording</span></> : <><Mic className="w-4 h-4" /><span>Record Audio</span></>}
            </Button>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={audioLoading || loading} className="flex items-center gap-2 rounded-xl bg-amber-500/5 border-amber-500/15 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/25">
              <Upload className="w-4 h-4" /><span>Upload Audio</span>
            </Button>
            {audioLoading && <span className="text-xs text-amber-400 flex items-center gap-2"><span className="w-3 h-3 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></span>Transcribing...</span>}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{description.length} characters</p>
            {description.length > 50 && <span className="text-xs text-amber-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>{t("form.analyzing")}</span>}
          </div>
        </div>

        {realtimeAnalysis && (
          <div className="p-4 rounded-xl border border-amber-500/15 space-y-3" style={{ background: 'rgba(245,158,11,0.03)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-amber-500/15 flex items-center justify-center"><span className="text-xs">&#9889;</span></div>
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Live Analysis</p>
              </div>
              {realtimeAnalysis.offence_type && <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getConfidenceColor(realtimeAnalysis.confidence_level)}`}>{realtimeAnalysis.offence_type} &bull; {(realtimeAnalysis.confidence * 100).toFixed(0)}%</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {realtimeAnalysis.preview.persons.map((p, i) => <span key={`p-${i}`} className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-lg border border-amber-500/15 font-medium">&#128100; {p}</span>)}
              {realtimeAnalysis.preview.locations.map((l, i) => <span key={`l-${i}`} className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-lg border border-cyan-500/15 font-medium">&#128205; {l}</span>)}
              {realtimeAnalysis.preview.organizations?.map((o, i) => <span key={`o-${i}`} className="px-2.5 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-lg border border-purple-500/15 font-medium">&#127970; {o}</span>)}
            </div>
          </div>
        )}

        <div>
          <button type="button" onClick={() => setShowWitness(!showWitness)} className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-forge">
            <span className="w-4 h-4 rounded-full bg-amber-500/15 flex items-center justify-center text-xs text-amber-400">{showWitness ? "\u2212" : "+"}</span>
            {showWitness ? t("form.removeWitness") : t("form.addWitness")}
          </button>
        </div>

        {showWitness && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-amber-500/10" style={{ background: 'rgba(245,158,11,0.02)' }}>
            <div className="space-y-2">
              <Label htmlFor="witnessName" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-ember-gradient"></span>{t("form.witnessName")}</Label>
              <Input id="witnessName" type="text" placeholder={t("form.witnessNamePlaceholder")} value={witnessName} onChange={(e) => setWitnessName(e.target.value)} className="input-forge rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="witnessContact" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-ember-gradient"></span>{t("form.witnessContact")}</Label>
              <Input id="witnessContact" type="tel" placeholder={t("form.witnessContactPlaceholder")} value={witnessContact} onChange={(e) => setWitnessContact(e.target.value)} className="input-forge rounded-xl" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{t("form.evidenceLabel")}</Label>
            <span className="text-xs text-muted-foreground">{evidenceFiles.length} {t("form.evidenceCount")}</span>
          </div>
          <input ref={evidenceInputRef} type="file" multiple onChange={handleEvidenceUpload} className="hidden" />
          <div onClick={() => evidenceInputRef.current?.click()} className="border-2 border-dashed border-amber-500/15 rounded-2xl p-6 text-center cursor-pointer hover:border-amber-500/30 transition-forge group" style={{ background: 'rgba(245,158,11,0.02)' }}>
            <Paperclip className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-amber-400 transition-forge" />
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-forge">{t("form.evidenceDropzone")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("form.evidenceHint")}</p>
          </div>
          {evidenceFiles.length > 0 && (
            <div className="space-y-2">
              {evidenceFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/8" style={{ background: 'rgba(15,15,18,0.5)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button type="button" onClick={() => removeEvidenceFile(index)} className="p-1 rounded-md hover:bg-red-500/15 hover:text-red-400 transition-forge shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading || !description.trim() || apiStatus === "offline"} className="flex-1 text-forge-950 shadow-lg shadow-amber-500/15 hover:shadow-amber-500/25 hover:opacity-90 transition-forge font-bold py-6 uppercase tracking-wider text-sm rounded-2xl bg-ember-gradient">
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-forge-950/30 border-t-forge-950 rounded-full animate-spin"></span>{t("form.analyzing")}</span> : <span className="flex items-center gap-2">{t("form.generateFIR")}</span>}
          </Button>
          {(name || contact || description) && <Button type="button" variant="outline" onClick={onClear} className="px-4 rounded-2xl border-amber-500/15 text-muted-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20">{t("form.clear")}</Button>}
        </div>
      </form>
    </div>
  );
}
