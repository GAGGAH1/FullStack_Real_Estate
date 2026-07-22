import { useState } from 'react';
import axios from 'axios';
import { X, Lock, Mail, User, ShieldCheck, Landmark } from 'lucide-react';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('buyer'); // buyer, agent
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick-autofill for evaluation convenience
  const handleAutofill = (type) => {
    setError('');
    if (type === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
      setIsLogin(true);
    } else if (type === 'agent') {
      setEmail('agent@example.com');
      setPassword('agent123');
      setIsLogin(true);
    } else if (type === 'buyer') {
      setEmail('buyer@example.com');
      setPassword('buyer123');
      setIsLogin(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password } 
        : { name, email, password, role };

      const res = await axios.post(endpoint, body);
      const data = res.data;
      
      // Save token & success callback
      localStorage.setItem('token', data.token);
      if (onAuthSuccess) onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Network error. Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth_modal_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div id="auth_modal_content" className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Banner */}
        <div className="bg-slate-950 text-white px-6 py-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Landmark size={20} className="text-white" />
            <div>
              <h3 className="font-sans font-bold text-base leading-none">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Authenticate with EstateHub properties
              </p>
            </div>
          </div>
          <button
            id="btn_close_auth_modal"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo Credentials quick fill */}
        <div className="bg-slate-100 border-b border-gray-200 px-6 py-3.5 text-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block mb-2">
            🔑 DEMO ACCOUNT INSTANT AUTOFILL
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              id="autofill_btn_admin"
              type="button"
              onClick={() => handleAutofill('admin')}
              className="bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-100 text-slate-800 hover:text-indigo-700 font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-lg transition-all"
            >
              Admin LogIn
            </button>
            <button
              id="autofill_btn_agent"
              type="button"
              onClick={() => handleAutofill('agent')}
              className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-100 text-slate-800 hover:text-blue-700 font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-lg transition-all"
            >
              Agent LogIn
            </button>
            <button
              id="autofill_btn_buyer"
              type="button"
              onClick={() => handleAutofill('buyer')}
              className="bg-white hover:bg-green-50 border border-gray-200 hover:border-green-100 text-slate-800 hover:text-green-700 font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-lg transition-all"
            >
              Buyer LogIn
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <p id="auth_error_message" className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded-lg">
              {error}
            </p>
          )}

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. buyer@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Sign Up Profile Role
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  id="btn_role_buyer"
                  onClick={() => setRole('buyer')}
                  className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    role === 'buyer' 
                      ? 'border-slate-900 bg-slate-50 text-slate-950 font-bold ring-1 ring-slate-900' 
                      : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                >
                  Buyer (Inquire listings)
                </button>
                <button
                  type="button"
                  id="btn_role_agent"
                  onClick={() => setRole('agent')}
                  className={`py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                    role === 'agent' 
                      ? 'border-slate-900 bg-slate-50 text-slate-950 font-bold ring-1 ring-slate-900' 
                      : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                  }`}
                >
                  Agent (Add property)
                </button>
              </div>
            </div>
          )}

          <button
            id="btn_auth_submit"
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer disabled:bg-slate-300"
          >
            <ShieldCheck size={14} />
            {loading ? 'Processing...' : isLogin ? 'Sign In Securely' : 'Complete Registration'}
          </button>

          {/* Switch tabs */}
          <div className="text-center mt-3.5 pt-3.5 border-t border-gray-50 text-xs">
            {isLogin ? (
              <p className="text-gray-500">
                New to the platform?{' '}
                <button
                  id="btn_toggle_to_signup"
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className="font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  Create credentials
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Already registered?{' '}
                <button
                  id="btn_toggle_to_login"
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className="font-bold text-slate-900 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}
