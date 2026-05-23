import { Product, PurchaseHistory, Badge, UserStats } from "./types";

export const INITIAL_USER_STATS: UserStats = {
  totalCarbonOffset: 2.4, // in tons
  greenPoints: 12450,
  sustainabilityLevel: "Leaf Protector",
  ranking: "Top 5%",
  nextTierPercent: 75,
  nextTierPointsNeeded: 125,
  nextTierName: "Forest Guardian"
};

export const INITIAL_BADGES: Badge[] = [
  {
    id: "badge-1",
    name: "First Purchase",
    description: "Ordered your first sustainable product on EcoKart AI.",
    icon: "verified_user",
    isUnlocked: true,
    unlockedAt: "May 01, 2024",
    borderStyle: "border-emerald-200 dark:border-emerald-800",
    bgStyle: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-700 dark:text-emerald-400"
  },
  {
    id: "badge-2",
    name: "Composter",
    description: "Subscribed or purchased biodegradable composter solutions.",
    icon: "compost",
    isUnlocked: true,
    unlockedAt: "May 10, 2024",
    borderStyle: "border-primary-container/30",
    bgStyle: "bg-primary-container/10",
    textColor: "text-primary"
  },
  {
    id: "badge-3",
    name: "Energy Saver",
    description: "Offset over 10 kg of CO2 in a single solar purchase.",
    icon: "bolt",
    isUnlocked: true,
    unlockedAt: "May 05, 2024",
    borderStyle: "border-teal-200 dark:border-teal-850",
    bgStyle: "bg-teal-50 dark:bg-teal-950/20",
    textColor: "text-teal-700 dark:text-teal-400"
  },
  {
    id: "badge-4",
    name: "Forest Guardian",
    description: "Gain 15,000 Green Points to earn this high-tier badge.",
    icon: "park",
    isUnlocked: false,
    borderStyle: "border-dashed border-slate-300 dark:border-slate-700",
    bgStyle: "bg-slate-100/50 dark:bg-slate-900/50",
    textColor: "text-slate-400 dark:text-slate-500"
  },
  {
    id: "badge-5",
    name: "Carbon Buster",
    description: "Offset over 50.0 kg of Carbon footprint directly.",
    icon: "eco",
    isUnlocked: false,
    borderStyle: "border-dashed border-slate-300 dark:border-slate-700",
    bgStyle: "bg-slate-100/50 dark:bg-slate-900/50",
    textColor: "text-slate-400 dark:text-slate-500"
  },
  {
    id: "badge-6",
    name: "Solar Evangelist",
    description: "Order 3 solar-powered items to harness clean energy.",
    icon: "wb_sunny",
    isUnlocked: false,
    borderStyle: "border-dashed border-slate-300 dark:border-slate-700",
    bgStyle: "bg-slate-100/50 dark:bg-slate-900/50",
    textColor: "text-slate-400 dark:text-slate-500"
  }
];

export const INITIAL_PURCHASE_HISTORY: PurchaseHistory[] = [
  {
    id: "p-1",
    productName: "Eco-Bamboo Kit",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuApK5Uy0SXLs4P-UZ7GBVbXNbN3NaXLBsVFesI7Mi81EUwTZXJ4SbqwBWIuRdepcocRVKEiznTgPzD6i2h-Z5k85Ql6YfFhDKf3UszFgFHITozYcB0rzpsmVV8St5XVrFdYRrSby4uwCtsZQQjlCUsIoez9v3C8ucPlOVtSiK2mphv4wHT8Sh2y3gkocBsA_dEm7NDr3bX8SKtaVgiORS-k9BulIK7t9zcYG9mEKY4daeRt_YvRt1V88kY4F4m-NR2KaPNvMZvlUqDP",
    date: "May 12, 2024",
    co2Saved: 2.5,
    pointsEarned: 450,
    status: "Delivered"
  },
  {
    id: "p-2",
    productName: "Solar Charge Pro",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFrY8wjAmicDRk8CdIkxG4R3-Ko43T2lBbNfwDlIBifJQ1KTKV6aZW4VqL4PZ7BwlV_9xH3wGMWW23rEjE89nQCAxDLLwrbUyEqGZ5QLBx_q3ya9aifMf842BNiij_yh0dspsnjXUGcwPadJ-PBozGEyj-Q6nhyQ27T6-c8PIQEaOJ6lB9TMEA2s39gUhJ5q_Hfiit7PwvfQ8MQymSMIuqKcQj9VM6L6pmZGRn6XQGpu2x9JHs6HOl-mmrzV900nvvsOJVWjJH4t8f",
    date: "May 05, 2024",
    co2Saved: 12.0,
    pointsEarned: 1200,
    status: "Shipped"
  }
];

