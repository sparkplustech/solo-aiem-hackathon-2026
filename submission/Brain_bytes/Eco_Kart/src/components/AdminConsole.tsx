import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  BarChart4, 
  Layers, 
  FolderPlus, 
  Compass, 
  Trophy,
  Check,
  Percent,
  Users,
  Landmark,
  FileText,
  Ban,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Search,
  Edit3,
  Save,
  TrendingUp,
  RefreshCw,
  Leaf,
  ArrowUpRight,
  Filter,
  UserX,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { Product, Seller, RegisteredUser } from "../types";
import { saveUserProfile } from "../firebaseUtils";

interface AdminConsoleProps {
  products: Product[];
  sellers: Seller[];
  users: RegisteredUser[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSellers: React.Dispatch<React.SetStateAction<Seller[]>>;
  setUsers: React.Dispatch<React.SetStateAction<RegisteredUser[]>>;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onLogout: () => void;
  onSwitchToUser: () => void;
}

export default function AdminConsole({
  products,
  sellers,
  users,
  setProducts,
  setSellers,
  setUsers,
  onAddProduct,
  onDeleteProduct,
  onLogout,
  onSwitchToUser
}: AdminConsoleProps) {
  // Navigation internal tabs
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "sellers" | "users" | "analytics">("overview");

  // Filter & Search states
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<"All" | "Approved" | "Pending" | "Rejected">("All");

  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerFilter, setSellerFilter] = useState<"All" | "Active" | "Pending" | "Banned">("All");

  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<"All" | "Active" | "Blocked">("All");

