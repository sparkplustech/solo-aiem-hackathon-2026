# DRISHTI — Tech Stack

> Every tool used in DRISHTI is free. Total infrastructure cost: ₹0.

---

## Backend

| Component       | Tool / Library            | Version  | Why                                                             |
| --------------- | ------------------------- | -------- | --------------------------------------------------------------- |
| API Framework   | FastAPI                   | 0.110+   | Async-native, automatic OpenAPI docs, WebSocket support built-in |
| ASGI Server     | Uvicorn                   | 0.29+    | High-performance ASGI; pairs natively with FastAPI              |
| ML Model        | LightGBM                  | 4.x      | Fast gradient boosting; ~5ms inference on CPU; small pkl size   |
| Explainability  | SHAP (shap)               | 0.45+    | TreeExplainer for LightGBM; per-transaction feature attribution |
| Graph Analytics | NetworkX                  | 3.x      | Build and query directed transaction graphs                     |
| Community Detect| python-louvain            | 0.16     | Louvain modularity-based clustering on NetworkX graphs          |
| LLM Narration   | Groq API (Llama 3.1 70B)  | Free tier| Sub-second inference for plain-English fraud explanations       |
| LLM Fallback    | Template system           | —        | Static explanation templates; < 1ms; no external dependency     |
| Scheduler       | APScheduler               | 3.x      | Background batch jobs (mule detection every 15 min)             |
| Database        | SQLite (aiosqlite)        | Built-in | Zero-config; async reads/writes; sufficient for prototype scale |
| Validation      | Pydantic v2               | 2.x      | Request/response models; model_dump() API                       |
| Data Classes    | Python dataclasses        | Built-in | Lightweight internal DTOs                                       |
| Environment     | python-dotenv             | —        | Load GROQ_API_KEY and config from .env                          |

---

## Machine Learning

| Component          | Tool / Library      | Why                                                             |
| ------------------ | ------------------- | --------------------------------------------------------------- |
| Training framework | LightGBM            | Handles class imbalance (is_unbalance); fast on CPU             |
| Class balancing    | imbalanced-learn    | SMOTE oversampling for ~2% fraud prevalence                     |
| Feature engineering| pandas + NumPy      | Velocity windows, rolling stats, cohort z-scores               |
| Data generation    | Faker               | Realistic synthetic Indian UPI data (names, VPAs, amounts)      |
| Model evaluation   | scikit-learn        | Precision, recall, F1, AUC-ROC, confusion matrix               |
| Federated sim      | Custom Python       | FedAvg aggregation across 3 in-memory bank objects             |
| Drift monitoring   | Custom (PSI)        | Population Stability Index computed from scoring logs           |
| Notebooks          | Google Colab        | Free GPU/CPU for training; no local setup required              |

---

## Frontend

| Component      | Tool / Library        | Version | Why                                                          |
| -------------- | --------------------- | ------- | ------------------------------------------------------------ |
| Framework      | Next.js (App Router)  | 14+     | SSR + CSR; file-based routing; Vercel-native deploy          |
| Styling        | Tailwind CSS          | 3.x     | Utility-first; dark mode; zero custom CSS overhead           |
| Charts         | Recharts              | 2.x     | React-native charting; SHAP waterfall + benchmark bars       |
| Graph viz      | react-force-graph-2d  | Latest  | Force-directed mule network graph; dynamic import for SSR    |
| Map            | react-simple-maps     | 1.x     | India choropleth fraud heatmap; TopoJSON projection          |
| Fonts          | Inter + JetBrains Mono| —       | Dashboard + monospace for transaction IDs                    |
| Animations     | CSS keyframes         | —       | slideUp, fadeIn, count-up for header stats                   |
| Language       | TypeScript            | 5.x     | Full type safety across components                           |

---

## Desktop

| Component    | Tool        | Why                                                         |
| ------------ | ----------- | ----------------------------------------------------------- |
| Shell        | Electron    | Cross-platform desktop wrapper for the Next.js frontend     |
| Purpose      | Local demo  | Runs DRISHTI dashboard offline without a browser or server  |

---

## Infrastructure & Deployment

| Component      | Tool           | Cost      | Notes                                               |
| -------------- | -------------- | --------- | --------------------------------------------------- |
| Backend host   | Render.com     | Free tier | Auto-deploy from GitHub; `render.yaml` committed    |
| Frontend host  | Vercel         | Free tier | Auto-deploy from GitHub; NEXT_PUBLIC_API_URL env var|
| Keep-alive     | cron-job.org   | Free      | Pings Render every 10 min to prevent spin-down      |
| Local tunnel   | (dev only)     | Free      | Used during development; not needed in production   |
| CI/CD          | None           | —         | Direct push to main; Render + Vercel auto-deploy    |

---

## Dev Tools & Utilities

| Tool            | Purpose                                     |
| --------------- | ------------------------------------------- |
| Git             | Version control                             |
| VS Code         | Primary IDE                                 |
| PowerShell      | Windows automation scripts                  |
| Python 3.10+    | Backend and ML runtime                      |
| Node.js 18+     | Frontend runtime                            |
| pip             | Python package management                   |
| npm             | Node package management                     |

---

## Total Cost Breakdown

| Category       | Tool          | Cost |
| -------------- | ------------- | ---- |
| Backend host   | Render.com    | ₹0   |
| Frontend host  | Vercel        | ₹0   |
| LLM API        | Groq          | ₹0   |
| Training       | Google Colab  | ₹0   |
| Database       | SQLite        | ₹0   |
| All libraries  | Open source   | ₹0   |
| **Total**      |               | **₹0** |