export const PRODUCTS_CATALOG: Product[] = [
  {
    id: "prod-1",
    name: "Eco-Bamboo Kit",
    price: 1999,
    co2Offset: 2.5,
    points: 450,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuApK5Uy0SXLs4P-UZ7GBVbXNbN3NaXLBsVFesI7Mi81EUwTZXJ4SbqwBWIuRdepcocRVKEiznTgPzD6i2h-Z5k85Ql6YfFhDKf3UszFgFHITozYcB0rzpsmVV8St5XVrFdYRrSby4uwCtsZQQjlCUsIoez9v3C8ucPlOVtSiK2mphv4wHT8Sh2y3gkocBsA_dEm7NDr3bX8SKtaVgiORS-k9BulIK7t9zcYG9mEKY4daeRt_YvRt1V88kY4F4m-NR2KaPNvMZvlUqDP",
    dataAlt: "Biodegradable toothbrushes and wood-fiber travel case resting beautifully under bright natural lighting.",
    category: "Lifestyle",
    rating: 4.8,
    description: "Ditch the plastic with this biodegradable FSC bamboo travel kit. Comes with four soft BPA-free bristle toothbrushes, organic cotton canvas travel pouch, and a luxury bamboo container.",
    status: "Approved",
    sellerName: "TerraWeave Imports",
    materialUsed: "FSC Certified Sustainably Harvested Bamboo",
    ecoScore: 89
  },
  {
    id: "prod-2",
    name: "Solar Charge Pro",
    price: 7499,
    co2Offset: 12.0,
    points: 1200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFrY8wjAmicDRk8CdIkxG4R3-Ko43T2lBbNfwDlIBifJQ1KTKV6aZW4VqL4PZ7BwlV_9xH3wGMWW23rEjE89nQCAxDLLwrbUyEqGZ5QLBx_q3ya9aifMf842BNiij_yh0dspsnjXUGcwPadJ-PBozGEyj-Q6nhyQ27T6-c8PIQEaOJ6lB9TMEA2s39gUhJ5q_Hfiit7PwvfQ8MQymSMIuqKcQj9VM6L6pmZGRn6XQGpu2x9JHs6HOl-mmrzV900nvvsOJVWjJH4t8f",
    dataAlt: "High-tech portable panels capturing solar radiation on a slate wooden surface.",
    category: "Energy",
    rating: 4.9,
    description: "Harness clean energy anywhere. Features ultra-efficient Monocrystalline silicone panels, a 20,000mAh dual fast-charging battery, drop-resistant silicone casing, and integrated LED emergency lights.",
    status: "Approved",
    sellerName: "AeroCharged Labs",
    materialUsed: "Recycled Monocrystalline Silicon Cells & Soft Eco-Silicone",
    ecoScore: 96
  },
  {
    id: "prod-3",
    name: "Smart Thermostat AI",
    price: 12499,
    co2Offset: 35.0,
    points: 2500,
    image: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?q=80&w=400&auto=format&fit=crop",
    dataAlt: "Sleek round smart temperature controller with digital readout mounted on a modern off-white wall.",
    category: "Energy",
    rating: 4.7,
    description: "An intelligent, auto-scheduling thermostat that learns your thermal profile and saves up to 26% on heating and cooling, preventing hundreds of kilograms of carbon output annually.",
    status: "Approved",
    sellerName: "EcoSmart Systems",
    materialUsed: "Post-Consumer PCR Thermoplastic ABS Polymers",
    ecoScore: 92
  },
  {
    id: "prod-4",
    name: "Organic Coffee Companion",
    price: 1499,
    co2Offset: 1.8,
    points: 200,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop",
    dataAlt: "A beautiful custom designed reusable thermo cup with organic cork sleeve on a wood counter.",
    category: "Lifestyle",
    rating: 4.6,
    description: "Made from natural eco-cork and premium double-walled borosilicate glass. Keeps espresso piping hot or cold brews crisp without leaching any chemicals or generating paper cup trash.",
    status: "Pending", // Let this start as pending for admin approval testing!
    sellerName: "SageGreen Containers",
    materialUsed: "Premium Double-Walled Borosilicate Glass & Mediterranean Cork",
    ecoScore: 84
  },
  {
    id: "prod-5",
    name: "Compost Bin Pro Max",
    price: 4999,
    co2Offset: 15.0,
    points: 1000,
    image: "https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?q=80&w=400&auto=format&fit=crop",
    dataAlt: "A modern stylish composting kitchen canister with organic charcoal filter on a modern marble counter.",
    category: "Home",
    rating: 4.5,
    description: "Turn organic kitchen leftovers into rich superfood for your plants within weeks. Completely odorless design with double active carbon air-filters and elegant matte sage-green finish.",
    status: "Approved",
    sellerName: "SageGreen Containers",
    materialUsed: "Powder-coated Stainless Steel with Biodegradable Charcoal Filters",
    ecoScore: 88
  },
  {
    id: "prod-6",
    name: "Biodegradable Phone Guard",
    price: 2499,
    co2Offset: 2.2,
    points: 300,
    image: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?q=80&w=400&auto=format&fit=crop",
    dataAlt: "High-end minimal straw-speckled phone case in a modern sustainable design layout.",
    category: "Lifestyle",
    rating: 4.4,
    description: "Constructed entirely from premium flax straws and plant polymers. Offers certified 6-foot military drop defense and breaks down harmlessly in home compost within 12 months!",
    status: "Approved",
    sellerName: "BioPlast Co.",
    materialUsed: "100% Compostable Flax Straw & Zero-Waste Plant Esters",
    ecoScore: 81
  }
];

