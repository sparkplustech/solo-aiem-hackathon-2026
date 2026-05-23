import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-ui-text space-y-12">
      <div className="space-y-4">
        <Link href="/" className="text-xs font-mono text-ui-accent hover:underline">← BACK TO HOME</Link>
        <h1 className="text-3xl md:text-3xl font-black tracking-tight mt-4">Privacy Policy</h1>
        <p className="text-sm text-ui-muted font-mono">Last Updated: May 22, 2026</p>
      </div>

      <div className="border-t border-ui-border pt-8 space-y-8 text-sm leading-relaxed text-ui-muted">
        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">1. Scope & DPDP Compliance</h2>
          <p>
            DRISHTI ("we", "us", or "our") operates a high-velocity payment fraud scoring engine designed for the Indian banking and fintech ecosystems. This Privacy Policy details how we process transaction telemetry, device fingerprints, and payment data in compliance with India's **Digital Personal Data Protection Act (DPDPA), 2023** and **RBI directives** on online payment security.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">2. Data We Collect and Process</h2>
          <p>
            We process transaction data submitted through our API by integrated financial merchants and banks. This processing is performed under a "Data Processor" relationship, where the integrating bank acts as the "Data Fiduciary."
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Transaction Telemetry:</strong> Amount, timestamp, transaction type (UPI, IMPS, Card), and routing details.</li>
            <li><strong>Device Telemetry:</strong> Anonymized device identifiers, operating system parameters, IP address, and browser agent strings to calculate risk levels.</li>
            <li><strong>Geographic Location:</strong> Approximate latitude and longitude values associated with transactions to detect impossible travel vectors.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">3. Data Security & Storage</h2>
          <p>
            All data is stored and processed exclusively on servers located within the **Republic of India** in compliance with RBI guidelines on localization.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>All transmission is encrypted via AES-256 and TLS 1.3.</li>
            <li>Stored data is pseudonymized; payment identifiers are salted and hashed (SHA-256).</li>
            <li>We undergo regular SOC2 Type II audits and ISO 27001 validation.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">4. Retention and Deletion</h2>
          <p>
            We retain transaction data only for the period required to compute temporal fraud velocity metrics (typically 90 days), after which data is purged, unless regulatory compliance requires longer retention.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">5. Contact Information</h2>
          <p>
            For questions regarding this policy or to exercise data fiduciary queries, please contact our Data Protection Officer at:
          </p>
          <p className="font-mono text-ui-accent bg-ui-card p-4 rounded border border-ui-border inline-block">
            dpo@drishti-security.in
          </p>
        </section>
      </div>
    </div>
  );
}
