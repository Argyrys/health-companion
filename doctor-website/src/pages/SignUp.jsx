import { useState, useEffect } from 'react';
import { Activity, Eye, EyeOff, ArrowRight, Heart, Shield, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { registerDoctor } from '../services/auth';

export default function SignUp({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Full name is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const user = await registerDoctor(email, password);
      onLogin(name.trim(), user.uid, user.email);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('An account with this email already exists');
      else if (err.code === 'auth/invalid-email') setError('Invalid email address');
      else if (err.code === 'auth/weak-password') setError('Password is too weak');
      else setError('Sign up failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden relative overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 pt-12 pb-16 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 -left-10 w-36 h-36 bg-blue-300 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Activity className="w-5.5 h-5.5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Health Companion</h1>
                <p className="text-blue-200 text-[11px] font-medium tracking-wide uppercase">Doctor Portal</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white leading-snug">Create your<br/>account</h2>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-6">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full h-full text-slate-50" preserveAspectRatio="none">
            <path d="M0 48h1440V16c-240 20-480 32-720 32S240 36 0 16v32z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:w-full min-h-screen">
        <div className="w-[45%] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden flex flex-col justify-between p-14">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-80 h-80 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-32 right-16 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-indigo-200 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Health Companion</h1>
                <p className="text-blue-100 text-xs">Healthcare that listens.</p>
              </div>
            </div>
            <h2 className="text-[2.75rem] font-bold text-white leading-[1.15] mb-5">Start your journey<br/>in smart healthcare.</h2>
            <p className="text-blue-100 text-base leading-relaxed max-w-sm">Join thousands of doctors using AI-powered tools to deliver better patient outcomes.</p>
          </div>
          <div className="relative z-10 space-y-5">
            {[
              { icon: Shield, label: 'HIPAA Compliant', desc: 'Patient data encrypted end-to-end' },
              { icon: Zap, label: 'Real-time Sync', desc: 'Instant updates from patient app' },
              { icon: Heart, label: 'AI Diagnostics', desc: 'Smart screening & recommendations' },
            ].map(({ icon: Icon, label, desc }, i) => (
              <div key={label} className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{label}</p>
                  <p className="text-blue-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Create account</h2>
              <p className="text-slate-400 text-sm">Register as a doctor to get started</p>
            </div>
            <SignUpForm
              name={name} setName={setName} email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              error={error} loading={loading} handleSubmit={handleSubmit}
              passwordStrength={passwordStrength}
            />
            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <a href="/" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Sign in</a>
              </p>
            </div>
            <p className="text-center text-xs text-slate-300 mt-10">Health Companion &middot; Smart India Hackathon 2026</p>
          </div>
        </div>
      </div>

      {/* Mobile Form */}
      <div className="lg:hidden flex-1 px-5 py-6 -mt-2">
        <div className={`w-full max-w-md mx-auto transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Create account</h2>
            <p className="text-slate-400 text-xs">Register as a doctor to get started</p>
          </div>
          <SignUpForm
            name={name} setName={setName} email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
            showPassword={showPassword} setShowPassword={setShowPassword}
            error={error} loading={loading} handleSubmit={handleSubmit}
            passwordStrength={passwordStrength} mobile
          />
          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <a href="/" className="text-blue-600 font-semibold">Sign in</a>
            </p>
          </div>
          <p className="text-center text-[10px] text-slate-300 mt-6">Health Companion &middot; SIH 2026</p>
        </div>
      </div>
    </div>
  );
}

function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 5, label: 'Very Strong', color: 'bg-emerald-600' };
}

function SignUpForm({ name, setName, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, showPassword, setShowPassword, error, loading, handleSubmit, passwordStrength, mobile }) {
  const pw = password;
  const showStrength = pw.length > 0;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div>
        <label className={`block font-medium text-slate-600 mb-1.5 ${mobile ? 'text-xs' : 'text-sm'}`}>Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
            <svg className="text-slate-300 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Smith" className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl pl-11 pr-4 py-3.5 text-sm" />
        </div>
      </div>

      <div>
        <label className={`block font-medium text-slate-600 mb-1.5 ${mobile ? 'text-xs' : 'text-sm'}`}>Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
            <svg className="text-slate-300 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="doctor@hospital.com" className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl pl-11 pr-4 py-3.5 text-sm" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`font-medium text-slate-600 ${mobile ? 'text-xs' : 'text-sm'}`}>Password</label>
          {showStrength && (
            <span className={`text-[11px] font-medium ${passwordStrength.score <= 2 ? 'text-red-500' : passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>{passwordStrength.label}</span>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
            <svg className="text-slate-300 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl pl-11 pr-12 py-3.5 text-sm" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {showStrength && (
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : 'bg-slate-100'}`} />
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={`block font-medium text-slate-600 mb-1.5 ${mobile ? 'text-xs' : 'text-sm'}`}>Confirm Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-11 flex items-center justify-center pointer-events-none">
            <svg className="text-slate-300 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className={`w-full bg-white border text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all rounded-xl pl-11 pr-10 py-3.5 text-sm ${passwordsMismatch ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : passwordsMatch ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20' : 'border-slate-200'}`} />
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
            {passwordsMatch && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {passwordsMismatch && <AlertCircle className="w-4 h-4 text-red-400" />}
          </div>
        </div>
        {passwordsMismatch && (
          <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">Passwords do not match</p>
        )}
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
        className={`w-full bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2 ${mobile ? 'py-3.5 text-sm' : 'py-3.5 text-sm'}`}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Creating account...
          </>
        ) : (
          <>Create Account <ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </form>
  );
}
