# DRISHTI — System Design Document

**Version:** 1.0  
**Status:** Hackathon prototype  
**Authors:** DRISHTI team

---

## 1. System Overview

DRISHTI is a real-time fraud detection engine for UPI transactions. It operates as a lightweight API middleware layer between a bank's transaction processing system and its fraud operations team. The system produces a risk score for every UPI transaction within 50ms, generates a human-readable explanation asynchronously, and provides a live web dashboard for fraud-ops staff to act on flagged transactions.

The system is designed around three core constraints:

- **Latency**: Synchronous scoring must complete in under 50ms to avoid becoming a bottleneck in the payment pipeline
- **Explainability**: Every decision must have a human-readable justification for audit trail compliance
- **Operability**: Fraud-ops staff must be able to block, allow, or escalate any transaction with one click, and their decisions must feed back into model retraining

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       EXTERNAL BOUNDARY                          │
│                                                                  │
│   Bank Transaction    Customer App         Fraud Ops Staff       │
│   Pipeline            (mobile)             (web browser)         │
│        │                   │                      │              │
└────────┼───────────────────┼──────────────────────┼─────────────┘
         │                   │                      │
         ▼                   ▼                      ▼
┌────────────────────────────────────────────────────────────────┐
│                      DRISHTI BACKEND (FastAPI)                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  TRACK A — Real-time (<50ms)             │   │
│  │                                                          │   │
│  │  POST /score                                             │   │
│  │       │                                                  │   │
│  │       ├──▶ Feature Extractor                            │   │
│  │       │         (pulls cached account profile)          │   │
│  │       │                                                  │   │
│  │       ├──▶ Rule Engine (hard rules, instant)            │   │
│  │       │         returns: [rule_flags]                   │   │
│  │       │                                                  │   │
│  │       ├──▶ LightGBM Scorer (pkl loaded at startup)      │   │
│  │       │         returns: risk_score, shap_values         │   │
│  │       │                                                  │   │
│  │       └──▶ Temporal Context (festival/salary check)     │   │
│  │                 adjusts: threshold multipliers           │   │
│  │                                                          │   │
│  │  ◀── Returns risk_score + flags in ~38ms ──▶            │   │
│  │                                                          │   │
│  │  BackgroundTask: generate explanation async             │   │
│  │       │                                                  │   │
│  │       └──▶ Groq API / Template System                   │   │
│  │                 └──▶ WebSocket push to dashboard         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              TRACK B — Batch (every 15 min)              │   │
│  │                                                          │   │
│  │  APScheduler trigger                                     │   │
│  │       │                                                  │   │
│  │       ├──▶ Build transaction graph (NetworkX)           │   │
│  │       │                                                  │   │
│  │       ├──▶ Louvain community detection                  │   │
│  │       │         tags accounts with cluster_id           │   │
│  │       │                                                  │   │
│  │       ├──▶ Compute graph features per account           │   │
│  │       │         (drain_ratio, fan_in, centrality)       │   │
│  │       │                                                  │   │
│  │       ├──▶ Update account_profiles table in SQLite      │   │
│  │       │                                                  │   │
│  │       └──▶ Flag mule suspects (drain_ratio > 0.85)      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  SQLite: transactions | account_profiles | operator_labels      │
│          peer_cohorts | fraud_templates | model_metadata        │
└────────────────────────────────────────────────────────────────┘
         │                   │                      │
         ▼                   ▼                      ▼
┌────────────────────────────────────────────────────────────────┐
│                  DRISHTI FRONTEND (Next.js)                     │
│                                                                 │
│  Dashboard      Mule Graph     Heatmap     Adversarial Sim      │
│  (live feed)    (react-force-  (choropleth) (evasion tab)       │
│                  graph)                                         │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Design

### 3.1 Feature Extractor

Runs synchronously on every transaction. Pulls account profile from SQLite cache (pre-computed by Track B), then computes real-time features.

**Inputs**: raw transaction event  
**Outputs**: 40+ feature vector  
**SLA**: under 5ms (pure in-memory computation + one SQLite read)

**Cold-start logic:**

```
if account.txn_count >= 30:
    use personal_history baseline
elif account.txn_count >= 5:
    blend = 0.4 * personal + 0.6 * peer_cohort_default
    use blend
else:
    use new_account_profile (conservative defaults, ₹2,000 cap triggers)
```

**Peer cohort assignment:**  
Each user is assigned to one of 12 cohorts based on: city_tier (1/2/3), account_type (savings/current/wallet), spend_bracket (low/medium/high). Cohort medians are pre-computed from the full synthetic transaction dataset.

### 3.2 Rule Engine

Hard-coded logical rules that fire independently of the ML model. Rules contribute to `rule_flags[]` in the response and also inject binary features into the LightGBM feature vector.

