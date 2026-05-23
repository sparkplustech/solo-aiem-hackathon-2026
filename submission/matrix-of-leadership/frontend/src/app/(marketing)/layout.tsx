"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Hash links should point to /#section when not on homepage, or #section when on homepage
  const sectionHref = (hash: string) => (isHomePage ? hash : `/${hash}`);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans">
      {/* Horizontal Navbar */}
      <header className="w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/90  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="group transition-transform hover:-translate-y-0.5 duration-200">
              <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" />
            </Link>
            
            {/* Nav Links */}
            <nav className="hidden md:flex space-x-8">
              <Link href={sectionHref("#features")} className="text-sm font-medium text-[var(--accent-light)] hover:text-[var(--text-main)] transition-colors">Features</Link>
              <Link href={sectionHref("#solutions")} className="text-sm font-medium text-[var(--accent-light)] hover:text-[var(--text-main)] transition-colors">Solutions</Link>
              <Link href={sectionHref("#pricing")} className="text-sm font-medium text-[var(--accent-light)] hover:text-[var(--text-main)] transition-colors">Pricing</Link>
              <Link href={sectionHref("#resources")} className="text-sm font-medium text-[var(--accent-light)] hover:text-[var(--text-main)] transition-colors">Resources</Link>
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <Link href="/login" className="text-sm font-bold text-[var(--text-main)] hover:text-[var(--accent-copper)] transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="text-sm font-bold bg-[var(--accent-copper)] text-black px-5 py-2.5 rounded-sm hover:brightness-110 transition-all shadow-md">
                Request Demo
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Comprehensive SaaS Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-surface)] pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-3 group w-fit">
                <Image 
                  src="/logo.png" 
                  alt="DRISHTI Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain transition-transform group-hover:scale-105" 
                />
                <span className="text-lg font-black tracking-tighter text-[var(--text-main)]">
                  DRI<span className="text-[var(--accent-copper)]">SHTI</span>
                </span>
              </Link>
              <p className="text-xs text-[var(--accent-light)] max-w-sm leading-relaxed">
                Real-time UPI payment fraud prevention and behavioral graph analytics. Engineered to intercept malicious transfers in under 50ms.
              </p>
              <div className="pt-2">
                <p className="text-[10px] font-mono text-[var(--accent-light)] uppercase tracking-wider mb-2">Subscribe to Fraud Ops Briefing</p>
                <div className="flex max-w-sm">
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-l-lg px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-copper)] flex-1 min-w-0" 
                  />
                  <button className="bg-[var(--accent-copper)] hover:brightness-110 text-black font-bold text-xs px-4 rounded-r-lg transition-all">
                    Join
                  </button>
                </div>
              </div>
            </div>

            {/* Link Column 1 - Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest font-mono">Product</h4>
              <ul className="space-y-2 text-xs text-[var(--accent-light)]">
                <li><Link href="/#features" className="hover:text-[var(--text-main)] transition-colors">Core Scorer</Link></li>
                <li><Link href="/dashboard/mule-graph" className="hover:text-[var(--text-main)] transition-colors">Mule Network Graph</Link></li>
                <li><Link href="/dashboard/adversarial" className="hover:text-[var(--text-main)] transition-colors">Adversarial Simulator</Link></li>
                <li><Link href="/dashboard" className="hover:text-[var(--text-main)] transition-colors">Operations Dashboard</Link></li>
              </ul>
            </div>

            {/* Link Column 2 - Solutions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest font-mono">Solutions</h4>
              <ul className="space-y-2 text-xs text-[var(--accent-light)]">
                <li><Link href="/#solutions" className="hover:text-[var(--text-main)] transition-colors">UPI Apps & FinTechs</Link></li>
                <li><Link href="/#solutions" className="hover:text-[var(--text-main)] transition-colors">Payment Gateways</Link></li>
                <li><Link href="/#solutions" className="hover:text-[var(--text-main)] transition-colors">Retail Banking Core</Link></li>
                <li><Link href="/#pricing" className="hover:text-[var(--text-main)] transition-colors">Pricing Plans</Link></li>
              </ul>
            </div>

            {/* Link Column 3 - Company & Legal */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest font-mono">Trust & Compliance</h4>
              <ul className="space-y-2 text-xs text-[var(--accent-light)]">
                <li><Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-[var(--text-main)] transition-colors">Security Center</Link></li>
                <li><a href="mailto:support@drishti-security.in" className="hover:text-[var(--text-main)] transition-colors">Contact Support</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[var(--border-color)] pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--accent-light)]">
            <span className="mb-4 md:mb-0">© 2026 DRISHTI Payment Security Systems. All rights reserved.</span>
            <div className="flex space-x-6">
              <a href="https://github.com/ShivamGawade-XS/DRISHTI" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-main)] transition-colors font-mono">GitHub</a>
              <a href="#" className="hover:text-[var(--text-main)] transition-colors font-mono">Twitter / X</a>
              <a href="#" className="hover:text-[var(--text-main)] transition-colors font-mono">LinkedIn</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

