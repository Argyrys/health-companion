import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Activity, Database, ChevronRight, TrendingUp, Clock, Stethoscope, ClipboardList } from 'lucide-react';
import { getAllPatients, deleteAllPatients } from '../services/patients';
import { seedDatabase } from '../services/seed';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getDate = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

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
    { label: 'Total Patients', value: totalPatients, icon: Users, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', link: '/patients' },
    { label: "Today's Visits", value: todayPatients, icon: FileText, gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', link: '/patients' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-600', link: '/patients' },
    { label: 'Pending', value: pendingReports, icon: Activity, gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', link: '/patients' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-7 w-7 text-emerald-600 mx-auto mb-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 animate-fadeIn">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
            <Clock className="w-3 h-3" />
            <span>{getDate()}</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">{getGreeting()}, Doctor</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Here's what's happening at your clinic today.</p>
        </div>
        <div className="flex items-center gap-2">
          {patients.length === 0 && !seeded && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all duration-200"
            >
              <Database className="w-3.5 h-3.5" />
              {seeding ? 'Seeding...' : 'Seed Data'}
            </button>
          )}
          {patients.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-all duration-200"
            >
              {clearing ? 'Clearing...' : 'Clear Data'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {stats.map(({ label, value, icon: Icon, gradient, bg, text, link }, i) => (
          <Link
            key={label}
            to={link}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 group animate-fadeIn cursor-pointer overflow-hidden"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={`h-0.5 sm:h-1 bg-gradient-to-r ${gradient}`} />
            <div className="p-3 sm:p-4 lg:p-5">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${bg} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${text}`} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">{value}</p>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-slate-800">Recent Patients</h2>
            {patients.length > 0 && (
              <Link to="/patients" className="text-xs sm:text-sm text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {patients.slice(0, 5).map((patient) => {
              const consultation = patient.consultations?.[0];
              return (
                <Link
                  to={`/patients/${patient.id}`}
                  key={patient.id}
                  className="flex items-center justify-between px-4 sm:px-5 py-3 hover:bg-slate-50/80 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {patient.name?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm sm:text-base text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{patient.name}</h3>
                      <p className="text-[11px] sm:text-xs text-slate-400 truncate">{patient.age}y, {patient.gender} &middot; {consultation?.chiefComplaint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                    {consultation?.eyeScreening?.riskLevel && (
                      <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        consultation.eyeScreening.riskLevel === 'High'
                          ? 'bg-red-50 text-red-600'
                          : consultation.eyeScreening.riskLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {consultation.eyeScreening.riskLevel}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
            {patients.length === 0 && (
              <div className="px-5 py-10 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Database className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm mb-0.5">No patients yet</p>
                <p className="text-slate-400 text-xs mb-4">Seed the database with sample data to get started.</p>
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all duration-200"
                >
                  {seeding ? 'Seeding...' : seeded ? 'Seeded!' : 'Seed Sample Data'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
          <h3 className="text-sm sm:text-base font-semibold text-slate-800 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/patients" className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all duration-200 group">
              <div className="w-8 h-8 bg-emerald-100 group-hover:bg-emerald-200 rounded-lg flex items-center justify-center transition-colors">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold">View Patients</p>
                <p className="text-[11px] text-emerald-600/70">{totalPatients} total</p>
              </div>
            </Link>
            <Link to="/patients" className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all duration-200 group">
              <div className="w-8 h-8 bg-amber-100 group-hover:bg-amber-200 rounded-lg flex items-center justify-center transition-colors">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold">Pending Reports</p>
                <p className="text-[11px] text-amber-600/70">{pendingReports} need attention</p>
              </div>
            </Link>
            <Link to="/patients" className="flex items-center gap-2.5 p-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-all duration-200 group">
              <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold">High Risk Cases</p>
                <p className="text-[11px] text-red-600/70">{highRisk} patients</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">Common Symptoms</h3>
          </div>
          <div className="space-y-3">
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
                  <div className="text-center py-5">
                    <p className="text-slate-300 text-xs">No symptom data yet</p>
                  </div>
                );
              }
              const maxCount = sorted[0]?.[1] || 1;
              const colors = ['bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500'];
              return sorted.map(([symptom, count], i) => (
                <div key={symptom}>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-slate-600 font-medium">{symptom}</span>
                    <span className="text-slate-400">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`${colors[i % colors.length]} h-2 rounded-full transition-all duration-700`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">Risk Distribution</h3>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'High Risk', count: highRisk, color: 'bg-red-500', dot: 'bg-red-100' },
              { label: 'Medium Risk', count: patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Medium').length, color: 'bg-amber-500', dot: 'bg-amber-100' },
              { label: 'Low Risk', count: patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Low').length, color: 'bg-green-500', dot: 'bg-green-100' },
              { label: 'Not Screened', count: patients.filter(p => !p.consultations?.[0]?.eyeScreening).length, color: 'bg-slate-300', dot: 'bg-slate-100' },
            ].map(({ label, count, color, dot }) => (
              <div key={label} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-7 h-7 ${dot} rounded-lg flex items-center justify-center`}>
                  <div className={`w-2.5 h-2.5 ${color} rounded`} />
                </div>
                <span className="text-xs sm:text-sm text-slate-600 flex-1 font-medium">{label}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
