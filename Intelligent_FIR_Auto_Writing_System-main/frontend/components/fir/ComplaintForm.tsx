"use client";

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
  loading: boolean;
  apiStatus: "checking" | "online" | "offline";
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onAudioTranscribed?: (text: string) => void;
  evidenceFiles: File[];
  setEvidenceFiles: (files: File[]) => void;
}

export function ComplaintForm({ name, setName, contact, setContact, description, onDescriptionChange, witnessName, setWitnessName, witnessContact, setWitnessContact, showWitness, setShowWitness, loading, apiStatus, onSubmit, onClear, onAudioTranscribed, evidenceFiles, setEvidenceFiles }: ComplaintFormProps) {
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
    <div className="rounded-3xl glass-card card-shadow hover:shadow-lg transition-all duration-300 p-8 mb-8 animate-reveal" style={{ animationDelay: '0.15s' }}>
      <div className="flex items-center gap-4 mb-7 pb-5 border-b border-blue-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 to-blue-600">
          <span className="text-white text-sm font-serif font-bold">01</span>
        </div>
        <div>
          <h2 className="text-base font-serif font-bold text-foreground tracking-tight uppercase">{t("form.title")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide">Fill in the details below to generate a formal FIR</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{t("form.name")}</Label>
            <Input id="name" type="text" placeholder={t("form.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} required className="input-theme rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{t("form.contact")}</Label>
            <Input id="contact" type="tel" placeholder={t("form.contactPlaceholder")} value={contact} onChange={(e) => setContact(e.target.value)} required className="input-theme rounded-xl" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{t("form.description")}</Label>
          <Textarea id="description" placeholder={t("form.descriptionPlaceholder")} value={description} onChange={onDescriptionChange} required rows={10} className="input-theme rounded-xl resize-none leading-relaxed" />
          <div className="flex items-center gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={isRecording ? stopRecording : startRecording} disabled={audioLoading || loading} className={`flex items-center gap-2 rounded-xl ${isRecording ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300"}`}>
              {isRecording ? <><MicOff className="w-4 h-4" /><span>Stop Recording</span></> : <><Mic className="w-4 h-4" /><span>Record Audio</span></>}
            </Button>
            <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={audioLoading || loading} className="flex items-center gap-2 rounded-xl bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300">
              <Upload className="w-4 h-4" /><span>Upload Audio</span>
            </Button>
            {audioLoading && <span className="text-xs text-blue-600 flex items-center gap-2"><span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></span>Transcribing...</span>}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{description.length} characters</p>
          </div>
        </div>

        <div>
          <button type="button" onClick={() => setShowWitness(!showWitness)} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 hover:border-blue-200 transition-all duration-300">
            <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-600">{showWitness ? "\u2212" : "+"}</span>
            {showWitness ? t("form.removeWitness") : t("form.addWitness")}
          </button>
        </div>

        {showWitness && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/30">
            <div className="space-y-2">
              <Label htmlFor="witnessName" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{t("form.witnessName")}</Label>
              <Input id="witnessName" type="text" placeholder={t("form.witnessNamePlaceholder")} value={witnessName} onChange={(e) => setWitnessName(e.target.value)} className="input-theme rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="witnessContact" className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{t("form.witnessContact")}</Label>
              <Input id="witnessContact" type="tel" placeholder={t("form.witnessContactPlaceholder")} value={witnessContact} onChange={(e) => setWitnessContact(e.target.value)} className="input-theme rounded-xl" />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground flex items-center gap-1.5 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{t("form.evidenceLabel")}</Label>
            <span className="text-xs text-muted-foreground">{evidenceFiles.length} {t("form.evidenceCount")}</span>
          </div>
          <input ref={evidenceInputRef} type="file" multiple onChange={handleEvidenceUpload} className="hidden" />
          <div onClick={() => evidenceInputRef.current?.click()} className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-400 transition-all duration-300 group bg-blue-50/30">
            <Paperclip className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-blue-500 transition-all duration-300" />
            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-all duration-300">{t("form.evidenceDropzone")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("form.evidenceHint")}</p>
          </div>
          {evidenceFiles.length > 0 && (
            <div className="space-y-2">
              {evidenceFiles.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2.5 rounded-lg border border-blue-100 bg-white">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="text-sm text-foreground truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button type="button" onClick={() => removeEvidenceFile(index)} className="p-1 rounded-md hover:bg-red-50 hover:text-red-500 transition-all duration-300 shrink-0"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading || !description.trim() || apiStatus === "offline"} className="flex-1 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:opacity-90 transition-all duration-300 font-bold py-6 uppercase tracking-wider text-sm rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600">
            {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>{t("form.analyzing")}</span> : <span className="flex items-center gap-2">{t("form.generateFIR")}</span>}
          </Button>
          {(name || contact || description) && <Button type="button" variant="outline" onClick={onClear} className="px-4 rounded-2xl border-gray-200 text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200">{t("form.clear")}</Button>}
        </div>
      </form>
    </div>
  );
}
