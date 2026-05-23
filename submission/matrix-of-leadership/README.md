# Project Title
DRISHTI — Detection & Real-time Intelligence for Securing Transactions in India

## Team Name
Matrix of Leadership

## Team Members
- Ashwith Shetty
- Shivam Gawade

## Selected Domain
AI Automation / Finance

## Problem Statement
India processes over 131 billion UPI transactions annually. However, the surge in digital payment fraud—particularly social-engineering scams, mule account networks, and fund laundering schemes—poses a significant threat to millions of users. Current fraud detection systems are either too rigid (rule-based) or completely opaque (black-box ML), making it impossible for compliance teams to explain why a transaction was flagged, and they often miss fraud patterns hidden in transaction networks. Banks need a real-time, explainable fraud detection system that:
- Scores every transaction in under 50ms (synchronous path)
- Explains decisions in plain English for regulatory compliance
- Detects mule-account clusters across networks
- Reduces false positives using dynamic peer-group baselines

## Solution
DRISHTI is a **hybrid fraud detection engine** combining three complementary techniques:
1. **Rule Engine** — Hard, instant filters for obvious fraud patterns (blocked banks, known fraudsters)
2. **LightGBM ML Model** — Fast gradient-boosting scoring with feature-level explainability via SHAP
3. **Graph Analytics** — Louvain community detection to find mule account clusters and money-flow funnels

The system produces a risk score (RED/YELLOW/GREEN) and an AI-generated plain-English explanation for every flagged transaction. Fraud-ops staff get a live web dashboard to review, block, or appeal decisions. Every ops action feeds back as a training label for model retraining. The entire stack runs on free-tier tools, requiring ₹0 infrastructure cost.

## Tech Stack Used
- **Backend:** FastAPI + Uvicorn + Python 3.10+
- **Frontend:** Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **ML / Data:** LightGBM, scikit-learn, SHAP, pandas, NumPy
- **Graph Analytics:** NetworkX + python-louvain
- **LLM / Explainability:** Groq API (Llama 3.1 70B) + SHAP TreeExplainer
- **Scheduling:** APScheduler (batch mule detection every 15 min)
- **Database:** SQLite (aiosqlite for async I/O)
- **Charting / Visualization:** Recharts, react-force-graph-2d, react-simple-maps
- **Desktop App:** Electron
- **Hosting:** Render (backend), Vercel (frontend), Google Colab (training)

## AI Tools Used
- **Groq API** — Real-time LLM inference for plain-English fraud explanations
- **SHAP (SHapley Additive exPlanations)** — Per-transaction feature attribution for LightGBM
- **LightGBM** — Fast, interpretable gradient-boosting ML model for scoring
- **python-louvain** — Louvain modularity-based community detection for mule clusters
- **Google Colab** — Free GPU/CPU for model training and feature engineering

## Features
- **Real-time transaction scoring** — Sub-50ms risk score (GREEN/YELLOW/RED) per UPI transaction
- **Three-layer hybrid engine** — Rules + ML + graph analytics working in tandem
- **SHAP-driven explainability cards** — Plain-English explanations per flagged transaction
- **Mule account detection** — Graph community detection finds funnel-and-drain clusters
- **Peer-group baseline** — Each user benchmarked against a dynamic cohort; reduces false positives
- **Temporal context** — Festival/salary-day threshold scaling (Diwali, Eid, salary dates)
- **Adversarial simulation** — Demonstrates evasion resistance (smurfing, hop laundering, sleeping mule tactics)
- **Precision-recall tuning** — Fraud ops can slider adjust false-positive/recall tradeoff
- **Bilingual explanations** — English and Hindi support
- **Operator feedback loop** — Every ops decision feeds back as a training label
- **Live fraud heatmap** — Choropleth map of India showing flagged transaction density by state
- **Customer alerts** — Mock SMS/in-app warnings for high-risk transactions
- **Model drift monitor** — PSI-based feature drift detection
- **Desktop companion app** — Electron-based offline viewer for demo and analysis

## How to Run the Project

### Prerequisites
- **Python 3.10+** (backend & ML)
- **Node.js 18+** (frontend)
- **Git**
- **Groq API Key** (free tier) — sign up at https://console.groq.com

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/ShivamGawade-XS/DRISHTI.git
   cd DRISHTI/backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `backend/` folder:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   DATABASE_URL=sqlite:///drishti.db
   ENVIRONMENT=development
   ```

5. Run the backend:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the interactive API docs.

### Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   The dashboard will be available at `http://localhost:3000`.

### ML / Training (Optional)
1. Navigate to the ML folder:
   ```bash
   cd ../ml
   ```

2. Install ML dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Generate synthetic data and train the model:
   ```bash
   python generate_data.py
   python train.py
   ```
   The trained model will be saved to `artifacts/` and automatically used by the backend.

### Full Stack via Docker (If Available)
```bash
docker-compose up
```

## Demo / Screenshots
**Live Demo URLs:**
- **Frontend (Fraud Ops Dashboard):** https://frontend-glw67lvff-shivamgawade-xs-projects.vercel.app/dashboard
- **Backend API Docs:** Currently unavailable due to deployment configuration (run locally at `http://localhost:8000/docs`)