**Rule definitions:**

| Rule ID | Condition                                                  | Severity |
| ------- | ---------------------------------------------------------- | -------- |
| R01     | `txn_count_1h > 3 AND avg_amount > 1000`                   | HIGH     |
| R02     | `amount > 0.95 * daily_limit AND is_new_beneficiary`       | HIGH     |
| R03     | `new_device_flag AND amount > 5000 AND is_new_beneficiary` | CRITICAL |
| R04     | `hour in [22,23,0,1,2,3,4,5] AND amount > 2000`            | MEDIUM   |
| R05     | `beneficiary_age_minutes < 30 AND amount > 3000`           | HIGH     |
| R06     | `mcc_mismatch AND amount > 1000`                           | MEDIUM   |
| R07     | `account_age_days < 7 AND amount > 2000`                   | HIGH     |
| R08     | `txn_count_24h > 10`                                       | MEDIUM   |
| R09     | `amount_sum_1h > 10000`                                    | HIGH     |
| R10     | `graph_contagion_score > 0.7`                              | HIGH     |

**Temporal adjustment:**  
On festival days and salary dates, thresholds for R01, R04, R09 are multiplied by a festival_multiplier (1.5–3.0× depending on event). This prevents mass false positives on Diwali, Eid, and salary disbursement days.

### 3.3 LightGBM Scorer

**Model loading:** Model `.pkl` file is loaded once at FastAPI startup into a module-level variable. Inference is ~5ms per transaction.

**Training configuration:**

```python
params = {
    "objective": "binary",
    "metric": ["auc", "binary_logloss"],
    "num_leaves": 63,
    "learning_rate": 0.05,
    "feature_fraction": 0.8,
    "bagging_fraction": 0.8,
    "bagging_freq": 5,
    "min_child_samples": 20,
    "is_unbalance": True,       # handles 2% fraud prevalence
    "n_estimators": 500,
    "early_stopping_rounds": 50,
}
```

**SHAP extraction per transaction:**

```python
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(feature_vector)[1]  # positive class
top_contributors = sorted(zip(feature_names, shap_values),
                         key=lambda x: abs(x[1]), reverse=True)[:4]
```

### 3.4 Explanation Generator

**Flow:**

1. Scoring returns immediately with `explanation_status: "generating"`
2. FastAPI `BackgroundTask` calls `generate_explanation(txn_id, shap_values, context)`
3. Groq API call with structured prompt (or template fallback)
4. Result stored in SQLite
5. Pushed to frontend via WebSocket `ws://host/ws/explanations/{txn_id}`

**Prompt structure sent to Groq:**

```
You are a fraud analyst explaining a suspicious UPI transaction in plain English.
Transaction: ₹{amount} from {sender} to {receiver} at {time}
Top risk factors (from most to least important):
1. {feature_1}: {explanation_1} (contribution: +{shap_1})
2. {feature_2}: {explanation_2} (contribution: +{shap_2})
3. {feature_3}: {explanation_3} (contribution: +{shap_3})

Write a 2-sentence plain-English explanation of why this transaction is suspicious.
Be specific with numbers. Do not use jargon. Do not start with "I".
```

### 3.5 Graph Analytics Engine (Track B)

**Runs every 15 minutes via APScheduler.**

```
Step 1: Query last 24h transactions from SQLite
Step 2: Build directed graph G = networkx.DiGraph()
        - Nodes: UPI IDs
        - Edges: transactions (weight = amount)
Step 3: Compute node-level features
        - in_degree, out_degree
        - drain_ratio = total_outflow / (total_inflow + 1)
        - betweenness_centrality (normalised)
        - fan_in_1h = distinct senders in last 1 hour
Step 4: Louvain community detection
        - G_undirected = G.to_undirected()
        - communities = community.best_partition(G_undirected)
Step 5: Compute community fraud density
        - For each community: fraud_density = flagged_members / total_members
Step 6: Update account_profiles table with all computed features
Step 7: Flag mule suspects
        - drain_ratio > 0.85 AND fan_in_1h > 5 → mule_suspect = True
```

### 3.6 Fraud DNA Fingerprinting

Five named fraud templates defined from known UPI fraud patterns:

| Template            | Signature                                                |
| ------------------- | -------------------------------------------------------- |
| `SCREEN_SHARE_SCAM` | new_device + high_amount + OTP-window timing             |
| `OTP_RELAY_SCAM`    | rapid small transactions followed by large withdrawal    |
| `MULE_FUNNEL`       | high fan_in + single large outflow within 6 hours        |
| `SOCIAL_ENG_GIFT`   | new_beneficiary + festival_day + amount_10x_baseline     |
| `SLEEPING_MULE`     | account_inactive_30d + sudden_high_velocity_inflow       |

