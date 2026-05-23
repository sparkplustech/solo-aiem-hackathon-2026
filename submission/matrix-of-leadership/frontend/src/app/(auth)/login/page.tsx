"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      try {
        // Derive name from email (e.g. "john.doe@bank.com" -> "John Doe")
        const namePart = email.split('@')[0] || "User";
        const displayName = namePart
          .split('.')
          .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
          .join(' ');
        
        const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

        localStorage.setItem('drishti_user', JSON.stringify({
          name: displayName || 'Investigator',
          initials: initials,
          role: 'L2 Investigator',
          email: email
        }));
        
        // Force hard navigation
        router.push('/dashboard');
      } catch (err) {
        console.error("Login logic error:", err);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <>
      {/* Left side - Marketing/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--bg-card)]/50 p-12 flex-col justify-between border-r border-[var(--border-color)]">
        <div>
          <div className="flex items-center space-x-4 mb-12">
            <Image src="/logo.png" alt="DRISHTI Logo" width={48} height={48} className="object-contain" priority />
            <h1 className="text-lg font-black tracking-tighter leading-none">
              <span className="glow-copper text-[var(--accent-copper)]">DRI</span>
              <span className="text-[var(--text-main)]">SHTI</span>
            </h1>
          </div>
          
          <h2 className="text-4xl font-bold text-[var(--text-main)] leading-tight mb-6">
            Securing the future of<br/>digital payments.
          </h2>
          <p className="text-lg text-[var(--accent-light)]/80 max-w-md leading-relaxed">
            Advanced behavioral biometrics and real-time network analysis for next-generation UPI fraud prevention.
          </p>
        </div>
        
        <div className="glass-card p-6 border-l-4 border-[var(--accent-copper)]">
          <p className="text-sm italic text-[var(--accent-light)] mb-4">
            "DRISHTI has reduced our false positive rate by 40% while capturing complex mule networks we previously missed."
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center mr-3">
              <span className="text-xs font-bold text-[var(--accent-copper)]">CTO</span>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-main)]">Leading Fintech Bank</p>
              <p className="text-xs text-[var(--accent-light)]">Enterprise Customer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center bg-[var(--bg-primary)]/80">
        <div className="max-w-md w-full mx-auto">
          <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">Welcome back</h3>
          <p className="text-[var(--accent-light)] text-sm mb-8">Enter your credentials to access the operations dashboard.</p>
          
          <div className="space-y-5" onKeyDown={(e) => e.key === 'Enter' && handleLogin(e as any)}>
            <div>
              <label className="block text-xs font-bold text-[var(--accent-light)] tracking-wide mb-2">WORK EMAIL</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-copper)] focus:ring-1 focus:ring-[var(--accent-copper)] transition-all placeholder-[var(--accent-light)]/30"
                placeholder="investigator@bank.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-[var(--accent-light)] tracking-wide">PASSWORD</label>
                <a href="#" className="text-xs text-[var(--accent-copper)] hover:text-white transition-colors">Forgot password?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm px-4 py-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-copper)] focus:ring-1 focus:ring-[var(--accent-copper)] transition-all placeholder-[var(--accent-light)]/30"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="button" 
              onClick={handleLogin}
              disabled={loading}
              className={`w-full py-3 rounded-sm font-bold text-white transition-all shadow-lg flex justify-center items-center ${
                loading 
                  ? 'bg-[var(--border-color)] cursor-wait' 
                  : 'bg-gradient-to-r from-[var(--accent-copper)] to-[rgba(184,115,51,0.8)] hover:to-[var(--accent-copper)] hover:shadow-[0_0_20px_rgba(184,115,51,0.3)]'
              }`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign In'}
            </button>
          </div>
          
          <div className="mt-8 text-center text-sm text-[var(--accent-light)]">
            Don't have an account? <Link href="/signup" className="text-[var(--accent-copper)] hover:text-white transition-colors font-bold">Request Access</Link>
          </div>
        </div>
      </div>
    </>
  );
}

