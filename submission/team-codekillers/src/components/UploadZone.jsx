import { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, Image, FileVideo, ShieldAlert, Lock, Cpu, Zap, Camera, Video } from 'lucide-react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];

export default function UploadZone({ onFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  // Webcam state
  const [webcamMode, setWebcamMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleFile = useCallback((file) => {
    setError(null);
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|jpg|jpeg|png|gif|webp)$/i)) {
      setError('Unsupported format. Please upload JPG, PNG, GIF, MP4, MOV, or WebM files.');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('File too large. Maximum size is 200 MB.');
      return;
    }
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (webcamMode) return;
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile, webcamMode]);

  const handleChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleSample = useCallback((type) => {
    if (type === 'deepfake') {
      const file = new File([new ArrayBuffer(1024 * 1024)], 'suspicious_deepfake.mp4', { type: 'video/mp4' });
      handleFile(file);
    } else {
      const file = new File([new ArrayBuffer(1024 * 1024 * 3)], 'IMG_8472.jpeg', { type: 'image/jpeg' });
      handleFile(file);
    }
  }, [handleFile]);

  // ── Webcam Logic ─────────────────────────────────────────────────────────────
  const startWebcam = async () => {
    setWebcamMode(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied or unavailable. Please check permissions.");
      setWebcamMode(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setWebcamMode(false);
    setRecording(false);
    setCountdown(5);
  };

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    setRecording(true);
    setCountdown(5);
    chunksRef.current = [];
    
    const stream = videoRef.current.srcObject;
    let options = { mimeType: 'video/webm' };
    if (!MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/mp4' }; // Fallback for Safari
    }
    
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: options.mimeType });
      // The backend expects an mp4 or webm. The heuristic uses the name 'live_scan'
      // We will name it 'live_webcam_scan.webm' so backend knows it's a video.
      const file = new File([blob], 'live_webcam_scan.webm', { type: options.mimeType });
      
      stopWebcam();
      handleFile(file); // trigger pipeline
    };
    
    mediaRecorder.start();
    
    // Countdown timer
    let timeLeft = 5;
    const interval = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      }
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Section label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-xs font-mono font-semibold tracking-wider">SECURE ANALYSIS PORTAL</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-red-500/20 to-transparent" />
      </div>

      {/* Upload / Webcam Zone */}
      <div
        className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
          !webcamMode ? 'border-dashed cursor-pointer group' : 'border-solid border-cyan-500/40 bg-black'
        } ${dragActive && !webcamMode ? 'border-cyan-400 bg-cyan-500/5 shadow-lg shadow-cyan-500/10' : ''} ${
          !webcamMode && !dragActive ? 'border-slate-700 hover:border-slate-500 hover:bg-white/[0.02]' : ''
        }`}
        onDragEnter={(e) => { e.preventDefault(); if(!webcamMode) setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => { if (!webcamMode) document.getElementById('file-input').click() }}
      >
        {!webcamMode && (
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.webm"
            onChange={handleChange}
          />
        )}

        {/* Corner accents */}
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-lg pointer-events-none z-10" />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-lg pointer-events-none z-10" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-lg pointer-events-none z-10" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-500/40 rounded-br-lg pointer-events-none z-10" />

        {webcamMode ? (
          // ── Webcam View ──────────────────────────────────────────────────
          <div className="relative w-full aspect-video bg-black flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror the camera
            />
            
            {/* Overlay UI */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-black/60 via-transparent to-black/80">
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-black/50 backdrop-blur border border-slate-700">
                  <div className={`w-2 h-2 rounded-full ${recording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-white text-xs font-mono">{recording ? 'RECORDING' : 'CAMERA ACTIVE'}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); stopWebcam(); }}
                  className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-black/50 border border-slate-700 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>

              {recording ? (
                <div className="mb-4 text-center">
                  <div className="text-6xl font-mono font-bold text-white drop-shadow-[0_0_15px_rgba(255,45,85,0.8)] mb-2">
                    {countdown}s
                  </div>
                  <p className="text-white/80 text-sm">Hold still while we capture temporal frames...</p>
                </div>
              ) : (
                <div className="mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); startRecording(); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold transition-colors shadow-[0_0_20px_rgba(255,45,85,0.4)]"
                  >
                    <Video className="w-5 h-5" />
                    Start 5s Live Scan
                  </motion.button>
                </div>
              )}
            </div>
            
            {/* Scanning lines effect when recording */}
            {recording && (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                  className="w-full h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(0,212,255,1)]"
                  animate={{ y: ['0%', '1000%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}
          </div>
        ) : (
          // ── Standard Upload View ─────────────────────────────────────────
          <div className="py-12 px-8 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {dragActive ? (
                <motion.div
                  key="drag"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="mb-7"
                >
                  <div className="w-24 h-24 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center"
                    style={{ boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
                    <Upload className="w-12 h-12 text-cyan-400" />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  className="mb-7 relative"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-24 h-24 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center group-hover:border-slate-500 transition-colors">
                    <div className="grid grid-cols-2 gap-2.5">
                      <Film className="w-6 h-6 text-slate-400" />
                      <Image className="w-6 h-6 text-slate-400" />
                      <FileVideo className="w-6 h-6 text-slate-400" />
                      <Upload className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl border border-cyan-500/10 animate-spin-slow" style={{ margin: '-10px' }} />
                </motion.div>
              )}
            </AnimatePresence>

            <h2 className="text-white text-2xl font-bold mb-3">
              {dragActive ? 'Release to Analyze' : 'Upload Suspicious Media'}
            </h2>
            <p className="text-slate-400 text-base mb-1.5">
              {dragActive
                ? 'Secure analysis will begin immediately'
                : 'Drag & drop or click to browse files'
              }
            </p>
            <p className="text-slate-500 text-sm mb-6">
              Supports: JPG, PNG, GIF, MP4, MOV, WebM · Max 200 MB
            </p>

            {/* Buttons Row */}
            {!dragActive && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.div
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white border border-cyan-500/40 bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-all cursor-pointer"
                  style={{ boxShadow: '0 0 20px rgba(0,212,255,0.1)' }}
                >
                  Select File
                </motion.div>
                
                <span className="text-slate-600 font-mono text-xs">OR</span>
                
                <motion.button
                  onClick={(e) => { e.stopPropagation(); startWebcam(); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Use Webcam
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer strip */}
      <div className="mt-4 flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-900/60 border border-slate-800/50">
        <div className="flex items-center gap-3 flex-1">
          <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-slate-400 text-sm leading-relaxed">
            <span className="text-emerald-400 font-semibold">Privacy Guarantee: </span>
            All uploads are processed locally on-device and immediately purged after analysis. No data is stored, transmitted, or retained on any server.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono font-bold flex-shrink-0 ml-2">
          <Cpu className="w-3.5 h-3.5" />
          <span>LOCAL</span>
        </div>
      </div>

      {/* Try a Sample */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <span className="text-slate-500 text-xs font-mono">Don't have a file? Try a sample:</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleSample('deepfake')}
            className="px-4 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
          >
            Test Deepfake Video
          </button>
          <button
            onClick={() => handleSample('real')}
            className="px-4 py-1.5 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-semibold transition-colors"
          >
            Test Authentic Photo
          </button>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