Each transaction is matched against templates using rule-based feature checks. Match → template label added to the explanation card.

### 3.7 Operator Feedback Loop

```
Operator clicks "Confirm Fraud" / "False Alarm" / "Investigate"
  │
  ▼
POST /api/v1/decision
  │
  ▼
SQLite: operator_labels table
  {txn_id, decision, operator_id, timestamp, notes}
  │
  ▼
Retraining trigger:
  - Collect decisions since last retrain
  - If new_labels >= 50 OR time_since_retrain >= 6h:
      trigger background retrain
  - Incremental LightGBM update with new labeled data
  - Save new model version with performance metrics
  │
  ▼
Dashboard: "Model last retrained Xh ago · F1 improved by +0.02"
```

---

## 4. Database Schema

```sql
-- Core transaction record
CREATE TABLE transactions (
    id              TEXT PRIMARY KEY,
    sender_upi      TEXT NOT NULL,
    receiver_upi    TEXT NOT NULL,
    amount          REAL NOT NULL,
    timestamp       DATETIME NOT NULL,
    device_id       TEXT,
    lat             REAL,
    lon             REAL,
    risk_score      INTEGER,
    risk_level      TEXT,         -- green | yellow | red
    rule_flags      TEXT,         -- JSON array
    shap_values     TEXT,         -- JSON object
    fraud_template  TEXT,         -- matched template or null
    explanation     TEXT,
    explanation_hi  TEXT,         -- Hindi translation
    operator_decision TEXT,       -- block | allow | investigate | null
    operator_id     TEXT,
    decided_at      DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pre-computed account intelligence (updated by Track B every 15 min)
CREATE TABLE account_profiles (
    upi_id              TEXT PRIMARY KEY,
    txn_count_total     INTEGER DEFAULT 0,
    txn_count_7d        INTEGER DEFAULT 0,
    avg_amount_7d       REAL,
    avg_amount_30d      REAL,
    peer_cohort_id      TEXT,
    history_tier        TEXT,     -- personal | blended | new_account
    account_age_days    INTEGER,
    linked_bank_type    TEXT,
    drain_ratio_24h     REAL DEFAULT 0,
    fan_in_count_1h     INTEGER DEFAULT 0,
    betweenness_centrality REAL DEFAULT 0,
    louvain_community   INTEGER,
    community_fraud_density REAL DEFAULT 0,
    graph_contagion_score REAL DEFAULT 0,
    mule_suspect        BOOLEAN DEFAULT FALSE,
    mule_flagged_at     DATETIME,
    last_active_at      DATETIME,
    last_device_id      TEXT,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Operator decisions for retraining
CREATE TABLE operator_labels (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    txn_id          TEXT NOT NULL,
    decision        TEXT NOT NULL,    -- fraud | legitimate | investigate
    operator_id     TEXT,
    notes           TEXT,
    used_in_retrain BOOLEAN DEFAULT FALSE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Peer cohort definitions
CREATE TABLE peer_cohorts (
    cohort_id           TEXT PRIMARY KEY,
    city_tier           INTEGER,      -- 1 | 2 | 3
    account_type        TEXT,
    spend_bracket       TEXT,
    median_daily_spend  REAL,
    p95_single_txn      REAL,
    median_txn_count    REAL,
    sample_size         INTEGER
);

-- Model version tracking
CREATE TABLE model_versions (
    version_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    trained_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    training_samples INTEGER,
    precision       REAL,
    recall          REAL,
    f1_score        REAL,
    auc_roc         REAL,
    notes           TEXT,
    is_active       BOOLEAN DEFAULT FALSE
);
```

---

## 5. API Contract

### 5.1 Score Transaction

```
POST /api/v1/score

Request:
{
  "transaction_id": string,         // unique ID, format: txn_[a-z0-9]{8}
  "sender_upi": string,             // e.g. "rajesh.k@okaxis"
  "receiver_upi": string,
  "amount": number,                 // INR, positive
  "timestamp": string,              // ISO 8601
  "device_id": string,
  "lat": number | null,
  "lon": number | null
}

Response (synchronous, <50ms):
{
  "transaction_id": string,
  "risk_score": integer,            // 0-100
  "risk_level": "green" | "yellow" | "red",
  "rule_flags": string[],
  "fraud_template": string | null,
  "top_shap_features": [
    { "feature": string, "contribution": number }
  ],
  "temporal_context": {
    "is_festival_day": boolean,
    "festival_name": string | null,
    "threshold_multiplier": number
  },
  "account_tier": "personal" | "blended" | "new_account",
  "explanation_status": "generating" | "ready",
  "explanation": string | null,
  "latency_ms": number
}
```

