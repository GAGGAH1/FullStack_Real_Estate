import { Home, LogIn, LogOut, RefreshCw, LayoutDashboard } from 'lucide-react';

export default function Navbar({ user, onAuthClick, onLogout, onToggleRole, activeTab, setActiveTab }) {
  return (
    <header id="app_navbar" className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div 
            id="nav_logo"
            onClick={() => setActiveTab('listings')}
            className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
          >
            <div className="p-2 bg-slate-900 rounded-lg text-white">
              <Home size={20} className="stroke-[2.5]" />
            </div>
            <span className="font-sans font-bold tracking-tight text-xl text-gray-900">
              EstateHub
            </span>
          </div>

          {/* Navigation Tab Links */}
          <nav id="nav_menu" className="hidden md:flex space-x-1">
            <button
              id="nav_btn_listings"
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'listings'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Browse Properties
            </button>
            {user && (
              <button
                id="nav_btn_dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard size={15} />
                Workspace
              </button>
            )}
          </nav>

          {/* Auth controls */}
          <div id="nav_auth_controls" className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Demo Role Toggle */}
                <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700">
                  <button
                    id="nav_btn_toggle_role"
                    onClick={onToggleRole}
                    className="flex items-center gap-1 hover:text-indigo-900 transition-colors"
                    title="Click to instantly toggle roles for testing RBAC"
                  >
                    <RefreshCw size={12} className="animate-spin-slow" />
                    Role: <span className="uppercase tracking-wider underline">{user.role}</span>
                  </button>
                </div>

                {/* Profile indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      user.role === 'admin' 
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : user.role === 'agent'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Dashboard for mobile */}
                <button
                  id="nav_mobile_dashboard_btn"
                  onClick={() => setActiveTab(activeTab === 'dashboard' ? 'listings' : 'dashboard')}
                  className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  title="Toggle Workspace"
                >
                  <LayoutDashboard size={18} />
                </button>

                {/* Logout Button */}
                <button
                  id="nav_logout_btn"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                id="nav_login_btn"
                onClick={onAuthClick}
                className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 active:scale-98 transition-all shadow-sm"
              >
                <LogIn size={16} />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