  // New product form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [co2Offset, setCo2Offset] = useState<number | "">("");
  const [points, setPoints] = useState<number | "">("");
  const [category, setCategory] = useState<"Lifestyle" | "Energy" | "Home" | "Transport">("Lifestyle");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [sellerName, setSellerName] = useState("TerraWeave Imports");
  const [materialUsed, setMaterialUsed] = useState("");
  const [formStatus, setFormStatus] = useState<"Approved" | "Pending">("Approved");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Edit product modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");
  const [editCo2, setEditCo2] = useState<number | "">("");
  const [editPoints, setEditPoints] = useState<number | "">("");
  const [editCategory, setEditCategory] = useState<"Lifestyle" | "Energy" | "Home" | "Transport">("Lifestyle");
  const [editImage, setEditImage] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editSeller, setEditSeller] = useState("");
  const [editMaterial, setEditMaterial] = useState("");
  const [editStatus, setEditStatus] = useState<"Approved" | "Pending" | "Rejected">("Approved");

  // Points Tweaker helper state
  const [ptsAdjustment, setPtsAdjustment] = useState<{ [userId: string]: number }>({});

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ score: number; explanation: string; passed: boolean } | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Auto-auditing states on item registration
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<{ name: string; score: number; explanation: string } | null>(null);
  const [registrationRejection, setRegistrationRejection] = useState<{ name: string; score: number; explanation: string } | null>(null);

  const handleRunAiAudit = async () => {
    if (!name.trim() || !description.trim()) {
      alert("Please fill out at least the Product Name and Carbon Lifecycle Description so the AI can evaluate the sustainability index of this product.");
      return;
    }

    setIsAuditing(true);
    setAuditError(null);
    setAuditResult(null);

    try {
      const response = await fetch("/api/gemini/eco-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          materialUsed: materialUsed.trim() || "Unspecified Materials",
          co2Offset: Number(co2Offset) || 1.0,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact the AI Eco-Auditor on the backend.");
      }

      const data = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      console.error(err);
      setAuditError(err.message || "An unexpected error occurred during AI evaluation.");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !description.trim()) {
      alert("Please fill out the required fields: Product Name, Price, and Carbon Lifecycle Description.");
      return;
    }

    setIsRegistering(true);
    setRegistrationError(null);
    setRegistrationSuccess(null);
    setRegistrationRejection(null);

    // Clean up numerical fields and calculate smart defaults if empty
    const finalPrice = Number(price);
    const finalCo2Offset = co2Offset !== "" ? Number(co2Offset) : Math.max(0.5, Math.round((finalPrice * 0.003) * 10) / 10);
    const finalPoints = points !== "" ? Number(points) : Math.round(finalCo2Offset * 100);
    const finalMaterialUsed = materialUsed.trim() || "Bio-sourced compostable compounds";

    let finalImage = image.trim();
    if (!finalImage) {
      // Direct assignment of dynamic high-quality eco placeholders based on category
      if (category === "Energy") {
        finalImage = "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=400&auto=format&fit=crop";
      } else if (category === "Home") {
        finalImage = "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=400&auto=format&fit=crop";
      } else if (category === "Transport") {
        finalImage = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop";
      } else {
        finalImage = "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop";
      }
    }

    try {
      // Contact backend Gemini API on the fly for scoring
      const response = await fetch("/api/gemini/eco-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          materialUsed: finalMaterialUsed,
          co2Offset: finalCo2Offset,
          description: description.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact the AI Eco-Auditor portal on the server.");
      }

      const resData = await response.json();

      if (!resData || typeof resData.score !== "number") {
        throw new Error("AI Auditor returned an unrecognized or empty evaluation outcome.");
      }

      // Check threshold (must be and score > 40)
      if (resData.score <= 40) {
        setRegistrationRejection({
          name: name.trim(),
          score: resData.score,
          explanation: resData.explanation || "Sourcing has been rejected due to excessive non-degradable or high-emission synthetic components."
        });
        return;
      }

      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: name.trim(),
        price: finalPrice,
        co2Offset: finalCo2Offset,
        points: finalPoints,
        image: finalImage,
        dataAlt: `${name.trim()} sustainable commodity.`,
        category,
        rating: 4.8,
        description: description.trim(),
        status: formStatus,
        sellerName,
        materialUsed: finalMaterialUsed,
        ecoScore: resData.score
      };

      onAddProduct(newProduct);

      // Save success outcome
      setRegistrationSuccess({
        name: newProduct.name,
        score: resData.score,
        explanation: resData.explanation
      });

      // Clear the inputs
      setName("");
      setPrice("");
      setCo2Offset("");
      setPoints("");
      setImage("");
      setDescription("");
      setMaterialUsed("");

    } catch (err: any) {
      console.error(err);
      setRegistrationError(err.message || "An error occurred during AI Sourcing eco certification.");
    } finally {
      setIsRegistering(false);
    }
  };

  const autofillTemplate = (num: number) => {
    setAuditResult(null);
    setAuditError(null);
    setRegistrationSuccess(null);
    setRegistrationRejection(null);
    setRegistrationError(null);
    if (num === 1) {
      setName("Handwoven Cotton Tote Bags");
      setPrice(850);
      setCo2Offset(1.2);
      setPoints(150);
      setCategory("Lifestyle");
      setImage("https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop");
      setDescription("Organic handloomed cotton fabric tote with extra long shoulder straps. Handcrafted by local artisan fair-trade collectives in rural India.");
      setSellerName("TerraWeave Imports");
      setMaterialUsed("100% GOTS Certified Organic Hand-spun Cotton");
      setFormStatus("Approved");
    } else if (num === 2) {
      setName("Premium Recycled Copper Drinkware");
      setPrice(2199);
      setCo2Offset(4.8);
      setPoints(500);
      setCategory("Home");
      setImage("https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=400&auto=format&fit=crop");
      setDescription("Double-walled 100% recycled high-purity copper hydration flask. Promotes ancient wellness and preserves cold water with elegant floral motifs.");
      setSellerName("AeroCharged Labs");
      setMaterialUsed("Pure High-Grade 100% Recycled Copper");
      setFormStatus("Pending");
    } else {
      setName("Solar Powered LED Garden Bricks");
      setPrice(3499);
      setCo2Offset(18.5);
      setPoints(800);
      setCategory("Energy");
      setImage("https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=400&auto=format&fit=crop");
      setDescription("Walkway landscape glass brick tile lights that charge via sunlight during daytime and automatically illuminate with warm gold hues for 12 hours.");
      setSellerName("EcoSmart Systems");
      setMaterialUsed("Toughened Cast Recycled Glass & Solar Monocrystalline Film");
      setFormStatus("Pending");
    }
  };

  // Open Edit Dialog Product
  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditPrice(p.price);
    setEditCo2(p.co2Offset);
    setEditPoints(p.points);
    setEditCategory(p.category);
    setEditImage(p.image);
    setEditDesc(p.description);
    setEditSeller(p.sellerName || "Individual Seller");
    setEditMaterial(p.materialUsed || "Standard Sustainability Components");
    setEditStatus(p.status || "Approved");
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts(prev => prev.map(p => {
      if (p.id === editingProduct.id) {
        return {
          ...p,
          name: editName,
          price: Number(editPrice),
          co2Offset: Number(editCo2),
          points: Number(editPoints),
          category: editCategory,
          image: editImage,
          description: editDesc,
          sellerName: editSeller,
          materialUsed: editMaterial,
          status: editStatus
        };
      }
      return p;
    }));

    setEditingProduct(null);
    setSuccessMsg("Invoiced product records updated successfully!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Reject / Approve Product inline action
  const setProductStatusAttr = (productId: string, val: "Approved" | "Pending" | "Rejected") => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: val } : p));
  };

  // Seller management inline helpers
  const approveSeller = (id: string) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, status: "Active", isVerified: true } : s));
  };

  const toggleVerifySeller = (id: string) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, isVerified: !s.isVerified } : s));
  };

  const toggleBanSeller = (id: string) => {
    setSellers(prev => prev.map(s => s.id === id ? { ...s, status: s.status === "Banned" ? "Active" : "Banned" } : s));
  };

  // User management inline helpers
  const toggleBlockUser = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, status: (u.status === "Blocked" ? "Active" : "Blocked") as any };
        saveUserProfile(updated);
        return updated;
      }
      return u;
    }));
  };

  const adjustUserRewardPoints = (id: string, amount: number) => {
    if (isNaN(amount) || amount === 0) return;
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextPts = Math.max(0, u.greenPoints + amount);
        const updated = { 
          ...u, 
          greenPoints: nextPts,
          recentActivity: `Admin adjusted points by ${amount > 0 ? "+" : ""}${amount} credits` 
        };
        saveUserProfile(updated);
        return updated;
      }
      return u;
    }));
    // reset manual input map
    setPtsAdjustment(prev => ({ ...prev, [id]: 0 }));
  };

  // Dynamic values calculated from state arrays
  const totalApprovedProducts = products.filter(p => p.status === "Approved").length;
  const totalPendingProducts = products.filter(p => !p.status || p.status === "Pending").length;
  
  const totalActiveSellers = sellers.filter(s => s.status === "Active").length;
  const totalUsersCount = users.length;
  const totalBannedSellers = sellers.filter(s => s.status === "Banned").length;

  const aggregatedCarbonSaved = flexCarbonSaved();
  const aggregatedPointsCirculating = users.reduce((sum, u) => sum + u.greenPoints, 0);

  function flexCarbonSaved() {
    // 425 tons baseline + registered offsets of approved items in list
    const factor = products.reduce((sum, p) => sum + (p.status === "Approved" ? p.co2Offset : 0), 0);
    return (425.8 + factor * 0.15).toFixed(1);
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-sans text-slate-800">
      
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-[#003b29] via-[#005c40] to-[#004d35] p-7 md:p-8 rounded-2xl text-white relative overflow-hidden shadow-xl border border-emerald-950">
        <div className="absolute right-0 top-0 w-2/5 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-300 via-emerald-800 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-300 mb-3 border border-teal-400/20">
              <ShieldCheck size={12} />
              <span>Platform Supervisor Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white font-display">
              EcoKart AI — Administrative Terminal
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl mt-1">
              Verify smart sellers, approve carbon-reducing commodities, triage client green points ratios, and monitor real-time sustainability metrics.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            {/* Quick action buttons per administrative request */}
            <button
              onClick={() => {
                setActiveTab("products");
                setTimeout(() => {
                  const el = document.getElementById("admin-add-product-name-input");
                  if (el) {
                    el.focus();
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }, 150);
              }}
              id="header-btn-quick-add"
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-900 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1.5 border border-amber-600/20 active:scale-95 cursor-pointer"
            >
              <PlusCircle size={14} className="stroke-[3px]" />
              <span>+ Add Product</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                setProductFilter("All");
                setTimeout(() => {
                  const el = document.getElementById("admin-products-list-anchor");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 150);
              }}
              id="header-btn-quick-view"
              className="px-4 py-2.5 bg-[#006c49]/90 hover:bg-[#006c49] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center gap-1.5 border border-emerald-700 active:scale-95 cursor-pointer"
            >
              <Layers size={14} />
              <span>View Added Products</span>
            </button>

            <button
              onClick={onSwitchToUser}
              className="px-5 py-2.5 bg-emerald-150 hover:bg-emerald-200 text-[#003b29] text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center gap-1.5 border border-emerald-300/10 bg-emerald-100"
            >
              <Compass size={14} />
              <span>Enter Customer Shop</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-[#002e20] hover:bg-red-950/40 text-rose-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border border-red-950"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Global tab Switcher row */}
        <div className="flex flex-wrap gap-1 mt-7 border-t border-white/15 pt-5 text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "overview" 
                ? "bg-white text-[#003b29] shadow-md" 
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <BarChart4 size={14} />
            <span>Overview Center</span>
          </button>
          
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "products" 
                ? "bg-white text-[#003b29] shadow-md" 
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Layers size={14} />
            <span>Products Catalog ({products.length})</span>
            {totalPendingProducts > 0 && (
              <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans animate-pulse">
                {totalPendingProducts} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "sellers" 
                ? "bg-white text-[#003b29] shadow-md" 
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Landmark size={14} />
            <span>Sustainable Sellers ({sellers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "users" 
                ? "bg-white text-[#003b29] shadow-md" 
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Users size={14} />
            <span>Registered Users ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "analytics" 
                ? "bg-white text-[#003b29] shadow-md" 
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <Leaf size={14} />
            <span>Sustainability Impact</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold animate-slideUp flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ==================== TAB 1: OVERVIEW CENTER ==================== */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main 7 Key Metrics Cards Grid */}
          <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-sm transition-all">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</div>
              <div className="text-xl font-extrabold text-slate-800 mt-1">{totalUsersCount}</div>
              <div className="text-[9px] text-emerald-600 font-bold mt-1">100% active ratio</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-sm transition-all">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Sellers</div>
              <div className="text-xl font-extrabold text-slate-800 mt-1">{sellers.length}</div>
              <div className="text-[9px] text-[#006c49] font-bold mt-1">{totalActiveSellers} certified active</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-sm transition-all">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Products</div>
              <div className="text-xl font-extrabold text-slate-800 mt-1">{products.length}</div>
              <div className="text-[9px] text-slate-500 font-medium mt-1">{totalPendingProducts} pending review</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-sm transition-all">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Approved Products</div>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">{totalApprovedProducts}</div>
              <div className="text-[9px] text-emerald-600 font-semibold mt-1">✓ Listed under shops</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#006c49]/20 bg-emerald-50/10 hover:shadow-sm transition-all">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eco Products Sold</div>
              <div className="text-xl font-extrabold text-[#006c49] mt-1">5,420 u.</div>
              <div className="text-[9px] text-[#006c49] font-bold mt-1">↑ 18% month-over-month</div>
            </div>

            <div className="bg-cyan-50/15 p-4 rounded-xl border border-cyan-100 hover:shadow-sm transition-all">
              <div className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">Carbon Saved</div>
              <div className="text-xl font-extrabold text-cyan-800 mt-1">{aggregatedCarbonSaved} t.</div>
              <div className="text-[9px] text-cyan-700 font-semibold mt-1">🌿 Audited carbon index</div>
            </div>

            <div className="bg-lime-50/15 p-4 rounded-xl border border-lime-200 hover:shadow-sm transition-all">
              <div className="text-[10px] font-bold text-lime-700 uppercase tracking-wider">Waste Reduced</div>
              <div className="text-xl font-extrabold text-lime-900 mt-1">18,240 kg</div>
              <div className="text-[9px] text-lime-700 font-semibold mt-1">♻ Plastic bottles avoided</div>
            </div>
          </section>

          {/* Special Buttons Panel - Primary Admin Control Deck */}
          <section className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-200/50 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c49]">shield_with_heart</span>
              <div>
                <h3 className="font-bold text-sm text-emerald-950 uppercase tracking-widest">Administrative Core Actions</h3>
                <p className="text-[11px] text-emerald-800 font-medium">Use these premium quick actions to deploy sustainable items and monitor the registered catalog.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => {
                  setActiveTab("products");
                  setTimeout(() => {
                    const inputEl = document.querySelector('input[placeholder*="Wheat Straw Cup"]');
                    if (inputEl) (inputEl as HTMLElement).focus();
                  }, 100);
                }}
                id="admin-btn-add-product"
                className="bg-gradient-to-br from-[#003b29] to-[#006c49] text-white p-5 rounded-xl hover:shadow-lg transition-all border border-emerald-700/30 flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/15 rounded-xl text-teal-300 group-hover:scale-110 transition-transform">
                    <PlusCircle size={22} className="text-teal-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm tracking-wide text-white">Sourcing Portal: Register & AI Audit Product</h4>
                    <p className="text-[10.5px] text-teal-100 font-medium">Auto-evaluate carbon offsets, material compliance, and eco scores natively.</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">east</span>
              </button>

              <button 
                onClick={() => {
                  setActiveTab("products");
                }}
                id="admin-btn-view-products"
                className="bg-gradient-to-br from-[#022c22] to-slate-900 text-white p-5 rounded-xl hover:shadow-lg transition-all border border-teal-800/20 flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/15 rounded-xl text-cyan-300 group-hover:scale-110 transition-transform">
                    <Layers size={22} className="text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm tracking-wide text-white">Live Catalog: View Added Products ({products.length})</h4>
                    <p className="text-[10.5px] text-slate-300 font-medium">Audit the live database list of carbon-reducing commodities inside the store.</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">east</span>
              </button>
            </div>
          </section>

          {/* Grid Layout: Activities and Real-time stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Core Metrics & Target dial */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 space-y-4">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1 text-[#003b29]">
                <Sparkles size={16} /> Eco Scoring Analytics
              </h3>
              
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Circulating Reward Points:</span>
                  <span className="font-extrabold font-mono text-indigo-700">{aggregatedPointsCirculating.toLocaleString()} PTS</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Verified Businesses:</span>
                  <span className="font-extrabold text-emerald-800">{sellers.filter(s => s.isVerified).length} / {sellers.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Mean Carbon Offset Per Sale:</span>
                  <span className="font-extrabold">11.45 kg CO₂</span>
                </div>
              </div>

              {/* Progress Gauges */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>District Carbon Target (500 Tons)</span>
                    <span className="text-cyan-700 font-bold">{Math.round((parseFloat(aggregatedCarbonSaved) / 500) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-cyan-500 h-2 rounded-full transition-all" 
                      style={{ width: `${Math.min(100, Math.round((parseFloat(aggregatedCarbonSaved) / 500) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Active Certified Sellers Ratio</span>
                    <span className="text-emerald-700 font-bold">
                      {Math.round((sellers.filter(s => s.isVerified).length / sellers.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all" 
                      style={{ width: `${Math.round((sellers.filter(s => s.isVerified).length / sellers.length) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-150 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setActiveTab("products")}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#006c49] text-xs font-bold rounded-lg text-center transition-colors"
                >
                  Verify Products
                </button>
                <button 
                  onClick={() => setActiveTab("sellers")}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg text-center transition-colors"
                >
                  Review Sellers
                </button>
              </div>
            </div>

            {/* Simulated performance graphs or SVG indicators */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1.5 text-slate-700">
                  <TrendingUp size={16} /> Eco Impact & Growth Metrics
                </h3>
                <span className="text-[10px] font-bold text-[#006c49] bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Updated live</span>
              </div>

              {/* Handcrafted vector analytics chart */}
              <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden">
                <div className="absolute top-2 right-3 flex items-center gap-3 text-[9px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400"></span> Carbon Saved Index</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Active Sellers</span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono mb-2">Offsets Scale (Metric Tons) & Registered Merchants</div>

                {/* SVG Visual Graphic Chart */}
                <div className="h-44 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                    {/* Gridlines */}
                    <line x1="0" y1="40" x2="500" y2="40" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                    
                    {/* Teal curve: Carbon Saved Index starting from 200 to 425 */}
                    <path 
                      d="M 50 130 C 150 110, 250 80, 350 50 L 450 30" 
                      fill="none" 
                      stroke="#2dd4bf" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                    
                    {/* Emerald curve: Active Sellers */}
                    <path 
                      d="M 50 140 Q 150 120, 250 110 T 450 70" 
                      fill="none" 
                      stroke="#34d399" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />

                    {/* Gradient under Carbon Curve */}
                    <path 
                      d="M 50 130 C 150 110, 250 80, 350 50 L 450 30 L 450 160 L 50 160 Z" 
                      fill="url(#carbon-grad)" 
                      opacity="0.15" 
                    />

                    <defs>
                      <linearGradient id="carbon-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Data Points */}
                    <circle cx="50" cy="130" r="4" fill="#2dd4bf" />
                    <circle cx="150" cy="115" r="4" fill="#2dd4bf" />
                    <circle cx="250" cy="90" r="4" fill="#2dd4bf" />
                    <circle cx="350" cy="50" r="4" fill="#2dd4bf" />
                    <circle cx="450" cy="30" r="4" fill="#2dd4bf" />

                    <circle cx="50" cy="140" r="4" fill="#34d399" />
                    <circle cx="150" cy="130" r="4" fill="#34d399" />
                    <circle cx="250" cy="110" r="4" fill="#34d399" />
                    <circle cx="350" cy="95" r="4" fill="#34d399" />
                    <circle cx="450" cy="70" r="4" fill="#34d399" />

                    {/* Text overlays inside SVG */}
                    <text x="45" y="155" fill="#94a3b8" fontSize="8" fontFamily="monospace">JAN</text>
                    <text x="145" y="155" fill="#94a3b8" fontSize="8" fontFamily="monospace">FEB</text>
                    <text x="245" y="155" fill="#94a3b8" fontSize="8" fontFamily="monospace">MAR</text>
                    <text x="345" y="155" fill="#94a3b8" fontSize="8" fontFamily="monospace">APR</text>
                    <text x="445" y="155" fill="#94a3b8" fontSize="8" fontFamily="monospace">MAY</text>
                  </svg>
                </div>

                <div className="mt-3 text-center text-xs text-teal-300 font-semibold">
                  Community achieved +7.2% overall carbon compensation improvement in May 2026.
                </div>
              </div>

              {/* Mini event list or alert triggers */}
              <div className="space-y-2 mt-2">
                <div className="text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">Simulated District Events Log</div>
                <div className="space-y-1 bg-slate-50 p-3 rounded-lg text-xs leading-relaxed font-mono divide-y divide-slate-100">
                  <div className="py-1 flex justify-between">
                    <span className="text-emerald-700 font-bold">[INFO] 14:48 Rajesh S. ordered Eco-Bamboo Kit (+450 pts)</span>
                    <span className="text-slate-400 text-[10px]">Just Now</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span className="text-blue-700 font-bold">[SELLER] EcoSmart Systems registered solar garden tiles</span>
                    <span className="text-slate-400 text-[10px]">2h ago</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span className="text-cyan-700 font-bold">[COMPILATION] Gemini model audited carbon score baseline</span>
                    <span className="text-slate-400 text-[10px]">4h ago</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 2: PRODUCTS CATALOG SYSTEM ==================== */}
      {activeTab === "products" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top filtering controller */}
          <div id="admin-products-list-anchor" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-205 scroll-mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Filter size={14} /> Product Status Filters:
              </span>
              {(["All", "Approved", "Pending", "Rejected"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setProductFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                    productFilter === f 
                      ? "bg-[#006c49] text-white shadow-sm" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64 max-w-xs">
              <input 
                type="text" 
                placeholder="Search catalog items..." 
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#003b29]"
              />
              <Search size={14} className="text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Column - Deploy Eco Product (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-xl border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <FolderPlus className="text-[#006c49]" size={20} /> Deploy Eco-Product
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define carbon-offset metrics and assign green scores.</p>
                </div>
                
                {/* Template autofill triggers */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                  <button 
                    onClick={() => autofillTemplate(1)}
                    className="text-[9px] font-bold text-[#006c49] bg-white hover:bg-emerald-50 px-2 py-0.5 rounded transition-colors"
                  >
                    T1
                  </button>
                  <button 
                    onClick={() => autofillTemplate(2)}
                    className="text-[9px] font-bold text-teal-800 bg-white hover:bg-teal-50 px-2 py-0.5 rounded transition-colors"
                  >
                    T2
                  </button>
                  <button 
                    onClick={() => autofillTemplate(3)}
                    className="text-[9px] font-bold text-blue-800 bg-white hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
                  >
                    T3
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Product Name *</label>
                    <span className="text-[10px] text-red-500 font-bold">Required</span>
                  </div>
                  <input 
                    type="text" 
                    id="admin-add-product-name-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Biodegradable Wheat Straw Cup"
                    className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-medium scroll-mt-36"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Price (Rupees ₹) *</label>
                      <span className="text-[10px] text-red-500 font-bold">Required</span>
                    </div>
                    <input 
                      type="number" 
                      value={price}
                      onChange={e => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 1299"
                      min="1"
                      className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">CO₂ Offset (Optional)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={co2Offset}
                      onChange={e => setCo2Offset(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Auto-calculated if empty"
                      min="0.1"
                      className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Eco Reward Points (Optional)</label>
                    <input 
                      type="number" 
                      value={points}
                      onChange={e => setPoints(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="Auto-calculated if empty"
                      min="1"
                      className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-medium"
                    />
                    <p className="text-[8px] text-slate-400">Awarded to members on purchase.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-bold"
                    >
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Energy">Energy</option>
                      <option value="Home">Home</option>
                      <option value="Transport">Transport</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Seller Affiliation</label>
                    <select 
                      value={sellerName}
                      onChange={e => setSellerName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-bold"
                    >
                      {sellers.map(s => (
                        <option key={s.id} value={s.businessName}>{s.businessName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Listing Status</label>
                    <select 
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border rounded-xl bg-white text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-bold"
                    >
                      <option value="Approved">Approved (Live)</option>
                      <option value="Pending">Pending Audit</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Direct Image URL (Optional)</label>
                  <input 
                    type="url" 
                    value={image}
                    onChange={e => setImage(e.target.value)}
                    placeholder="Leave blank for dynamic high-quality eco placeholder"
                    className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Sourced Materials (Optional)</label>
                  <input 
                    type="text" 
                    value={materialUsed}
                    onChange={e => setMaterialUsed(e.target.value)}
                    placeholder="e.g. FSC Recycled Eucalyptus Wood (AI infers if blank)"
                    className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Carbon Lifecycle Description *</label>
                    <span className="text-[10px] text-red-500 font-bold">Required</span>
                  </div>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Outline the extraction process, biodegradable design, and why the product is green..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-[#006c49] font-medium"
                    required
                  ></textarea>
                </div>

                {/* Helpful Instruction Tip */}
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/40 text-[10px] text-emerald-800 leading-normal flex items-start gap-1.5 font-medium">
                  <Sparkles size={13} className="text-[#006c49] shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong>Automated AI Eco Rating:</strong> Sourcing audit handles automatically when you register the product. If raw components pass sustainability evaluation (score above 40/100), the applet successfully registers card in real-time.
                  </div>
                </div>

                {/* AI Auditing Loader Feedback */}
                {isRegistering && (
                  <div className="p-3.5 bg-emerald-950 text-white rounded-xl flex items-center gap-3 animate-pulse">
                    <RefreshCw size={16} className="animate-spin text-emerald-300" />
                    <div>
                      <div className="text-xs font-bold font-sans">Contacting AI auditor...</div>
                      <p className="text-[9px] text-emerald-200/90 leading-tight">Analyzing carbon footprint, extracting ethical materials, and indexing Eco Score on the backend.</p>
                    </div>
                  </div>
                )}

                {/* General Service Error Panel */}
                {registrationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-1">
                    <div className="text-xs font-extrabold flex items-center gap-1">
                      <AlertCircle size={14} className="text-rose-600" /> Service Fault
                    </div>
                    <p className="text-[10px] leading-relaxed text-rose-700/90">{registrationError}</p>
                  </div>
                )}

                {/* AI Sourcing Rejection Notification */}
                {registrationRejection && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-900 rounded-xl space-y-2 animate-fadeIn">
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-extrabold text-red-800 uppercase flex items-center gap-1.5">
                        <XCircle size={14} className="text-red-600" /> Sourcing Disapproved
                      </div>
                      <span className="text-[10px] font-mono font-extrabold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                        AI Score: {registrationRejection.score} / 100
                      </span>
                    </div>
                    <p className="text-[10px] text-red-700/90 leading-relaxed font-semibold">
                      This item was rejected because scores under 40 represent substandard sustainability protocols.
                    </p>
                    <div className="p-2 bg-white rounded-lg border border-red-100 text-[10px] text-slate-600 leading-relaxed italic">
                      &ldquo;{registrationRejection.explanation}&rdquo;
                    </div>
                    <p className="text-[9px] text-red-800 font-bold">
                      💡 Sourced materials containing coal, oil, toxic chemicals or single-use patterns flag instant rejections. Modify description and try again!
                    </p>
                    <button
                      type="button"
                      onClick={() => setRegistrationRejection(null)}
                      className="text-[9px] font-bold text-red-800 hover:underline"
                    >
                      Clear message
                    </button>
                  </div>
                )}

                {/* Sustainable Sourcing Success Feedback */}
                {registrationSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-slate-800 rounded-xl space-y-2 animate-fadeIn shadow-xs">
                    <div className="flex justify-between items-start">
                      <div className="text-xs font-extrabold text-[#006c49] uppercase flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600 animate-bounce" /> Eco Certification Approved!
                      </div>
                      <span className="text-[10px] font-mono font-extrabold bg-[#006c49] text-white px-2 py-0.5 rounded-full shadow-xs">
                        AI Score: {registrationSuccess.score}/100
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed text-slate-600">
                      Product <strong>{registrationSuccess.name}</strong> cleared sourcing protocol and is registered into marketplace store list.
                    </p>
                    <div className="p-2 bg-white rounded-lg border border-emerald-100 text-[9px] text-slate-500 leading-relaxed italic">
                      &ldquo;{registrationSuccess.explanation}&rdquo;
                    </div>
                    <button
                      type="button"
                      onClick={() => setRegistrationSuccess(null)}
                      className="text-[9px] font-extrabold text-[#006c49] underline cursor-pointer hover:text-emerald-800"
                    >
                      Dismiss banner
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegistering}
                  className={`w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 ${
                    isRegistering
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                      : "bg-[#006c49] hover:bg-[#005137] text-white cursor-pointer"
                  }`}
                >
                  {isRegistering ? (
                    <>
                      <RefreshCw size={12} className="animate-spin text-slate-400" />
                      <span>Registering & Eco Auditing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} className="text-amber-400 fill-amber-400 stroke-none" />
                      <span>Register & Deploy Eco-Product</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Existing Table Catalog (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-xl border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-sidebar-100">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
                      <Layers className="text-[#006c49]" size={20} /> Verified Store Offerings
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Audit files, toggle active statuses, write back specs, and manage deletions.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase">{products.length} listed</span>
                </div>

                <div className="overflow-x-auto mt-4 max-h-[440px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        <th className="px-3 py-2">Info</th>
                        <th className="px-3 py-2">Affiliation & Materials</th>
                        <th className="px-3 py-2">Score / Carbon</th>
                        <th className="px-3 py-2 text-center">Status</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {products
                        .filter(p => {
                          const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
                          if (productFilter === "All") return matchesSearch;
                          if (productFilter === "Approved") return matchesSearch && p.status === "Approved";
                          if (productFilter === "Pending") return matchesSearch && (!p.status || p.status === "Pending");
                          if (productFilter === "Rejected") return matchesSearch && p.status === "Rejected";
                          return matchesSearch;
                        })
                        .map(p => {
                          const itemStatus = p.status || "Pending";
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3 py-3 vertical-middle">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={p.image} 
                                    alt={p.name} 
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs"
                                  />
                                  <div>
                                    <span className="font-bold text-slate-800 text-xs line-clamp-1">{p.name}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-bold rounded text-[9px] uppercase">{p.category}</span>
                                      <span className="font-mono text-slate-900 font-bold">₹{p.price.toLocaleString("en-IN")}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-3 py-3 text-slate-600">
                                <div className="font-bold text-slate-800 text-[11px]">{p.sellerName || "Individual Merchant"}</div>
                                <div className="text-[10px] text-slate-400 overflow-hidden text-ellipsis line-clamp-1">{p.materialUsed || "Sustainable Ingredients"}</div>
                              </td>

                              <td className="px-3 py-3">
                                <div className="font-bold text-emerald-800 flex items-center gap-0.5">
                                  <Leaf size={10} /> -{p.co2Offset} kg CO₂
                                </div>
                                <div className="text-[10px] text-indigo-700 font-semibold font-mono">{p.points} Green Score</div>
                                {p.ecoScore && (
                                  <div className="text-[9px] text-[#006c49] font-extrabold flex items-center gap-0.5 mt-0.5">
                                    <Sparkles size={10} className="fill-[#006c49] stroke-none animate-pulse" /> AI Score: {p.ecoScore}/100
                                  </div>
                                )}
                              </td>

                              <td className="px-3 py-3 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                                  itemStatus === "Approved" 
                                    ? "bg-emerald-550/10 text-emerald-700 bg-emerald-50"
                                    : itemStatus === "Rejected"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-550/10 text-amber-700 bg-amber-50"
                                }`}>
                                  {itemStatus}
                                </span>
                              </td>

                              <td className="px-3 py-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {itemStatus !== "Approved" && (
                                    <button
                                      onClick={() => setProductStatusAttr(p.id, "Approved")}
                                      className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition-colors"
                                      title="Approve Listing"
                                    >
                                      <Check size={12} />
                                    </button>
                                  )}
                                  {itemStatus === "Approved" && (
                                    <button
                                      onClick={() => setProductStatusAttr(p.id, "Pending")}
                                      className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-colors"
                                      title="Demote to Pending"
                                    >
                                      <XCircle size={12} />
                                    </button>
                                  )}
                                  {itemStatus !== "Rejected" && (
                                    <button
                                      onClick={() => setProductStatusAttr(p.id, "Rejected")}
                                      className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded transition-colors"
                                      title="Reject Product"
                                    >
                                      <span className="material-symbols-outlined text-[13px] leading-none">block</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => openEditProduct(p)}
                                    className="p-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                                    title="Edit Product"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Do you wish to delete "${p.name}" permanently from the catalog?`)) {
                                        onDeleteProduct(p.id);
                                      }
                                    }}
                                    className="p-1 bg-rose-50 hover:bg-rose-250 hover:bg-rose-100 text-rose-700 rounded transition-colors"
                                    title="Delete product"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 3: SELLER MANAGEMENT ==================== */}
      {activeTab === "sellers" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Sellers Stats counters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Registered Sellers</div>
              <div className="text-2xl font-bold text-slate-950 mt-1">{sellers.length} Shops</div>
              <p className="text-[10px] text-slate-400 mt-1">Verified with local tax authorities</p>
            </div>
            <div className="bg-emerald-50/15 p-4 rounded-xl border border-emerald-100">
              <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Green Score average</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">94.3%</div>
              <p className="text-[10px] style-underlined text-emerald-600 font-bold mt-1">🌿 Exceeds strict carbon quotas</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider font-sans">Active & Approved</div>
              <div className="text-2xl font-bold text-slate-950 mt-1">{totalActiveSellers} Partners</div>
              <p className="text-[10px] text-slate-400 mt-1">Capable of dispatching offsets</p>
            </div>
            <div className="bg-red-50/10 p-4 rounded-xl border border-rose-100">
              <div className="text-xs text-rose-700 font-bold uppercase tracking-wider">Banned accounts</div>
              <div className="text-2xl font-bold text-rose-800 mt-1">{totalBannedSellers} Bots</div>
              <p className="text-[10px] font-bold text-rose-600 mt-1">⚠️ Audited fake sustainability claims</p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-[#003b29] flex items-center gap-1.5">
                  <Landmark size={20} /> Sustainable Seller Verification Hub
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Review credentials of green startups and apply platform constraints.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={sellerFilter}
                  onChange={e => setSellerFilter(e.target.value as any)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active only</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Banned">Banned list</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Quick search sellers..." 
                  value={sellerSearch}
                  onChange={e => setSellerSearch(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold w-48 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    <th className="px-4 py-3">Business Profile</th>
                    <th className="px-4 py-3 text-center">Green Score Indicator</th>
                    <th className="px-4 py-3">Volume Traded (Rupees)</th>
                    <th className="px-4 py-3">Total Carbon savings</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Moderations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {sellers
                    .filter(s => {
                      const matches = s.businessName.toLowerCase().includes(sellerSearch.toLowerCase()) || s.ownerName.toLowerCase().includes(sellerSearch.toLowerCase());
                      if (sellerFilter === "All") return matches;
                      return matches && s.status === sellerFilter;
                    })
                    .map(s => (
                      <tr key={s.id} className="hover:bg-slate-55/15 leading-relaxed transition-all">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            {s.businessName}
                            {s.isVerified && (
                              <span 
                                className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                                title="Platform-verified green business"
                              >
                                <Check size={8} /> Verified
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold">{s.ownerName} &bull; <code className="bg-slate-50 px-1 py-0.5 rounded font-mono text-[9px] text-[#006c49]">{s.email}</code></div>
                          <div className="text-[9px] text-slate-400 mt-0.5">Joined on {s.joinedDate}</div>
                        </td>

                        <td className="px-4 py-3 text-center vertical-middle">
                          <div className="inline-flex flex-col items-center">
                            <span className={`font-mono text-sm font-extrabold ${s.sustainabilityScore > 80 ? "text-emerald-700" : s.sustainabilityScore > 50 ? "text-amber-600" : "text-rose-600"}`}>
                              {s.sustainabilityScore}/100
                            </span>
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full mt-0.5 overflow-hidden">
                              <div 
                                className={`h-full ${s.sustainabilityScore > 80 ? "bg-emerald-500" : s.sustainabilityScore > 50 ? "bg-amber-400" : "bg-rose-500"}`}
                                style={{ width: `${s.sustainabilityScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-semibold font-mono text-slate-900">
                          ₹{s.totalSalesRupees.toLocaleString("en-IN")}
                        </td>

                        <td className="px-4 py-3 font-semibold text-emerald-700">
                          🌿 -{s.carbonOffsetContributed} kg CO₂
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide inline-block ${
                            s.status === "Active" 
                              ? "bg-emerald-50 text-emerald-800"
                              : s.status === "Banned"
                              ? "bg-rose-100 text-rose-800 font-bold"
                              : "bg-amber-50 text-amber-800"
                          }`}>
                            {s.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status !== "Active" && (
                              <button
                                onClick={() => approveSeller(s.id)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-150 hover:bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded transition-all"
                                title="Approve Business"
                              >
                                Approve
                              </button>
                            )}

                            <button
                              onClick={() => toggleVerifySeller(s.id)}
                              className={`p-1 rounded text-xs leading-none transition-all ${
                                s.isVerified 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                              title={s.isVerified ? "Revoke trusted verification badge" : "Award trusted Verification sticker"}
                            >
                              <ShieldCheck size={14} />
                            </button>

                            <button
                              onClick={() => toggleBanSeller(s.id)}
                              className={`p-1 rounded text-xs leading-none transition-colors ${
                                s.status === "Banned" 
                                  ? "bg-rose-600 text-white" 
                                  : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                              }`}
                              title={s.status === "Banned" ? "Lift account ban" : "Ban account for fake carbon claims"}
                            >
                              <Ban size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 bg-amber-50/20 p-4 rounded-xl border border-dashed border-amber-200 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 leading-relaxed">
                <strong>EcoKart AI Regulatory Standard:</strong> Every seller listed above submits self-certified environmental disclosures audited automatically via custom Gemini schemas. Flagging non-compliant materials results in immediate score deductions. Banned sellers' portfolios are frozen instantly.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: REGISTERED USERS MANAGEMENT ==================== */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* User Metrics overview info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-450 text-[11px] font-bold uppercase tracking-wide">Community Engagement</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-1">{totalUsersCount} Members</div>
                <span className="text-[10px] text-slate-400">Enrolled in dynamic rewards</span>
              </div>
              <Users size={32} className="text-indigo-600 opacity-20" />
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-450 text-[11px] font-bold uppercase tracking-wide">Circulating Rewards Pool</span>
                <div className="font-mono text-2xl font-extrabold text-indigo-700 mt-1">{aggregatedPointsCirculating.toLocaleString()} GP</div>
                <span className="text-[10px] text-slate-400">Green Points circulating among users</span>
              </div>
              <Trophy size={32} className="text-indigo-700 opacity-20" />
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-450 text-[11px] font-bold uppercase tracking-wide">Average Carbon Offsets</span>
                <div className="text-3xl font-extrabold text-emerald-800 mt-1">1.28 Tons</div>
                <span className="text-[10px] text-emerald-600 font-semibold">🌿 Over average baseline per district</span>
              </div>
              <Leaf size={32} className="text-emerald-700 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/80">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-[#003b29] flex items-center gap-1.5">
                  <Users className="text-[#006c49]" size={20} /> Customer Directory & Reward Grader
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Edit user green points manually, report fake users, and audit real-time purchase logs.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select 
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value as any)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold bg-white focus:outline-none"
                >
                  <option value="All">All Users</option>
                  <option value="Active">Active only</option>
                  <option value="Blocked">Blocked list</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Search by name/email..." 
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-bold w-48 focus:outline-none"
                />
              </div>
            </div>

            {/* Directory list container */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-505 uppercase tracking-wider">
                    <th className="px-4 py-3">Member Details</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-center">Reward Balance</th>
                    <th className="px-4 py-3 text-center">Reward Points Tweaker</th>
                    <th className="px-4 py-3">Carbon Contribution</th>
                    <th className="px-4 py-3">Recent Activity</th>
                    <th className="px-4 py-3 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {users
                    .filter(u => {
                      const matches = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                      if (userFilter === "All") return matches;
                      return matches && u.status === userFilter;
                    })
                    .map(u => {
                      const adjustmentAmount = ptsAdjustment[u.id] || 0;
                      return (
                        <tr key={u.id} className={`hover:bg-slate-50 transition-colors ${u.status === "Blocked" ? "bg-red-50/10" : ""}`}>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              {u.name}
                              {u.status === "Blocked" && (
                                <span className="bg-rose-100 text-rose-800 text-[8px] font-extrabold uppercase px-1 py-0.2 rounded font-sans">Blocked</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium font-mono">{u.email}</div>
                          </td>

                          <td className="px-4 py-3 text-slate-500 font-semibold">{u.joinedDate}</td>

                          <td className="px-4 py-3 text-center">
                            <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                              {u.greenPoints.toLocaleString()} GP
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center vertical-middle">
                            <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-lg border">
                              <input 
                                type="number" 
                                placeholder="Value"
                                value={adjustmentAmount || ""}
                                onChange={e => {
                                  const val = e.target.value === "" ? 0 : Number(e.target.value);
                                  setPtsAdjustment(prev => ({ ...prev, [u.id]: val }));
                                }}
                                className="w-14 px-1.5 py-0.5 border text-center text-xs font-bold rounded bg-white text-slate-800 font-mono focus:outline-none"
                              />
                              <button
                                onClick={() => adjustUserRewardPoints(u.id, adjustmentAmount)}
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                                title="Add reward balance"
                              >
                                <PlusCircle size={14} />
                              </button>
                              <button
                                onClick={() => adjustUserRewardPoints(u.id, -adjustmentAmount)}
                                className="p-1 text-rose-700 hover:bg-rose-50 rounded"
                                title="Deduct points"
                              >
                                <MinusCircle size={14} />
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3 font-semibold text-emerald-700">{u.carbonOffsetTons} Tons CO₂</td>

                          <td className="px-4 py-3 text-slate-500 font-medium max-w-[150px] truncate" title={u.recentActivity}>
                            {u.recentActivity}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => toggleBlockUser(u.id)}
                              className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide rounded-md transition-colors ${
                                u.status === "Blocked" 
                                  ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100" 
                                  : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                              }`}
                            >
                              {u.status === "Blocked" ? "Unblock" : "Block User"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ==================== TAB 5: SUSTAINABILITY ANALYTICS ==================== */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: Carbon Compensations */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Leaf size={14} className="text-[#006c49]" /> Carbon Offset progress
              </h4>
              <div className="text-3xl font-extrabold text-[#003b29] mt-2">{aggregatedCarbonSaved} Metric Tons</div>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                This indicates the audited volumetric mass of carbon dioxide equivalents directly avoided or retired from active grid footprints via community solar acquisitions and compost adoptions.
              </p>
              
              <div className="mt-5 space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Target 1 (Carbon Standard)</span>
                  <span>{Math.round((parseFloat(aggregatedCarbonSaved) / 500) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full transition-all" 
                    style={{ width: `${Math.min(100, Math.round((parseFloat(aggregatedCarbonSaved) / 500) * 100))}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block">Baseline comparison: +45.4% better than regional standards</span>
              </div>
            </div>

            {/* Box 2: Materials Classification Checklist */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h4 className="text-xs font-extrabold text-[#006c49] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={14} /> Sourced Composition classification
              </h4>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">100% Bio-based</div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Breakdown of vetted materials deployed across the active store catalog. Our NLP pipeline cross-references invoices against global FSC/Fair-Trade registries.
              </p>

              <div className="space-y-2 mt-4 text-xs font-semibold">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                  <span className="text-slate-600">Bamboo & Hardwood FSC fibres</span>
                  <span className="text-slate-800 font-bold">40% catalog</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                  <span className="text-slate-600">PCR Recycled ABS thermoplastic polymers</span>
                  <span className="text-slate-800 font-bold">25% catalog</span>
                </div>
                <div className="flex justify-between items-center bg-slate-55 p-2 rounded bg-emerald-50 text-[#003b29]">
                  <span>Glass, Organic Cork & Biodegradables</span>
                  <span className="font-extrabold">35% catalog</span>
                </div>
              </div>
            </div>

            {/* Box 3: Renewable Ratio Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-xl text-white relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Sustainable Integrity Badge Ratios</span>
              <div className="text-3xl font-extrabold text-white mt-1">94.2 %</div>
              <p className="text-xs text-slate-300 lead-relaxed mt-2">
                Certified sellers retain strict verified clean energy supplies. 1,482 household memberships across this administrative district unlocked sustainable reward titles.
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="text-slate-400 font-bold">VERIFICATION TIER</div>
                  <div className="text-teal-300 font-bold mt-0.5">Tier 1 Platinum Standard</div>
                </div>
                <div className="px-3 py-1.5 bg-white/10 rounded-lg text-emerald-300 font-bold uppercase text-[9px] tracking-wider">
                  Audited ISO-14001
                </div>
              </div>
            </div>

          </div>

          {/* Expanded simulated monthly performance analytics graph block */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-1 text-[#003b29] pb-3 border-b">
              <TrendingUp size={16} /> Extended Sustainability Forecasting Ledger (2026 Q1/Q2)
            </h3>
            
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              We collect carbon ledger credits traded dynamically in real-time. This line chart traces the calculated greenhouse gas balance offset curves across the Indian subcontinent district framework.
            </p>

            {/* High end responsive SVG line graph */}
            <div className="h-64 relative bg-[#0b1329] p-5 rounded-2xl text-white mt-5">
              <div className="absolute top-3 left-4 text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Volumetric carbon savings projection parameters</span>
              </div>

              <div className="absolute top-3 right-4 flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-cyan-400"></span> Targeted Carbon Saved</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-400"></span> Verified Reductions Achieved</span>
              </div>

              {/* Graphical representation in SVG */}
              <div className="w-full h-44 mt-6">
                <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="600" y2="30" stroke="#102a43" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="#102a43" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="#102a43" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="0" y1="120" x2="600" y2="120" stroke="#102a43" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#102a43" strokeWidth="0.5" strokeDasharray="2 2" />

                  {/* Projected target curve (cyan) */}
                  <path 
                    d="M 50 145 Q 150 120, 250 100 T 450 65 T 550 40" 
                    fill="none" 
                    stroke="#06b6d4" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />

                  {/* Verified reduction curve (indigo/violet color) */}
                  <path 
                    d="M 50 148 C 120 140, 200 115, 300 85 S 480 60, 550 35" 
                    fill="none" 
                    stroke="#818cf8" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  <circle cx="50" cy="148" r="4" fill="#818cf8" />
                  <circle cx="150" cy="135" r="4" fill="#818cf8" />
                  <circle cx="250" cy="110" r="4" fill="#818cf8" />
                  <circle cx="350" cy="80" r="4" fill="#818cf8" />
                  <circle cx="450" cy="55" r="4" fill="#818cf8" />
                  <circle cx="550" cy="35" r="4" fill="#818cf8" />

                  {/* Horizontal axes text */}
                  <text x="45" y="170" fill="#627d98" fontSize="8" fontFamily="monospace">JAN 2026</text>
                  <text x="145" y="170" fill="#627d98" fontSize="8" fontFamily="monospace">FEB 2026</text>
                  <text x="245" y="170" fill="#627d98" fontSize="8" fontFamily="monospace">MAR 2026</text>
                  <text x="345" y="170" fill="#627d98" fontSize="8" fontFamily="monospace">APR 2026</text>
                  <text x="445" y="170" fill="#627d98" fontSize="8" fontFamily="monospace">MAY 2026</text>
                  <text x="545" y="170" fill="#627d98" fontSize="8" fontFamily="monospace">JUN 2026</text>

                  {/* Vertical scale markings */}
                  <text x="5" y="33" fill="#627d98" fontSize="7" fontFamily="monospace">500 Tons</text>
                  <text x="5" y="93" fill="#627d98" fontSize="7" fontFamily="monospace">250 Tons</text>
                  <text x="5" y="153" fill="#627d98" fontSize="7" fontFamily="monospace">0 Tons</text>
                </svg>
              </div>

              <div className="absolute bottom-2.5 right-4 text-[9px] text-slate-500 font-semibold font-mono">
                System calculated offsets factor is adjusted automatically under ISO certification.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ==================== EMBEDDED MODAL: EDIT PRODUCT DETAILS ==================== */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-55 overflow-y-auto z-[9999]">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 md:p-8 space-y-4 shadow-2xl border relative animate-scaleUp text-xs">
            <button 
              onClick={() => setEditingProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1"
            >
              ✕
            </button>
            
            <div className="border-b pb-3.5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                <Edit3 className="text-blue-600" size={18} /> Edit Product Specifications
              </h3>
              <p className="text-slate-405 text-slate-400 font-semibold mt-0.5">Amending records for unique ID: <code className="bg-slate-50 px-1 py-0.5 rounded text-blue-800 font-mono text-[10px]">{editingProduct.id}</code></p>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Edit Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Price in Rupees (₹)</label>
                  <input 
                    type="number" 
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">CO₂ Saved Offset (kg)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={editCo2}
                    onChange={e => setEditCo2(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Points Assigned</label>
                  <input 
                    type="number" 
                    value={editPoints}
                    onChange={e => setEditPoints(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Edit Category</label>
                  <select 
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl font-bold focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Energy">Energy</option>
                    <option value="Home">Home</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Seller Affiliate</label>
                  <input 
                    type="text" 
                    value={editSeller}
                    onChange={e => setEditSeller(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Approval State</label>
                  <select 
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl font-bold focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending Audit</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Sourced Materials</label>
                <input 
                  type="text" 
                  value={editMaterial}
                  onChange={e => setEditMaterial(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Direct Image URL</label>
                <input 
                  type="text" 
                  value={editImage}
                  onChange={e => setEditImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Carbon Lifecycle Description</label>
                <textarea 
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-xl font-medium focus:ring-1 focus:ring-blue-500"
                  required
                ></textarea>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-505 uppercase hover:bg-slate-50"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-wider shadow-sm flex items-center gap-1"
                >
                  <Save size={13} /> Save records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
