import { useState, useEffect } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Mic, Square, Zap, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";
import { useNavigate } from "react-router-dom";

export default function LiveMeetingPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const processMeeting = useStore((state) => state.processMeeting);
  const isLoading = useStore((state) => state.isLoading);
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processMeeting(audioBlob, `Meeting ${new Date().toLocaleString()}`);
        navigate('/dashboard');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-muted'}`} />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                {isRecording ? 'Recording Live' : isLoading ? 'Processing with AI...' : 'Ready to record'}
              </span>
            </div>
            <h1 className="text-3xl font-bold">SyncOS Real-time Engine</h1>
          </div>
          <div className="flex gap-4">
             {isRecording ? (
               <Button variant="destructive" className="gap-2 px-6" onClick={stopRecording}>
                 <Square className="w-4 h-4 fill-current" /> Stop & Analyze
               </Button>
             ) : (
               <Button 
                className="gap-2 px-8 bg-red-600 hover:bg-red-700" 
                onClick={startRecording}
                disabled={isLoading}
               >
                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                 {isLoading ? 'Processing...' : 'Start Meeting'}
               </Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-primary/20 glass overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 border-b border-border/50 bg-background/50 flex items-center justify-between">
               <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                 <MessageSquare className="w-3 h-3" /> AUDIO STREAM
               </span>
               {isRecording && <Badge variant="secondary" className="animate-pulse">RECORDING</Badge>}
             </div>
             <CardContent className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
                {isRecording ? (
                  <div className="flex items-center gap-1 h-20">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [20, 60, 20] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                        className="w-1 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                ) : isLoading ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-medium animate-pulse text-primary">Gemini is transcribing and extracting action items...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-4 opacity-50">
                    <Mic className="w-16 h-12 mx-auto" />
                    <p className="text-sm italic">Click 'Start' to begin a live session with SyncOS AI.</p>
                  </div>
                )}
             </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-indigo-500/20 bg-indigo-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">Gemini-Native Intelligence</span>
                </div>
                <div className="space-y-4">
                   <p className="text-sm text-muted-foreground leading-relaxed">
                     Once the meeting ends, Gemini 1.5 Flash will perform a multimodal analysis of the audio to:
                   </p>
                   <ul className="text-xs space-y-2 text-muted-foreground list-disc pl-4">
                     <li>Generate a full accurate transcript</li>
                     <li>Identify every decision and risk</li>
                     <li>Automatically assign tasks to team members</li>
                     <li>Predict execution probability</li>
                   </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
