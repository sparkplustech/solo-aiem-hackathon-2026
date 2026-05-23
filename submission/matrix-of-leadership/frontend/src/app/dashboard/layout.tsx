"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';

// Grouped Navigation
const navGroups = [
  {
    id: "core",
    label: "Core Operations",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
      { name: "Alert Center", href: "/dashboard/alerts", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
      { name: "Transactions", href: "/dashboard/transactions", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    ]
  },
  {
    id: "investigation",
    label: "Investigation & Intel",
    items: [
      { name: "Identities", href: "/dashboard/identities", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg> },
      { name: "Mule Network", href: "/dashboard/mule-graph", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> },
      { name: "Threat Intel", href: "/dashboard/threat-intel", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ]
  },
  {
    id: "analytics",
    label: "Analytics & Simulation",
    items: [
      { name: "Risk Reports", href: "/dashboard/reports", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
      { name: "India Heatmap", href: "/dashboard/heatmap", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
      { name: "Adversarial Sim", href: "/dashboard/adversarial", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
    ]
  },
  {
    id: "governance",
    label: "Governance & Automation",
    items: [
      { name: "Rule Architect", href: "/dashboard/rules", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
      { name: "AML Compliance", href: "/dashboard/compliance", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
      { name: "AI Analyst", href: "/dashboard/ai-analyst", icon: <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
    ]
  }
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  
  // Track collapsed state of sections. True means collapsed.
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-main)] overflow-hidden font-sans">
      
      {/* Sidebar */}
      <aside className="w-[260px] bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col flex-shrink-0 z-20">
        
        {/* Header / Logo Area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-color)] shrink-0">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
             <div className="w-6 h-6 rounded bg-[var(--accent-copper)] flex items-center justify-center text-black font-black text-xs">
               D
             </div>
             <h1 className="text-lg font-black tracking-tight leading-none flex items-center">
               <span className="text-[var(--text-main)]">DRISHTI</span>
             </h1>
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--risk-green)]/10 border border-[var(--risk-green)]/30 rounded text-[9px] font-mono text-[var(--risk-green)] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-green)] animate-pulse"></span>
            LIVE
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.id} className="space-y-1">
              
              {/* Collapsible Header */}
              <button 
                onClick={() => toggleSection(group.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-mono tracking-widest text-[var(--accent-light)] uppercase hover:text-[var(--text-main)] transition-colors group/header"
              >
                <span>{group.label}</span>
                <svg 
                  className={`w-3 h-3 text-[var(--accent-light)] group-hover/header:text-[var(--text-main)] transition-transform ${collapsedSections[group.id] ? '-rotate-90' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Items List */}
              <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${collapsedSections[group.id] ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                  
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md font-medium transition-all text-[13px] relative ${
                        isActive 
                          ? "bg-[var(--bg-card)] text-[var(--text-main)]" 
                          : "text-[var(--accent-light)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]/50"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[var(--accent-copper)] rounded-r-full"></div>
                      )}
                      
                      <div className={`${isActive ? 'text-[var(--accent-copper)]' : 'text-[var(--accent-light)]'}`}>
                        {item.icon}
                      </div>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        
        {/* Explicit Back to Website Link */}
        <div className="p-4 border-t border-[var(--border-color)] shrink-0 bg-[var(--bg-surface)]">
          <Link href="/" className="flex items-center gap-2 text-xs font-mono text-[var(--accent-light)] hover:text-[var(--text-main)] transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            BACK TO WEBSITE
          </Link>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-[var(--border-color)] shrink-0 bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--bg-card)] flex items-center justify-center font-bold text-[var(--text-main)] border border-[var(--border-color)]">
                OP
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--accent-copper)] transition-colors">Operator-04</p>
                <p className="text-[10px] text-[var(--accent-light)]">Level 3 Access</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-[var(--accent-light)] group-hover:text-[var(--text-main)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen min-w-0 bg-[var(--bg-primary)]">
        
        {/* Top Navbar / Utility Bar */}
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-surface)] flex items-center justify-between px-6 shrink-0 z-10">
           
           <div className="flex items-center gap-4 text-xs font-mono text-[var(--accent-light)]">
             <span className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[var(--risk-green)]"></span>
               System Nominal
             </span>
             <span className="text-[var(--border-color)]">|</span>
             <span>v2.1.0-alpha</span>
           </div>

           <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="relative text-[var(--accent-light)] hover:text-[var(--text-main)] transition-colors p-2 hover:bg-[var(--bg-card)] rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--risk-red)] rounded-full border border-[var(--bg-surface)]"></span>
              </button>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </div>
      </main>

    </div>
  );
}
