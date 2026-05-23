// ============================================================
// DRISHTI — Types & Interfaces
// ============================================================

export type RiskLevel = "GREEN" | "YELLOW" | "RED";

export interface Transaction {
  id: string;
  timestamp: string;
  sender: string;
  receiver: string;
  amount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: "approved" | "flagged" | "blocked";
  channel: string;
  location: string;
  explanation?: ExplanationData;
}

export interface ExplanationData {
  topFeatures: ShapFeature[];
  plainEnglish: string;
  hindi: string;
  fraudDna: string | null;
  templateMatch: number | null;
}

export interface ShapFeature {
  feature: string;
  importance: number;
  direction: "positive" | "negative";
}

export interface ModelMetrics {
  precision: number;
  recall: number;
  f1: number;
  aucRoc: number;
  lastTrained: string;
  psiDrift: number;
  psiThreshold: number;
}

export interface DashboardStats {
  totalTransactions: number;
  fraudDetected: number;
  falsePositiveRate: number;
  avgLatency: number;
  uptimePercent: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  detail: string;
}

export interface MuleNode {
  id: string;
  label: string;
  community: number;
  betweenness: number;
  isMuleSuspect: boolean;
  riskScore: number;
  transactionCount: number;
}

export interface MuleEdge {
  source: string;
  target: string;
  amount: number;
  count: number;
}

export interface MuleGraphData {
  nodes: MuleNode[];
  links: MuleEdge[];
}

export interface StateFraudData {
  stateCode: string;
  stateName: string;
  fraudCount: number;
  totalTransactions: number;
  fraudRate: number;
}

export interface AdversarialScenario {
  id: string;
  name: string;
  description: string;
  attackPattern: string[];
  detectionMethod: string;
  explanation: string;
  detected: boolean;
  confidence: number;
}

export interface RiskThresholds {
  yellowThreshold: number;
  redThreshold: number;
}

export interface SystemStatus {
  isOnline: boolean;
  latency: number;
  wsConnected: boolean;
  lastHeartbeat: string;
}
