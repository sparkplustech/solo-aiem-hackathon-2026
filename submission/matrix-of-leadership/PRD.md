# DRISHTI — Product Requirements Document

### Detection & Real-time Intelligence for Securing Transactions in India

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** May 2026  
**Author:** Team DRISHTI

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Non-Goals](#3-goals--non-goals)
4. [User Personas](#4-user-personas)
5. [Feature Requirements](#5-feature-requirements)
6. [User Stories & Acceptance Criteria](#6-user-stories--acceptance-criteria)
7. [System Behavior & Edge Cases](#7-system-behavior--edge-cases)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Success Metrics](#9-success-metrics)
10. [Out of Scope / Future Roadmap](#10-out-of-scope--future-roadmap)
11. [Dependencies & Risks](#11-dependencies--risks)
12. [Appendix](#12-appendix)

---

## 1. Executive Summary

DRISHTI is a real-time UPI fraud and mule-account detection engine designed specifically for the Indian banking context. It operates as a lightweight API layer that plugs into a bank's existing transaction pipeline, combining rule-based hard filters, a tree-based ML model (LightGBM), graph-based network analysis (Louvain community detection via NetworkX), and LLM-generated plain-English explanations into a single, explainable, and deployable system.

The product targets three actors: **fraud-operations analysts** at banks, **customers** transacting over UPI, and **bank compliance/risk officers**. It surfaces a risk score per transaction, an explainability card, a fraud-ops review dashboard, customer-facing alerts, and a mule-account monitoring panel — all deployable for ₹0 using free-tier tools.

---

## 2. Problem Statement

### 2.1 Context

India processed over **131 billion UPI transactions** in FY2024, totalling ₹200+ lakh crore in value. The Unified Payments Interface has become the default payment rail for hundreds of millions of Indians, including small merchants, daily-wage earners, and first-time digital users — demographics with limited awareness of social-engineering scams.

### 2.2 The Fraud Surge

- **Social-engineering scams** (OTP relay, screen-share, impersonation) account for the majority of UPI fraud cases.
- **Mule accounts** — seemingly legitimate small-merchant or personal accounts used to launder stolen funds — are increasingly difficult to detect with static rules.
- RBI's FY2024 Annual Report flagged a **27% YoY rise** in digital payment fraud value.
- NPCI's DIGI-KAVACH initiative and the government's "Zero Financial Frauds" goal both demand scalable, intelligent detection beyond rule lists.

### 2.3 The Gap in Current Systems

| Current Approach             | Problem                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Hard rule-based systems      | Rigid thresholds — too many false positives, adapt slowly to new attack vectors |
| Pure deep-learning models    | Black-box decisions, hard to explain to regulators or ops staff                 |
| Per-transaction scoring only | Miss mule-cluster patterns that only appear across a network of accounts        |
| No user-facing warnings      | Customers complete scam-induced transfers with no friction                      |
| No seasonal awareness        | Diwali/festival spikes treated as fraud spikes — high false positive rates      |

### 2.4 The Core Need

A bank fraud team needs a system that:

- Scores transactions in **< 50ms** before settlement (sync path)
- Explains *why* a transaction is suspicious in plain language
- Detects **mule clusters** across accounts, not just individual transactions
- Reduces false positives by benchmarking against **peer cohorts**, not absolute thresholds
- Can be deployed and demonstrated without enterprise infrastructure

---

## 3. Goals & Non-Goals

### 3.1 Goals (In Scope)

| ID   | Goal                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| G-01 | Score every synthetic UPI transaction with a risk level: GREEN / YELLOW / RED            |
| G-02 | Generate a human-readable explanation card for each flagged transaction                  |
| G-03 | Detect mule-account clusters using graph community analysis on transaction networks      |
| G-04 | Provide a fraud-ops dashboard for analysts to block, allow, or escalate transactions     |
| G-05 | Surface customer-facing alerts (mock SMS / in-app banner) for high-risk transactions     |
| G-06 | Simulate a federated learning aggregation across 3 synthetic bank nodes                  |
| G-07 | Apply festival/seasonal threshold scaling (Diwali, year-end) to suppress false positives |
| G-08 | Benchmark the hybrid model against rules-only and ML-only baselines                      |
| G-09 | Deploy the full system free of cost using Render + Vercel                                |

### 3.2 Non-Goals (Explicitly Out of Scope)

| ID    | Non-Goal                                           | Reason                                                                                  |
| ----- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| NG-01 | Integration with a real bank's core banking system | Requires regulatory approvals and NDAs                                                  |
| NG-02 | Real customer PII or live UPI transaction data     | Privacy regulations; synthetic data is sufficient for demo                              |
| NG-03 | Training a production-grade GraphSAGE model        | Requires labeled graph data and GPU training time; Louvain achieves same visual outcome |
| NG-04 | Building a real federated learning network         | Simulation with FedAvg across 3 in-memory bank objects is sufficient                   |
| NG-05 | Mobile app (iOS/Android)                           | Web dashboard covers the demo scope                                                     |
| NG-06 | Multi-currency or cross-border transaction support | DRISHTI is UPI-specific (INR only)                                                      |

---

## 4. User Personas

### Persona 1 — Anjali, Fraud Operations Analyst

- **Role:** Reviews flagged transactions at a mid-sized private bank
- **Frustration:** Current system gives a score with no context. She has to manually investigate every flag.
- **Need:** Instant, readable explanation of *why* a transaction was flagged. One-click block/allow.
- **Success looks like:** DRISHTI shows "User's 30-day avg spend is ₹800/day. This transfer is ₹12,000 to a new beneficiary from a new device." She blocks it in 3 seconds.

### Persona 2 — Ramesh, Small Merchant / UPI User

- **Role:** A kirana store owner in Tier-2 city who uses UPI daily
- **Frustration:** Gets scammed via OTP relay. No warning before the transfer completes.
- **Need:** A timely in-app or SMS prompt that says "This transaction looks unusual. Did you initiate this?"
- **Success looks like:** He receives a warning banner, taps "Block", and calls his bank. Money is safe.

### Persona 3 — Priya, Bank Risk & Compliance Officer

- **Role:** Reports to RBI, maintains AML and KYC compliance records
- **Frustration:** Can't explain ML decisions to auditors. Model is a black box.
- **Need:** Audit logs, SHAP-based explanations, trend dashboards, and regulatory alignment narrative.
- **Success looks like:** DRISHTI's explanation cards serve as audit-ready documentation. Mule cluster reports align with FATF typologies.

### Persona 4 — Vikram, Hackathon Judge (NPCI / RBI background)

- **Role:** Evaluates technical depth, real-world applicability, and regulatory awareness
- **Need:** Sees something beyond a Jupyter notebook. Working demo, clear architecture, honest about limitations.
- **Success looks like:** DRISHTI shows a live transaction stream, flags a mule cluster, renders a bilingual explanation, and the presenter speaks fluently about FedAvg simulation and PSI drift monitoring.

---

## 5. Feature Requirements

Features are prioritized as **P0** (must-have for MVP / demo), **P1** (high-value, build if time allows), **P2** (stretch goals / roadmap).

---

### 5.1 Core Scoring Engine (P0)

| ID   | Feature             | Description                                                                                     |
| ---- | ------------------- | ----------------------------------------------------------------------------------------------- |
| F-01 | Rule layer          | Hard-coded rule set catches obvious red flags before ML inference                               |
| F-02 | LightGBM scoring    | Trained on synthetic data; outputs a 0–1 fraud probability                                      |
| F-03 | Feature engineering | Velocity, recency, new-beneficiary count, device-change flag, merchant-type mismatch            |
| F-04 | Peer cohort z-score | Users clustered by spend bracket + city tier; score deviation vs cohort, not absolute threshold |
| F-05 | Risk label mapping  | Probability → GREEN (< 0.35) / YELLOW (0.35–0.70) / RED (> 0.70)                                |
| F-06 | Scoring latency     | End-to-end score must be returned in < 50ms (P99)                                               |
| F-07 | Festival scaling    | Threshold multiplier applied during Diwali ±7 days, year-end ±3 days                            |
| F-08 | Cold-start handling | New accounts (< 10 transactions) fall back to rule-layer + cohort median baseline               |

**Rule Set (F-01 detail):**

| Rule ID | Condition                                        | Risk Tag             |
| ------- | ------------------------------------------------ | -------------------- |
| R-01    | > 3 transactions in 60 seconds above ₹1,000      | HIGH_VELOCITY        |
| R-02    | Transfer > 80% of daily limit to new beneficiary | LIMIT_PROXIMITY      |
| R-03    | New device + new beneficiary + amount > ₹5,000   | DEVICE_BEN_COMBO     |
| R-04    | Merchant-category UPI ID used for P2P transfer   | MERCHANT_MISMATCH    |
| R-05    | Transfer within 30 seconds of OTP event          | OTP_RELAY_PATTERN    |
| R-06    | 10+ small inflows (< ₹500) within 1 hour         | AGGREGATION_PATTERN  |

---

### 5.2 Mule Account Detection (P0)

| ID   | Feature                     | Description                                                                      |
| ---- | --------------------------- | -------------------------------------------------------------------------------- |
| F-09 | Transaction graph builder   | Directed graph: nodes = UPI IDs, edges = transactions (weighted by amount)       |
| F-10 | Louvain community detection | Identify tightly-knit clusters using NetworkX + python-louvain                   |
| F-11 | Mule pattern scoring        | Score each cluster on: fan-in/fan-out ratio, avg time-to-drain, # unique senders |
| F-12 | Mule risk label             | Clusters scored HIGH / MEDIUM / LOW mule risk                                    |
| F-13 | Batch job scheduling        | Mule detection runs every 15 minutes via APScheduler, not per-transaction        |
| F-14 | Precomputed cache           | Results cached in-memory (dict); dashboard reads cache, not live graph           |

**Mule Pattern Templates:**

| Pattern Name    | Signature                                               |
| --------------- | ------------------------------------------------------- |
| Classic Drain   | 8+ senders → 1 account → 1 large outflow within 2 hours |
| Round-trip Loop | A → B → C → A with < 5-minute intervals                 |
| Layered Funnel  | 3-hop money movement through distinct account tiers     |

---

### 5.3 Explainability Engine (P0)

| ID   | Feature                | Description                                                                                        |
| ---- | ---------------------- | -------------------------------------------------------------------------------------------------- |
| F-15 | SHAP value computation | Per-transaction SHAP values computed for LightGBM output                                           |
| F-16 | Groq LLM narration     | SHAP values + transaction context sent to Llama 3.1 70B via Groq free tier                         |
| F-17 | Template fallback      | Pre-written explanation templates used if Groq API is unavailable (< 1ms latency)                  |
| F-18 | Async delivery         | Explanation card delivered via WebSocket after score; does NOT block the scoring response          |
| F-19 | Bilingual output       | Explanation rendered in English + Hindi (translated via template map or LLM)                       |
| F-20 | Fraud DNA matching     | Incoming transaction compared to unsupervised fraud cluster centroids; top-match template surfaced |

**Example Explanation Card:**

```
[EN] This transfer is ₹10,000 — 12× your 30-day daily average of ₹820.
     The beneficiary was added 4 minutes ago and this device has never
     been seen on your account. Pattern matches: OTP Relay Scam (87% similarity).

[HI] यह ट्रांसफर ₹10,000 है — आपके 30-दिन के औसत ₹820 से 12 गुना अधिक।
     लाभार्थी 4 मिनट पहले जोड़ा गया था और यह डिवाइस पहले कभी नहीं देखा गया।
```

---

### 5.4 Fraud-Ops Dashboard (P0)

| ID   | Feature             | Description                                                                      |
| ---- | ------------------- | -------------------------------------------------------------------------------- |
| F-21 | Transaction feed    | Live-scrolling list of transactions colored by risk label                        |
| F-22 | Expand panel        | Click any transaction to see full explanation card + SHAP bar chart              |
| F-23 | Action buttons      | Block / Allow / Investigate per transaction (mock state update)                  |
| F-24 | Mule cluster panel  | Visual graph of detected mule clusters with node coloring by risk                |
| F-25 | Fraud heatmap       | Geographic/category heatmap of flagged transactions by hour                      |
| F-26 | Benchmark panel     | Side-by-side comparison: Rules Only vs ML Only vs DRISHTI Hybrid                 |
| F-27 | Adversarial sim tab | Replay known evasion patterns (split transactions, slow drip) against the engine |
| F-28 | PSI drift monitor   | Population Stability Index chart showing feature distribution drift over time    |
| F-29 | Audit log           | Timestamped log of all analyst actions (block/allow) with transaction ID         |

---

### 5.5 Customer-Facing Alert Flow (P0)

| ID   | Feature                 | Description                                                                                  |
| ---- | ----------------------- | -------------------------------------------------------------------------------------------- |
| F-30 | Risk gate               | Transactions scored RED are held for 30 seconds pending user confirmation                    |
| F-31 | Mock SMS alert          | Terminal / log output simulating "ALERT: Unusual UPI activity detected. Confirm?"            |
| F-32 | In-app banner           | Dashboard shows a customer-view modal: "This transaction looks unusual" with Confirm / Block |
| F-33 | Pre-auth large transfer | Transactions > ₹50,000 to new beneficiaries trigger a mandatory confirmation step            |

---

### 5.6 Federated Learning Simulation (P1)

| ID   | Feature                 | Description                                                           |
| ---- | ----------------------- | --------------------------------------------------------------------- |
| F-34 | 3-bank simulation       | Three in-memory synthetic bank datasets, each trains a local LightGBM |
| F-35 | FedAvg aggregation      | Feature weights averaged across banks; global model distributed back  |
| F-36 | Privacy preservation    | Raw transaction data never leaves each simulated bank node            |
| F-37 | Dashboard visualization | Shows local model accuracy vs federated model accuracy per bank       |

---

### 5.7 Data & Synthetic Generation (P0)

| ID   | Feature                 | Description                                                                         |
| ---- | ----------------------- | ----------------------------------------------------------------------------------- |
| F-38 | Synthetic dataset       | 50,000+ synthetic UPI transactions generated via Faker + custom rules               |
| F-39 | Labeled fraud scenarios | ~5% fraud rate with 6 labeled fraud types (OTP relay, mule, screen-share, etc.)     |
| F-40 | Streaming simulation    | FastAPI BackgroundTask replays dataset at configurable TPS for demo                 |
| F-41 | Cohort profiles         | 5 pre-defined user cohort profiles (student, trader, homemaker, merchant, salaried) |

---

## 6. User Stories & Acceptance Criteria

### Story 1 — Transaction Scoring

**As** Anjali (fraud analyst),  
**I want** every incoming transaction to receive a risk score within 50ms,  
**So that** I can review flagged items before settlement completes.

**Acceptance Criteria:**

- [ ] POST `/api/v1/score` returns `{ transaction_id, risk_score, risk_label, rule_hits }` in < 50ms (P99)
- [ ] Rule hits list all triggered rule IDs (e.g., `["R-02", "R-03"]`)
- [ ] Risk label is one of: `GREEN`, `YELLOW`, `RED`
- [ ] Response does NOT include explanation card (async via WebSocket)
- [ ] Festival modifier is applied if current date is within festival window

---

### Story 2 — Explanation Card Delivery

**As** Anjali,  
**I want** a plain-English explanation of why a transaction was flagged,  
**So that** I can make a block/allow decision without running my own investigation.

**Acceptance Criteria:**

- [ ] Explanation card delivered via WebSocket within 2 seconds of score response
- [ ] Card includes: top 3 SHAP features, peer-cohort comparison, fraud DNA match (if any)
- [ ] Template fallback renders if Groq API call exceeds 3-second timeout
- [ ] Card available in both English and Hindi
- [ ] Card is stored in audit log with timestamp and analyst ID

---

### Story 3 — Mule Account Detection

**As** Priya (compliance officer),  
**I want** to see clusters of accounts that are collectively laundering money,  
**So that** I can file Suspicious Transaction Reports (STRs) to RBI/FIU.

**Acceptance Criteria:**

- [ ] Mule detection batch job runs every 15 minutes
- [ ] Graph built from all transactions in the past 24 hours
- [ ] Louvain communities with > 3 nodes scored for mule risk
- [ ] HIGH risk clusters surfaced in dashboard with account list and cluster graph
- [ ] Classic Drain, Round-trip Loop, and Layered Funnel patterns explicitly labeled

---

### Story 4 — Customer Alert

**As** Ramesh (UPI user),  
**I want** to be warned before a suspicious transfer completes,  
**So that** I can block scam-induced transfers before losing money.

**Acceptance Criteria:**

- [ ] RED-scored transactions are held for 30 seconds
- [ ] In-app banner shows: amount, beneficiary name, risk reason (short text)
- [ ] Customer can tap "Confirm" (transaction proceeds) or "Block" (transaction cancelled)
- [ ] Pre-auth step triggered for amounts > ₹50,000 to beneficiaries added < 24 hours ago

---

### Story 5 — Analyst Dashboard Actions

**As** Anjali,  
**I want** to block, allow, or escalate transactions from the dashboard,  
**So that** I can work through my queue efficiently.

**Acceptance Criteria:**

- [ ] Dashboard shows real-time transaction feed with color coding
- [ ] Each row expandable to show full explanation + SHAP bar chart
- [ ] Block / Allow / Investigate buttons update transaction state immediately
- [ ] State persists in-memory (resets on server restart — acceptable for hackathon)
- [ ] Audit log panel shows all actions in chronological order

---

### Story 6 — Adversarial Simulation

**As** Vikram (judge),  
**I want** to see the system tested against known evasion techniques,  
**So that** I can assess the depth of the fraud defense.

**Acceptance Criteria:**

- [ ] Adversarial tab can replay: split-transaction evasion, slow-drip pattern, round-number avoidance
- [ ] System correctly flags at least 2 of 3 evasion patterns
- [ ] Detection method is explained per evasion type (velocity window, graph density, etc.)

---

## 7. System Behavior & Edge Cases

| Scenario                       | Expected Behavior                                                            |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Groq API timeout               | Template fallback explanation rendered; no scoring delay                     |
| New user (< 10 transactions)   | Cold-start fallback: rule layer + cohort median score applied                |
| Festival season                | Threshold multiplier (1.5×) applied; festival label shown in dashboard       |
| Mule graph has no clusters     | Mule panel shows "No suspicious clusters detected in last 24h"               |
| LightGBM inference error       | Rule-layer score returned; error logged; no system crash                     |
| WebSocket client disconnects   | Explanation card dropped; re-requested on reconnect                          |
| TPS > 100 (stress test)        | Background queue buffers; scores delivered in order; no dropped transactions |
| Analyst takes no action in 60s | Transaction auto-escalated to "Investigate" queue                            |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| Metric                     | Target                         |
| -------------------------- | ------------------------------ |
| Scoring latency (P50)      | < 30ms                         |
| Scoring latency (P99)      | < 50ms                         |
| Explanation delivery (P50) | < 1.5s                         |
| Mule batch job runtime     | < 30s for 10,000-node graph    |
| Dashboard load time        | < 2s on 50Mbps connection      |
| Synthetic TPS (demo mode)  | Configurable: 1, 5, 10, 20 TPS |

### 8.2 Reliability

- Backend crash must not affect stored audit log (persisted to JSON file)
- Template fallback must always render — Groq unavailability is non-fatal
- Frontend must degrade gracefully if WebSocket drops (show "Explanation loading...")

### 8.3 Security (Demo Scope)

- No real PII in any dataset
- API endpoints protected with a static Bearer token (demo-grade auth)
- All synthetic UPI IDs follow format `user_XXXX@mockbank` — no real VPA patterns

### 8.4 Observability

- All scoring decisions logged to `logs/scoring.jsonl` with timestamp, features, rules hit, score
- Mule batch results appended to `logs/mule_batches.jsonl`
- Analyst actions appended to `logs/audit.jsonl`
- PSI drift computed from `logs/scoring.jsonl` and surfaced in dashboard

### 8.5 Accessibility & Localisation

- Dashboard supports English and Hindi UI toggle
- Explanation cards rendered in both languages simultaneously
- Color-blind safe palette: risk levels use shape + icon in addition to color

---

## 9. Success Metrics

### 9.1 Demo-Day Metrics (Primary)

| Metric                      | Target                                            |
| --------------------------- | ------------------------------------------------- |
| Live transaction score demo | ≥ 50 transactions scored in front of judges       |
| Mule cluster detected       | ≥ 1 classic drain cluster visible in graph panel  |
| Explanation card render     | < 2s per transaction during live demo             |
| Benchmark improvement       | DRISHTI Hybrid F1 > Rules-Only F1 by ≥ 10pp       |
| Festival scaling demo       | Threshold shift demonstrably visible in dashboard |

### 9.2 Model Performance Metrics (Hackathon Dataset)

| Metric                | Target |
| --------------------- | ------ |
| Precision (RED label) | ≥ 0.85 |
| Recall (RED label)    | ≥ 0.80 |
| F1 Score              | ≥ 0.82 |
| False Positive Rate   | ≤ 10%  |
| AUC-ROC               | ≥ 0.92 |

### 9.3 Qualitative Metrics (Judge Evaluation)

- Judges can articulate the 3-layer architecture (rules → ML → graph) after the demo
- Explanation cards are rated "clear and useful" by non-technical evaluators
- Regulatory alignment narrative (DIGI-KAVACH, Zero Financial Frauds, DPIP) is explicitly acknowledged

---

## 10. Out of Scope / Future Roadmap

| Feature                                               | Phase   |
| ----------------------------------------------------- | ------- |
| Real bank API integration (core banking middleware)   | Phase 2 |
| Production GraphSAGE model with labeled training data | Phase 2 |
| True federated learning across bank endpoints         | Phase 3 |
| Mobile SDK (Android/iOS) for in-app alerts            | Phase 2 |
| WhatsApp Business API integration for alerts          | Phase 2 |
| Real-time PSI retraining trigger                      | Phase 3 |
| Regulatory reporting API (RBI STR format)             | Phase 3 |
| Multi-language support (Tamil, Telugu, Bengali)       | Phase 2 |

---

## 11. Dependencies & Risks

### 11.1 Technical Dependencies

| Dependency                          | Risk Level | Mitigation                                            |
| ----------------------------------- | ---------- | ----------------------------------------------------- |
| Groq free tier availability         | MEDIUM     | Template fallback always ready                        |
| Render free tier spin-down (15min)  | LOW        | cron-job.org keep-alive ping every 10min              |
| Vercel cold start                   | LOW        | Pre-render static frames                              |
| NetworkX graph performance at scale | LOW        | Batch limited to 24h window, ~5,000 nodes max in demo |
| LightGBM training convergence       | LOW        | Pre-trained model checkpoint committed to repo        |

### 11.2 Project Risks

| Risk                                             | Impact | Mitigation                                                                                |
| ------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------- |
| Wi-Fi failure at demo venue                      | HIGH   | All models and data run locally; no external dependencies except Groq (template fallback) |
| Overfitting on synthetic data                    | MEDIUM | Held-out test set; PSI dashboard shows if distribution shifts                             |
| Judge unfamiliar with GNN → Louvain substitution | LOW    | Slide explicitly calls out substitution and justifies it                                  |
| Time overrun on federated learning sim           | MEDIUM | FedAvg sim is < 100 lines of Python; build last                                           |

---

## 12. Appendix

### 12.1 Glossary

| Term         | Definition                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------- |
| UPI          | Unified Payments Interface — India's real-time payment system operated by NPCI                     |
| Mule Account | An account used to receive and forward fraudulent funds, often operated by unwitting third parties |
| SHAP         | SHapley Additive exPlanations — a method to explain individual ML model predictions                |
| FedAvg       | Federated Averaging — aggregation algorithm for federated learning                                 |
| PSI          | Population Stability Index — measures feature distribution shift between training and production   |
| P2P          | Person-to-Person — direct fund transfers between individuals                                       |
| VPA          | Virtual Payment Address — the UPI handle (e.g., name@bank)                                         |
| DIGI-KAVACH  | NPCI's initiative for digital payment safety and fraud awareness                                   |
| STR          | Suspicious Transaction Report — mandatory report filed with FIU-India                              |
| Louvain      | Community detection algorithm for large graphs; maximizes modularity                               |
| LightGBM     | Light Gradient Boosting Machine — fast, accurate, tree-based ML model                              |
| FIU-India    | Financial Intelligence Unit of India                                                               |

### 12.2 API Contract Summary

```
POST   /api/v1/score               → Score a single transaction
POST   /api/v1/score/batch         → Score a batch of transactions
GET    /api/v1/transactions        → List recent transactions with scores
PATCH  /api/v1/transactions/{id}   → Update analyst action (block/allow/investigate)
GET    /api/v1/mule/clusters       → Get latest mule cluster results
GET    /api/v1/mule/graph          → Get graph JSON for frontend visualisation
GET    /api/v1/metrics/benchmark   → Get benchmark comparison data
GET    /api/v1/metrics/psi         → Get PSI drift data
WS     /ws/explanations            → WebSocket for async explanation card delivery
```

### 12.3 Risk Score Thresholds

| Label  | Probability Range | Action                           |
| ------ | ----------------- | -------------------------------- |
| GREEN  | 0.00 – 0.34       | Auto-approve; log only           |
| YELLOW | 0.35 – 0.69       | Queue for analyst review         |
| RED    | 0.70 – 1.00       | Hold 30s; trigger customer alert |

*Festival multiplier applies 1.5× to GREEN/YELLOW thresholds during defined festival windows.*

### 12.4 Fraud DNA Cluster Templates

| Cluster Name       | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| OTP Relay Scam     | Transfer within 30s of OTP event; new device; new beneficiary     |
| Screen-Share Scam  | Large P2P transfer; merchant VPA used; same-session device change |
| Investment Fraud   | Recurring transfers to same beneficiary increasing in amount      |
| KYC Impersonation  | Multiple small debits followed by single large outflow after 48h  |
| Mule Classic Drain | Fan-in from 8+ senders; single outflow within 2 hours             |
| Round-Trip Loop    | A→B→C→A with < 5-minute inter-hop time                            |

---

*This PRD is a living document. Update version and date on each revision.*  
*For architecture diagrams and data models, refer to `DESIGN_DOC.md`.*  
*For setup and deployment instructions, refer to `README.md`.*
