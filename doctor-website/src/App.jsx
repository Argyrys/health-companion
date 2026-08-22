import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientReport from './pages/PatientReport';
import Navbar from './components/Navbar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorName, setDoctorName] = useState('');

  const handleLogin = (name) => {
    setIsLoggedIn(true);
    setDoctorName(name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setDoctorName('');
  };

  return (
    <Router>
      {isLoggedIn ? (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar doctorName={doctorName} onLogout={handleLogout} />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientReport />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App;
