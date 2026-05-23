import React, { useState } from "react";
import { 
  ShoppingBag, 
  Sparkles, 
  Search, 
  Check, 
  SlidersHorizontal, 
  Star, 
  Leaf, 
  ArrowRight,
  Plus
} from "lucide-react";
import { Product } from "../types";

interface MarketplaceTabProps {
  products: Product[];
  onOrderProduct: (product: Product) => void;
}

export default function MarketplaceTab({ products, onOrderProduct }: MarketplaceTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Home" | "Energy" | "Lifestyle">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "price-asc" | "price-desc" | "co2">("popular");
  
  // Selected product for detailed modal view
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  
  // Success toast state
  const [purchasedProduct, setPurchasedProduct] = useState<string | null>(null);

  // Filter products by category & search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "co2") return b.co2Offset - a.co2Offset;
    return b.rating - a.rating; // default: popular (rating)
  });

  // Handle buy click
  const handleBuy = (product: Product) => {
    onOrderProduct(product);
    setPurchasedProduct(product.name);
    setTimeout(() => {
      setPurchasedProduct(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Toast Notice of Purchase */}
      {purchasedProduct && (
        <div className="fixed top-24 right-6 bg-emerald-900 border border-emerald-400/20 text-white p-5 rounded-2xl shadow-xl z-50 flex items-center gap-4 animate-bounce max-w-sm">
          <div className="p-3 bg-emerald-500 rounded-full text-white">
            <Check size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-200">Order Placed Successfully!</h4>
            <p className="text-xs text-white/80 mt-1">Bought **{purchasedProduct}**. Your carbon offset tracker and green points have been updated!</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-950 to-emerald-950 p-8 text-white shadow-md">
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-400 via-emerald-800 to-transparent pointer-events-none"></div>
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-teal-300">
            <Sparkles size={12} />
            <span>AI Sustainable Selection</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display-lg font-bold tracking-tight text-white">
            Ethical Eco Marketplace
          </h1>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
            Every purchase automatically neutralizes carbon equivalents, grants eco-incentive rewards, and funds reforestation efforts globally.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 border-primary/5">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {(["All", "Energy", "Home", "Lifestyle"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                selectedCategory === cat 
                  ? "bg-primary text-white shadow-sm" 
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-full text-xs bg-transparent focus:ring-1 focus:ring-primary w-full md:w-48 text-on-surface"
            />
          </div>

          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <SlidersHorizontal size={14} className="text-slate-400" />
            <select 
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent border-none py-1.5 focus:ring-0 text-slate-700 dark:text-slate-400 font-bold"
            >
              <option value="popular">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="co2">Highest CO₂ Offset</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((p) => (
          <div 
            key={p.id}
            className="glass-card rounded-3xl overflow-hidden border border-slate-200/20 dark:border-slate-800/10 flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-primary/20 bg-white"
          >
            {/* Image Containment */}
            <div className="relative h-48 bg-slate-100 overflow-hidden group">
              <img 
                src={p.image} 
                alt={p.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3 bg-emerald-900/90 text-teal-300 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Leaf size={10} />
                <span>-{p.co2Offset.toFixed(1)} kg CO₂</span>
              </div>
              <div className="absolute top-3 right-3 bg-white/95 text-slate-900 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                <Star size={11} className="text-amber-500 fill-amber-500" />
                <span>{p.rating}</span>
              </div>
            </div>

            {/* Information Payload */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006c49]/80">{p.category}</span>
                  {p.ecoScore && (
                    <span className="inline-flex px-1.5 py-0.5 bg-emerald-50 text-[#006c49] text-[9px] font-extrabold rounded items-center gap-0.5 border border-emerald-100">
                      <Sparkles size={10} className="fill-emerald-600 stroke-none" /> AI Score: {p.ecoScore}/100
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-slate-900 mt-1 line-clamp-1">{p.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 font-sans leading-relaxed">{p.description}</p>
              </div>

              {/* Purchase Details */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Eco Price</span>
                  <span className="text-xl font-bold text-slate-900">₹{p.price.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setDetailProduct(p)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 rounded-full transition-all border border-slate-200 dark:border-slate-800"
                    title="View Details"
                  >
                    <SlidersHorizontal size={16} />
                  </button>
                  <button 
                    onClick={() => handleBuy(p)}
                    className="bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <ShoppingBag size={14} />
                    <span>Order Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Product Modal */}
      {detailProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 relative overflow-hidden shadow-2xl border border-slate-200/20 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setDetailProduct(null)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 font-bold border border-slate-200"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden relative">
                <img 
                  src={detailProduct.image} 
                  alt={detailProduct.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-3 left-3 bg-[#0a5c3d] text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide">
                  -{detailProduct.co2Offset} kg CO₂
                </span>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-primary font-bold">{detailProduct.category}</span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">{detailProduct.name}</h2>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-slate-800">{detailProduct.rating} / 5.0</span>
                    <span className="text-xs text-slate-400 font-medium">(Verified Eco Reviews)</span>
                  </div>
                </div>

                <div className="text-[13px] text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Product Description</h4>
                  <p>{detailProduct.description}</p>
                </div>

                {detailProduct.ecoScore && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/40 text-xs flex flex-col gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold shadow-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-500 fill-amber-500 stroke-none animate-pulse" />
                        AI Certified Eco Score:
                      </span>
                      <span className="font-extrabold text-[#006c49] text-[13px]">{detailProduct.ecoScore} / 100</span>
                    </div>
                    <div className="w-full bg-emerald-200/40 rounded-full h-1.5 mt-1">
                      <div className="bg-[#006c49] h-1.5 rounded-full" style={{ width: `${detailProduct.ecoScore}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/40 text-xs flex flex-wrap gap-4 text-emerald-800 dark:text-emerald-300 font-semibold justify-between items-center">
                  <span>🍃 Dynamic Carbon Savings:</span>
                  <span className="font-bold">{detailProduct.co2Offset} kilograms</span>
                  <span>🏆 Reward Green Points:</span>
                  <span className="font-bold">+{detailProduct.points} pts</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Eco Price</span>
                    <span className="text-2xl font-bold text-slate-900">₹{detailProduct.price.toLocaleString("en-IN")}</span>
                  </div>

                  <button 
                    onClick={() => {
                      handleBuy(detailProduct);
                      setDetailProduct(null);
                    }}
                    className="flex-1 max-w-xs bg-primary hover:bg-primary/95 text-white font-bold uppercase tracking-wider py-3.5 rounded-full flex items-center justify-center gap-2 shadow-sm transition-all text-xs"
                  >
                    <ShoppingBag size={16} />
                    <span>Confirm Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
