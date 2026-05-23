import React, { useState } from "react";
import { 
  Sparkles, 
  Search, 
  ShoppingCart, 
  Bell, 
  Compass, 
  Award, 
  Receipt, 
  Trophy, 
  TreePine,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Coins,
  Globe,
  Share2,
  Trash2
} from "lucide-react";

import { 
  INITIAL_USER_STATS, 
  INITIAL_BADGES, 
  INITIAL_PURCHASE_HISTORY, 
  PRODUCTS_CATALOG,
  INITIAL_SELLERS,
  INITIAL_USERS
} from "./data";
import { Product, PurchaseHistory, Badge, UserStats, Seller, RegisteredUser } from "./types";
import { 
  seedUsersIfNeeded, 
  seedProductsIfNeeded, 
  saveUserProfile, 
  registerProductToDb, 
  deleteProductFromDb 
} from "./firebaseUtils";

import DashboardTab from "./components/DashboardTab";
import MarketplaceTab from "./components/MarketplaceTab";
import BadgesTab from "./components/BadgesTab";
import AiAdvisor from "./components/AiAdvisor";
import LoginPage from "./components/LoginPage";
import AdminConsole from "./components/AdminConsole";

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "marketplace" | "badges">("dashboard");

  // Global Dynamic application state
  const [stats, setStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>(INITIAL_PURCHASE_HISTORY);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Initialize and seed Firebase collections
  React.useEffect(() => {
    async function loadDatabase() {
      try {
        const seededUsers = await seedUsersIfNeeded();
        const seededProducts = await seedProductsIfNeeded();
        setUsers(seededUsers);
        setProducts(seededProducts);
      } catch (err) {
        console.error("Failed to connect or seed database on start:", err);
      } finally {
        setDbLoading(false);
      }
    }
    loadDatabase();
  }, []);

  // Login Session & Admin Role previewer
  const [user, setUser] = useState<{ email: string; role: "user" | "admin" } | null>(null);
  const [isAdminPreviewMode, setIsAdminPreviewMode] = useState(false);

  // Synchronize stats when active user/users structure is updated (e.g. login or admin point tweaks)
  React.useEffect(() => {
    if (user && user.role === "user") {
      const activeUserRecord = users.find((u: RegisteredUser) => u.email === user.email);
      if (activeUserRecord) {
        if (stats.greenPoints !== activeUserRecord.greenPoints || stats.totalCarbonOffset !== activeUserRecord.carbonOffsetTons) {
          setStats((prev: UserStats) => {
            const targetPoints = 15000;
            let nextTierPercent = Math.min(100, Math.floor((activeUserRecord.greenPoints / targetPoints) * 100));
            let nextTierPointsNeeded = Math.max(0, targetPoints - activeUserRecord.greenPoints);
            let nextTierName = "Forest Guardian";
            let sustainabilityLevel = activeUserRecord.greenPoints >= 15000 ? "Forest Guardian" : "Leaf Protector";
            
            if (activeUserRecord.greenPoints >= targetPoints) {
              nextTierName = "Eco Visionary";
              nextTierPointsNeeded = Math.max(0, 30000 - activeUserRecord.greenPoints);
              nextTierPercent = Math.min(100, Math.floor((activeUserRecord.greenPoints / 30000) * 100));
            }

            return {
              ...prev,
              greenPoints: activeUserRecord.greenPoints,
              totalCarbonOffset: activeUserRecord.carbonOffsetTons,
              sustainabilityLevel,
              nextTierPercent,
              nextTierPointsNeeded,
              nextTierName
            };
          });
        }
      }
    }
  }, [users, user, stats.greenPoints, stats.totalCarbonOffset]);
  
  // Redeem Rewards modal state
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);

  // Search input state on the top nav header
  const [globalSearch, setGlobalSearch] = useState("");

  // Handle "Redeem Rewards" button click
  const handleRedeemReward = (rewardName: string, pointsCost: number) => {
    if (stats.greenPoints < pointsCost) {
      alert(`Insufficient Green Points! You need ${pointsCost} points to redeem: "${rewardName}".`);
      return;
    }

    setStats((prev: UserStats) => ({
      ...prev,
      greenPoints: prev.greenPoints - pointsCost
    }));
    setSelectedReward(rewardName);

    // Save back to user record and trigger list updates
    if (user && user.role === "user") {
      setUsers(prev => prev.map(u => {
        if (u.email === user.email) {
          const updatedUser = {
            ...u,
            greenPoints: Math.max(0, u.greenPoints - pointsCost),
            recentActivity: `Redeemed Reward: ${rewardName}`
          };
          saveUserProfile(updatedUser);
          return updatedUser;
        }
        return u;
      }));
    }
  };

  // Place order for product
  const handleOrderProduct = (product: Product) => {
    // 1. Calculate new carbon offset & points
    // Convert current total co2 tons to kg (1 ton = 1000 kg), add offset, divide back to tons
    const currentCo2Kg = stats.totalCarbonOffset * 1000;
    const newCo2Kg = currentCo2Kg + product.co2Offset;
    const newTotalCarbonOffset = newCo2Kg / 1000;

    const newGreenPoints = stats.greenPoints + product.points;

    // Adjust points to Forest Guardian milestone
    const targetPoints = 15000;
    let nextTierPercent = Math.min(100, Math.floor((newGreenPoints / targetPoints) * 100));
    let nextTierPointsNeeded = Math.max(0, targetPoints - newGreenPoints);
    let nextTierName = "Forest Guardian";
    let sustainabilityLevel = stats.sustainabilityLevel;

    if (newGreenPoints >= targetPoints) {
      sustainabilityLevel = "Forest Guardian";
      nextTierName = "Eco Visionary";
      // restart rating logic for standard gamified milestones
      nextTierPointsNeeded = Math.max(0, 30000 - newGreenPoints);
      nextTierPercent = Math.min(100, Math.floor((newGreenPoints / 30000) * 100));
    }

    setStats((prev: UserStats) => ({
      ...prev,
      totalCarbonOffset: newTotalCarbonOffset,
      greenPoints: newGreenPoints,
      sustainabilityLevel,
      nextTierPercent,
      nextTierPointsNeeded,
      nextTierName
    }));

    // Save back to user record and trigger list updates
    if (user && user.role === "user") {
      setUsers((prev: RegisteredUser[]) => prev.map((u: RegisteredUser) => {
        if (u.email === user.email) {
          const updatedUser = {
            ...u,
            greenPoints: newGreenPoints,
            carbonOffsetTons: newTotalCarbonOffset,
            recentActivity: `Purchased Product: ${product.name}`
          };
          saveUserProfile(updatedUser);
          return updatedUser;
        }
        return u;
      }));
    }

    // 2. Add to Purchase History
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    
    const newHistoryEntry: PurchaseHistory = {
      id: `p-${Date.now()}`,
      productName: product.name,
      image: product.image,
      date: formattedDate,
      co2Saved: product.co2Offset,
      pointsEarned: product.points,
      status: "Processing"
    };

    setPurchaseHistory((prev: PurchaseHistory[]) => [newHistoryEntry, ...prev]);

    // 3. Evaluate dynamically unlocking badges
    setBadges((prevBadges: Badge[]) => {
      return prevBadges.map((badge: Badge) => {
        // Unlock Forest Guardian if point levels hit
        if (badge.id === "badge-4" && !badge.isUnlocked && newGreenPoints >= 15000) {
          return { ...badge, isUnlocked: true, unlockedAt: formattedDate };
        }
        // Unlock Carbon Buster if offset milestone hit
        if (badge.id === "badge-5" && !badge.isUnlocked && newTotalCarbonOffset >= 2.5) {
          return { ...badge, isUnlocked: true, unlockedAt: formattedDate };
        }
        // Unlock Solar Evangelist if ordered Solar Charge Pro
        if (badge.id === "badge-6" && !badge.isUnlocked && product.category === "Energy") {
          return { ...badge, isUnlocked: true, unlockedAt: formattedDate };
        }
        return badge;
      });
    });
  };

  // Handle order cancellation and roll back eco metrics
  const handleCancelOrder = (orderId: string) => {
    // 1. Find the target order
    const targetOrder = purchaseHistory.find((item: PurchaseHistory) => item.id === orderId);
    if (!targetOrder || targetOrder.status === "Cancelled") return;

    // 2. Decrement carbon offset and points appropriately
    const lostPoints = targetOrder.pointsEarned;
    const lostCo2Tons = targetOrder.co2Saved / 1000;

    const newGreenPoints = Math.max(0, stats.greenPoints - lostPoints);
    const newTotalCarbonOffset = Math.max(0, stats.totalCarbonOffset - lostCo2Tons);

    const targetPoints = 15000;
    let nextTierPercent = Math.min(100, Math.floor((newGreenPoints / targetPoints) * 100));
    let nextTierPointsNeeded = Math.max(0, targetPoints - newGreenPoints);
    let nextTierName = "Forest Guardian";
    let sustainabilityLevel = stats.sustainabilityLevel;

    if (newGreenPoints >= targetPoints) {
      sustainabilityLevel = "Forest Guardian";
      nextTierName = "Eco Visionary";
      nextTierPointsNeeded = Math.max(0, 30000 - newGreenPoints);
      nextTierPercent = Math.min(100, Math.floor((newGreenPoints / 30000) * 100));
    } else {
      sustainabilityLevel = "Leaf Protector";
    }

    setStats((prev: UserStats) => ({
      ...prev,
      totalCarbonOffset: newTotalCarbonOffset,
      greenPoints: newGreenPoints,
      sustainabilityLevel,
      nextTierPercent,
      nextTierPointsNeeded,
      nextTierName
    }));

    // Update registered user stats
    if (user && user.role === "user") {
      setUsers((prev: RegisteredUser[]) => prev.map((u: RegisteredUser) => {
        if (u.email === user.email) {
          return {
            ...u,
            greenPoints: newGreenPoints,
            carbonOffsetTons: newTotalCarbonOffset,
            recentActivity: `Cancelled Order: ${targetOrder.productName}`
          };
        }
        return u;
      }));
    }

    // 3. Mark in Purchase History
    setPurchaseHistory((prev: PurchaseHistory[]) => prev.map((o: PurchaseHistory) => {
      if (o.id === orderId) {
        return { ...o, status: "Cancelled" };
      }
      return o;
    }));
  };

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center items-center p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <h3 className="font-sans font-bold text-slate-800 text-sm">Connecting database...</h3>
        <p className="font-sans text-xs text-slate-400 mt-1 max-w-sm">Initializing secure connection to Google Firebase Firestore & seeding catalog...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage 
        users={users}
        setUsers={setUsers}
        onLogin={(selectedRole, email) => { 
          setUser({ role: selectedRole, email }); 
          if (selectedRole === "admin") {
            setIsAdminPreviewMode(false); 
          }
        }} 
      />
    );
  }

  // Admin View (not in preview mode)
  if (user.role === "admin" && !isAdminPreviewMode) {
    return (
      <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-geist">
        {/* Dynamic Admin Control Header */}
        <div className="bg-slate-900 border-b border-indigo-950 px-6 py-2.5 text-center text-xs text-slate-300 font-bold flex justify-between items-center z-50">
          <div className="flex items-center gap-2 text-teal-300">
            <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Administrator Session: {user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAdminPreviewMode(true)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-full text-[10px] uppercase font-extrabold tracking-widest transition-all shadow-sm"
            >
              Verify Customer Dashboard
            </button>
            <button 
              onClick={() => {
                setUser(null);
                setIsAdminPreviewMode(false);
              }}
              className="text-slate-400 hover:text-rose-400 font-bold uppercase text-[10px] tracking-wider transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-[1280px] w-full mx-auto px-6 md:px-10 py-8">
          <AdminConsole 
            products={products}
            sellers={sellers}
            users={users}
            setProducts={setProducts}
            setSellers={setSellers}
            setUsers={setUsers}
            onAddProduct={async (newProd) => {
              try {
                await registerProductToDb(newProd);
                setProducts((prev: Product[]) => [newProd, ...prev]);
              } catch (err) {
                console.error("Failed to save newly audited product to firestore:", err);
              }
            }}
            onDeleteProduct={async (id) => {
              try {
                await deleteProductFromDb(id);
                setProducts((prev: Product[]) => prev.filter((p: Product) => p.id !== id));
              } catch (err) {
                console.error("Failed to delete product from firestore:", err);
              }
            }}
            onLogout={() => {
              setUser(null);
              setIsAdminPreviewMode(false);
            }}
            onSwitchToUser={() => setIsAdminPreviewMode(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-geist">
      {/* Admin Preview Switcher bar */}
      {user.role === "admin" && (
        <div className="bg-[#0b132b] text-teal-300 px-6 py-2 bg-gradient-to-r from-slate-950 to-slate-900 text-xs font-bold font-sans flex justify-between items-center border-b border-teal-500/10 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] animate-pulse">admin_panel_settings</span>
            <span>Admin Preview Active (Seeing dashboard in simulation mode)</span>
          </div>
          <button 
            onClick={() => setIsAdminPreviewMode(false)}
            className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded font-bold uppercase tracking-wider text-[10px] transition-all"
          >
            ← Return to Admin Console
          </button>
        </div>
      )}
      
      {/* Top Banner Header Info */}
      <header className="fixed top-0 w-full z-40 bg-white/75 backdrop-blur-2xl border-b border-slate-200/40 shadow-sm">
        <div className="flex justify-between items-center px-6 md:px-10 py-4 max-w-[1280px] mx-auto w-full">
          
          <div className="flex items-center gap-2">
            {/* Logo */}
            <span className="material-symbols-outlined text-[32px] text-[#006c49] font-bold">energy_savings_leaf</span>
            <span className="font-bold text-2xl text-primary tracking-tight font-sans">EcoKart AI</span>
            
            {/* Desktop main headers */}
            <nav className="hidden md:flex items-center ml-8 gap-4">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`text-sm font-bold tracking-wide px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === "dashboard" 
                    ? "text-[#006c49] bg-[#e5eeff]" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("marketplace")}
                className={`text-sm font-bold tracking-wide px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === "marketplace" 
                    ? "text-[#006c49] bg-[#e5eeff]" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Marketplace
              </button>
              <button 
                onClick={() => setActiveTab("badges")}
                className={`text-sm font-bold tracking-wide px-3.5 py-2 rounded-lg transition-all ${
                  activeTab === "badges" 
                    ? "text-[#006c49] bg-[#e5eeff]" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Impact
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Topbar product quick lookup */}
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 border border-slate-200/30">
              <Search className="size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Lookup product context..." 
                value={globalSearch}
                onChange={e => {
                  setGlobalSearch(e.target.value);
                  setActiveTab("marketplace"); // automatically switch to catalog if searching
                }}
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs ml-2 w-48 text-on-surface"
              />
            </div>

            {/* Micro Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab("marketplace")}
                className="p-2 rounded-full hover:bg-emerald-500/10 text-primary transition-all relative"
                title="Go to Shop"
              >
                <ShoppingCart size={19} />
              </button>
              
              <button 
                className="p-2 rounded-full hover:bg-emerald-500/10 text-primary transition-all relative"
                title="Notifications"
                onClick={() => alert("Sustainability Notification: You saved 14.5 kg of Carbon total this week so far! Keep going!")}
              >
                <Bell size={19} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full"></span>
              </button>

              {/* Avatar Frame */}
              <div className="ml-2 ring-2 ring-emerald-500/20 rounded-full p-0.5">
                <img 
                  alt="User Avatar profile Picture" 
                  className="w-8 h-8 rounded-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkFIep63c8kL0tSrEQOvQ3U_EhqzuJaf1VDEE4imXrHs8XOCNN7ycWoMjt7R8vzbXolCm6Y7NOu8_x1OIeJNa4_A_dDR40cPHA8N3b1kfS8v1yQtVfeLD31pdaCX9V1G1DRjivG13wsV4huZL9zLCL9Ars97ki3wiMZQ8G3HNG11IRqaAv1fDF-RlbdushXJd-USBJzjggj18Prb24GKV6uJeZ52YyzZv2f8iMIvj12pHsgZ6RuHakhZt37XHEUDy1lmnrQgJhsey7"
                />
              </div>

              {/* Log out option */}
              <button
                onClick={() => {
                  setUser(null);
                  setIsAdminPreviewMode(false);
                }}
                className="p-1.5 ml-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-550/10 transition-all font-semibold text-xs flex items-center gap-1"
                title="Sign out of Session"
              >
                <span className="material-symbols-outlined text-[19px]">logout</span>
                <span className="hidden md:inline uppercase tracking-wider text-[9px] font-extrabold text-slate-600">Sign Out</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Structural Content Grid */}
      <div className="pt-24 min-h-[calc(100vh-100px)] max-w-[1280px] w-full mx-auto flex flex-col md:flex-row px-4 md:px-10 gap-gutter pb-12">
        
        {/* Left Drawer rail Navigation on Desktop */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 glass-card rounded-2xl p-6 gap-8 h-[calc(100vh-120px)] sticky top-24">
          <nav className="flex flex-col gap-1.5">
            <div className="text-[10px] font-extrabold text-slate-400 px-4 mb-2 tracking-wider uppercase">OVERVIEW</div>
            
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider ${
                activeTab === "dashboard" 
                  ? "bg-[#10b981] text-white shadow-sm" 
                  : "text-slate-600 hover:bg-[#10b981]/10 hover:text-[#006c49]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span>My Impact</span>
            </button>

            <button 
              onClick={() => setActiveTab("badges")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider ${
                activeTab === "badges" 
                  ? "bg-[#10b981] text-white shadow-sm" 
                  : "text-slate-600 hover:bg-[#10b981]/10 hover:text-[#006c49]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">eco</span>
              <span>Eco Badges</span>
            </button>

            <button 
              onClick={() => setActiveTab("marketplace")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs uppercase tracking-wider ${
                activeTab === "marketplace" 
                  ? "bg-[#10b981] text-white shadow-sm" 
                  : "text-slate-600 hover:bg-[#10b981]/10 hover:text-[#006c49]"
              }`}
            >
              <span className="material-symbols-outlined text-lg">storefront</span>
              <span>Eco Market</span>
            </button>
          </nav>

          <nav className="flex flex-col gap-1.5">
            <div className="text-[10px] font-extrabold text-slate-400 px-4 mb-2 tracking-wider uppercase">COMMUNITY</div>
            
            <button 
              onClick={() => alert("Leaderboard: You are currently ranked #142 out of 8,500 active carbon savers in your metropolitan district!")}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-[#10b981]/10 hover:text-[#006c49] rounded-xl transition-all font-semibold text-xs uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-lg">leaderboard</span>
              <span>Rankings</span>
            </button>

            <button 
              onClick={() => setIsRedeemOpen(true)}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-[#10b981]/10 hover:text-[#006c49] rounded-xl transition-all font-semibold text-xs uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-lg">workspace_premium</span>
              <span>Redeem Rewards</span>
            </button>
          </nav>

          {/* User Tier Progress Box */}
          <div className="mt-auto bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary">Next Tier Progress</span>
              <span className="text-xs font-extrabold text-primary">{stats.nextTierPercent}%</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${stats.nextTierPercent}%` }}></div>
            </div>
            
            <p className="text-[11px] font-medium text-slate-500 mt-2">
              {stats.nextTierPointsNeeded.toLocaleString()} points left to reach <strong className="text-teal-900">"{stats.nextTierName}"</strong>
            </p>
          </div>
        </aside>

        {/* Dynamic Display area panel */}
        <main className="flex-1 min-w-0">
          {activeTab === "dashboard" && (
            <DashboardTab 
              stats={stats} 
              badges={badges} 
              history={purchaseHistory}
              onRedeemClick={() => setIsRedeemOpen(true)}
              onNavigateToBadges={() => setActiveTab("badges")}
              onCancelOrder={handleCancelOrder}
            />
          )}

          {activeTab === "marketplace" && (
            <MarketplaceTab 
              products={products} 
              onOrderProduct={handleOrderProduct}
            />
          )}

          {activeTab === "badges" && (
            <BadgesTab 
              badges={badges} 
              stats={stats}
            />
          )}
        </main>
      </div>

      {/* Global Redeem Rewards Modal Screen */}
      {isRedeemOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden shadow-2xl border border-slate-200/20 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsRedeemOpen(false);
                setSelectedReward(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold border"
            >
              ✕
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl text-primary">
                  <Coins size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Redeem Eco Incentives</h2>
                  <p className="text-xs text-slate-400">Available Points Balance: <strong className="text-primary font-mono">{stats.greenPoints.toLocaleString()} pts</strong></p>
                </div>
              </div>

              {selectedReward ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-fadeIn">
                  <div className="mx-auto w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-emerald-950">Incentive Redeemed Successfully!</h3>
                    <p className="text-xs text-emerald-800 font-sans mt-1">
                      You converted your points to reward: <strong className="font-bold">"{selectedReward}"</strong>. Check your email inbox for the voucher certificate!
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedReward(null)}
                    className="px-5 py-2 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-sm"
                  >
                    View Other Rewards
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-500">Spend your hard-earned green points on carbon-neutral initiatives and real-world vouchers:</p>
                  
                  {/* Reward listings */}
                  <div className="space-y-2.5">
                    {[
                      { name: "Plant 5 Native Saplings", desc: "Collaborate with Eden Reforestation projects to grow critical mangrove forests.", cost: 1500, icon: <TreePine size={18} /> },
                      { name: "15% Coupon off Bamboo products", desc: "Redeemable with certified zero-waste local kitchen distributors.", cost: 1000, icon: <Award size={18} /> },
                      { name: "Offset 100 kg Carbon directly", desc: "Certified retirement of carbon offsets from active wind farms.", cost: 3000, icon: <span className="material-symbols-outlined text-[18px]">energy_savings_leaf</span> },
                      { name: "Free Premium Solar Kit Shipping", desc: "Waive all carriage costs on massive battery panels in the marketplace.", cost: 800, icon: <Compass size={18} /> }
                    ].map((reward, i) => (
                      <div 
                        key={i}
                        className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-emerald-300 transition-all"
                      >
                        <div className="flex gap-3">
                          <div className="p-2 bg-emerald-50 text-primary rounded-lg self-start">
                            {reward.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-800">{reward.name}</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">{reward.desc}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRedeemReward(reward.name, reward.cost)}
                          disabled={stats.greenPoints < reward.cost}
                          className="px-3.5 py-1.5 font-bold text-[11px] uppercase tracking-wider rounded-full text-white bg-primary disabled:bg-slate-300 disabled:opacity-50 transition-all"
                        >
                          {reward.cost} pts
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Active AI Advisor Companion */}
      <AiAdvisor />

      {/* Footer System Component */}
      <footer className="w-full mt-auto bg-slate-50 border-t border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-gutter px-6 md:px-10 py-12 max-w-[1280px] mx-auto w-full">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-lg text-primary">EcoKart AI</span>
            <p className="text-xs text-slate-500 max-w-xs font-medium">Empowering sustainable consumption through intelligent tracking, premium eco alternatives, and ethical commerce incentives.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-500 font-semibold">
            <button onClick={() => alert("Sustainability Mission: 100% audited supply chains using zero-emission distribution logistics.")} className="hover:text-primary transition-colors">Sustainability Mission</button>
            <button onClick={() => alert("Carbon Offset Program: Certified by Verified Carbon Standard (VCS) and Gold Standard registry.")} className="hover:text-primary transition-colors">Carbon Offset Program</button>
            <button onClick={() => alert("Ethical AI Policy: Transparent tracking analysis without tracking individual user identities.")} className="hover:text-primary transition-colors">Ethical AI Policy</button>
            <button onClick={() => alert("Marketplace Transparency: Detailed lifecycle greenhouse warming impact listed on every single product.")} className="hover:text-primary transition-colors">Marketplace Transparency</button>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3.5">
            <div className="flex gap-4 text-slate-500">
              <Globe size={18} className="cursor-pointer hover:text-primary transition-colors" />
              <Share2 size={18} className="cursor-pointer hover:text-primary transition-colors" />
              <TreePine size={18} className="cursor-pointer hover:text-primary transition-colors" />
            </div>
            <span className="text-[11px] font-medium text-slate-400">© 2026 EcoKart AI. Built for a Greener Intelligence.</span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Navigation Bar strategy on small view screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card bg-white/90 border-t border-slate-200/50 px-6 py-3 flex justify-around items-center z-40 shadow-xl">
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 ${activeTab === "dashboard" ? "text-primary font-bold" : "text-slate-550"}`}
        >
          <span className="material-symbols-outlined text-lg">dashboard</span>
          <span className="text-[10px] font-semibold">Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab("marketplace")}
          className={`flex flex-col items-center gap-1 ${activeTab === "marketplace" ? "text-primary font-bold" : "text-slate-550"}`}
        >
          <span className="material-symbols-outlined text-lg">storefront</span>
          <span className="text-[10px] font-semibold font-geist">Marketplace</span>
        </button>

        <button 
          onClick={() => setActiveTab("badges")}
          className={`flex flex-col items-center gap-1 ${activeTab === "badges" ? "text-primary font-bold" : "text-slate-550"}`}
        >
          <span className="material-symbols-outlined text-lg">eco</span>
          <span className="text-[10px] font-semibold">Impact</span>
        </button>
      </nav>

    </div>
  );
}
