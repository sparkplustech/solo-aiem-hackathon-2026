import Link from "next/link";
import Marquee from "react-fast-marquee";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full bg-ui-bg text-ui-text font-sans selection:bg-ui-accent selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="w-full relative py-24 md:py-36 overflow-hidden border-b border-ui-border bg-ui-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-start justify-center min-h-[70vh]">
          <div className="max-w-3xl space-y-8 animate-slide-up">
            <div className="inline-flex items-center border border-ui-border bg-[#0a0a0a] px-3 py-1 text-[10px] font-mono font-bold text-ui-muted uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-ui-riskGreen mr-2 animate-pulse" />
              SYSTEM STATUS: LIVE
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-ui-text">
              Intercept UPI fraud in under 50ms using behavioral graph biometrics.
            </h1>
            <p className="text-base md:text-lg text-ui-muted max-w-xl leading-relaxed">
              We process high-velocity transaction streams synchronously, blocking malicious transfers before settlement. 
              Built exclusively for India’s next-generation payment infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">Access Developer API</Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">View Live Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Asymmetric Graphic Elements */}
        <div className="absolute right-0 top-0 w-full md:w-1/2 h-full opacity-20 pointer-events-none flex justify-end items-center">
          <div className="w-[850px] h-[850px] border border-ui-border rounded-full transform translate-x-1/3 -translate-y-1/4 animate-spin-slow"></div>
          <div className="absolute w-[650px] h-[650px] border border-ui-accent/30 rounded-full transform translate-x-1/4 -translate-y-1/8 animate-float"></div>
        </div>
      </section>

      {/* HORIZONTAL MARQUEE SECTION */}
      <section className="w-full border-b border-ui-border bg-[#050505] py-5 overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto px-4 flex items-center w-full">
          <span className="text-[10px] font-mono font-bold text-ui-muted uppercase tracking-widest mr-8 shrink-0">Securing Networks For</span>
          <div className="flex-1 mask-edges relative">
            <Marquee gradient={false} speed={50} pauseOnHover={true} autoFill={true}>
              <div className="flex gap-16 pr-16 items-center">
                <img src="/logos/hdfc.svg" alt="HDFC Bank" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <img src="/logos/axis.svg" alt="Axis Bank" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <img src="/logos/icici.svg" alt="ICICI Bank" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <img src="/logos/kotak.svg" alt="Kotak Mahindra" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <img src="/logos/paytm.svg" alt="Paytm" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <img src="/logos/phonepe.svg" alt="PhonePe" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <img src="/logos/cred.png" alt="CRED" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <img src="/logos/yes.png" alt="Yes Bank" className="h-8 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
              </div>
            </Marquee>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="w-full border-b border-ui-border py-24 md:py-32 bg-ui-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16 max-w-2xl">
            <h2 className="text-xs font-bold text-ui-accent uppercase tracking-widest font-mono mb-3">Core Capabilities</h2>
            <h3 className="text-3xl md:text-3xl font-black tracking-tight text-ui-text mb-6">
              AI-driven defense engineered for instant settlement cycles.
            </h3>
            <p className="text-base text-ui-muted leading-relaxed">
              UPI settles funds instantly. Static pattern matching isn't enough anymore. DRISHTI uses real-time network graphs, active telemetry, and interpretable machine learning.
            </p>
          </div>

          <div className="flex flex-col w-full mt-16 border-t border-ui-border">
            {/* Feature 1 */}
            <div className="group flex flex-col md:flex-row md:items-center py-12 md:py-16 border-b border-ui-border hover:bg-[#080808] transition-colors duration-500 relative overflow-hidden px-4 md:px-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-ui-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
              
              <div className="md:w-1/5 font-mono text-ui-accent/50 text-sm tracking-widest mb-6 md:mb-0 group-hover:text-ui-accent transition-colors duration-500 flex items-center">
                <span className="w-8 h-[1px] bg-ui-accent/30 mr-4 group-hover:w-12 group-hover:bg-ui-accent transition-all duration-500" />
                01
              </div>
              
              <div className="md:w-1/3 pr-8 mb-6 md:mb-0">
                <h4 className="text-2xl md:text-3xl font-black text-ui-text tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                  Sub-50ms Risk Scorer
                </h4>
                <div className="mt-4 inline-flex px-3 py-1 bg-[#111] border border-ui-border text-ui-accent/80 text-[10px] uppercase tracking-widest font-mono group-hover:border-ui-accent/50 transition-colors duration-500">
                  LGBM + XGBoost
                </div>
              </div>
              
              <div className="md:w-5/12 md:ml-auto">
                <p className="text-base md:text-lg text-ui-muted leading-relaxed font-light group-hover:text-ui-text/90 transition-colors duration-500">
                  FastAPI backend processes transaction payloads, executes ML scorer, applies deterministic fallbacks, and outputs a response in milliseconds.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group flex flex-col md:flex-row md:items-center py-12 md:py-16 border-b border-ui-border hover:bg-[#080808] transition-colors duration-500 relative overflow-hidden px-4 md:px-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-ui-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
              
              <div className="md:w-1/5 font-mono text-ui-accent/50 text-sm tracking-widest mb-6 md:mb-0 group-hover:text-ui-accent transition-colors duration-500 flex items-center">
                <span className="w-8 h-[1px] bg-ui-accent/30 mr-4 group-hover:w-12 group-hover:bg-ui-accent transition-all duration-500" />
                02
              </div>
              
              <div className="md:w-1/3 pr-8 mb-6 md:mb-0">
                <h4 className="text-2xl md:text-3xl font-black text-ui-text tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                  Explorable Mule Graph
                </h4>
                <div className="mt-4 inline-flex px-3 py-1 bg-[#111] border border-ui-border text-ui-accent/80 text-[10px] uppercase tracking-widest font-mono group-hover:border-ui-accent/50 transition-colors duration-500">
                  Dynamic Louvain Community
                </div>
              </div>
              
              <div className="md:w-5/12 md:ml-auto">
                <p className="text-base md:text-lg text-ui-muted leading-relaxed font-light group-hover:text-ui-text/90 transition-colors duration-500">
                  Continuous Louvain modularity detection isolates multi-hop mule rings funneling money out. Network topology graphs render instantly.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group flex flex-col md:flex-row md:items-center py-12 md:py-16 border-b border-ui-border hover:bg-[#080808] transition-colors duration-500 relative overflow-hidden px-4 md:px-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-ui-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
              
              <div className="md:w-1/5 font-mono text-ui-accent/50 text-sm tracking-widest mb-6 md:mb-0 group-hover:text-ui-accent transition-colors duration-500 flex items-center">
                <span className="w-8 h-[1px] bg-ui-accent/30 mr-4 group-hover:w-12 group-hover:bg-ui-accent transition-all duration-500" />
                03
              </div>
              
              <div className="md:w-1/3 pr-8 mb-6 md:mb-0">
                <h4 className="text-2xl md:text-3xl font-black text-ui-text tracking-tight group-hover:translate-x-2 transition-transform duration-500">
                  SHAP Explainability
                </h4>
                <div className="mt-4 inline-flex px-3 py-1 bg-[#111] border border-ui-border text-ui-accent/80 text-[10px] uppercase tracking-widest font-mono group-hover:border-ui-accent/50 transition-colors duration-500">
                  Dynamic SHAP translations
                </div>
              </div>
              
              <div className="md:w-5/12 md:ml-auto">
                <p className="text-base md:text-lg text-ui-muted leading-relaxed font-light group-hover:text-ui-text/90 transition-colors duration-500">
                  Converts mathematical SHAP values into simple narrative explanations in English and Hindi so operational staff can justify blocks immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Deep Dive */}
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center mt-24">
            <div className="w-full md:w-5/12 space-y-6">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">Stop treating ML models as black boxes.</h3>
              <p className="text-sm text-ui-muted leading-relaxed">
                When an account is flagged, your operations team needs to know exactly why. 
                Our LightGBM pipeline outputs real-time SHAP values, translating complex feature importance 
                into actionable, human-readable reasoning in English and Hindi.
              </p>
              <ul className="space-y-4 pt-4 text-sm font-semibold">
                <li className="flex items-center text-ui-text">
                  <span className="w-1.5 h-1.5 bg-ui-accent rounded-full mr-3"></span>
                  Real-time feature contribution metrics
                </li>
                <li className="flex items-center text-ui-text">
                  <span className="w-1.5 h-1.5 bg-ui-accent rounded-full mr-3"></span>
                  Deterministic hard-rule fallbacks
                </li>
                <li className="flex items-center text-ui-text">
                  <span className="w-1.5 h-1.5 bg-ui-accent rounded-full mr-3"></span>
                  Automated narrative generation
                </li>
              </ul>
            </div>
            
            <div className="w-full md:w-7/12">
              <Card className="p-8 border border-ui-border bg-ui-card">
                <div className="flex justify-between items-center border-b border-ui-border pb-4 mb-6">
                  <span className="text-xs font-mono text-ui-muted">Transaction ID: TX-9842A</span>
                  <span className="bg-ui-riskRed/10 text-ui-riskRed border border-ui-riskRed/20 px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider">REJECTED</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-b border-ui-border/50 pb-2">
                    <span className="text-ui-muted">Velocity (1H)</span>
                    <span className="text-ui-text font-mono">+14.2% SHAP impact</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-ui-border/50 pb-2">
                    <span className="text-ui-muted">Device Trust Score</span>
                    <span className="text-ui-text font-mono">+8.5% SHAP impact</span>
                  </div>
                  <div className="pt-4 p-4 bg-ui-bg rounded border border-ui-border mt-4">
                    <p className="text-xs text-ui-text leading-relaxed">
                      <strong className="text-ui-accent">Reasoning (English):</strong> Transaction blocked due to abnormal 1H velocity from an unrecognized device, matching known mule network patterns.
                    </p>
                    <p className="text-xs text-ui-muted/80 leading-relaxed mt-2 border-t border-ui-border/30 pt-2 font-sans">
                      <strong className="text-ui-accent">कारण (हिंदी):</strong> अपरिचित डिवाइस से शुरू की गई असामान्य 1 घंटे की लेनदेन आवृत्ति के कारण लेनदेन को ब्लॉक किया गया।
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SOLUTIONS SECTION */}
      <section id="solutions" className="w-full border-b border-ui-border py-24 md:py-32 bg-ui-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row-reverse gap-16 md:gap-24 items-center">
            <div className="w-full md:w-5/12 space-y-6">
              <h2 className="text-xs font-bold text-ui-accent uppercase tracking-widest font-mono mb-3">Enterprise Verticals</h2>
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-ui-text leading-tight">
                Detect Mule Networks and block fraud at scale.
              </h3>
              <p className="text-sm text-ui-muted leading-relaxed">
                Money launderers use complex layering funnels to evade detection. 
                We compute Louvain communities and drain-ratios continuously across your transaction graph to isolate 
                central drain nodes before the funds exit your system.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="group p-4 border border-ui-border bg-ui-bg hover:border-ui-accent/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ui-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  <h4 className="text-base font-bold text-ui-text mb-1">UPI Apps & FinTechs</h4>
                  <p className="text-xs text-ui-muted">Embed SDK telemetry to analyze device fingerprints and prevent SIM-swapping / OTP-relay vectors.</p>
                </div>
                <div className="group p-4 border border-ui-border bg-ui-bg hover:border-ui-accent/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ui-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  <h4 className="text-base font-bold text-ui-text mb-1">Payment Gateways</h4>
                  <p className="text-xs text-ui-muted">Route real-time payment streams through our scoring API to drop merchant chargebacks by 45%.</p>
                </div>
                <div className="group p-4 border border-ui-border bg-ui-bg hover:border-ui-accent/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ui-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
                  <h4 className="text-base font-bold text-ui-text mb-1">Retail Banking Core</h4>
                  <p className="text-xs text-ui-muted">Batch processing and continuous network community detection to uncover money mule networks and dormant accounts.</p>
                </div>
              </div>
            </div>
            
            {/* Mule Ring Visualization - Premium */}
            <div className="w-full md:w-7/12 relative aspect-video border border-ui-border bg-ui-bg flex items-center justify-center p-8 overflow-hidden">
              {/* Decorative grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-color)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none" />
              
              {/* Animated rings visualization */}
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex items-center gap-4">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-ui-border bg-ui-surface flex items-center justify-center text-[10px] font-mono text-ui-muted">
                      N{i}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-ui-accent/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                  ))}
                </div>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-2 border-ui-riskRed bg-ui-riskRed/10 flex items-center justify-center animate-pulse">
                    <div className="text-center">
                      <div className="text-xl font-black text-ui-riskRed font-mono">85</div>
                      <div className="text-[8px] font-mono text-ui-riskRed uppercase tracking-widest">Drain</div>
                    </div>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <h3 className="text-lg font-bold text-ui-text font-mono">Mule Ring Detected</h3>
                  <p className="text-xs text-ui-muted font-mono mt-1">Fan-in: 5 nodes • Cumulative: ₹25,000</p>
                  <div className="pt-3 flex justify-center gap-2">
                    <span className="px-2 py-0.5 bg-ui-riskRed/10 text-ui-riskRed text-[10px] border border-ui-riskRed/20 font-mono">Target: Node #428</span>
                    <span className="px-2 py-0.5 bg-ui-surface text-ui-muted text-[10px] border border-ui-border font-mono">Modularity: 0.76</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="w-full border-b border-ui-border py-24 md:py-32 bg-ui-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-xl mx-auto">
            <h2 className="text-xs font-bold text-ui-accent uppercase tracking-widest font-mono mb-3">Transparent Plans</h2>
            <h3 className="text-3xl md:text-3xl font-black tracking-tight text-ui-text mb-6">
              Flexible scale for fintechs and banks.
            </h3>
            <p className="text-base text-ui-muted leading-relaxed">
              No hidden platform fees. Pay transparently based on transaction volume, and access premium dashboard tools instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1 */}
            <Card className="p-8 border border-ui-border bg-ui-card/45 flex flex-col justify-between h-full hover:border-ui-border/80 transition-colors">
              <div>
                <h4 className="text-base font-bold text-ui-text font-mono uppercase tracking-wider mb-2">Sandbox</h4>
                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-2xl font-black text-ui-text">₹0</span>
                  <span className="text-xs text-ui-muted">/ forever</span>
                </div>
                <p className="text-xs text-ui-muted leading-relaxed mb-6">
                  Best for local testing and developer integration validation. Fully simulated engine.
                </p>
                <div className="border-t border-ui-border/60 pt-6 space-y-4 text-xs">
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Up to 1,000 txns / month</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Simulated ML scores</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Community Slack support</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Access to Adversarial Simulator</div>
                </div>
              </div>
              <Link href="/signup" className="mt-8">
                <Button variant="secondary" className="w-full">Create Free Account</Button>
              </Link>
            </Card>

            {/* Plan 2 */}
            <Card className="p-8 border-2 border-ui-accent bg-ui-card flex flex-col justify-between h-full relative shadow-[0_0_30px_rgba(217,119,54,0.1)]">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-ui-accent text-white px-3 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h4 className="text-base font-bold text-ui-accent font-mono uppercase tracking-wider mb-2">FinTech Scale</h4>
                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-2xl font-black text-ui-text">₹15,000</span>
                  <span className="text-xs text-ui-muted">/ month</span>
                </div>
                <p className="text-xs text-ui-muted leading-relaxed mb-6">
                  Production ready API key for startups and growth-stage fintech operations.
                </p>
                <div className="border-t border-ui-border/60 pt-6 space-y-4 text-xs">
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Up to 100,000 txns / month</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Real LightGBM + Graph modularity</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Hindi & English SHAP narratives</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Sub-50ms API SLA</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Slack & Email support (12h SLA)</div>
                </div>
              </div>
              <Link href="/signup" className="mt-8">
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </Card>

            {/* Plan 3 */}
            <Card className="p-8 border border-ui-border bg-ui-card/45 flex flex-col justify-between h-full hover:border-ui-border/80 transition-colors">
              <div>
                <h4 className="text-base font-bold text-ui-text font-mono uppercase tracking-wider mb-2">Enterprise</h4>
                <div className="flex items-baseline space-x-1 mb-6">
                  <span className="text-xl font-bold text-ui-text">Custom Billing</span>
                </div>
                <p className="text-xs text-ui-muted leading-relaxed mb-6">
                  Engineered for commercial retail banks and national payment routing gateways.
                </p>
                <div className="border-t border-ui-border/60 pt-6 space-y-4 text-xs">
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Unlimited transactions</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Custom model training & weights</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Dedicated server / On-premise options</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> Guaranteed sub-30ms SLA</div>
                  <div className="flex items-center"><span className="text-ui-accent mr-3">✓</span> 24/7 dedicated support team (15m SLA)</div>
                </div>
              </div>
              <Link href="/signup" className="mt-8">
                <Button variant="secondary" className="w-full">Contact Sales</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. RESOURCES SECTION */}
      <section id="resources" className="w-full border-b border-ui-border py-24 md:py-32 bg-ui-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16 max-w-2xl">
            <h2 className="text-xs font-bold text-ui-accent uppercase tracking-widest font-mono mb-3">Knowledge Base</h2>
            <h3 className="text-3xl md:text-3xl font-black tracking-tight text-ui-text mb-6">
              Built by engineers, for risk operations.
            </h3>
            <p className="text-base text-ui-muted leading-relaxed">
              Explore API integrations, developer tools, payment biometrics case studies, and payment graph publications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-ui-border">
            {/* Resource 1 */}
            <div className="group bg-ui-bg p-8 md:p-10 flex flex-col justify-between min-h-[220px] hover:bg-ui-surface transition-colors duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-ui-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-ui-accent border border-ui-accent/30 mb-6">API Reference</span>
                <h4 className="text-xl font-bold text-ui-text tracking-tight group-hover:text-ui-accent transition-colors duration-300">Developer Quickstart</h4>
                <p className="text-sm text-ui-muted mt-3 leading-relaxed">Integrate DRISHTI REST endpoints in NodeJS, Go, or Python. Learn JSON request payload schemas.</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-ui-muted group-hover:text-ui-accent transition-all duration-300">
                <span className="text-xs font-mono">Read docs</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>

            {/* Resource 2 */}
            <div className="group bg-ui-bg p-8 md:p-10 flex flex-col justify-between min-h-[220px] hover:bg-ui-surface transition-colors duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-ui-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-ui-accent border border-ui-accent/30 mb-6">Research Paper</span>
                <h4 className="text-xl font-bold text-ui-text tracking-tight group-hover:text-ui-accent transition-colors duration-300">Multi-Hop Mule Ring Detection</h4>
                <p className="text-sm text-ui-muted mt-3 leading-relaxed">Read our engineering brief on running modular Louvain clustering under strict sub-50ms execution limits.</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-ui-muted group-hover:text-ui-accent transition-all duration-300">
                <span className="text-xs font-mono">Read paper</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>

            {/* Resource 3 */}
            <div className="group bg-ui-bg p-8 md:p-10 flex flex-col justify-between min-h-[220px] hover:bg-ui-surface transition-colors duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-ui-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-ui-accent border border-ui-accent/30 mb-6">Case Study</span>
                <h4 className="text-xl font-bold text-ui-text tracking-tight group-hover:text-ui-accent transition-colors duration-300">Retail Bank Integration</h4>
                <p className="text-sm text-ui-muted mt-3 leading-relaxed">How a leading Indian retail bank deployed DRISHTI to decrease its false-positive alerts by 40% in two weeks.</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-ui-muted group-hover:text-ui-accent transition-all duration-300">
                <span className="text-xs font-mono">Read case study</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>

            {/* Resource 4 */}
            <div className="group bg-ui-bg p-8 md:p-10 flex flex-col justify-between min-h-[220px] hover:bg-ui-surface transition-colors duration-300 cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-ui-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-ui-accent border border-ui-accent/30 mb-6">Explanations</span>
                <h4 className="text-xl font-bold text-ui-text tracking-tight group-hover:text-ui-accent transition-colors duration-300">Bilingual SHAP Explanations</h4>
                <p className="text-sm text-ui-muted mt-3 leading-relaxed">Explore the dictionary mapping features to English/Hindi context-rich sentences for risk operations.</p>
              </div>
              <div className="mt-6 flex items-center gap-2 text-ui-muted group-hover:text-ui-accent transition-all duration-300">
                <span className="text-xs font-mono">Explore</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL-TO-ACTION SECTION */}
      <section className="w-full max-w-4xl mx-auto px-4 py-28 md:py-36 text-center space-y-8">
        <h2 className="text-3xl md:text-3xl font-black tracking-tight text-ui-text">Ready to secure your payment highway?</h2>
        <p className="text-base text-ui-muted max-w-xl mx-auto leading-relaxed">
          DRISHTI is fully compliant with NPCI guidelines and easily integrates with existing payment switches.
        </p>
        <div className="pt-4 flex justify-center">
          <Link href="/signup">
            <Button size="lg" variant="primary">Access Developer Trial</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}

