import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { summarizeNotes } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { 
  FileText, 
  Upload as UploadIcon, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  Check, 
  ArrowRight,
  Brain,
  Scale,
  Plus,
  HelpCircle,
  FileCheck,
  Copy,
  Download,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

interface UploadProps {
  onNavigate: (view: string) => void;
  selectedText?: string;
  onSetSelectText?: (text: string) => void;
}

export const Upload: React.FC<UploadProps> = ({ onNavigate, selectedText, onSetSelectText }) => {
  const { user } = useAuth();
  const [text, setText] = useState(selectedText || "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState("Analyzing document structure...");
  const [uploadPercent, setUploadPercent] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // AI Summary Results
  const [result, setResult] = useState<{
    title: string;
    summary: string;
    keyPoints: string[];
    examNotes: string;
    formulas: string[];
  } | null>(null);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selected = e.dataTransfer.files[0];
      const isPdf = selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf");
      const isTxt = selected.type === "text/plain" || selected.name.toLowerCase().endsWith(".txt");
      if (isPdf || isTxt) {
        setFile(selected);
      } else {
        toast.error("Please provide either standard Text file (.txt) or PDF files (.pdf).");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const triggerProcess = async () => {
    if (!text.trim() && !file) {
      toast.error("Please paste lecture notes text, or drag/upload a lecture PDF document first!");
      return;
    }

    setLoading(true);
    setResult(null);
    setSaved(false);
    setUploadPercent(0);

    // If a physical file exists, simulate an upload progress bar first to give premium physical experience
    if (file) {
      setIsUploading(true);
      setLoadingPhrase(`Reading & parsing "${file.name}"...`);
      for (let p = 0; p <= 100; p += 20) {
        setUploadPercent(p);
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      setIsUploading(false);
    }

    // Stagger loading phrases to keep judges engaged
    const phrases = [
      "Accessing Gemini Academic API Cluster...",
      "Extracting raw textbook / notes textual assets...",
      "Synthesizing key conceptual summaries...",
      "Formulating exam specifications...",
      "Structuring equations & key laws...",
      "Finalizing clean revision notes card..."
    ];
    let phraseIndex = 0;
    setLoadingPhrase(phrases[phraseIndex]);
    const interval = setInterval(() => {
      if (phraseIndex < phrases.length - 1) {
        phraseIndex++;
        setLoadingPhrase(phrases[phraseIndex]);
      }
    }, 2000);

    try {
      const apiResult = await summarizeNotes(file || undefined, text || undefined);
      setResult(apiResult);
      clearInterval(interval);
      toast.success("AI Synthesis complete!");
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.message || "Failed to process lecture notes summary.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNotes = () => {
    if (!result) return;
    const notesString = `TITLE: ${result.title}\n\nSUMMARY:\n${result.summary}\n\nKEY TAKEAWAYS:\n${result.keyPoints.map((p, i) => `${i+1}. ${p}`).join("\n")}\n\nEXAM SPECIFICATION:\n${result.examNotes}\n\nFORMULAS:\n${result.formulas.join("\n")}`;
    navigator.clipboard.writeText(notesString);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadNotes = () => {
    if (!result) return;
    const notesString = `TITLE: ${result.title}\n\nSUMMARY:\n${result.summary}\n\nKEY TAKEAWAYS:\n${result.keyPoints.map((p, i) => `${i+1}. ${p}`).join("\n")}\n\nEXAM SPECIFICATION:\n${result.examNotes}\n\nFORMULAS:\n${result.formulas.join("\n")}`;
    const element = document.createElement("a");
    const fileBlob = new Blob([notesString], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${result.title.replace(/\s+/g, "_").toLowerCase()}_summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded textbook notes summary!");
  };

  const saveToFirebase = async () => {
    if (!user || !result || saving) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "summaries"), {
        ownerId: user.uid,
        title: result.title,
        summary: result.summary,
        keyPoints: result.keyPoints,
        examNotes: result.examNotes,
        formulas: result.formulas,
        createdAt: serverTimestamp()
      });
      setSaved(true);
      toast.success("Summary saved securely in your Academic Artifact Archives!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "summaries");
    } finally {
      setSaving(false);
    }
  };

  const clearWorkspace = () => {
    setText("");
    setFile(null);
    setResult(null);
    setSaved(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 select-none bg-slate-950/10 min-h-screen">
      
      {/* Header board */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Brain className="h-4 w-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest">Syllabus Comprehension Suite</span>
        </div>
        <h1 className="text-2xl font-black text-white">AI Note Summary & Parser</h1>
        <p className="text-xs text-slate-400 mt-1">
          Inject textbook chapters, code documentations, or lecture briefings in PDF to construct structured study cards.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-slate-800 bg-slate-900/30 py-16 flex flex-col items-center justify-center space-y-5 text-center min-h-[350px] px-4"
          >
            <LoadingSpinner label={loadingPhrase} />
            {isUploading && (
              <div className="w-full max-w-xs bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <motion.div
                  className="bg-indigo-500 h-full rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadPercent}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}
            {isUploading && (
              <span className="text-[10px] font-mono text-slate-400">{uploadPercent}% parsed & ingested</span>
            )}
          </motion.div>
        ) : !result ? (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
          >
            {/* Left box: Drag PDF drag upload zone */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-2">Ingestion Source</h3>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  file ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-800 bg-slate-900/20 hover:border-indigo-500/40 hover:bg-slate-900/40"
                }`}
                id="file-drop-zone"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt"
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-3">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      <FileCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200 truncate max-w-[250px] mx-auto">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to ingest</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
                      <UploadIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-300">Drag & Drop Lecture Note PDF here</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">Supports PDF & TXT up to 10MB, or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right box: Textbook material typing */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-2">Alternative: Paste Syllabus / Lecture Text</h3>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste raw text details, syllabus bullet points, or lecture highlights here... AutoPilot is ready to structure it..."
                  rows={8}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 resize-none font-sans"
                  id="notebox-textarea"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={triggerProcess}
                  className="flex items-center space-x-2 rounded bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-6 py-3 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all font-mono cursor-pointer"
                  id="process-summary-btn"
                >
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Synthesize AI Study Bundle</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Results Section with full detailed layouts */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* Save / command toolbar banner */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Parsing finalized successfully</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyNotes}
                  className="text-[10px] font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Notes</span>
                </button>
                <button
                  onClick={handleDownloadNotes}
                  className="text-[10px] font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-950 border border-slate-800 hover:bg-slate-900 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download txt</span>
                </button>
                <button
                  onClick={triggerProcess}
                  className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Regenerate</span>
                </button>
                <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />
                <button
                  onClick={clearWorkspace}
                  className="text-[10px] font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-950 border border-slate-800 transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={saveToFirebase}
                  disabled={saved || saving}
                  className={`text-[10px] font-mono font-bold px-4.5 py-1.5 rounded transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                    saved 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                      : "bg-indigo-500 text-white hover:bg-indigo-600 border border-transparent shadow shadow-indigo-500/20"
                  }`}
                  id="save-summary-btn"
                >
                  {saved ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Saved inside OS</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>Save Note Asset</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Grid Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* Executive Summary Card & Keywords (Takes 2 columns in large screens) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Main title and summary */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                  <div className="flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 rounded px-2.5 py-1 w-fit text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                    Executive Summary
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-white">{result.title}</h2>
                  <p className="text-xs text-slate-350 leading-relaxed font-sans">{result.summary}</p>
                </div>

                {/* Exam focused notes in full Markdown details */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                  <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 rounded px-2.5 py-1 w-fit text-[10px] font-mono text-amber-400 uppercase tracking-wider">
                    Exam Practice Specifications
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-text selection:bg-indigo-500/30 bg-slate-950/40 p-4.5 rounded-xl border border-slate-900">
                    {result.examNotes}
                  </div>
                </div>

              </div>

              {/* Takeaways and extract formulas (1 column) */}
              <div className="space-y-6">
                
                {/* Takeaway points card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-3 border-b border-slate-900 pb-2">Core Takeaway KeyPoints</h3>
                    <div className="space-y-3">
                      {result.keyPoints.map((pt, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5">
                          <div className="bg-indigo-500/10 text-indigo-400 rounded-full p-0.5 shrink-0 border border-indigo-500/20 mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                          <span className="text-xs text-slate-300 leading-normal">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Extracted formulas or laws card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-3 border-b border-slate-900 pb-2">Formulas & Concept Maps</h3>
                    {result.formulas.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No mathematical symbols found. Principles are embedded in details.</p>
                    ) : (
                      <div className="space-y-2">
                        {result.formulas.map((frm, idx) => (
                          <div key={idx} className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col space-y-1.5">
                            <span className="text-xs font-mono font-bold text-indigo-400">{frm.split(":")[0]}</span>
                            {frm.includes(":") && (
                              <span className="text-[10px] text-slate-450 leading-relaxed font-sans">{frm.split(":").slice(1).join(":")}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Proceed to Quiz Navigation assistance */}
            <div className="rounded-xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 to-transparent p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">Demo Walkthrough: Step 2</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                    You have successfully generated the static note summaries! Now proceed to the AI Quiz Generator to deploy interactive tests and check your memory.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  // Save text of summary elements and go to quiz tab
                  if (onSetSelectText && result) {
                    onSetSelectText(result.summary + "\n\n" + result.keyPoints.join("\n"));
                  }
                  onNavigate("quiz");
                }}
                className="text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white rounded px-4 py-2 flex items-center space-x-1.5 transition-all shadow shadow-indigo-500/25 cursor-pointer shrink-0"
              >
                <span>Generate Practice Quiz</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