### 5.2 WebSocket Streams

**Live transaction feed:**
```
WS /ws/transactions
→ streams every scored transaction as JSON in real time
```

**Async explanation delivery:**
```
WS /ws/explanations/{transaction_id}
→ fires once when explanation is ready
{
  "transaction_id": string,
  "explanation": string,
  "explanation_hi": string,
  "generation_ms": number,
  "llm_source": "groq" | "gemini" | "template"
}
```

### 5.3 Operator Decision

```
POST /api/v1/decision

Request:
{
  "transaction_id": string,
  "decision": "block" | "allow" | "investigate",
  "operator_id": string,
  "notes": string | null
}

Response:
{
  "status": "recorded",
  "label_count_since_retrain": integer,
  "next_retrain_trigger": integer
}
```

### 5.4 Account Profile

```
GET /api/v1/account/{upi_id}/profile

Response:
{
  "upi_id": string,
  "risk_level": "low" | "medium" | "high" | "mule_suspect",
  "mule_suspect": boolean,
  "graph_metrics": {
    "drain_ratio_24h": number,
    "fan_in_count_1h": integer,
    "betweenness_centrality": number,
    "louvain_community": integer,
    "community_fraud_density": number
  },
  "transaction_summary": { ... },
  "recent_flags": [ ... ]
}
```

---

## 6. Data Flow Diagrams

### 6.1 Happy path — low-risk transaction

```
Transaction arrives
      │
      ▼
Feature Extractor (2ms) → pulls cached account profile
      │
      ▼
Rule Engine (1ms) → no rules fire
      │
      ▼
LightGBM Scorer (5ms) → score = 12
      │
      ▼
Temporal Context check (1ms) → not a festival day
      │
      ▼
Response: {risk_score: 12, risk_level: "green"} ← 9ms total
      │
      ▼
No background task spawned (green transactions skip LLM)
```

### 6.2 High-risk transaction with explanation

```
Transaction arrives
      │
      ▼
Feature Extractor (3ms) → new_device_flag=1, new_beneficiary=1
      │
      ▼
Rule Engine (1ms) → fires R03 (new device + new beneficiary + high amount)
      │
      ▼
LightGBM Scorer (5ms) → score = 94, shap = [amount:+38, device:+26, graph:+22]
      │
      ▼
Fraud DNA check (1ms) → matches SCREEN_SHARE_SCAM template
      │
      ▼
Response: {risk_score: 94, risk_level: "red", explanation_status: "generating"} ← 10ms
      │
      │ (response already sent, background task spawns)
      ▼
BackgroundTask: call Groq API with SHAP context (800ms)
      │
      ▼
WebSocket push: explanation delivered to dashboard ← total 810ms after txn
```

---

## 7. Performance Targets

| Metric                       | Target  | Notes                     |
| ---------------------------- | ------- | ------------------------- |
| Sync scoring latency (p50)   | < 30ms  | Rule + LightGBM inference |
| Sync scoring latency (p99)   | < 50ms  | Including DB read         |
| Async explanation (p50)      | < 1.5s  | Groq API                  |
| Async explanation (fallback) | < 10ms  | Template system           |
| Batch graph analytics        | < 60s   | For 50K accounts          |
| Dashboard live feed lag      | < 200ms | WebSocket                 |
| Model retrain time           | < 2 min | Incremental LightGBM      |

---

## 8. Security Considerations (For Production Roadmap)

The following are flagged as production requirements, not implemented in the hackathon prototype:

- **Auth**: All API endpoints require JWT bearer token authentication
- **Encryption**: All data at rest encrypted (AES-256). SQLite replaced with PostgreSQL + encryption at rest.
- **PII masking**: UPI IDs partially masked in logs (e.g. `r***h.k@okaxis`)
- **Audit trail**: Every scoring decision and operator action is immutably logged
- **Rate limiting**: Score endpoint limited to 1,000 requests/minute per bank API key
- **TLS**: All HTTP and WebSocket traffic over TLS 1.3
- **Secret management**: `GROQ_API_KEY` and other secrets managed via Render environment variables, never committed to git

---

## 9. Scalability Notes (For Production Roadmap)

The hackathon prototype uses a single-process FastAPI + SQLite architecture. For production:

- Replace SQLite with PostgreSQL (horizontal read replicas)
- Replace BackgroundTasks with Celery + Redis for distributed explanation generation
- Replace APScheduler with Apache Airflow for batch pipeline orchestration
- Add a Redis cache layer for account profile lookups (sub-millisecond vs 3ms SQLite)
- Kafka or Pulsar for the transaction ingestion stream
- The LightGBM model is already stateless and can be replicated across N API pods behind a load balancer with zero changes

---

*Design document v1.0 — hackathon prototype scope*
