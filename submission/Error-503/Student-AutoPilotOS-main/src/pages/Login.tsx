import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, ShieldCheck, Cpu, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onNavigate: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { loginWithGoogle, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto redirect if user clicks and is authenticated
  React.useEffect(() => {
    if (user) {
      onNavigate("dashboard");
    }
  }, [user, onNavigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      onNavigate("dashboard");
    } catch (err: any) {
      const errMsg = err.message || "Failed to establish secure connection with Google Authenticator.";
      setError(errMsg);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a] text-white min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden px-4">
      {/* Glow backgrounds */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] bg-violet-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Main glass card portal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/70 p-8 shadow-2xl backdrop-blur-md relative z-10"
        id="login-card"
      >
        <button
          onClick={() => onNavigate("landing")}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors font-mono uppercase"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit Hub</span>
        </button>

        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-indigo-500 bg-indigo-500/10 text-indigo-400 mb-4">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            Authentication Portal
          </h2>
          <p className="text-xs text-slate-450 mt-2">
            Connect your academic workspace to AutoPilot OS Core
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 mb-6 flex items-start space-x-2 text-xs text-red-400 leading-normal">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Authentication Options */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 rounded-lg bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 py-3.5 text-xs font-bold transition-all hover:scale-[1.01] shadow-md shadow-white/5 cursor-pointer disabled:opacity-50"
            id="google-login-btn"
          >
            {/* Standard Vector Google G Logo */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{loading ? "Authenticating Workspace..." : "Sign In with Google"}</span>
          </button>
        </div>

        {/* Info footer */}
        <div className="mt-8 border-t border-slate-900 pt-6 flex items-center justify-center space-x-2 text-[10px] font-mono tracking-widest uppercase text-slate-500">
          <ShieldCheck className="h-4 w-4 text-indigo-400" />
          <span>Secured with Firebase OAuth 2.0</span>
        </div>
      </motion.div>
    </div>
  );
};
