import { useState } from 'react';
import { Activity, Eye, EyeOff, Shield, Clock, Stethoscope } from 'lucide-react';
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
      onLogin(displayName, user.uid, user.email);
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found with this email');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Health Companion</h1>
              <p className="text-blue-100 text-xs">Healthcare that listens.</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">Welcome back to your clinical dashboard.</h2>
          <p className="text-blue-100 text-base leading-relaxed max-w-md">Access patient records, manage diagnoses, and provide better care — all in one place.</p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: Shield, text: 'HIPAA compliant & secure' },
            { icon: Clock, text: 'Real-time patient monitoring' },
            { icon: Stethoscope, text: 'AI-powered diagnostics' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 sm:py-12">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Activity className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">AI Health Companion</h1>
              <p className="text-xs text-slate-400">Healthcare that listens.</p>
            </div>
          </div>

          <div className="animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">Sign in</h2>
            <p className="text-sm text-slate-400 mb-8">Enter your credentials to access the doctor portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 animate-slideIn">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.com"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-600 font-semibold hover:underline underline-offset-2">Sign up</a>
            </p>
          </div>

          <p className="text-center text-xs text-slate-300 mt-8">
            Powered by AI Health Companion &middot; SIH 2026
          </p>
        </div>
      </div>
    </div>
  );
}
