// ============================================================
// DRISHTI — Mock Data for standalone mode
// ============================================================

import {
  Transaction,
  ModelMetrics,
  DashboardStats,
  AuditLogEntry,
  MuleGraphData,
  StateFraudData,
  AdversarialScenario,
  RiskLevel,
} from "./types";

// Helpers
const randomId = () => Math.random().toString(36).substring(2, 10).toUpperCase();
const randomAmount = () => Math.round(Math.random() * 450000 + 500);
const randomScore = () => Math.round(Math.random() * 100);

const names = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sunita Gupta", "Vikram Singh",
  "Neha Verma", "Deepak Joshi", "Anita Reddy", "Manoj Tiwari", "Kavita Nair",
  "Suresh Menon", "Pooja Agarwal", "Ravi Shankar", "Meera Iyer", "Arun Kapoor",
  "Shalini Das", "Rahul Malhotra", "Divya Pillai", "Kiran Rao", "Sneha Banerjee",
];

const channels = ["UPI", "NEFT", "IMPS", "RTGS", "UPI"];
const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"];

function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return "RED";
  if (score >= 50) return "YELLOW";
  return "GREEN";
}

function statusFromRisk(level: RiskLevel): "approved" | "flagged" | "blocked" {
  if (level === "RED") return "blocked";
  if (level === "YELLOW") return "flagged";
  return "approved";
}

export function generateMockTransaction(index?: number): Transaction {
  const score = randomScore();
  const risk = riskLevelFromScore(score);
  const senderIdx = Math.floor(Math.random() * names.length);
  let receiverIdx = Math.floor(Math.random() * names.length);
  if (receiverIdx === senderIdx) receiverIdx = (receiverIdx + 1) % names.length;

  const now = new Date();
  if (index !== undefined) {
    now.setSeconds(now.getSeconds() - index * 3);
  }

  return {
    id: `TXN-${randomId()}`,
    timestamp: now.toISOString(),
    sender: names[senderIdx],
    receiver: names[receiverIdx],
    amount: randomAmount(),
    riskScore: score,
    riskLevel: risk,
    status: statusFromRisk(risk),
    channel: channels[Math.floor(Math.random() * channels.length)],
    location: cities[Math.floor(Math.random() * cities.length)],
    explanation: {
      topFeatures: [
        { feature: "Transaction velocity (24h)", importance: score > 50 ? 0.85 : 0.15, direction: score > 50 ? "positive" : "negative" },
        { feature: "Amount deviation from avg", importance: score > 60 ? 0.72 : 0.10, direction: score > 60 ? "positive" : "negative" },
        { feature: "New beneficiary flag", importance: score > 70 ? 0.65 : 0.08, direction: score > 70 ? "positive" : "negative" },
        { feature: "Time-of-day anomaly", importance: score > 40 ? 0.48 : 0.05, direction: score > 40 ? "positive" : "negative" },
        { feature: "Geo-location deviation", importance: Math.random() * 0.5, direction: Math.random() > 0.5 ? "positive" : "negative" },
        { feature: "Device fingerprint match", importance: Math.random() * 0.3, direction: "negative" },
      ],
      plainEnglish: score >= 80
        ? "High-risk transaction: Unusually large amount sent to a new beneficiary at an unusual hour with high transaction velocity."
        : score >= 50
        ? "Medium-risk: Some unusual patterns detected including elevated transaction frequency and minor amount deviation."
        : "Low-risk transaction: All patterns within normal behavioral baseline.",
      hindi: score >= 80
        ? "उच्च जोखिम लेनदेन: असामान्य समय पर नए लाभार्थी को असामान्य रूप से बड़ी राशि भेजी गई।"
        : score >= 50
        ? "मध्यम जोखिम: कुछ असामान्य पैटर्न पाए गए जिनमें लेनदेन की बढ़ी हुई आवृत्ति शामिल है।"
        : "कम जोखिम लेनदेन: सभी पैटर्न सामान्य व्यवहार आधार रेखा के भीतर।",
      fraudDna: score >= 80 ? "SPLIT_AND_MERGE" : score >= 50 ? "VELOCITY_SPIKE" : null,
      templateMatch: score >= 50 ? Math.round(70 + Math.random() * 25) : null,
    },
  };
}

export function generateMockTransactions(count: number = 30): Transaction[] {
  return Array.from({ length: count }, (_, i) => generateMockTransaction(i));
}

