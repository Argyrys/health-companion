import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientReport from './pages/PatientReport';
import Navbar from './components/Navbar';
import { logoutDoctor, onAuthChange } from './services/auth';
import { getOrCreateDoctor } from './services/doctors';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctorNum, setDoctorNum] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadDoctorProfile = async (user, signupName) => {
    try {
      const doc = await getOrCreateDoctor(user.uid, user.email, signupName);
      setDoctorName(doc.name || user.email.split('@')[0]);
      setDoctorNum(doc.doctorId);
    } catch (err) {
      console.error('Error loading doctor profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setDoctorId(user.uid);
        setIsLoggedIn(true);
        loadDoctorProfile(user);
      } else {
        setIsLoggedIn(false);
        setDoctorName('');
        setDoctorId('');
        setDoctorNum(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (name, uid, email) => {
    setIsLoggedIn(true);
    setDoctorId(uid);
    try {
      const doc = await getOrCreateDoctor(uid, email, name);
      setDoctorName(doc.name || name);
      setDoctorNum(doc.doctorId);
    } catch (err) {
      console.error('Error loading doctor profile:', err);
    }
  };

  const handleLogout = async () => {
    await logoutDoctor();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-white mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white/80 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {isLoggedIn ? (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar doctorName={doctorName} doctorNum={doctorNum} onLogout={handleLogout} />
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
            <Routes>
              <Route path="/" element={<Dashboard doctorId={doctorId} />} />
              <Route path="/patients" element={<PatientList doctorId={doctorId} />} />
              <Route path="/patients/:id" element={<PatientReport doctorId={doctorId} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-slate-400">AI Health Companion &middot; Smart India Hackathon 2026</p>
              <p className="text-xs text-slate-300">Healthcare that listens.</p>
            </div>
          </footer>
        </div>
      ) : (
        <Routes>
          <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
