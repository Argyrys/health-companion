import { useState, useEffect } from 'react';
import { Activity, Eye, EyeOff, ArrowRight, Heart, Shield, Zap, CheckCircle2 } from 'lucide-react';
import { loginDoctor, resetPassword, loginWithGoogle } from '../services/auth';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      onLogin(user.displayName || user.email.split('@')[0], user.uid, user.email);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // no-op
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account with this email already exists. Try signing in with email/password.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in. Ask your admin to add it in Firebase Console.');
      } else {
        setError('Google sign-in failed. Please try again.');
      }
    }
    setGoogleLoading(false);
  };

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
      else if (err.code === 'auth/too-many-requests') setError('Too many attempts. Please try again later.');
      else setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Enter your email address first');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No account found with this email');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else setError('Failed to send reset email. Please try again.');
    }
    setResetLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 px-6 pt-12 pb-16 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 -left-10 w-36 h-36 bg-blue-400 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Activity className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Health Companion</h1>
                <p className="text-blue-300 text-[11px] font-medium tracking-wide uppercase">Doctor Portal</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white leading-snug">Welcome back,<br/>Doctor</h2>
          </div>
        </div>
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full h-full text-slate-900" preserveAspectRatio="none">
            <path d="M0 48h1440V16c-240 20-480 32-720 32S240 36 0 16v32z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Desktop Left Panel */}
      <div className="hidden lg:flex lg:w-full min-h-screen">
        <div className="w-[45%] bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 relative overflow-hidden flex flex-col justify-between p-14">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-32 right-16 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-indigo-200 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Health Companion</h1>
                <p className="text-blue-300 text-xs">Healthcare that listens.</p>
              </div>
            </div>
            <h2 className="text-[2.75rem] font-bold text-white leading-[1.15] mb-5">Your clinical<br/>dashboard awaits.</h2>
            <p className="text-blue-300 text-base leading-relaxed max-w-sm">Access patient records, manage diagnoses, and deliver better care — all from one place.</p>
          </div>
          <div className="relative z-10 space-y-5">
            {[
              { icon: Shield, label: 'HIPAA Compliant', desc: 'Patient data encrypted end-to-end' },
              { icon: Zap, label: 'Real-time Sync', desc: 'Instant updates from patient app' },
              { icon: Heart, label: 'AI Diagnostics', desc: 'Smart screening & recommendations' },
            ].map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-blue-300 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Right Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-white mb-2">Sign in</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access the doctor portal</p>
            </div>
            <LoginForm
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              error={error} loading={loading}
              resetSent={resetSent} resetLoading={resetLoading}
              handleSubmit={handleSubmit} handleForgotPassword={handleForgotPassword}
              googleLoading={googleLoading} handleGoogleLogin={handleGoogleLogin}
            />
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{' '}
                <a href="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign up free</a>
              </p>
            </div>
            <p className="text-center text-xs text-slate-500 mt-10">Health Companion &middot; Smart India Hackathon 2026</p>
          </div>
        </div>
      </div>

      {/* Mobile Form */}
      <div className="lg:hidden flex-1 px-5 py-6 -mt-2">
        <div className={`w-full max-w-md mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Sign in</h2>
            <p className="text-slate-400 text-xs">Access your clinical dashboard</p>
          </div>
          <LoginForm
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            showPassword={showPassword} setShowPassword={setShowPassword}
            error={error} loading={loading}
            resetSent={resetSent} resetLoading={resetLoading}
            handleSubmit={handleSubmit} handleForgotPassword={handleForgotPassword}
            googleLoading={googleLoading} handleGoogleLogin={handleGoogleLogin}
            mobile
          />
          <div className="mt-5 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <a href="/signup" className="text-blue-400 font-semibold">Sign up free</a>
            </p>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-6">Health Companion &middot; SIH 2026</p>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ email, setEmail, password, setPassword, showPassword, setShowPassword, error, loading, resetSent, resetLoading, handleSubmit, handleForgotPassword, googleLoading, handleGoogleLogin, mobile }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm flex items-center justify-center gap-3 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className={`text-slate-400 font-medium ${mobile ? 'text-[11px]' : 'text-xs'}`}>or sign in with email</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div>
        <label className={`block font-medium text-slate-300 mb-1.5 ${mobile ? 'text-xs' : 'text-sm'}`}>Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
            <svg className="text-slate-500 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="doctor@hospital.com"
            className="w-full bg-slate-800/70 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all rounded-xl pl-11 pr-4 py-3.5 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`font-medium text-slate-300 ${mobile ? 'text-xs' : 'text-sm'}`}>Password</label>
          <div className="h-5">
            {resetSent ? (
              <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Sent!</p>
            ) : (
              <button type="button" onClick={handleForgotPassword} disabled={resetLoading} className="text-[11px] text-blue-400 font-medium hover:text-blue-300 transition-colors disabled:opacity-50">
                {resetLoading ? 'Sending...' : 'Forgot password?'}
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
            <svg className="text-slate-500 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full bg-slate-800/70 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all rounded-xl pl-11 pr-12 py-3.5 text-sm"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl border border-red-100 flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-500 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40 hover:shadow-blue-800/50 flex items-center justify-center gap-2 ${mobile ? 'py-3.5 text-sm' : 'py-3.5 text-sm'}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in...
          </>
        ) : (
          <>Sign In <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}
