export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-copper)]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--accent-light)]/5 blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-6xl flex shadow-2xl rounded-md overflow-hidden glass-card z-10 mx-4" style={{ minHeight: '600px' }}>
        {children}
      </div>
    </div>
  );
}

