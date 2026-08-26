import { useState, useEffect } from 'react';
import { Activity, Shield, Zap, Heart, Eye, Brain, Pill, Users, ArrowRight, ChevronRight, Smartphone, Monitor, Stethoscope, ClipboardList, Bell, FileText, Menu, X } from 'lucide-react';

export default function Landing({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${scrolled ? 'text-slate-800' : 'text-white'}`}>Health Companion</span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button onClick={onLogin} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${scrolled ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-white/80 hover:text-white hover:bg-white/10'}`}>Sign In</button>
              <button onClick={onSignup} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all">Get Started</button>
            </div>
            <button onClick={() => setMobileMenu(!mobileMenu)} className={`sm:hidden p-2 rounded-lg ${scrolled ? 'text-slate-600' : 'text-white'}`}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="sm:hidden bg-white border-b border-slate-100 shadow-lg px-5 py-4 space-y-2">
            <button onClick={() => { onLogin(); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl">Sign In</button>
            <button onClick={() => { onSignup(); setMobileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl">Get Started</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-32 sm:py-40">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-xs font-medium tracking-wide">Smart India Hackathon 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              Healthcare that<br />
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">listens to you.</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/70 leading-relaxed max-w-xl mb-10">
              An AI-powered health companion connecting patients and doctors. Track symptoms, screen for conditions, and get instant access to your complete health record.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onSignup} className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm">
                Start as Doctor <ArrowRight className="w-4 h-4" />
              </button>
              <a href="#features" className="px-8 py-3.5 bg-white/10 backdrop-blur-sm text-white font-medium rounded-xl border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm">
                Learn More <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                { value: '2', label: 'Platforms' },
                { value: '10+', label: 'Health Modules' },
                { value: 'AI', label: 'Powered' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs text-blue-200/50 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Two Platforms, One System</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Patient App + Doctor Dashboard</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Patients manage their health on mobile. Doctors access everything from a web dashboard. Everything syncs in real-time.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Patient Mobile App</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Android app for patients to record symptoms, track medications, screen for eye conditions, and manage their complete health profile.</p>
              <ul className="space-y-2.5">
                {['Case taking & voice recording', 'Eye screening with AI', 'Mental health assessment', 'Medication reminders'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Monitor className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Doctor Web Dashboard</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">Web portal for doctors to view patient records, manage diagnoses, write prescriptions, and handle appointment requests.</p>
              <ul className="space-y-2.5">
                {['Patient list with risk levels', 'Detailed health reports', 'Diagnosis & prescriptions', 'Appointment management'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Core Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Everything you need for smarter healthcare</h2>
            <p className="text-slate-500 max-w-lg mx-auto">From symptom recording to AI-powered screening, Health Companion covers the full patient-doctor journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: ClipboardList, title: 'Case Taking', desc: 'Record chief complaints, symptoms, severity, and duration with structured forms.', color: 'blue' },
              { icon: Activity, title: 'Voice Recording', desc: 'Describe symptoms in your own words. Speech-to-text transcription for doctor review.', color: 'emerald' },
              { icon: Eye, title: 'Eye Screening', desc: 'AI-powered eye image analysis with risk assessment and clinical recommendations.', color: 'violet' },
              { icon: Brain, title: 'Mental Health', desc: 'Standardized mental health screening with scoring and status assessment.', color: 'amber' },
              { icon: Pill, title: 'Medications & Allergies', desc: 'Track current medications, dosages, and known allergies with severity levels.', color: 'rose' },
              { icon: Bell, title: 'Smart Reminders', desc: 'Medication reminders with scheduling, tracking, and push notifications.', color: 'cyan' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={title} className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:border-slate-200 transition-all duration-300" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`w-12 h-12 bg-${color}-50 border border-${color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Three steps to better care</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Patient Records', desc: 'Patient signs up, fills health profile, and records symptoms through the mobile app.' },
              { step: '02', title: 'AI Screening', desc: 'App performs eye screening, mental health assessment, and generates structured reports.' },
              { step: '03', title: 'Doctor Reviews', desc: 'Doctor accesses the dashboard, reviews patient data, and provides diagnosis with prescriptions.' },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-lg shadow-blue-600/20">{step}</div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-8 left-[calc(100%+1rem)] w-[calc(100%-3rem)] h-px bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <p className="text-blue-600 text-xs font-semibold tracking-widest uppercase mb-3">Built With</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Modern, reliable tech stack</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
            {[
              'Kotlin', 'Jetpack Compose', 'Firebase Auth', 'Firestore', 'Firebase Storage',
              'React', 'Tailwind CSS', 'Hilt DI', 'Coroutines', 'iText PDF',
            ].map(tech => (
              <div key={tech} className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-300 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-blue-100/70 max-w-md mx-auto mb-8">Join the future of healthcare. Create your doctor account and start managing patients today.</p>
              <button onClick={onSignup} className="px-8 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 shadow-xl transition-all inline-flex items-center gap-2 text-sm">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">Health Companion</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>Smart India Hackathon 2026</span>
              <span className="hidden sm:inline">&middot;</span>
              <span className="hidden sm:inline">Healthcare that listens.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
