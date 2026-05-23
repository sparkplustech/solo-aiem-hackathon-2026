import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-ui-text space-y-12">
      <div className="space-y-4">
        <Link href="/" className="text-xs font-mono text-ui-accent hover:underline">← BACK TO HOME</Link>
        <h1 className="text-3xl md:text-3xl font-black tracking-tight mt-4">Terms of Service</h1>
        <p className="text-sm text-ui-muted font-mono">Last Updated: May 22, 2026</p>
      </div>

      <div className="border-t border-ui-border pt-8 space-y-8 text-sm leading-relaxed text-ui-muted">
        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">1. License & Usage</h2>
          <p>
            By accessing the DRISHTI API or the operations dashboard, you agree to comply with these terms. We grant you a revocable, non-exclusive, non-transferable license to access our platform in accordance with the limits defined in your API plan.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">2. Customer Obligations & Integration</h2>
          <p>
            You are responsible for ensuring that your integration meets standard secure communication protocols (TLS 1.3).
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must secure API access credentials and keys.</li>
            <li>You must not reverse-engineer the LightGBM models or Louvain community partition logic.</li>
            <li>You must obtain necessary consent from end-users before logging device telemetry parameters.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">3. API Availability & SLAs</h2>
          <p>
            We target 99.9% uptime for API query endpoints. Our standard response latency SLA is:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Scale Tier:</strong> Sub-50ms average latency.</li>
            <li><strong>Enterprise Tier:</strong> Sub-30ms average latency with service credits for SLA breach.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">4. Limitation of Liability</h2>
          <p>
            Our fraud scoring platform acts as a recommendation engine. Decisions to block or clear transactions are executed by the customer bank/merchant system. DRISHTI is not liable for false positives or uncaught fraud transactions occurring on the customer's payment infrastructure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">5. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the Republic of India. Disputes will be settled under the jurisdiction of the courts of Mumbai.
          </p>
        </section>
      </div>
    </div>
  );
}
