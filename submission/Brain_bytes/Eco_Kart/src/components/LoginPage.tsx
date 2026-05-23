import React, { useState } from "react";
import { 
  Sparkles, 
  User, 
  ShieldCheck, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  ArrowLeft,
  UserPlus,
  KeyRound,
  IdCard,
  MapPin,
  ShieldAlert,
  Info
} from "lucide-react";
import { RegisteredUser } from "../types";
import { saveUserProfile } from "../firebaseUtils";

interface LoginPageProps {
  onLogin: (role: "user" | "admin", email: string) => void;
  users: RegisteredUser[];
  setUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
}

export default function LoginPage({ onLogin, users, setUsers }: LoginPageProps) {
  // Navigation active tab for login and signup layouts
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"user" | "admin" >("user");
  const [signUpRole, setSignUpRole] = useState<"user" | "admin">("user");

  // Login inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // User Signup inputs 
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirmPassword, setSuConfirmPassword] = useState("");
  const [suRegion, setSuRegion] = useState("Goa");
  const [suAgreed, setSuAgreed] = useState(false);

  // Admin Signup inputs
  const [adName, setAdName] = useState("");
  const [adEmail, setAdEmail] = useState("");
  const [adPassword, setAdPassword] = useState("");
  const [adConfirmPassword, setAdConfirmPassword] = useState("");
  const [adPIN, setAdPIN] = useState(""); // clearance passcode

  // Validation feedback
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Demo credentials loader
  const handleQuickLogin = (selectedRole: "user" | "admin") => {
    setRole(selectedRole);
    if (selectedRole === "user") {
      setEmail("user@ecokart.in");
      setPassword("user123");
    } else {
      setEmail("admin@ecokart.in");
      setPassword("admin123");
    }
    setError(null);
  };

  // Submit standard Sign In handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please fill out both email and password input triggers.");
      return;
    }

    const matchedAccount = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedAccount) {
      setError(`No account credentials match the email: "${cleanEmail}". Please register a separate account below!`);
      return;
    }

    if (matchedAccount.password !== password) {
      setError("Invalid password credentials provided. Ensure CAPS lock is disabled and retry.");
      return;
    }

    const matchedRole = matchedAccount.role || (cleanEmail === "admin@ecokart.in" ? "admin" : "user");
    if (matchedRole !== role) {
      setError(`This email is registered as a ${matchedRole.toUpperCase()} profile. Please toggle your login mode to authenticate.`);
      return;
    }

    // Safety verify: checkIf user is marked blocked inside App users grid
    if (role === "user") {
      if (matchedAccount.status === "Blocked") {
        setError("Your account is currently BLOCKED by Platform Management. Access is strictly denied.");
        return;
      }
    }

    // Trigger loaded transition
    setSuccess(true);
    setTimeout(() => {
      onLogin(role, cleanEmail);
    }, 1200);
  };

  // Submit User Registration handler
  const handleUserSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = suName.trim();
    const cleanEmail = suEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !suPassword || !suConfirmPassword) {
      setError("Please input your name, email, parameters and security locks.");
      return;
    }

    if (suPassword !== suConfirmPassword) {
      setError("Passwords mismatch! Ensure both matching inputs share identical characters.");
      return;
    }

    if (!suAgreed) {
      setError("You must check and pledge community cooperation of zero-waste parameters to proceed.");
      return;
    }

    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      setError(`Account identifier "${cleanEmail}" is already active in database. Sign in directly.`);
      return;
    }

    // Create a matching RegisteredUser model for Admin Panel visibility and live points tracking
    const newRegUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      greenPoints: 0,
      carbonOffsetTons: 0,
      status: "Active",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      recentActivity: `Signed up from ${suRegion} district region`,
      password: suPassword,
      role: "user"
    };

    try {
      // Save directly to Firebase Firestore
      await saveUserProfile(newRegUser);
      setUsers(prev => [...prev, newRegUser]);

      setSuccessMsg(`Welcome aboard, ${cleanName}! Your User Account is successfully provisioned. Enter credentials to login.`);
      setIsSignUp(false);
      setRole("user");
      setEmail(cleanEmail);
      setPassword(suPassword);

      // Reset User form fields
      setSuName("");
      setSuEmail("");
      setSuPassword("");
      setSuConfirmPassword("");
      setSuAgreed(false);
    } catch (err: any) {
      setError("Failed to register account to the database: " + err.message);
    }

    setTimeout(() => setSuccessMsg(null), 6000);
  };

  // Submit Administrator Registration handler
  const handleAdminSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = adName.trim();
    const cleanEmail = adEmail.trim().toLowerCase();
    const cleanPIN = adPIN.trim().toUpperCase();

    if (!cleanName || !cleanEmail || !adPassword || !adConfirmPassword || !cleanPIN) {
      setError("All credentials, names, and supervisor overrides must be supplied.");
      return;
    }

    if (adPassword !== adConfirmPassword) {
      setError("Password inputs do not match standard verify specifications.");
      return;
    }

    // STRICT CHECKPASS FOR ADMIN ROLES SECURITY VERIFICATION
    const securityKey = "ECO-ADMIN";
    if (cleanPIN !== securityKey) {
      setError(`Administrative override PIN error. You supplied "${cleanPIN}" which does not match active clearance. PIN is: '${securityKey}'.`);
      return;
    }

    const existingAdmin = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingAdmin) {
      setError(`The authorization email "${cleanEmail}" is already mapped in server directories.`);
      return;
    }

    const newAdminUser: RegisteredUser = {
      id: `admin-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      greenPoints: 0,
      carbonOffsetTons: 0,
      status: "Active",
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      recentActivity: `Administrative security clearance granted`,
      password: adPassword,
      role: "admin"
    };

    try {
      // Save directly to Firebase Firestore
      await saveUserProfile(newAdminUser);
      setUsers(prev => [...prev, newAdminUser]);

      setSuccessMsg(`Access Granted! Welcome to Platform Supervisors, Admin ${cleanName}. Use credentials to enter security terminal.`);
      setIsSignUp(false);
      setRole("admin");
      setEmail(cleanEmail);
      setPassword(adPassword);

      // Reset admin form fields
      setAdName("");
      setAdEmail("");
      setAdPassword("");
      setAdConfirmPassword("");
      setAdPIN("");
    } catch (err: any) {
      setError("Failed to provision administrator parameters to the database: " + err.message);
    }

    setTimeout(() => setSuccessMsg(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4 md:p-10 font-sans relative overflow-hidden">
      
      {/* Decorative ambient blurred layout backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/15 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl glass-card border border-white/60 grid grid-cols-1 lg:grid-cols-12 min-h-[600px] z-10">
        
        {/* Left Side: Brand & Carbon Offset Stats showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-[#004e36] to-[#022a1c] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle eco background watermark */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-11 blur-xs">
            <span className="material-symbols-outlined text-[320px] text-[#006c49]/30">energy_savings_leaf</span>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-teal-300">
              <span className="material-symbols-outlined text-[36px] font-bold">energy_savings_leaf</span>
              <span className="font-bold text-2xl tracking-tight">EcoKart AI</span>
            </div>
            
            <p className="text-xs text-emerald-100/90 font-medium py-1">
              An intelligent, dynamically calculated marketplace designed with carbon-accounting, automated clearance, and gamified reward systems.
            </p>
          </div>

          {/* Dynamic contextual guidelines for separate signup */}
          <div className="relative z-10 space-y-5 my-8 lg:my-0">
            <div className="inline-flex py-1 px-3 bg-white/10 rounded-full text-[10px] uppercase font-bold tracking-widest text-teal-300 border border-teal-500/20">
              SYSTEM CAPABILITIES
            </div>
            <h2 className="text-2xl font-bold font-display leading-[1.2] text-teal-100">
              Personalized carbon ledger dashboards
            </h2>
            
            <div className="space-y-4 text-xs font-sans text-emerald-50/80 leading-relaxed">
              <div className="flex gap-2.5">
                <CheckCircle size={14} className="text-teal-400 shrink-0 mt-0.5" />
                <p><strong>Separated Signup Terminals</strong>: Dynamic standard customer signup and administrative clearance levels powered by passcodes.</p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle size={14} className="text-teal-400 shrink-0 mt-0.5" />
                <p><strong>Security Protocols</strong>: Built to authenticate strictly matching registered accounts while blocking blacklisted actors instantly.</p>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle size={14} className="text-teal-400 shrink-0 mt-0.5" />
                <p><strong>Reward Sinks & Badges</strong>: Create and modify eco catalog lists, track user milestones, and redeem clean forest sapling badges.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-[10px] text-emerald-200/80 flex items-center justify-between font-mono">
            <span>₹ Indian Rupya Localization</span>
            <span>v2.8.5 — Live Database</span>
          </div>
        </div>

        {/* Right Side: Dual-role Form Panel for LOGIN & SIGNUP */}
        <div className="lg:col-span-7 bg-white/95 p-8 md:p-11 flex flex-col justify-center relative">
          
          <div className="max-w-md w-full mx-auto space-y-5">
            
            {/* Header Success Alerts */}
            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-semibold animate-fadeIn flex items-start gap-2.5 shadow-sm">
                <CheckCircle size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Error alerts */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-850 rounded-2xl text-xs font-medium animate-shake flex items-start gap-2 text-rose-900">
                <ShieldAlert size={15} className="text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success login notification loader */}
            {success && (
              <div className="p-5 bg-emerald-700 text-white rounded-3xl flex items-center gap-4 animate-scaleUp shadow-md">
                <CheckCircle className="shrink-0 size-6 text-teal-300 animate-spin" />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold">Verification Successful!</h4>
                  <p className="text-[11px] text-emerald-100">
                    Routing session key to {role === "admin" ? "Administrative supervisor panel" : "Sustainability customer terminal"}...
                  </p>
                </div>
              </div>
            )}

            {/* ==================================== SIGN IN VIEW ==================================== */}
            {!isSignUp && !success && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Header title */}
                <div>
                  <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#006c49] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Terminal Gateway
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900 mt-2.5">Access System Credentials</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your targeted subsystem below and present authorized email credentials.
                  </p>
                </div>

                {/* Segmented Sign In switcher role control */}
                <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/40">
                  <button
                    type="button"
                    onClick={() => {
                      setRole("user");
                      setError(null);
                    }}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      role === "user" 
                        ? "bg-white text-emerald-800 shadow-md" 
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    <User size={13} />
                    <span>Customer Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRole("admin");
                      setError(null);
                    }}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                      role === "admin" 
                        ? "bg-white text-emerald-800 shadow-md" 
                        : "text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    <ShieldCheck size={13} />
                    <span>Supervisor Hub</span>
                  </button>
                </div>

                {/* Actual Login form */}
                <form onSubmit={handleSignInSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 size-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={role === "admin" ? "admin@ecokart.in" : "you@example.com"}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block text-left">Security Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 size-4 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#006c49] hover:bg-[#005137] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Authenticate Session</span>
                    <ArrowRight size={14} />
                  </button>
                </form>

                {/* Trigger link to switch to signup */}
                <div className="text-center pt-1.5 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Don't have credentials yet?{" "}
                    <button
                      onClick={() => {
                        setIsSignUp(true);
                        setSignUpRole(role); // default sign up role based on active sign in toggle
                        setError(null);
                      }}
                      className="text-[#006c49] font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Create Account</span>
                      <UserPlus size={11} className="mt-0.5" />
                    </button>
                  </p>
                </div>

                {/* Quick Auto credentials Sandbox list */}
                <div className="p-3 bg-slate-100/50 rounded-xl space-y-1.5 text-center border border-slate-200/20">
                  <div className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400">Pre-Configured Sandbox Accounts</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("user")}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#006c49] font-bold rounded-lg text-[10px] border border-emerald-200/40 transition-colors"
                    >
                      Quick Fill Rajesh
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("admin")}
                      className="flex-1 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg text-[10px] border border-teal-200/40 transition-colors"
                    >
                      Quick Fill Supervisor
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Use <code className="bg-slate-100 px-1 py-0.5 rounded text-[#006c49]/80 font-bold font-mono">user123</code> or <code className="bg-slate-100 px-1 py-0.5 rounded text-teal-700 font-bold font-mono">admin123</code>
                  </p>
                </div>

              </div>
            )}

            {/* ==================================== SIGN UP VIEW ==================================== */}
            {isSignUp && !success && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Back button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    <span>Return to Login</span>
                  </button>

                  <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                    REGISTRATION SCREEN
                  </span>
                </div>

                <div className="space-y-1">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create Account Credentials</h1>
                  <p className="text-xs text-slate-500">
                    Enroll below. Standard customers and administrator roles have separate registration forms.
                  </p>
                </div>

                {/* Segmented Signup switcher: Separate Signup for Admin & User */}
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/40 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSignUpRole("user");
                      setError(null);
                    }}
                    className={`flex-1 py-2 font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 ${
                      signUpRole === "user" 
                        ? "bg-white text-emerald-800 shadow-sm" 
                        : "text-slate-500 hover:text-emerald-900"
                    }`}
                  >
                    <User size={12} />
                    <span>User Signup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignUpRole("admin");
                      setError(null);
                    }}
                    className={`flex-1 py-2 font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 ${
                      signUpRole === "admin" 
                        ? "bg-white text-emerald-800 shadow-sm" 
                        : "text-slate-500 hover:text-emerald-900"
                    }`}
                  >
                    <ShieldCheck size={12} />
                    <span>Admin Signup</span>
                  </button>
                </div>

                {/* USER SIGNUP FORM */}
                {signUpRole === "user" ? (
                  <form onSubmit={handleUserSignUpSubmit} className="space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Full Name</label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-3 size-4 text-slate-400" />
                          <input
                            type="text"
                            value={suName}
                            onChange={(e) => setSuName(e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Home Region</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 size-4 text-slate-400" />
                          <select
                            value={suRegion}
                            onChange={(e) => setSuRegion(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-bold"
                          >
                            <option value="Goa">Goa</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Delhi UT">Delhi UT</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                            <option value="Gujarat">Gujarat</option>
                            <option value="Kerala">Kerala</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Account Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 size-4 text-slate-400" />
                        <input
                          type="email"
                          value={suEmail}
                          onChange={(e) => setSuEmail(e.target.value)}
                          placeholder="e.g. aarav@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 font-sans">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-3 size-4 text-slate-400" />
                          <input
                            type="password"
                            value={suPassword}
                            onChange={(e) => setSuPassword(e.target.value)}
                            placeholder="Minimum 6 chars"
                            className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Verify Password</label>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-3 size-4 text-slate-400" />
                          <input
                            type="password"
                            value={suConfirmPassword}
                            onChange={(e) => setSuConfirmPassword(e.target.value)}
                            placeholder="Re-type password"
                            className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Checkbox community cooperation pledge */}
                    <label className="flex items-start gap-2 pt-1 pb-1 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={suAgreed}
                        onChange={(e) => setSuAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600 sm:size-4 pointer-events-auto"
                      />
                      <span className="text-[10.5px] leading-relaxed text-slate-550 text-slate-500">
                        I pledge to purchase carbon-reducing, fair-trade goods on this platform and observe zero-waste community recommendations in my region.
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="w-full bg-[#006c49] hover:bg-[#005137] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <span>Join EcoKart AI Community</span>
                      <ArrowRight size={13} />
                    </button>
                  </form>
                ) : (
                  /* ADMINISTRATIVE HUB SIGNUP FORM */
                  <form onSubmit={handleAdminSignUpSubmit} className="space-y-3 animate-fadeIn">
                    
                    {/* Admin clearance notification hint box */}
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-850 text-[10.5px] leading-normal font-sans flex items-start gap-2">
                      <Info size={14} className="text-teal-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Security Clearance Key:</strong> Registering as an Admin supervisor requires active override system Clearance Key. Use <code className="bg-teal-100 font-bold font-mono text-teal-900 border border-teal-400/20 px-1 py-0.5 rounded">ECO-ADMIN</code> to register.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 bg-white">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Supervisor Name</label>
                        <div className="relative">
                          <IdCard className="absolute left-3 top-3 size-4 text-slate-400" />
                          <input
                            type="text"
                            value={adName}
                            onChange={(e) => setAdName(e.target.value)}
                            placeholder="e.g. Dr. Satish"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Access Clearance PIN</label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 size-4 text-[#006c49]" />
                          <input
                            type="text"
                            value={adPIN}
                            onChange={(e) => setAdPIN(e.target.value)}
                            placeholder="Key: ECO-ADMIN"
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-teal-300 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-bold uppercase"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Admin Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 size-4 text-slate-400" />
                        <input
                          type="email"
                          value={adEmail}
                          onChange={(e) => setAdEmail(e.target.value)}
                          placeholder="e.g. satish@ecokart.in"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-3 size-4 text-slate-400" />
                          <input
                            type="password"
                            value={adPassword}
                            onChange={(e) => setAdPassword(e.target.value)}
                            placeholder="Minimum 6 chars"
                            className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Verify Password</label>
                        <div className="relative">
                          <Lock className="absolute left-2.5 top-3 size-4 text-slate-400" />
                          <input
                            type="password"
                            value={adConfirmPassword}
                            onChange={(e) => setAdConfirmPassword(e.target.value)}
                            placeholder="Re-type password"
                            className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-emerald-700 rounded-xl text-xs text-slate-800 font-semibold"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#032d1f] hover:bg-[#001d14] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 mt-3 border border-[#006c49]/30"
                    >
                      <ShieldCheck size={14} className="text-teal-400" />
                      <span>Provision Admin Credentials</span>
                    </button>
                  </form>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