export const mockStats: DashboardStats = {
  totalTransactions: 1847293,
  fraudDetected: 2847,
  falsePositiveRate: 3.2,
  avgLatency: 45,
  uptimePercent: 99.97,
};

export const mockModelMetrics: ModelMetrics = {
  precision: 0.94,
  recall: 0.91,
  f1: 0.925,
  aucRoc: 0.978,
  lastTrained: "2026-05-22T06:30:00Z",
  psiDrift: 0.08,
  psiThreshold: 0.2,
};

export const mockAuditLog: AuditLogEntry[] = [
  { id: "A1", timestamp: "2026-05-22T08:15:00Z", operator: "Operator Mehra", action: "OVERRIDE_APPROVE", detail: "Overrode block on TXN-4F2A → false positive confirmed" },
  { id: "A2", timestamp: "2026-05-22T08:10:00Z", operator: "Operator Singh", action: "THRESHOLD_CHANGE", detail: "Red threshold adjusted from 0.75 to 0.80" },
  { id: "A3", timestamp: "2026-05-22T08:05:00Z", operator: "System", action: "MODEL_RETRAIN", detail: "Automated retraining triggered — PSI drift detected" },
  { id: "A4", timestamp: "2026-05-22T07:58:00Z", operator: "Operator Nair", action: "BLOCK_ACCOUNT", detail: "Account ACC-7821 blocked — confirmed mule suspect" },
  { id: "A5", timestamp: "2026-05-22T07:45:00Z", operator: "Operator Das", action: "ESCALATE", detail: "TXN-9B3E escalated to senior analyst — complex pattern" },
  { id: "A6", timestamp: "2026-05-22T07:30:00Z", operator: "System", action: "ALERT_SENT", detail: "Customer alert sent for TXN-6D1C — awaiting response" },
];

const communityColors = ["#B87333", "#A34333", "#B87333", "#7D8C6C", "#a855f7", "#f97316"];

export const mockMuleGraph: MuleGraphData = {
  nodes: [
    { id: "ACC-001", label: "Rajesh K.", community: 0, betweenness: 0.85, isMuleSuspect: true, riskScore: 92, transactionCount: 47 },
    { id: "ACC-002", label: "Priya S.", community: 0, betweenness: 0.42, isMuleSuspect: false, riskScore: 35, transactionCount: 12 },
    { id: "ACC-003", label: "Amit P.", community: 0, betweenness: 0.65, isMuleSuspect: true, riskScore: 88, transactionCount: 38 },
    { id: "ACC-004", label: "Sunita G.", community: 1, betweenness: 0.30, isMuleSuspect: false, riskScore: 22, transactionCount: 8 },
    { id: "ACC-005", label: "Vikram S.", community: 1, betweenness: 0.78, isMuleSuspect: true, riskScore: 91, transactionCount: 55 },
    { id: "ACC-006", label: "Neha V.", community: 1, betweenness: 0.25, isMuleSuspect: false, riskScore: 18, transactionCount: 5 },
    { id: "ACC-007", label: "Deepak J.", community: 2, betweenness: 0.55, isMuleSuspect: false, riskScore: 45, transactionCount: 22 },
    { id: "ACC-008", label: "Anita R.", community: 2, betweenness: 0.70, isMuleSuspect: true, riskScore: 87, transactionCount: 41 },
    { id: "ACC-009", label: "Manoj T.", community: 2, betweenness: 0.38, isMuleSuspect: false, riskScore: 30, transactionCount: 15 },
    { id: "ACC-010", label: "Kavita N.", community: 3, betweenness: 0.90, isMuleSuspect: true, riskScore: 95, transactionCount: 62 },
    { id: "ACC-011", label: "Suresh M.", community: 3, betweenness: 0.20, isMuleSuspect: false, riskScore: 12, transactionCount: 3 },
    { id: "ACC-012", label: "Pooja A.", community: 3, betweenness: 0.45, isMuleSuspect: false, riskScore: 42, transactionCount: 19 },
    { id: "ACC-013", label: "Ravi S.", community: 0, betweenness: 0.33, isMuleSuspect: false, riskScore: 28, transactionCount: 10 },
    { id: "ACC-014", label: "Meera I.", community: 1, betweenness: 0.50, isMuleSuspect: false, riskScore: 55, transactionCount: 25 },
    { id: "ACC-015", label: "Arun K.", community: 2, betweenness: 0.60, isMuleSuspect: false, riskScore: 48, transactionCount: 20 },
  ],
  links: [
    { source: "ACC-001", target: "ACC-002", amount: 250000, count: 8 },
    { source: "ACC-001", target: "ACC-003", amount: 480000, count: 15 },
    { source: "ACC-001", target: "ACC-013", amount: 120000, count: 4 },
    { source: "ACC-003", target: "ACC-002", amount: 180000, count: 6 },
    { source: "ACC-003", target: "ACC-013", amount: 95000, count: 3 },
    { source: "ACC-004", target: "ACC-005", amount: 350000, count: 12 },
    { source: "ACC-005", target: "ACC-006", amount: 420000, count: 18 },
    { source: "ACC-005", target: "ACC-014", amount: 200000, count: 7 },
    { source: "ACC-014", target: "ACC-004", amount: 150000, count: 5 },
    { source: "ACC-007", target: "ACC-008", amount: 310000, count: 10 },
    { source: "ACC-008", target: "ACC-009", amount: 275000, count: 9 },
    { source: "ACC-008", target: "ACC-015", amount: 180000, count: 6 },
    { source: "ACC-015", target: "ACC-007", amount: 140000, count: 4 },
    { source: "ACC-010", target: "ACC-011", amount: 520000, count: 20 },
    { source: "ACC-010", target: "ACC-012", amount: 390000, count: 14 },
    { source: "ACC-012", target: "ACC-011", amount: 85000, count: 2 },
    { source: "ACC-001", target: "ACC-005", amount: 680000, count: 22 },
    { source: "ACC-005", target: "ACC-008", amount: 450000, count: 16 },
    { source: "ACC-008", target: "ACC-010", amount: 550000, count: 19 },
    { source: "ACC-010", target: "ACC-001", amount: 720000, count: 25 },
  ],
};