**Key Dashboard Tabs:**
- **Transactions Feed** — Real-time flagged transactions with risk scores and explanations
- **Mule Graph** — Force-directed graph showing account clusters and money-flow patterns
- **Fraud Heatmap** — Choropleth map of India with transaction density by state
- **Adversarial Simulation** — Sandbox to test evasion tactics (smurfing, layering, etc.)
- **Compliance Reports** — Model performance metrics and drift monitoring

## Future Scope

### Immediate Enhancements
- **Federated Learning** — Aggregate models across multiple partner banks securely
- **Mobile App** — Native iOS/Android alerts for high-risk transactions
- **Multi-currency Support** — Extend beyond UPI to cross-border and crypto payments
- **Real Bank Integration** — Plug into a production core-banking system with regulatory approval
- **Live PII Data Pipeline** — Replace synthetic data with anonymized production transactions

### Medium-term Roadmap
- **GNN-based Mule Detection** — Train a Graph Neural Network (GraphSAGE/GCN) on labeled mule clusters
- **Time-series Anomaly Detection** — LSTM/Temporal CNN for account velocity anomalies
- **Customer Risk Scoring** — Tier customers by risk level; adjust alerts per tier
- **API Rate Limiting & SLA Monitoring** — Production-grade SLO tracking
- **Audit Trail & Explainability API** — Regulatory-grade evidence export (PDF/JSON)

