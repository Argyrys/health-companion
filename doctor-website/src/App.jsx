import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientReport from './pages/PatientReport';
import Sidebar from './components/Sidebar';
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {isLoggedIn ? (
        <div className="min-h-screen bg-slate-50">
          <Sidebar doctorName={doctorName} doctorNum={doctorNum} onLogout={handleLogout} />
          <div className="lg:pl-60">
            <main className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-screen">
              <Routes>
                <Route path="/" element={<Dashboard doctorId={doctorId} />} />
                <Route path="/patients" element={<PatientList doctorId={doctorId} />} />
                <Route path="/patients/:id" element={<PatientReport doctorId={doctorId} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <footer className="border-t border-slate-200 bg-white px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs text-slate-400">AI Health Companion &middot; Smart India Hackathon 2026</p>
                <p className="text-xs text-slate-300">Healthcare that listens.</p>
              </div>
            </footer>
          </div>
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