export const mockStateFraudData: StateFraudData[] = [
  { stateCode: "MH", stateName: "Maharashtra", fraudCount: 4520, totalTransactions: 285000, fraudRate: 1.59 },
  { stateCode: "DL", stateName: "Delhi", fraudCount: 3890, totalTransactions: 210000, fraudRate: 1.85 },
  { stateCode: "KA", stateName: "Karnataka", fraudCount: 2750, totalTransactions: 195000, fraudRate: 1.41 },
  { stateCode: "TN", stateName: "Tamil Nadu", fraudCount: 2100, totalTransactions: 178000, fraudRate: 1.18 },
  { stateCode: "UP", stateName: "Uttar Pradesh", fraudCount: 3200, totalTransactions: 250000, fraudRate: 1.28 },
  { stateCode: "GJ", stateName: "Gujarat", fraudCount: 1850, totalTransactions: 165000, fraudRate: 1.12 },
  { stateCode: "RJ", stateName: "Rajasthan", fraudCount: 1650, totalTransactions: 145000, fraudRate: 1.14 },
  { stateCode: "WB", stateName: "West Bengal", fraudCount: 2400, totalTransactions: 160000, fraudRate: 1.50 },
  { stateCode: "TG", stateName: "Telangana", fraudCount: 2200, totalTransactions: 155000, fraudRate: 1.42 },
  { stateCode: "AP", stateName: "Andhra Pradesh", fraudCount: 1400, totalTransactions: 130000, fraudRate: 1.08 },
  { stateCode: "KL", stateName: "Kerala", fraudCount: 980, totalTransactions: 120000, fraudRate: 0.82 },
  { stateCode: "MP", stateName: "Madhya Pradesh", fraudCount: 1100, totalTransactions: 110000, fraudRate: 1.00 },
  { stateCode: "PB", stateName: "Punjab", fraudCount: 1350, totalTransactions: 95000, fraudRate: 1.42 },
  { stateCode: "HR", stateName: "Haryana", fraudCount: 1200, totalTransactions: 88000, fraudRate: 1.36 },
  { stateCode: "BR", stateName: "Bihar", fraudCount: 1800, totalTransactions: 140000, fraudRate: 1.29 },
  { stateCode: "OR", stateName: "Odisha", fraudCount: 750, totalTransactions: 85000, fraudRate: 0.88 },
  { stateCode: "AS", stateName: "Assam", fraudCount: 620, totalTransactions: 60000, fraudRate: 1.03 },
  { stateCode: "JH", stateName: "Jharkhand", fraudCount: 890, totalTransactions: 72000, fraudRate: 1.24 },
  { stateCode: "CG", stateName: "Chhattisgarh", fraudCount: 540, totalTransactions: 55000, fraudRate: 0.98 },
  { stateCode: "UK", stateName: "Uttarakhand", fraudCount: 380, totalTransactions: 42000, fraudRate: 0.90 },
  { stateCode: "GA", stateName: "Goa", fraudCount: 220, totalTransactions: 28000, fraudRate: 0.79 },
  { stateCode: "HP", stateName: "Himachal Pradesh", fraudCount: 190, totalTransactions: 25000, fraudRate: 0.76 },
  { stateCode: "JK", stateName: "Jammu & Kashmir", fraudCount: 310, totalTransactions: 35000, fraudRate: 0.89 },
];

