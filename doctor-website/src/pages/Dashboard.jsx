import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Activity, Database, ChevronRight, TrendingUp } from 'lucide-react';
import { getAllPatients, deleteAllPatients } from '../services/patients';
import { seedDatabase } from '../services/seed';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients();
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      setSeeded(true);
      const data = await getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error('Error seeding database:', err);
    }
    setSeeding(false);
  };

  const handleClear = async () => {
    if (!window.confirm('Delete all patient data? This cannot be undone.')) return;
    setClearing(true);
    try {
      await deleteAllPatients();
      setPatients([]);
      setSeeded(false);
    } catch (err) {
      console.error('Error clearing database:', err);
    }
    setClearing(false);
  };

  const totalPatients = patients.length;
  const todayPatients = patients.filter(p => p.createdAt === new Date().toISOString().split('T')[0]).length;
  const highRisk = patients.filter(p =>
    p.consultations?.[0]?.eyeScreening?.riskLevel === 'High'
  ).length;
  const pendingReports = patients.filter(p => !p.consultations?.[0]?.diagnosis).length;

  const stats = [
    { label: 'Total Patients', value: totalPatients, icon: Users, bg: 'bg-blue-50', text: 'text-blue-600', link: '/patients' },
    { label: "Today's Visits", value: todayPatients, icon: FileText, bg: 'bg-emerald-50', text: 'text-emerald-600', link: '/patients' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-600', link: '/patients' },
    { label: 'Pending Reports', value: pendingReports, icon: Activity, bg: 'bg-amber-50', text: 'text-amber-600', link: '/patients' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, Doctor. Here's your overview.</p>
        </div>
        <div className="flex items-center gap-2">
          {patients.length === 0 && !seeded && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all duration-200"
            >
              <Database className="w-4 h-4" />
              {seeding ? 'Seeding...' : 'Seed Sample Data'}
            </button>
          )}
          {patients.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-all duration-200"
            >
              {clearing ? 'Clearing...' : 'Clear All Data'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bg, text, link }, i) => (
          <Link
            key={label}
            to={link}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group animate-fadeIn cursor-pointer"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">{label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1.5">{value}</p>
              </div>
              <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${text}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Recent Patients</h2>
          {patients.length > 0 && (
            <Link to="/patients" className="text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="divide-y divide-slate-50">
          {patients.slice(0, 5).map((patient, i) => {
            const consultation = patient.consultations?.[0];
            return (
              <Link
                to={`/patients/${patient.id}`}
                key={patient.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/80 transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    <span className="text-white font-semibold text-sm">
                      {patient.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">{patient.name}</h3>
                    <p className="text-sm text-slate-400">{patient.age}y, {patient.gender} &middot; {consultation?.chiefComplaint}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {consultation?.eyeScreening?.riskLevel && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      consultation.eyeScreening.riskLevel === 'High'
                        ? 'bg-red-50 text-red-600'
                        : consultation.eyeScreening.riskLevel === 'Medium'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {consultation.eyeScreening.riskLevel} Risk
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </Link>
            );
          })}
          {patients.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium mb-1">No patients yet</p>
              <p className="text-slate-400 text-sm mb-5">Seed the database with sample data to get started.</p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all duration-200"
              >
                {seeding ? 'Seeding...' : seeded ? 'Seeded!' : 'Seed Sample Data'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-base font-semibold text-slate-800">Common Symptoms</h3>
          </div>
          <div className="space-y-4">
            {(() => {
              const symptomCounts = {};
              patients.forEach(p => {
                p.consultations?.forEach(c => {
                  c.symptoms?.forEach(s => {
                    symptomCounts[s] = (symptomCounts[s] || 0) + 1;
                  });
                });
              });
              const sorted = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
              if (sorted.length === 0) {
                return (
                  <div className="text-center py-6">
                    <p className="text-slate-300 text-sm">No symptom data yet</p>
                  </div>
                );
              }
              const maxCount = sorted[0]?.[1] || 1;
              const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500'];
              return sorted.map(([symptom, count], i) => (
                <div key={symptom}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 font-medium">{symptom}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`${colors[i % colors.length]} h-2.5 rounded-full transition-all duration-700`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-semibold text-slate-800">Risk Distribution</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'High Risk', count: highRisk, color: 'bg-red-500', dot: 'bg-red-100' },
              { label: 'Medium Risk', count: patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Medium').length, color: 'bg-amber-500', dot: 'bg-amber-100' },
              { label: 'Low Risk', count: patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Low').length, color: 'bg-green-500', dot: 'bg-green-100' },
              { label: 'Not Screened', count: patients.filter(p => !p.consultations?.[0]?.eyeScreening).length, color: 'bg-slate-300', dot: 'bg-slate-100' },
            ].map(({ label, count, color, dot }) => (
              <div key={label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 ${dot} rounded-lg flex items-center justify-center`}>
                  <div className={`w-3 h-3 ${color} rounded`} />
                </div>
                <span className="text-sm text-slate-600 flex-1 font-medium">{label}</span>
                <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