### Long-term Vision
- **Industry Collaboration** — Propose DRISHTI as an open-source standard for Indian fintech
- **RBI Integration** — Partner with regulators to feed fraud signals into national fraud registry
- **Multi-rail Support** — Extend to NEFT, RTGS, Card networks, and BNPL fraud detection
- **AI Governance Framework** — Implement fairness, bias auditing, and explainability compliance tooling

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DRISHTI SYSTEM                           │
│                                                                 │
│  Transaction Stream                                             │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ Rule Engine │───▶│  LightGBM    │───▶│  Risk Score +    │   │
│  │ (sync)      │    │  Scorer      │    │  SHAP Values     │   │
│  └─────────────┘    └──────────────┘    └──────────────────┘   │
│                                                │                │
│                         (async background)     ▼                │
│  ┌──────────────────┐                  ┌──────────────────┐    │
│  │ Graph Analytics  │◀─── batch/15min  │  LLM Explanation │    │
│  │ (NetworkX+Louvain│                  │  (Groq/template) │    │
│  └──────────────────┘                  └──────────────────┘    │
│          │                                      │               │
│          ▼                                      ▼               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Fraud Ops Dashboard (Next.js)            │  │
│  │  Live feed │ Explainability │ Mule graph │ Heatmap        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack (100% Free)

| Layer           | Tool                      | Cost            |
| --------------- | ------------------------- | --------------- |
| Backend API     | FastAPI + Uvicorn         | Free            |
| ML Model        | LightGBM + scikit-learn   | Free            |
| Explainability  | SHAP                      | Free            |
| Graph Analytics | NetworkX + python-louvain | Free            |
| LLM Narration   | Groq API (Llama 3.1 70B)  | Free tier       |
| Scheduler       | APScheduler               | Free            |
| Database        | SQLite                    | Free (built-in) |
| Frontend        | Next.js + Tailwind CSS    | Free            |
| Charts          | Recharts                  | Free            |
| Graph viz       | react-force-graph         | Free            |
| Map             | react-simple-maps         | Free            |
| Desktop app     | Electron                  | Free            |
| Training        | Google Colab              | Free            |
| Data gen        | Faker + NumPy + pandas    | Free            |
| Backend host    | Render.com                | Free tier       |
| Frontend host   | Vercel                    | Free tier       |

**Total infrastructure cost: ₹0**

---

## Project Structure

```
drishti/
├── backend/
│   ├── main.py                  # FastAPI app, all routes, WebSocket
│   ├── engine/
│   │   ├── rules.py             # Hard rule engine
│   │   ├── scorer.py            # LightGBM inference + SHAP
│   │   ├── graph.py             # NetworkX mule detection
│   │   ├── explainer.py         # SHAP → LLM narration
│   │   └── temporal.py          # Festival/salary-day context
│   ├── models/
│   │   └── lgbm_model.pkl       # Trained model
│   ├── data/
│   │   ├── transactions.db      # SQLite database
│   │   └── peer_cohorts.json    # Cohort definitions
│   ├── scheduler.py             # APScheduler batch jobs
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/
│   ├── generate_data.py         # Synthetic UPI data generator
│   ├── feature_engineering.py  # All 40+ features
│   ├── train.py                 # LightGBM training + evaluation
│   ├── federated_sim.py         # FedAvg simulation across 3 banks
│   ├── benchmark.py             # Rules vs LightGBM vs DRISHTI
│   └── notebooks/
│       ├── 01_data_exploration.ipynb
│       ├── 02_model_training.ipynb
│       └── 03_benchmark_results.ipynb
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx             # Main dashboard
│   │   ├── mule-graph/page.tsx  # Mule network visualisation
│   │   ├── heatmap/page.tsx     # India fraud heatmap
│   │   └── adversarial/page.tsx # Evasion simulation tab
│   ├── components/
│   │   ├── TransactionFeed.tsx
│   │   ├── ExplainabilityCard.tsx
│   │   ├── RiskThresholdSlider.tsx
│   │   ├── ModelHealthWidget.tsx
│   │   └── CustomerAlertMock.tsx
│   └── package.json
│
├── desktop/
│   └── ...                      # Electron companion app for local demo
│
├── README.md
├── DESIGN_DOC.md
├── PRD.md
├── TECHSTACK.md
└── CHANGELOG.md
```

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Git
- A free [Groq API key](https://console.groq.com) (takes 2 minutes)
- A free [Render.com](https://render.com) account
- A free [Vercel](https://vercel.com) account

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/ShivamGawade-XS/DRISHTI.git
cd DRISHTI
```

### 2. Generate synthetic data and train the model

Open `ml/notebooks/02_model_training.ipynb` in Google Colab, run all cells. This will:

- Generate 100,000 synthetic UPI transactions with 5 fraud templates
- Engineer 40+ features
- Train LightGBM with SMOTE class balancing
- Export `lgbm_model.pkl` to `backend/models/`

Or run locally:

```bash
cd ml
pip install -r requirements.txt
python generate_data.py        # creates data/transactions_raw.csv
python feature_engineering.py # creates data/transactions_features.csv
python train.py                # trains model, exports lgbm_model.pkl
python benchmark.py            # prints rules vs LightGBM vs DRISHTI comparison
```

### 3. Start the backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env           # add your GROQ_API_KEY
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### 4. Start the frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Dashboard runs at `http://localhost:3000`

---

## API Reference

### Score a transaction

```
POST /api/v1/score
Content-Type: application/json

{
  "transaction_id": "txn_abc123",
  "sender_upi": "rajesh.k@okaxis",
  "receiver_upi": "newmerchant92@ybl",
  "amount": 18500,
  "timestamp": "2025-01-15T02:47:00",
  "device_id": "dev_xyz_new",
  "lat": 19.0760,
  "lon": 72.8777
}
```

```json
{
  "transaction_id": "txn_abc123",
  "risk_score": 94,
  "risk_level": "red",
  "rule_flags": ["new_device", "new_beneficiary", "night_hour"],
  "top_shap_features": [
    {"feature": "amount_vs_7d_avg", "contribution": 38},
    {"feature": "new_device_flag", "contribution": 26},
    {"feature": "graph_contagion_score", "contribution": 22}
  ],
  "explanation_status": "generating",
  "latency_ms": 38
}
```

Explanation arrives async via WebSocket at `ws://localhost:8000/ws/explanations/{transaction_id}`

### Get account intelligence

```
GET /api/v1/account/{upi_id}/profile
```

### Operator decision

```
POST /api/v1/decision
{
  "transaction_id": "txn_abc123",
  "decision": "block",
  "operator_id": "ops_001",
  "notes": "confirmed mule hop"
}
```

### WebSocket — live transaction stream

```
ws://localhost:8000/ws/transactions
```

Streams scored transactions in real time for the dashboard feed.

---

## Running the Benchmark

```bash
cd ml
python benchmark.py
```

Expected output:

```
Model               Precision   Recall   F1      AUC-ROC
─────────────────────────────────────────────────────────
Rules only          0.71        0.58     0.64    0.72
LightGBM only       0.82        0.76     0.79    0.84
DRISHTI (hybrid)    0.89        0.87     0.88    0.93
```

---

## Deployment

### Backend → Render.com

1. Push `backend/` to GitHub
2. New Web Service on Render → connect repo → set `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Add environment variable `GROQ_API_KEY`
4. Add a free cron ping at [cron-job.org](https://cron-job.org) to prevent spin-down

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on Vercel
3. Add environment variable `NEXT_PUBLIC_API_URL=https://your-render-url.onrender.com`
4. Deploy — done in under 2 minutes

---

## Environment Variables

```env
# backend/.env
GROQ_API_KEY=your_groq_key_here
USE_TEMPLATE_FALLBACK=false       # set true during demo for reliability
BATCH_INTERVAL_MINUTES=15
RISK_THRESHOLD_RED=80
RISK_THRESHOLD_YELLOW=50
DB_PATH=data/transactions.db
```

---

## Regulatory Alignment

| Initiative                                        | How DRISHTI aligns                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| RBI DPIP (Digital Payments Intelligence Platform) | Federated simulation shows cross-bank model aggregation without raw data sharing                  |
| NPCI Zero Financial Frauds goal                   | Real-time blocking + customer confirmation targets social-engineering — #1 UPI fraud vector       |
| RBI mule account directive (2024–25)              | Graph-based mule detection directly implements monitoring requirements for high-velocity accounts |
| RBI explainability guidelines                     | Every decision has SHAP-driven human-readable justification for audit trail                       |

---

## License

MIT License — free to use, modify, and distribute.

---

*Built for the finance-domain hackathon track. Total build cost: ₹0.*