export const mockAdversarialScenarios: AdversarialScenario[] = [
  {
    id: "split",
    name: "Split Transaction",
    description: "Fraudster splits a ₹5,00,000 transaction into five ₹99,000 transfers to evade threshold-based detection rules.",
    attackPattern: [
      "₹99,000 → Account A (T+0 min)",
      "₹99,500 → Account B (T+2 min)",
      "₹98,700 → Account C (T+5 min)",
      "₹99,200 → Account A (T+8 min)",
      "₹99,100 → Account D (T+12 min)",
    ],
    detectionMethod: "DRISHTI aggregates transactions within a sliding 30-minute window, detects the cumulative amount (₹4,95,500) exceeds the ₹1,00,000 threshold, and flags the velocity anomaly.",
    explanation: "The GNN layer identifies the fan-out pattern to multiple accounts from a single source within a short timeframe. Combined with the XGBoost temporal feature detecting transaction velocity spikes, this attack is caught with 97% confidence.",
    detected: true,
    confidence: 97,
  },
  {
    id: "slowdrip",
    name: "Slow Drip",
    description: "Fraudster transfers small amounts (₹5,000–₹15,000) over 7 days across 40+ transactions to slowly drain ₹3,50,000 from an account.",
    attackPattern: [
      "Day 1: ₹8,500 × 3 transfers",
      "Day 2: ₹6,200 × 4 transfers",
      "Day 3: ₹12,000 × 2 transfers",
      "Day 4: ₹7,800 × 5 transfers",
      "Day 5: ₹9,400 × 4 transfers",
      "Day 6: ₹11,200 × 3 transfers",
      "Day 7: ₹5,600 × 6 transfers",
    ],
    detectionMethod: "DRISHTI's autoencoder detects the gradual deviation from the customer's baseline spending pattern. The rolling 7-day aggregation reveals cumulative anomaly.",
    explanation: "While each individual transaction appears normal, the autoencoder's reconstruction error increases steadily over 7 days. By day 3, the cumulative drift exceeds the PSI threshold, triggering an investigation alert.",
    detected: true,
    confidence: 89,
  },
  {
    id: "roundnum",
    name: "Round-Number Avoidance",
    description: "Fraudster deliberately avoids round numbers (₹10,000, ₹50,000) to bypass simple rule-based systems, using amounts like ₹49,873 or ₹9,647.",
    attackPattern: [
      "₹49,873 → Beneficiary X",
      "₹9,647 → Beneficiary Y",
      "₹24,519 → Beneficiary X",
      "₹49,982 → Beneficiary Z",
      "₹9,831 → Beneficiary Y",
    ],
    detectionMethod: "DRISHTI's feature engineering captures the 'near-round-number' pattern. The amounts clustering just below ₹10K and ₹50K thresholds are flagged by the boundary proximity feature.",
    explanation: "The XGBoost model includes engineered features for boundary proximity (distance to common thresholds). Combined with the new beneficiary pattern and rapid succession timing, DRISHTI achieves 93% detection confidence.",
    detected: true,
    confidence: 93,
  },
];

export function generateRiskDistribution(): { range: string; count: number }[] {
  return [
    { range: "0-10", count: 4520 },
    { range: "10-20", count: 3890 },
    { range: "20-30", count: 2750 },
    { range: "30-40", count: 1980 },
    { range: "40-50", count: 1420 },
    { range: "50-60", count: 890 },
    { range: "60-70", count: 650 },
    { range: "70-80", count: 420 },
    { range: "80-90", count: 280 },
    { range: "90-100", count: 150 },
  ];
}

export { communityColors };
