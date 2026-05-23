"use client";

import React, { useState, useEffect, useRef } from "react";
import { API_URL, WS_URL } from "@/lib/api";

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer group">
      <div>
        <div className="text-sm font-semibold text-[var(--text-main)] group-hover:text-white transition-colors">
          {label}
        </div>
        {description && (
          <div className="text-[10px] text-[var(--accent-light)]/70 font-mono mt-0.5">
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
        style={{
          background: checked
            ? "linear-gradient(135deg, var(--accent-copper), #b86b25)"
            : "var(--border-color)",
          boxShadow: checked
            ? "0 0 12px rgba(217,119,54,0.4), inset 0 1px 2px rgba(255,255,255,0.1)"
            : "inset 0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md"
          style={{
            transform: checked ? "translateX(20px)" : "translateX(0)",
            boxShadow: checked
              ? "0 2px 8px rgba(217,119,54,0.5)"
              : "0 2px 4px rgba(0,0,0,0.4)",
          }}
        />
      </button>
    </label>
  );
}

// ─── Slider Component ─────────────────────────────────────────────────────────
function GlowSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  dangerThreshold,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  dangerThreshold?: number;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const isDanger = dangerThreshold !== undefined && value >= dangerThreshold;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-xs font-bold font-mono tracking-wider text-[var(--accent-light)]">
          {label}
        </label>
        <span
          className="text-sm font-black font-mono transition-colors"
          style={{ color: isDanger ? "#E05243" : "var(--text-main)" }}
        >
          {format(value)}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div
          className="absolute w-full h-1.5 rounded-full"
          style={{ background: "var(--border-color)" }}
        />
        <div
          className="absolute h-1.5 rounded-full transition-all duration-150"
          style={{
            width: `${pct}%`,
            background: isDanger
              ? "linear-gradient(90deg, #F0A04B, #E05243)"
              : "linear-gradient(90deg, var(--accent-copper), #e8964a)",
            boxShadow: isDanger
              ? "0 0 8px rgba(224,82,67,0.5)"
              : "0 0 8px rgba(217,119,54,0.4)",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full opacity-0 cursor-pointer h-6"
        />
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-150"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: isDanger ? "#E05243" : "var(--accent-copper)",
            boxShadow: isDanger
              ? "0 0 12px rgba(224,82,67,0.6)"
              : "0 0 12px rgba(217,119,54,0.6)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Risk Gauge ───────────────────────────────────────────────────────────────
function RiskGauge({ score, level }: { score: number; level: string }) {
  const [animScore, setAnimScore] = useState(0);
  const radius = 64;
  const stroke = 10;
  const normalizedR = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedR;
  // Only half arc
  const arcLen = circumference * 0.65;
  const dash = (animScore / 100) * arcLen;

  useEffect(() => {
    setAnimScore(0);
    const timer = setTimeout(() => setAnimScore(score), 50);
    return () => clearTimeout(timer);
  }, [score]);

  const color =
    level === "red" ? "#E05243" : level === "yellow" ? "#F0A04B" : "#7D9C65";
  const label =
    level === "red" ? "CRITICAL" : level === "yellow" ? "SUSPICIOUS" : "CLEAN";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-24 overflow-hidden">
        <svg
          width="160"
          height="140"
          viewBox="0 0 160 140"
          className="absolute -bottom-4"
        >
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7D9C65" />
              <stop offset="50%" stopColor="#F0A04B" />
              <stop offset="100%" stopColor="#E05243" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <circle
            cx={80}
            cy={100}
            r={normalizedR}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
            strokeDasharray={`${arcLen} ${circumference}`}
            strokeDashoffset={circumference * 0.175}
            strokeLinecap="round"
            transform="rotate(180, 80, 100)"
          />
          {/* Value arc */}
          <circle
            cx={80}
            cy={100}
            r={normalizedR}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={circumference * 0.175}
            strokeLinecap="round"
            transform="rotate(180, 80, 100)"
            style={{
              transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease",
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
          {/* Glow */}
          <circle
            cx={80}
            cy={100}
            r={normalizedR}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeDasharray={`${dash} ${circumference}`}
            strokeDashoffset={circumference * 0.175}
            strokeLinecap="round"
            transform="rotate(180, 80, 100)"
            opacity={0.3}
            style={{
              transition: "stroke-dasharray 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `blur(4px)`,
            }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <span
            className="text-4xl font-black font-mono leading-none transition-all duration-1000"
            style={{ color }}
          >
            {animScore}
          </span>
        </div>
      </div>
      <span
        className="text-xs font-black font-mono tracking-widest mt-1 px-3 py-1 rounded-full"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}40`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Payload Form ─────────────────────────────────────────────────────────────
const PRESETS = [
  {
    id: "otp_relay",
    label: "OTP Relay Attack",
    icon: "📡",
    color: "#E05243",
    description: "High-value transfer to new beneficiary from unknown device",
    values: {
      amount: 95000,
      is_new_beneficiary: true,
      new_device_flag: true,
      txn_count_1h: 3,
      amount_avg_1h: 1000,
      fraud_template: "OTP_RELAY",
    },
  },
  {
    id: "mule_funnel",
    label: "Mule Funnel",
    icon: "🕸",
    color: "#F0A04B",
    description: "High-frequency small transactions through intermediaries",
    values: {
      amount: 2000,
      is_new_beneficiary: false,
      new_device_flag: false,
      txn_count_1h: 18,
      amount_avg_1h: 2000,
      fraud_template: "MULE_FUNNEL",
    },
  },
  {
    id: "night_burst",
    label: "Night Burst",
    icon: "🌙",
    color: "#8B8FE8",
    description: "Late-night suspicious volume spike to new payee",
    values: {
      amount: 45000,
      is_new_beneficiary: true,
      new_device_flag: false,
      txn_count_1h: 5,
      amount_avg_1h: 500,
      fraud_template: "NIGHT_BURST",
    },
  },
];

// ─── Main Adversarial Page ────────────────────────────────────────────────────
export default function AdversarialPage() {
  const [formData, setFormData] = useState({
    amount: 15000,
    timestamp: new Date().toISOString().slice(0, 16),
    is_new_beneficiary: false,
    new_device_flag: false,
    txn_count_1h: 1,
    amount_avg_1h: 1000,
    fraud_template: "",
    sender_upi: "attacker@ybl",
    receiver_upi: "victim@paytm",
    lat: 19.07,
    lon: 72.87,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [transmitting, setTransmitting] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [sentPayload, setSentPayload] = useState<any>(null);
  const scanRef = useRef<NodeJS.Timeout | null>(null);

  // WS Listener for Live Explanations
  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/ws/transactions`);
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "explanation_ready" && result && msg.transaction_id === result.transaction_id) {
          setResult((prev: any) => ({
            ...prev,
            explanation: msg.explanation,
            explanation_hi: msg.explanation_hi,
            explanation_status: "ready"
          }));
        }
      } catch (e) {}
    };
    return () => ws.close();
  }, [result]);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    const nightTime = new Date();
    if (preset.id === "night_burst") {
      nightTime.setHours(2, 30, 0, 0);
    } else {
      nightTime.setTime(Date.now());
    }
    setFormData((f) => ({
      ...f,
      ...preset.values,
      timestamp: nightTime.toISOString().slice(0, 16),
    }));
    setResult(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTransmitting(true);
    setScanLine(0);
    setResult(null);

    // Scanning animation
    let line = 0;
    scanRef.current = setInterval(() => {
      line += 3;
      setScanLine(line);
      if (line >= 100) {
        clearInterval(scanRef.current!);
      }
    }, 30);

    const payload = {
      transaction_id: `adv_${Math.floor(Math.random() * 99999)}`,
      sender_upi: formData.sender_upi,
      receiver_upi: formData.receiver_upi,
      amount: formData.amount,
      timestamp: new Date(formData.timestamp).toISOString(),
      device_id: formData.new_device_flag ? "new_device_xyz" : "known_device_abc",
      lat: formData.lat,
      lon: formData.lon,
      is_new_beneficiary: formData.is_new_beneficiary,
      new_device_flag: formData.new_device_flag,
      txn_count_1h: formData.txn_count_1h,
      amount_avg_1h: formData.amount_avg_1h,
      fraud_template: formData.fraud_template || undefined,
    };
    setSentPayload(payload);

    try {
      const res = await fetch(`${API_URL}/api/v1/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      setResult(data);
      setTransmitting(false);
      setLoading(false);
    } catch {
      // Fallback mock
      const mockScore = Math.floor(
        formData.fraud_template
          ? 72 + Math.random() * 25
          : 20 + Math.random() * 40
      );
      setTimeout(() => {
        setResult({
          transaction_id: payload.transaction_id,
          risk_score: mockScore,
          risk_level: mockScore >= 75 ? "red" : mockScore >= 45 ? "yellow" : "green",
          rule_flags:
            formData.fraud_template === "OTP_RELAY"
              ? ["HIGH_AMOUNT", "NEW_BENEFICIARY", "NEW_DEVICE"]
              : formData.fraud_template === "MULE_FUNNEL"
              ? ["HIGH_VELOCITY_1H", "AMOUNT_BELOW_THRESHOLD"]
              : formData.fraud_template === "NIGHT_BURST"
              ? ["NIGHT_TRANSACTION", "NEW_BENEFICIARY", "AMOUNT_SPIKE"]
              : ["AMOUNT_DEVIATION"],
          top_shap_features: [
            { feature: "amount_vs_7d_avg", contribution: 18 + Math.random() * 15 },
            { feature: "txn_count_1h", contribution: formData.txn_count_1h * 1.2 },
            { feature: "new_device_flag", contribution: formData.new_device_flag ? 14 : 0 },
            { feature: "is_new_beneficiary", contribution: formData.is_new_beneficiary ? 12 : 0 },
            { feature: "hour_of_day", contribution: 5 + Math.random() * 8 },
          ],
          explanation:
            "Anomalous behavioral pattern detected. Transaction exhibits characteristics consistent with adversarial fraud vectors including velocity anomaly and device fingerprint mismatch.",
          explanation_hi:
            "असामान्य व्यवहार पैटर्न पाया गया। लेनदेन में वेग विसंगति और डिवाइस फिंगरप्रिंट मेल न खाने जैसी विशेषताएं हैं।",
          explanation_status: "ready",
          fraud_template: formData.fraud_template,
        });
        setTransmitting(false);
        setLoading(false);
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col h-full gap-5 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)]">
            Adversarial{" "}
            <span className="text-[var(--accent-copper)]">Simulation Lab</span>
          </h2>
          <p className="text-sm text-[var(--accent-light)] mt-0.5">
            Craft and inject custom payloads to stress-test the LightGBM model
            &amp; rule engine constraints
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm border text-[10px] font-mono tracking-widest"
          style={{
            background: "rgba(217,119,54,0.06)",
            borderColor: "rgba(217,119,54,0.3)",
            color: "var(--accent-copper)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-copper)] animate-pulse" />
          ENGINE ONLINE
        </div>
      </div>

      {/* Attack Preset buttons */}
      <div className="grid grid-cols-3 gap-3">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="relative overflow-hidden rounded-sm border p-4 text-left transition-all duration-300 group"
            style={{
              borderColor:
                activePreset === preset.id
                  ? `${preset.color}60`
                  : "var(--border-color)",
              background:
                activePreset === preset.id
                  ? `${preset.color}0d`
                  : "var(--bg-card)",
              boxShadow:
                activePreset === preset.id
                  ? `0 0 20px ${preset.color}20`
                  : "none",
            }}
          >
            {activePreset === preset.id && (
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{
                  background: `linear-gradient(90deg, transparent, ${preset.color}, transparent)`,
                }}
              />
            )}
            <div className="text-xl mb-2">{preset.icon}</div>
            <div
              className="text-xs font-black font-mono tracking-wider mb-1 transition-colors"
              style={{
                color:
                  activePreset === preset.id ? preset.color : "var(--text-main)",
              }}
            >
              {preset.label.toUpperCase()}
            </div>
            <div className="text-[10px] text-[var(--accent-light)] leading-relaxed">
              {preset.description}
            </div>
          </button>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-2 gap-5 min-h-0 overflow-y-auto pb-4">
        {/* LEFT: Payload Craft Panel */}
        <div
          className="rounded-md border p-6 flex flex-col gap-5"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <h3 className="text-xs font-black font-mono tracking-widest text-[var(--accent-light)]">
              CRAFT PAYLOAD
            </h3>
            <span className="text-[9px] font-mono text-[var(--accent-light)]/50">
              DRISHTI/ADV-SIM v2
            </span>
          </div>

          {/* UPI Endpoints */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "SENDER UPI", field: "sender_upi" as const, placeholder: "attacker@ybl" },
              { label: "RECEIVER UPI", field: "receiver_upi" as const, placeholder: "victim@paytm" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="text-[9px] font-bold font-mono tracking-widest text-[var(--accent-light)] block mb-1.5">
                  {label}
                </label>
                <input
                  type="text"
                  value={formData[field]}
                  onChange={(e) => setFormData((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-sm px-3 py-2 text-xs font-mono text-[var(--text-main)] placeholder-[var(--accent-light)]/30 focus:outline-none transition-all"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--accent-copper)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--border-color)")
                  }
                />
              </div>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="text-[9px] font-bold font-mono tracking-widest text-[var(--accent-light)] block mb-1.5">
              AMOUNT (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-light)] text-sm font-bold">
                ₹
              </span>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))
                }
                className="w-full rounded-sm pl-7 pr-4 py-2.5 text-sm font-mono font-bold text-[var(--text-main)] focus:outline-none transition-all"
                style={{
                  background: "var(--bg-primary)",
                  border: `1px solid ${formData.amount > 50000 ? "rgba(224,82,67,0.5)" : "var(--border-color)"}`,
                  color: formData.amount > 50000 ? "#E05243" : "var(--text-main)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-copper)")}
                onBlur={(e) =>
                  (e.target.style.borderColor =
                    formData.amount > 50000
                      ? "rgba(224,82,67,0.5)"
                      : "var(--border-color)")
                }
              />
              {formData.amount > 50000 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#E05243] font-mono">
                  ⚠ HIGH
                </span>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className="text-[9px] font-bold font-mono tracking-widest text-[var(--accent-light)] block mb-1.5">
              TIMESTAMP
            </label>
            <input
              type="datetime-local"
              value={formData.timestamp}
              onChange={(e) => setFormData((f) => ({ ...f, timestamp: e.target.value }))}
              className="w-full rounded-sm px-3 py-2.5 text-xs font-mono text-[var(--text-main)] focus:outline-none transition-all"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                colorScheme: "dark",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-copper)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-color)")}
            />
          </div>

          {/* Sliders */}
          <div className="space-y-5">
            <GlowSlider
              label="TXN COUNT (1H)"
              value={formData.txn_count_1h}
              min={0}
              max={25}
              step={1}
              onChange={(v) => setFormData((f) => ({ ...f, txn_count_1h: v }))}
              format={(v) => String(v)}
              dangerThreshold={10}
            />
            <GlowSlider
              label="AVG AMOUNT 1H (₹)"
              value={formData.amount_avg_1h}
              min={100}
              max={100000}
              step={100}
              onChange={(v) => setFormData((f) => ({ ...f, amount_avg_1h: v }))}
              format={(v) => `₹${v.toLocaleString("en-IN")}`}
              dangerThreshold={50000}
            />
          </div>

          {/* Toggles */}
          <div
            className="space-y-4 p-4 rounded-sm border"
            style={{
              background: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <Toggle
              checked={formData.new_device_flag}
              onChange={(v) => setFormData((f) => ({ ...f, new_device_flag: v }))}
              label="New Unrecognized Device"
              description="Device fingerprint not in trusted registry"
            />
            <div
              className="border-t"
              style={{ borderColor: "var(--border-color)" }}
            />
            <Toggle
              checked={formData.is_new_beneficiary}
              onChange={(v) => setFormData((f) => ({ ...f, is_new_beneficiary: v }))}
              label="New Beneficiary"
              description="Receiver not in sender's past 90-day history"
            />
          </div>

          {/* Inject Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-sm font-black text-sm font-mono tracking-widest transition-all duration-300 relative overflow-hidden"
            style={{
              background: loading
                ? "var(--border-color)"
                : "linear-gradient(135deg, var(--accent-copper) 0%, #b86b25 50%, #d97736 100%)",
              color: loading ? "var(--accent-light)" : "white",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                TRANSMITTING PAYLOAD...
              </span>
            ) : (
              "⚡ INJECT PAYLOAD"
            )}
          </button>
        </div>

        {/* RIGHT: Results Panel */}
        <div className="flex flex-col gap-4">
          {transmitting && !result ? (
            /* Transmission Animation */
            <div
              className="flex-1 rounded-md border flex flex-col items-center justify-center gap-6"
              style={{
                background: "var(--bg-card)",
                borderColor: "rgba(217,119,54,0.3)",
              }}
            >
              <div className="text-center">
                <div className="text-3xl mb-4">⚡</div>
                <div className="text-xs font-mono font-bold tracking-widest text-[var(--accent-copper)] mb-2">
                  ANALYZING PAYLOAD
                </div>
                <div className="text-[10px] text-[var(--accent-light)] font-mono">
                  Routing through ML pipeline...
                </div>
              </div>
              <div className="w-48 space-y-2">
                {[
                  { label: "Rule Engine", delay: 0 },
                  { label: "LightGBM Model", delay: 200 },
                  { label: "SHAP Explainer", delay: 400 },
                  { label: "NLP Narrative", delay: 600 },
                ].map(({ label, delay }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: scanLine > delay / 10 ? "var(--accent-copper)" : "var(--border-color)",
                        transition: "all 0.3s ease",
                      }}
                    />
                    <div className="flex-1 bg-[var(--border-color)]/40 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(0, Math.min(100, scanLine - delay / 10))}%`,
                          background: "linear-gradient(90deg, var(--accent-copper), #e8964a)",
                        }}
                      />
                    </div>
                    <span
                      className="text-[9px] font-mono w-20"
                      style={{
                        color: scanLine > delay / 10 ? "var(--text-main)" : "var(--accent-light)",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : result ? (
            <>
              {/* Risk Score Card */}
              <div
                className="rounded-md border p-6"
                style={{
                  background: "var(--bg-card)",
                  borderColor:
                    result.risk_level === "red"
                      ? "rgba(224,82,67,0.4)"
                      : result.risk_level === "yellow"
                      ? "rgba(240,160,75,0.4)"
                      : "rgba(125,156,101,0.4)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[9px] font-mono font-bold tracking-widest text-[var(--accent-light)]">
                      ENGINE VERDICT
                    </div>
                    <div className="text-xs text-[var(--accent-light)]/60 font-mono mt-0.5">
                      {result.transaction_id}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="text-[9px] font-mono px-2 py-1 rounded border transition-all"
                    style={{
                      borderColor: showRaw ? "var(--accent-copper)" : "var(--border-color)",
                      color: showRaw ? "var(--accent-copper)" : "var(--accent-light)",
                      background: showRaw ? "rgba(217,119,54,0.08)" : "transparent",
                    }}
                  >
                    {"{ JSON }"}
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <RiskGauge score={result.risk_score} level={result.risk_level} />
                  <div className="flex-1 space-y-3">
                    {/* SHAP feature bars */}
                    {result.top_shap_features
                      ?.filter((f: any) => f.contribution > 0)
                      .slice(0, 4)
                      .map((feat: any) => {
                        const pct = Math.min((feat.contribution / 30) * 100, 100);
                        return (
                          <div key={feat.feature}>
                            <div className="flex justify-between text-[9px] mb-1">
                              <span className="font-mono text-[var(--accent-light)] uppercase">
                                {feat.feature.replace(/_/g, " ")}
                              </span>
                              <span className="font-mono font-bold text-[#E05243]">
                                +{feat.contribution.toFixed(1)}
                              </span>
                            </div>
                            <div className="h-1 bg-[var(--border-color)]/50 rounded-full overflow-hidden">
                              <div
                                className="h-1 rounded-full"
                                style={{
                                  width: `${pct}%`,
                                  background:
                                    "linear-gradient(90deg, #F0A04B, #E05243)",
                                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Rule Flags */}
              {result.rule_flags?.length > 0 && (
                <div
                  className="rounded-md border p-5"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="text-[9px] font-mono font-bold tracking-widest text-[var(--accent-light)] mb-3">
                    RULES FIRED
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.rule_flags.map((r: string) => (
                      <span
                        key={r}
                        className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold"
                        style={{
                          background: "rgba(224,82,67,0.08)",
                          color: "#E05243",
                          border: "1px solid rgba(224,82,67,0.25)",
                        }}
                      >
                        ⚡ {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation */}
              <div
                className="rounded-md border p-5 flex-1"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[9px] font-mono font-bold tracking-widest text-[var(--accent-light)]">
                    AI NARRATIVE
                  </div>
                  {result.fraud_template && (
                    <span
                      className="text-[9px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{
                        color: "#E05243",
                        background: "rgba(224,82,67,0.08)",
                        border: "1px solid rgba(224,82,67,0.3)",
                      }}
                    >
                      {result.fraud_template}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--accent-light)] leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Raw JSON Panel */}
              {showRaw && (
                <div
                  className="rounded-md border p-4"
                  style={{
                    background: "var(--bg-primary)",
                    borderColor: "rgba(217,119,54,0.3)",
                  }}
                >
                  <div className="text-[9px] font-mono font-bold tracking-widest text-[var(--accent-copper)] mb-2">
                    RAW PAYLOAD SENT
                  </div>
                  <pre
                    className="text-[9px] font-mono text-[var(--accent-light)] overflow-auto max-h-40"
                    style={{ lineHeight: 1.6 }}
                  >
                    {JSON.stringify(sentPayload, null, 2)}
                  </pre>
                  <div className="text-[9px] font-mono font-bold tracking-widest text-[var(--accent-copper)] mb-2 mt-3">
                    ENGINE RESPONSE
                  </div>
                  <pre
                    className="text-[9px] font-mono text-[var(--accent-light)] overflow-auto max-h-40"
                    style={{ lineHeight: 1.6 }}
                  >
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            /* Idle State */
            <div
              className="flex-1 rounded-md border flex flex-col items-center justify-center gap-4"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-color)",
                borderStyle: "dashed",
              }}
            >
              <div
                className="w-16 h-16 rounded-md flex items-center justify-center"
                style={{ background: "rgba(217,119,54,0.08)", border: "1px solid rgba(217,119,54,0.2)" }}
              >
                <svg
                  className="w-8 h-8 text-[var(--accent-copper)] opacity-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-[var(--text-main)] mb-1">
                  Awaiting Payload Injection
                </div>
                <div className="text-xs text-[var(--accent-light)]/60 font-mono">
                  Select a preset or craft a custom attack vector
                </div>
              </div>
              <div className="flex gap-2 text-[9px] font-mono text-[var(--accent-light)]/40">
                <span>RULE ENGINE READY</span>
                <span>•</span>
                <span>LIGHTGBM LOADED</span>
                <span>•</span>
                <span>SHAP ACTIVE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

