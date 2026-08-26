import { useState, useEffect, useRef } from 'react';
import {
  Activity, Shield, Zap, Heart, Eye, Brain, Pill, Users,
  ArrowRight, ChevronRight, Smartphone, Monitor, Stethoscope,
  ClipboardList, Bell, FileText, Menu, X, Sparkles, ShieldCheck,
  BarChart3, MessageSquare, Star, CheckCircle2, Play
} from 'lucide-react';

const fadeUp = 'animate-[fadeUp_0.6s_ease-out_forwards]';
const stagger = (i) => `animate-[fadeUp_0.6s_ease-out_${i * 0.1}s_forwards] opacity-0`;

function CountUp({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const step = end / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Landing({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .float { animation: float 6s ease-in-out infinite; }
        .float-delay { animation: float 6s ease-in-out 2s infinite; }
        .gradient-shift { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
        .glass { background: rgba(255,255,255,0.06); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .feature-card:hover .feature-icon { transform: scale(1.1) rotate(-3deg); }
        .feature-icon { transition: transform 0.3s ease; }
      `}</style>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-[0_1px_40px_rgba(0,0,0,0.06)] border-b border-slate-100/60' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${scrolled ? 'text-slate-800' : 'text-white'}`}>
                Health Companion
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button onClick={onLogin} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${scrolled ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                Sign In
              </button>
              <button onClick={onSignup} className="group px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/25 transition-all duration-300 flex items-center gap-2">
                Get Started
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <button onClick={() => setMobileMenu(!mobileMenu)} className={`sm:hidden p-2 rounded-xl transition-colors ${scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="sm:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-2xl px-5 py-4 space-y-2 animate-[fadeUp_0.3s_ease-out]">
            <button onClick={() => { onLogin(); setMobileMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">Sign In</button>
            <button onClick={() => { onSignup(); setMobileMenu(false); }} className="w-full text-left px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-600/25">Get Started</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#0b1d3a]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Glows */}
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-indigo-500/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[200px]" />

        {/* Floating orbs */}
        <div className="absolute top-32 right-[15%] w-3 h-3 bg-blue-400/40 rounded-full float" />
        <div className="absolute top-48 right-[25%] w-2 h-2 bg-cyan-400/30 rounded-full float-delay" />
        <div className="absolute bottom-40 left-[20%] w-2.5 h-2.5 bg-indigo-400/30 rounded-full float" />
        <div className="absolute top-60 left-[12%] w-1.5 h-1.5 bg-blue-300/20 rounded-full float-delay" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-32 sm:py-40 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2.5 glass rounded-full px-4 py-2 mb-8">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
                </div>
                <span className="text-white/60 text-xs font-medium tracking-wider uppercase">Smart India Hackathon 2026</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
                Healthcare that
                <br />
                <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-200 bg-clip-text text-transparent gradient-shift">
                  listens to you.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-blue-100/50 leading-relaxed max-w-lg mb-10 font-light">
                An AI-powered health companion connecting patients and doctors. Track symptoms, screen for conditions, and access your complete health record — instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-12">
                <button onClick={onSignup} className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-blue-800 shadow-2xl shadow-blue-600/30 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm">
                  Start as Doctor
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a href="#features" className="group px-8 py-4 glass text-white font-medium rounded-2xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2.5 text-sm">
                  Explore Features
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.06]">
                {[
                  { value: 2, label: 'Platforms', suffix: '' },
                  { value: 10, label: 'Health Modules', suffix: '+' },
                  { value: 3, label: 'AI Models', suffix: '' },
                ].map(({ value, label, suffix }) => (
                  <div key={label}>
                    <p className="text-3xl font-extrabold text-white mb-1">
                      <CountUp end={value} suffix={suffix} />
                    </p>
                    <p className="text-xs text-blue-200/40 font-medium tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Floating UI Card */}
            <div className="hidden lg:block relative">
              <div className="relative float">
                {/* Main card */}
                <div className="glass rounded-3xl p-8 max-w-md ml-auto">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Stethoscope className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Dr. Priya Sharma</p>
                      <p className="text-white/40 text-xs">Cardiologist</p>
                    </div>
                    <div className="ml-auto px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                      <span className="text-emerald-400 text-xs font-medium">Online</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {[
                      { label: 'Patient Records', value: '247', icon: FileText, color: 'blue' },
                      { label: 'Appointments Today', value: '8', icon: ClipboardList, color: 'cyan' },
                      { label: 'AI Screenings', value: '34', icon: Eye, color: 'violet' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.04]">
                        <div className={`w-9 h-9 bg-${color}-500/15 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 text-${color}-400`} />
                        </div>
                        <span className="text-white/60 text-sm flex-1">{label}</span>
                        <span className="text-white font-bold text-sm">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>End-to-end encrypted &middot; HIPAA compliant</span>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -left-8 top-12 glass rounded-2xl px-4 py-3 shadow-2xl float-delay" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">Appointment Accepted</p>
                      <p className="text-white/40 text-[10px]">2 min ago</p>
                    </div>
                  </div>
                </div>

                {/* Floating AI badge */}
                <div className="absolute -right-4 bottom-20 glass rounded-2xl px-4 py-3 shadow-2xl float" style={{ animationDelay: '3s' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">AI Analysis Complete</p>
                      <p className="text-white/40 text-[10px]">Risk: Low</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-700 text-xs font-semibold tracking-wide">Two Platforms, One System</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Patient App + Doctor Dashboard
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
              Patients manage their health on mobile. Doctors access everything from a web dashboard. Everything syncs in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Patient App */}
            <div className="group relative bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-200/60 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/[0.03] to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-100 rounded-2xl flex items-center justify-center mb-7 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-500">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Patient Mobile App</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-7">
                  Android app for patients to record symptoms, track medications, screen for eye conditions, and manage their complete health profile.
                </p>
                <ul className="space-y-3">
                  {['Case taking & voice recording', 'AI-powered eye screening', 'Mental health assessment', 'Medication reminders'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Doctor Dashboard */}
            <div className="group relative bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-200/60 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-500/[0.03] to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-indigo-100/80 border border-indigo-100 rounded-2xl flex items-center justify-center mb-7 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-indigo-500/10 transition-all duration-500">
                  <Monitor className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Doctor Web Dashboard</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-7">
                  Web portal for doctors to view patient records, manage diagnoses, write prescriptions, and handle appointment requests.
                </p>
                <ul className="space-y-3">
                  {['Patient list with risk levels', 'Detailed health reports', 'Diagnosis & prescriptions', 'Appointment management'].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-5 h-5 bg-indigo-50 rounded-md flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 sm:py-36">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-700 text-xs font-semibold tracking-wide">Core Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Everything you need for smarter healthcare
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
              From symptom recording to AI-powered screening, Health Companion covers the full patient-doctor journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto" style={{ justifyItems: 'center' }}>
            {[
              { icon: ClipboardList, title: 'Case Taking', desc: 'Record chief complaints, symptoms, severity, and duration with structured forms.', gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/15' },
              { icon: Activity, title: 'Voice Recording', desc: 'Describe symptoms in your own words. Speech-to-text transcription for doctor review.', gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/15' },
              { icon: Eye, title: 'Eye Screening', desc: 'AI-powered eye image analysis with risk assessment and clinical recommendations.', gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/15' },
              { icon: Brain, title: 'Mental Health', desc: 'Standardized mental health screening with scoring and status assessment.', gradient: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/15' },
              { icon: Pill, title: 'Medications & Allergies', desc: 'Track current medications, dosages, and known allergies with severity levels.', gradient: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/15' },
              { icon: Bell, title: 'Smart Reminders', desc: 'Medication reminders with scheduling, tracking, and push notifications.', gradient: 'from-cyan-500 to-cyan-600', shadow: 'shadow-cyan-500/15' },
            ].map(({ icon: Icon, title, desc, gradient, shadow }) => (
              <div key={title} className="feature-card group bg-white rounded-2xl border border-slate-100 p-8 sm:p-9 w-full max-w-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-200 transition-all duration-500">
                <div className={`feature-icon w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg ${shadow}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-800 mb-3 text-[15px] text-center">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed text-center">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-32 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-700 text-xs font-semibold tracking-wide">How It Works</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Three steps to better care
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" />

            {[
              { step: '01', icon: Smartphone, title: 'Patient Records', desc: 'Patient signs up, fills health profile, and records symptoms through the mobile app.', color: 'from-blue-500 to-blue-600' },
              { step: '02', icon: Sparkles, title: 'AI Screening', desc: 'App performs eye screening, mental health assessment, and generates structured reports.', color: 'from-indigo-500 to-indigo-600' },
              { step: '03', icon: Stethoscope, title: 'Doctor Reviews', desc: 'Doctor accesses the dashboard, reviews patient data, and provides diagnosis with prescriptions.', color: 'from-violet-500 to-violet-600' },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="text-center relative">
                <div className={`relative w-20 h-20 bg-gradient-to-br ${color} text-white rounded-2xl flex items-center justify-center mx-auto mb-7 shadow-xl shadow-blue-600/15`}>
                  <Icon className="w-8 h-8" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-700">{step}</span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-700 text-xs font-semibold tracking-wide">Built With</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Modern, reliable tech stack
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {[
              { name: 'Kotlin', cat: 'Mobile' },
              { name: 'Jetpack Compose', cat: 'UI' },
              { name: 'Firebase Auth', cat: 'Backend' },
              { name: 'Firestore', cat: 'Database' },
              { name: 'Firebase Storage', cat: 'Storage' },
              { name: 'Gemini AI', cat: 'AI' },
              { name: 'React', cat: 'Web' },
              { name: 'Tailwind CSS', cat: 'Styling' },
              { name: 'Hilt DI', cat: 'Architecture' },
              { name: 'Coroutines', cat: 'Async' },
              { name: 'iText PDF', cat: 'Reports' },
            ].map(({ name, cat }) => (
              <div key={name} className="group px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 bg-slate-300 group-hover:bg-blue-500 rounded-full transition-colors" />
                {name}
                <span className="text-[10px] text-slate-400 group-hover:text-blue-400 font-normal transition-colors">{cat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="relative bg-gradient-to-br from-[#0f2847] via-[#1a3a6b] to-[#0b1d3a] rounded-[2rem] p-10 sm:p-16 text-center overflow-hidden">
            {/* Decorations */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span className="text-white/60 text-xs font-medium">Trusted by healthcare professionals</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 tracking-tight">
                Ready to get started?
              </h2>
              <p className="text-blue-100/50 max-w-md mx-auto mb-10 leading-relaxed">
                Join the future of healthcare. Create your doctor account and start managing patients today — it's free.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={onSignup} className="group px-8 py-4 bg-white text-blue-700 font-semibold rounded-2xl hover:bg-blue-50 shadow-2xl shadow-black/10 transition-all duration-300 inline-flex items-center justify-center gap-2.5 text-sm">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button onClick={onLogin} className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-2xl border border-white/10 hover:bg-white/15 transition-all duration-300 text-sm">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Health Companion</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>Smart India Hackathon 2026</span>
              <span className="hidden sm:inline text-slate-200">|</span>
              <span className="hidden sm:inline">Healthcare that listens.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
