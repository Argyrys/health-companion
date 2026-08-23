import { useState } from 'react';
import { Activity, Eye, EyeOff, Stethoscope } from 'lucide-react';
import { loginDoctor } from '../services/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await loginDoctor(email, password);
      const name = user.email.split('@')[0];
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      onLogin(displayName);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Login failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center px-4 py-8 sm:p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-200 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        <div className="text-center mb-6 sm:mb-8 animate-fadeIn">
          <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-5 shadow-xl border border-white/30">
            <Activity className="w-7 h-7 sm:w-11 sm:h-11 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">AI Health Companion</h1>
          <p className="text-emerald-100 mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium">Healthcare that listens.</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/50 animate-slideIn">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">Doctor Portal</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs sm:text-sm px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <div className="mt-4 sm:mt-5 text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs sm:text-sm text-white/80">
            Don't have an account?{' '}
            <a href="/signup" className="text-white font-semibold hover:underline underline-offset-2">
              Sign up
            </a>
          </p>
        </div>

        <p className="text-center text-[10px] sm:text-xs text-white/50 mt-5 sm:mt-6">
          Powered by AI Health Companion &middot; SIH 2026
        </p>
      </div>
    </div>
  );
}