import { Seller, RegisteredUser } from "./types";

export const INITIAL_SELLERS: Seller[] = [
  {
    id: "sell-1",
    businessName: "TerraWeave Imports",
    ownerName: "Aarav Sharma",
    email: "aarav@terraweave.in",
    sustainabilityScore: 92,
    isVerified: true,
    status: "Active",
    totalSalesRupees: 45800,
    carbonOffsetContributed: 350,
    joinedDate: "Jan 12, 2024"
  },
  {
    id: "sell-2",
    businessName: "AeroCharged Labs",
    ownerName: "Priya Patel",
    email: "priya@aerocharge.io",
    sustainabilityScore: 98,
    isVerified: true,
    status: "Active",
    totalSalesRupees: 184500,
    carbonOffsetContributed: 840,
    joinedDate: "Feb 08, 2024"
  },
  {
    id: "sell-3",
    businessName: "BioPlast Co.",
    ownerName: "Kabir Mehta",
    email: "contact@bioplast.in",
    sustainabilityScore: 84,
    isVerified: false,
    status: "Pending",
    totalSalesRupees: 12900,
    carbonOffsetContributed: 120,
    joinedDate: "Apr 22, 2024"
  },
  {
    id: "sell-4",
    businessName: "EcoSmart Systems",
    ownerName: "Rohan Das",
    email: "rohan@ecosmart.co",
    sustainabilityScore: 89,
    isVerified: true,
    status: "Active",
    totalSalesRupees: 89000,
    carbonOffsetContributed: 430,
    joinedDate: "Mar 19, 2024"
  },
  {
    id: "sell-5",
    businessName: "Greener Plastic Imitators",
    ownerName: "Vikram Raj",
    email: "info@greenfakeplastic.com",
    sustainabilityScore: 12,
    isVerified: false,
    status: "Banned",
    totalSalesRupees: 0,
    carbonOffsetContributed: 0,
    joinedDate: "May 02, 2024"
  }
];

export const INITIAL_USERS: RegisteredUser[] = [
  {
    id: "user-1",
    name: "Rajesh S.",
    email: "user@ecokart.in",
    greenPoints: 12450,
    carbonOffsetTons: 2.4,
    status: "Active",
    joinedDate: "May 01, 2024",
    recentActivity: "Purchased Eco-Bamboo Kit"
  },
  {
    id: "user-2",
    name: "Anita Patel",
    email: "anita.patel@gmail.com",
    greenPoints: 8500,
    carbonOffsetTons: 1.8,
    status: "Active",
    joinedDate: "Mar 15, 2024",
    recentActivity: "Ordered Solar Charge Pro"
  },
  {
    id: "user-3",
    name: "Devendra Rao",
    email: "devendra.rao@outlook.in",
    greenPoints: 3400,
    carbonOffsetTons: 0.95,
    status: "Active",
    joinedDate: "Jan 10, 2024",
    recentActivity: "Unlocked First Purchase Badge"
  },
  {
    id: "user-4",
    name: "Spammer Account",
    email: "bot99@cheapspam.xyz",
    greenPoints: 0,
    carbonOffsetTons: 0,
    status: "Blocked",
    joinedDate: "May 20, 2026",
    recentActivity: "Posted spam reviews on smart thermostats"
  }
];
