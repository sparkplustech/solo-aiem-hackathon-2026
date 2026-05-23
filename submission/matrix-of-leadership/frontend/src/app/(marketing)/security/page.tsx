import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 md:py-28 text-ui-text space-y-12">
      <div className="space-y-4">
        <Link href="/" className="text-xs font-mono text-ui-accent hover:underline">← BACK TO HOME</Link>
        <h1 className="text-3xl md:text-3xl font-black tracking-tight mt-4">Security & Compliance</h1>
        <p className="text-sm text-ui-muted font-mono">Last Updated: May 22, 2026</p>
      </div>

      <div className="border-t border-ui-border pt-8 space-y-8 text-sm leading-relaxed text-ui-muted">
        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">1. Encryption In Transit and Rest</h2>
          <p>
            DRISHTI handles mission-critical payment streams. We ensure maximum grade security protocols across our pipelines:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>In Transit:</strong> All API requests are forced through TLS 1.3 encryption. We reject connection requests using older deprecated SSL/TLS versions.</li>
            <li><strong>At Rest:</strong> Databases are encrypted using AES-256 with keys managed in hardware security modules (HSM).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">2. PCI-DSS Compliance & Tokenization</h2>
          <p>
            While DRISHTI processes behavior patterns rather than plain-text card details, we maintain full alignment with **PCI-DSS v4.0** guidelines. Custom API keys, tokens, and payment identifiers are securely salted and one-way hashed to prevent correlation back to the original accounts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">3. Indian Data Localization & Auditing</h2>
          <p>
            Pursuant to the Reserve Bank of India (RBI) circular on storage of payment system data, DRISHTI stores and processes all transactional telemetry within servers physically located in India.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Uptime Audits:</strong> Continuous health telemetry is verified via independent status monitoring tools.</li>
            <li><strong>Vulnerability Assessments:</strong> Daily automated dependency vulnerability scans, and biannual third-party Penetration Testing.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-bold text-ui-text">4. Vulnerability Disclosure Policy</h2>
          <p>
            If you believe you have discovered a security issue on our platform, please report it to our security team immediately at:
          </p>
          <p className="font-mono text-ui-accent bg-ui-card p-4 rounded border border-ui-border inline-block">
            security@drishti-security.in
          </p>
        </section>
      </div>
    </div>
  );
}
