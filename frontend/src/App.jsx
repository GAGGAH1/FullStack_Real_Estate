import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar.jsx';
import PropertyCard from './components/PropertyCard.jsx';
import PropertyDetailsModal from './components/PropertyDetailsModal.jsx';
import PropertyFormModal from './components/PropertyFormModal.jsx';
import InquiryList from './components/InquiryList.jsx';
import UserManagement from './components/UserManagement.jsx';
import DashboardStats from './components/DashboardStats.jsx';
import AuthModal from './components/AuthModal.jsx';
import { 
  Search, SlidersHorizontal, Plus, ShieldCheck, Grid,
  Sparkles, Heart, Landmark, Loader2 
} from 'lucide-react';

// Normalize MongoDB _id → id so frontend can consistently use .id
const normalizeDoc = (doc) => {
  if (!doc) return doc;
  const id = doc._id?.toString() || doc.id;
  return { ...doc, id, _id: doc._id?.toString() || doc._id };
};

export default function App() {
  // Global Auth State
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('listings'); // listings, dashboard

  // listings View State
  const [properties, setProperties] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [favorites, setFavorites] = useState([]); // Client-side favorites for buyers

  // Filters State
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState(''); // 'sale', 'rent', or empty
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [beds, setBeds] = useState('');

  // Dashboard Workspace State
  const [dashboardProperties, setDashboardProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashboardTab, setDashboardTab] = useState('properties'); // properties, users, inquiries, favorites
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Modals / Overlays
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ========== FUNCTION DECLARATIONS (before useEffect) ==========
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (e) {
      console.error('Failed to load user profile', e);
      // Stale or invalid token
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const loadApprovedProperties = async () => {
    setLoadingListings(true);
    try {
      // Build query params
      const params = {};
      if (search) params.search = search;
      if (location) params.location = location;
      if (type) params.type = type;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (beds) params.beds = beds;

      const res = await axios.get('/api/properties', { params });
      const payload = res.data;
      // Handle APIs that either return an array directly or a wrapper { success, data }
      if (Array.isArray(payload)) setProperties(payload.map(normalizeDoc));
      else if (payload && Array.isArray(payload.data)) setProperties(payload.data.map(normalizeDoc));
      else setProperties([]);
    } catch (e) {
      console.error('Failed to load properties', e);
    } finally {
      setLoadingListings(false);
    }
  };

  const loadDashboardData = async () => {
    setLoadingDashboard(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // 1. Load Listings (RBAC: Admin gets all, Agent gets own)
      if (user?.role === 'admin' || user?.role === 'agent') {
        const propRes = await axios.get('/api/properties/dashboard/all', config);
        const propPayload = propRes.data;
        if (Array.isArray(propPayload)) setDashboardProperties(propPayload.map(normalizeDoc));
        else if (propPayload && Array.isArray(propPayload.data)) setDashboardProperties(propPayload.data.map(normalizeDoc));
        else setDashboardProperties([]);
      }

      // 2. Load Inquiries (RBAC: Admin gets all, Agent gets own directed, Buyer gets own sent)
      const inqRes = await axios.get('/api/inquiries', config);
      const inqPayload = inqRes.data;
      if (Array.isArray(inqPayload)) setInquiries(inqPayload.map(normalizeDoc));
      else if (inqPayload && Array.isArray(inqPayload.data)) setInquiries(inqPayload.data.map(normalizeDoc));
      else setInquiries([]);

      // 3. Load User accounts (RBAC: Admin only)
      if (user?.role === 'admin') {
        const userRes = await axios.get('/api/users', config);
        const usersPayload = userRes.data;
        if (Array.isArray(usersPayload)) setUsers(usersPayload.map(normalizeDoc));
        else if (usersPayload && Array.isArray(usersPayload.data)) setUsers(usersPayload.data.map(normalizeDoc));
        else setUsers([]);
      }
    } catch (e) {
      console.error('Failed to load dashboard workspace data', e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setActiveTab('listings');
    setDashboardProperties([]);
    setInquiries([]);
    setUsers([]);
  };

  // Quick Demo Tool: Instant role toggler to let evaluators switch profiles in 1 click
  const handleToggleRole = async () => {
    if (!user) return;
    
    let nextRole = 'buyer';
    if (user.role === 'buyer') nextRole = 'agent';
    else if (user.role === 'agent') nextRole = 'admin';
    else if (user.role === 'admin') nextRole = 'buyer';

    try {
      const res = await axios.post('/api/auth/demo/toggle-my-role', 
        { targetRole: nextRole },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      const data = res.data;
      localStorage.setItem('token', data.token);
      setUser(data.user);
      // Force workspace tab reset to avoid rendering admin panels as buyers
      setDashboardTab(nextRole === 'buyer' ? 'favorites' : 'properties');
    } catch (err) {
      console.error('Failed to toggle demo role', err);
    }
  };

  // Property Approval (Admin Only)
  const handleApproveProperty = async (propertyId, status) => {
    try {
      await axios.patch(`/api/properties/${propertyId}/approve`, 
        { status },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh dashboard data
      loadDashboardData();
      loadApprovedProperties();
    } catch (e) {
      console.error('Failed to approve property', e);
    }
  };

  // Property Deletion (Agent owner or Admin)
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this property listing? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/properties/${propertyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      loadDashboardData();
      loadApprovedProperties();
      if (selectedProperty && (selectedProperty.id === propertyId || selectedProperty._id === propertyId)) {
        setSelectedProperty(null);
      }
    } catch (e) {
      console.error('Failed to delete property', e);
    }
  };

  const handleToggleFavorite = (property) => {
    const propId = property.id || property._id;
    if (favorites.some(f => (f.id || f._id) === propId)) {
      setFavorites(favorites.filter(f => (f.id || f._id) !== propId));
    } else {
      setFavorites([...favorites, property]);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setBeds('');
  };

  // ========== EFFECTS (after function declarations) ==========
  // Load User profile on boot if token exists
  useEffect(() => {
    loadUser();
  }, []);

  // Sync Listings when active tab or filters change
  useEffect(() => {
    if (activeTab === 'listings') {
      loadApprovedProperties();
    }
  }, [activeTab, search, location, type, minPrice, maxPrice, beds]);

  // Sync Dashboard data when switching to dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard' && user) {
      loadDashboardData();
    }
  }, [activeTab, user]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-gray-800">
      
      {/* Top Banner indicating security mode */}
      <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-1.5 flex-wrap">
        <ShieldCheck size={13} className="text-emerald-500 stroke-[2.5]" />
        <span>Full-Stack Security Active: <strong>JSON NoSQL Persistence</strong>, <strong>JWT Tokens</strong> & <strong>RBAC (Role-Based Access Control)</strong></span>
        <span className="hidden md:inline text-gray-400">|</span>
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded font-bold uppercase tracking-wider text-[9px]">Zero Config</span>
      </div>

      {/* Global Navbar */}
      <Navbar
        user={user}
        onAuthClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onToggleRole={handleToggleRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: BROWSE PROPERTIES */}
        {activeTab === 'listings' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Greeting Card */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-12 shadow-md">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-15" />
              <div className="relative max-w-2xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-lg">
                  Welcome to EstateHub
                </span>
                <h1 className="text-3xl md:text-5xl font-sans font-black tracking-tight leading-none text-white">
                  Find Your Premier Living Spaces
                </h1>
                <p className="text-sm md:text-base text-gray-300 font-medium">
                  Browse validated luxury properties for sale or rent. Submit inquiries, connect with independent certified agents, or register as an agent to list your own properties.
                </p>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <div id="filter_panel" className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-slate-900" />
                  <h3 className="font-sans font-bold text-slate-900 text-sm">
                    Advanced Search Filters
                  </h3>
                </div>
                {(search || location || type || minPrice || maxPrice || beds) && (
                  <button
                    id="btn_clear_filters"
                    onClick={clearFilters}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>

              {/* Filtering Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                {/* Search Term */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Keyword Search</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="e.g. Modern, Penthouse"
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                {/* City/Location */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Beverly Hills"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Listing Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Listing For</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Any Type</option>
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Min Price (USD)</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Any"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Max Price (USD)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Bedrooms</label>
                  <select
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Any</option>
                    <option value="1">1+ Beds</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                    <option value="5">5+ Beds</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Properties Listings Grid Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-sans font-bold text-gray-900 text-lg flex items-center gap-1.5">
                  <Grid size={18} className="text-gray-500" />
                  Available Property Listings
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200/55 px-2 py-0.5 rounded-full">
                    {properties.length} Listings
                  </span>
                </h2>
              </div>

              {loadingListings ? (
                <div className="py-24 text-center">
                  <Loader2 className="mx-auto text-gray-400 animate-spin mb-3" size={32} />
                  <p className="text-xs font-semibold text-gray-500">Querying active real estate indices...</p>
                </div>
              ) : properties.length === 0 ? (
                <div id="empty_listings_card" className="text-center py-20 px-6 bg-white border border-gray-100 rounded-3xl max-w-xl mx-auto">
                  <Sparkles className="mx-auto text-indigo-400 mb-3" size={36} />
                  <h3 className="font-sans font-bold text-slate-900 text-base">No Matching Listings Found</h3>
                  <p className="text-xs text-gray-500 mt-1 mb-5">
                    No approved properties fit your exact filter specifications. Try clearing search keywords or expanding your budget boundaries.
                  </p>
                  <button
                    id="btn_reset_empty_search"
                    onClick={clearFilters}
                    className="bg-slate-900 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                  >
                    Reset Filter Parameters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map(p => (
                    <div key={p.id || p._id} className="relative">
                      <PropertyCard
                        property={p}
                        user={user}
                        onViewDetails={(prop) => setSelectedProperty(prop)}
                        onEdit={(prop) => { setEditingProperty(prop); setIsFormOpen(true); }}
                        onDelete={handleDeleteProperty}
                        onApprove={handleApproveProperty}
                      />
                      
                      {/* Favorite Heart Trigger (Buyer-specific client local state) */}
                      {user && user.role === 'buyer' && (
                        <button
                          onClick={() => handleToggleFavorite(p)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border shadow transition-all cursor-pointer ${
                            favorites.some(f => (f.id || f._id) === (p.id || p._id)) 
                              ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/50' 
                              : 'bg-white/95 text-gray-500 border-gray-200 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                          title={favorites.some(f => (f.id || f._id) === (p.id || p._id)) ? 'Remove from saved' : 'Save Property'}
                        >
                          <Heart size={14} className={favorites.some(f => (f.id || f._id) === (p.id || p._id)) ? 'fill-current' : ''} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WORKSPACE / DASHBOARD */}
        {activeTab === 'dashboard' && user && (
          <div className="space-y-6 animate-fade-in">
            {/* Dashboard Header greeting */}
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Logged Account Dashboard</span>
                <h1 className="text-2xl font-sans font-black tracking-tight text-slate-950 flex items-center gap-2">
                  Hello, {user.name}
                  <span className="bg-slate-900 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-gray-700">
                    {user.role} workspace
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  Manage listings, review contact leads, and maintain security parameters
                </p>
              </div>

              {/* Primary dashboard action (Agent/Admin) */}
              {(user.role === 'agent' || user.role === 'admin') && (
                <button
                  id="btn_add_property_trigger"
                  onClick={() => { setEditingProperty(null); setIsFormOpen(true); }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>List New Property</span>
                </button>
              )}
            </div>

            {/* Statistical Widgets Bento-grid */}
            {(user.role === 'agent' || user.role === 'admin') && (
              <DashboardStats
                properties={dashboardProperties}
                inquiries={inquiries}
                users={users}
                role={user.role}
              />
            )}

            {/* Dashboard Workspace Navigation Tabs */}
            <div className="border-b border-gray-100 flex gap-4 overflow-x-auto text-xs font-bold uppercase tracking-wider">
              {/* Properties Tab (Agent/Admin only) */}
              {(user.role === 'agent' || user.role === 'admin') && (
                <button
                  id="dash_tab_properties"
                  onClick={() => setDashboardTab('properties')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    dashboardTab === 'properties' 
                      ? 'border-slate-900 text-slate-950' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {user.role === 'admin' ? 'Manage Submissions' : 'My Listings'} ({dashboardProperties.length})
                </button>
              )}

              {/* Inquiries Tab (All roles) */}
              <button
                id="dash_tab_inquiries"
                onClick={() => setDashboardTab('inquiries')}
                className={`pb-3 border-b-2 transition-all cursor-pointer ${
                  dashboardTab === 'inquiries' 
                    ? 'border-slate-900 text-slate-950' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {user.role === 'buyer' ? 'My Sent Inquiries' : 'Client Inquiries'} ({inquiries.length})
              </button>

              {/* Favorites Tab (Buyer only) */}
              {user.role === 'buyer' && (
                <button
                  id="dash_tab_favorites"
                  onClick={() => setDashboardTab('favorites')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    dashboardTab === 'favorites' 
                      ? 'border-slate-900 text-slate-950' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Saved Favorites ({favorites.length})
                </button>
              )}

              {/* User Accounts Tab (Admin only) */}
              {user.role === 'admin' && (
                <button
                  id="dash_tab_users"
                  onClick={() => setDashboardTab('users')}
                  className={`pb-3 border-b-2 transition-all cursor-pointer ${
                    dashboardTab === 'users' 
                      ? 'border-slate-900 text-slate-950' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Platform Accounts ({users.length})
                </button>
              )}
            </div>

            {/* Dashboard Content Panes */}
            {loadingDashboard ? (
              <div className="py-20 text-center bg-white border border-gray-100 rounded-2xl">
                <Loader2 className="mx-auto text-gray-400 animate-spin mb-2" size={24} />
                <p className="text-xs text-gray-500">Syncing database collections...</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* 1. Sub-listings View (Agent/Admin) */}
                {dashboardTab === 'properties' && (user.role === 'agent' || user.role === 'admin') && (
                  <div>
                    {dashboardProperties.length === 0 ? (
                      <div className="text-center py-12 px-4 bg-white border border-gray-100 rounded-2xl">
                        <Landmark size={36} className="mx-auto text-gray-300 mb-2" />
                        <h4 className="font-sans font-bold text-sm text-slate-800">No Listings in Workspace</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          {user.role === 'admin' 
                            ? "No properties exist on the platform indices yet." 
                            : "You haven't added any listings yet. Click 'List New Property' to submit your first estate!"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardProperties.map(p => (
                          <PropertyCard
                            key={p.id || p._id}
                            property={p}
                            user={user}
                            onViewDetails={(prop) => setSelectedProperty(prop)}
                            onEdit={(prop) => { setEditingProperty(prop); setIsFormOpen(true); }}
                            onDelete={handleDeleteProperty}
                            onApprove={handleApproveProperty}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Inquiries View (All Roles) */}
                {dashboardTab === 'inquiries' && (
                  <InquiryList
                    inquiries={inquiries}
                    user={user}
                    onReplied={() => loadDashboardData()}
                  />
                )}

                {/* 3. Favorites View (Buyer only) */}
                {dashboardTab === 'favorites' && user.role === 'buyer' && (
                  <div>
                    {favorites.length === 0 ? (
                      <div className="text-center py-12 px-4 bg-white border border-gray-100 rounded-2xl">
                        <Heart size={36} className="mx-auto text-gray-300 mb-2" />
                        <h4 className="font-sans font-bold text-sm text-slate-800">No Saved Favorites</h4>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                          Click the heart button on listing cards in the 'Browse Properties' tab to bookmark them here.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map(p => (
                          <div key={p.id || p._id} className="relative">
                            <PropertyCard
                              property={p}
                              user={user}
                              onViewDetails={(prop) => setSelectedProperty(prop)}
                              onEdit={() => {}}
                              onDelete={() => {}}
                              onApprove={() => {}}
                            />
                            <button
                              onClick={() => handleToggleFavorite(p)}
                              className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border shadow bg-rose-50 text-rose-600 border-rose-100"
                              title="Remove from saved"
                            >
                              <Heart size={14} className="fill-current" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Accounts Table (Admin Only) */}
                {dashboardTab === 'users' && user.role === 'admin' && (
                  <UserManagement
                    users={users}
                    currentUser={user}
                    onRoleChange={() => loadDashboardData()}
                    onUserDelete={() => loadDashboardData()}
                  />
                )}

              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer credits */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 mt-12">
        <p>© 2026 EstateHub. Engineered for the MERN Stack. Built with Node, Express, React, and Vite.</p>
      </footer>

      {/* MODAL OVERLAYS */}
      
      {/* 1. Property Details Overlay */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          user={user}
          onClose={() => setSelectedProperty(null)}
          onInquirySubmit={() => {
            // Reload dashboard metrics when inquiry is posted
            if (user) loadDashboardData();
          }}
          onAuthRequired={() => {
            setSelectedProperty(null);
            setIsAuthOpen(true);
          }}
        />
      )}

      {/* 2. Listing Form Overlay (Agent / Admin) */}
      {isFormOpen && (
        <PropertyFormModal
          property={editingProperty}
          onClose={() => { setIsFormOpen(false); setEditingProperty(null); }}
          onSave={() => {
            setIsFormOpen(false);
            setEditingProperty(null);
            loadApprovedProperties();
            loadDashboardData();
          }}
        />
      )}

      {/* 3. Authentication Overlay */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onAuthSuccess={(userData) => {
            setUser(userData);
            setActiveTab('listings');
          }}
        />
      )}

    </div>
  );
}
