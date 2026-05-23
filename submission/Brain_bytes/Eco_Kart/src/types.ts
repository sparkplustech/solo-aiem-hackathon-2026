export interface Product {
  id: string;
  name: string;
  price: number;
  co2Offset: number; // in kg
  points: number;
  image: string;
  dataAlt: string;
  category: "Home" | "Energy" | "Transport" | "Lifestyle";
  rating: number;
  description: string;
  status?: "Approved" | "Pending" | "Rejected"; // New field for admin approval flows
  sellerName?: string; // New field for seller references
  materialUsed?: string; // New field for materials verification
  ecoScore?: number; // Calculated Eco Score out of 100 via AI
}

export interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  sustainabilityScore: number; // Scale 0-100 indicating green score
  isVerified: boolean;
  status: "Active" | "Pending" | "Banned";
  totalSalesRupees: number;
  carbonOffsetContributed: number; // in kg
  joinedDate: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  greenPoints: number;
  carbonOffsetTons: number;
  status: "Active" | "Blocked";
  joinedDate: string;
  recentActivity: string;
  password?: string;
  role?: "user" | "admin";
}

export interface PurchaseHistory {
  id: string;
  productName: string;
  image: string;
  date: string;
  co2Saved: number; // in kg
  pointsEarned: number;
  status: "Delivered" | "Shipped" | "Processing" | "Cancelled";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  borderStyle: string;
  bgStyle: string;
  textColor: string;
}

export interface UserStats {
  totalCarbonOffset: number; // in tons
  greenPoints: number;
  sustainabilityLevel: string;
  ranking: string;
  nextTierPercent: number;
  nextTierPointsNeeded: number;
  nextTierName: string;
}
