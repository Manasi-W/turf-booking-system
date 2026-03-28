"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MapPin, X, LayoutGrid, Map as MapIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState(searchParams.get("view") || "grid");
  
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [location, setLocation] = useState(searchParams.get("loc") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("price") || "");
  const [sportType, setSportType] = useState(searchParams.get("sport") || "");

  // Update URL on form submit
  const applyFilters = (newView?: string) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (location) params.set("loc", location);
    if (maxPrice) params.set("price", maxPrice);
    if (sportType) params.set("sport", sportType);
    
    // Use the provided newView or the current view state
    const currentView = newView || view;
    if (currentView !== "grid") params.set("view", currentView);
    
    router.push(`/explore?${params.toString()}`);
    setIsOpen(false);
  };
  
  const handleToggleView = (v: string) => {
    setView(v);
    applyFilters(v);
  };

  // Apply search on Enter key or button click
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setMaxPrice("");
    setSportType("");
    setView("grid");
    router.push('/explore');
    setIsOpen(false);
  };

  const hasActiveFilters = location || maxPrice || sportType;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-turf-dark mb-2">Explore Turfs</h1>
          <p className="text-muted-foreground">Find the perfect spot for your next match.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button 
              onClick={() => handleToggleView("grid")}
              className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-white text-turf-green shadow-sm' : 'text-muted-foreground hover:text-turf-dark'}`}
              title="Grid View"
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => handleToggleView("map")}
              className={`p-2 rounded-xl transition-all ${view === 'map' ? 'bg-white text-turf-green shadow-sm' : 'text-muted-foreground hover:text-turf-dark'}`}
              title="Map View"
            >
              <MapIcon size={20} />
            </button>
          </div>

          <div className="relative flex-grow md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              placeholder="Search by name..." 
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green transition-all"
            />
          </div>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-3 border rounded-2xl transition-all flex items-center gap-2 ${isOpen || hasActiveFilters ? 'bg-turf-green text-white border-turf-green shadow-lg shadow-turf-green/20' : 'bg-white border-gray-200 text-turf-dark hover:bg-gray-50'}`}
          >
            <Filter size={20} />
            <span className="md:hidden font-bold">Filters</span>
            {hasActiveFilters && (
               <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-2 right-2 md:relative md:top-auto md:right-auto"></span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {isOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-turf-dark flex items-center gap-2">
              <Filter size={18} className="text-turf-green" /> 
              Advanced Filters
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
              <X size={20} />
            </button>
          </div>
          
          <form 
            onSubmit={(e) => { e.preventDefault(); applyFilters(); }} 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="space-y-2">
              <label className="text-sm font-bold text-turf-dark block">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Downtown, Stadium Road" 
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-turf-dark block">Maximum Price (₹/hr)</label>
              <input 
                type="number" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 1500" 
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-turf-dark block">Sport Type</label>
              <select 
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-turf-green/20 focus:border-turf-green appearance-none"
              >
                <option value="">Any Sport</option>
                <option value="Football">Football</option>
                <option value="Cricket">Cricket</option>
                <option value="Tennis">Tennis</option>
                <option value="Basketball">Basketball</option>
                <option value="Badminton">Badminton</option>
              </select>
            </div>
            
            <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t mt-2">
              <button 
                type="button" 
                onClick={clearFilters}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                Clear All
              </button>
              <button 
                type="submit" 
                className="px-6 py-2.5 text-sm font-bold bg-turf-green text-white rounded-xl shadow-md shadow-turf-green/20 hover:bg-turf-dark transition-all"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
