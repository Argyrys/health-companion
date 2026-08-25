import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Activity, Database, TrendingUp, Clock, Stethoscope, ClipboardList, ChevronRight, User, Droplets, BarChart3 } from 'lucide-react';
import { getAllPatients, deleteAllPatients } from '../services/patients';
import { seedDatabase } from '../services/seed';
import DashboardSkeleton from '../components/Skeleton';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const getDate = () => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export default function Dashboard({ doctorId }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients(doctorId);
        setPatients(data);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load data. Check your connection and try again.');
      }
      setLoading(false);
    };
    fetchPatients();
  }, [doctorId]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase(doctorId);
      setSeeded(true);
      const data = await getAllPatients(doctorId);
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
      await deleteAllPatients(doctorId);
      setPatients([]);
      setSeeded(false);
    } catch (err) {
      console.error('Error clearing database:', err);
    }
    setClearing(false);
  };

  const totalPatients = patients.length;
  const todayPatients = patients.filter(p => p.createdAt === new Date().toISOString().split('T')[0]).length;
  const highRisk = patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'High').length;
  const pendingReports = patients.filter(p => !p.consultations?.[0]?.diagnosis).length;

  const stats = [
    { label: 'Total Patients', value: totalPatients, icon: Users, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', link: '/patients' },
    { label: "Today's Visits", value: todayPatients, icon: FileText, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', link: '/patients' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', link: '/patients' },
    { label: 'Pending Reports', value: pendingReports, icon: Activity, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', link: '/patients' },
  ];

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-slate-500 font-medium text-sm mb-1">Something went wrong</p>
          <p className="text-slate-400 text-xs mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-all">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{getGreeting()}, Doctor</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <Clock className="w-3 h-3" />
            <span>{getDate()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {patients.length === 0 && !seeded && (
            <button onClick={handleSeed} disabled={seeding} className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 transition-all">
              <Database className="w-4 h-4" />
              {seeding ? 'Seeding...' : 'Seed Data'}
            </button>
          )}
          {patients.length > 0 && (
            <button onClick={handleClear} disabled={clearing} className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-all">
              {clearing ? 'Clearing...' : 'Clear Data'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bg, text, border, link }, i) => (
          <Link key={label} to={link} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 group animate-fadeIn" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 ${bg} border ${border} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.2s' }}>
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Recent Patients</h2>
            {patients.length > 0 && (
              <Link to="/patients" className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="divide-y divide-slate-50">
            {patients.slice(0, 5).map((patient) => {
              const consultation = patient.consultations?.[0];
              return (
                <Link to={`/patients/${patient.id}`} key={patient.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">{patient.name?.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm text-slate-800 group-hover:text-blue-700 transition-colors truncate">{patient.name}</h3>
                      <p className="text-xs text-slate-400 truncate">{patient.age}y, {patient.gender} &middot; {consultation?.chiefComplaint}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {consultation?.eyeScreening?.riskLevel && (
                      <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${consultation.eyeScreening.riskLevel === 'High' ? 'bg-red-50 text-red-600' : consultation.eyeScreening.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {consultation.eyeScreening.riskLevel}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </Link>
              );
            })}
            {patients.length === 0 && (
              <div className="px-5 py-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Database className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium text-sm mb-0.5">No patients yet</p>
                <p className="text-slate-400 text-xs mb-4">Seed the database with sample data to get started.</p>
                <button onClick={handleSeed} disabled={seeding} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-md shadow-blue-600/20 transition-all">
                  {seeding ? 'Seeding...' : seeded ? 'Seeded!' : 'Seed Sample Data'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-2.5">
            <Link to="/patients" className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-100 transition-all group">
              <div className="w-9 h-9 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                <Stethoscope className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">View Patients</p>
                <p className="text-xs text-blue-500/70">{totalPatients} total</p>
              </div>
            </Link>
            <Link to="/patients" className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 transition-all group">
              <div className="w-9 h-9 bg-amber-100 group-hover:bg-amber-200 rounded-lg flex items-center justify-center transition-colors">
                <ClipboardList className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Pending Reports</p>
                <p className="text-xs text-amber-500/70">{pendingReports} need attention</p>
              </div>
            </Link>
            <Link to="/patients" className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 transition-all group">
              <div className="w-9 h-9 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold">High Risk Cases</p>
                <p className="text-xs text-red-500/70">{highRisk} patients</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-slate-800">Common Symptoms</h3>
          </div>
          <div className="space-y-3.5">
            {(() => {
              const symptomCounts = {};
              patients.forEach(p => {
                p.consultations?.forEach(c => {
                  c.symptoms?.forEach(s => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; });
                });
              });
              const sorted = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
              if (sorted.length === 0) {
                return <div className="text-center py-6"><p className="text-slate-300 text-xs">No symptom data yet</p></div>;
              }
              const maxCount = sorted[0]?.[1] || 1;
              const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200', 'bg-blue-100'];
              return sorted.map(([symptom, count], i) => (
                <div key={symptom}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 font-medium">{symptom}</span>
                    <span className="text-slate-400 text-xs">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all duration-700`} style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fadeIn" style={{ animationDelay: '0.35s' }}>
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-semibold text-slate-800">Risk Distribution</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: 'High Risk', count: highRisk, color: 'bg-red-500', dot: 'bg-red-100' },
              { label: 'Medium Risk', count: patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Medium').length, color: 'bg-amber-500', dot: 'bg-amber-100' },
              { label: 'Low Risk', count: patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Low').length, color: 'bg-emerald-500', dot: 'bg-emerald-100' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-slate-800">Age Distribution</h3>
          </div>
          <div className="space-y-3">
            {(() => {
              if (patients.length === 0) return <div className="text-center py-6"><p className="text-slate-300 text-xs">No data yet</p></div>;
              const ranges = [
                { label: '0-18', min: 0, max: 18, color: 'bg-blue-400' },
                { label: '19-35', min: 19, max: 35, color: 'bg-blue-500' },
                { label: '36-50', min: 36, max: 50, color: 'bg-blue-600' },
                { label: '51-65', min: 51, max: 65, color: 'bg-blue-700' },
                { label: '65+', min: 66, max: 200, color: 'bg-blue-800' },
              ];
              const counts = ranges.map(r => ({
                ...r,
                count: patients.filter(p => p.age >= r.min && p.age <= r.max).length
              }));
              const maxCount = Math.max(...counts.map(c => c.count), 1);
              return counts.map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className="text-slate-400 text-xs">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fadeIn" style={{ animationDelay: '0.45s' }}>
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-slate-800">Gender Split</h3>
          </div>
          {(() => {
            if (patients.length === 0) return <div className="text-center py-6"><p className="text-slate-300 text-xs">No data yet</p></div>;
            const male = patients.filter(p => p.gender?.toLowerCase() === 'male').length;
            const female = patients.filter(p => p.gender?.toLowerCase() === 'female').length;
            const other = patients.length - male - female;
            const total = patients.length || 1;
            return (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <p className="text-2xl font-bold text-blue-600">{male}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Male</p>
                  </div>
                  <div className="flex-1 p-3 bg-pink-50 border border-pink-100 rounded-xl text-center">
                    <p className="text-2xl font-bold text-pink-600">{female}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Female</p>
                  </div>
                  {other > 0 && (
                    <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <p className="text-2xl font-bold text-slate-600">{other}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Other</p>
                    </div>
                  )}
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                  <div className="bg-blue-500 transition-all duration-700" style={{ width: `${(male / total) * 100}%` }} />
                  <div className="bg-pink-500 transition-all duration-700" style={{ width: `${(female / total) * 100}%` }} />
                  {other > 0 && <div className="bg-slate-400 transition-all duration-700" style={{ width: `${(other / total) * 100}%` }} />}
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-500 rounded-full" />Male {Math.round((male / total) * 100)}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-pink-500 rounded-full" />Female {Math.round((female / total) * 100)}%</span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fadeIn" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-2 mb-5">
            <Droplets className="w-4 h-4 text-blue-500" />
            <h3 className="text-base font-semibold text-slate-800">Blood Groups</h3>
          </div>
          {(() => {
            if (patients.length === 0) return <div className="text-center py-6"><p className="text-slate-300 text-xs">No data yet</p></div>;
            const groups = {};
            patients.forEach(p => { if (p.bloodGroup) groups[p.bloodGroup] = (groups[p.bloodGroup] || 0) + 1; });
            const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
            const maxCount = Math.max(...sorted.map(([, c]) => c), 1);
            const colors = ['bg-red-500', 'bg-red-400', 'bg-red-300', 'bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-emerald-500', 'bg-slate-400'];
            return sorted.length > 0 ? (
              <div className="space-y-3">
                {sorted.map(([group, count], i) => (
                  <div key={group}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-600 font-medium">{group}</span>
                      <span className="text-slate-400 text-xs">{count} patient{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${colors[i % colors.length]} h-2 rounded-full transition-all duration-700`} style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6"><p className="text-slate-300 text-xs">No blood group data</p></div>
            );
          })()}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 animate-fadeIn" style={{ animationDelay: '0.55s' }}>
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-blue-500" />
          <h3 className="text-base font-semibold text-slate-800">Severity Overview</h3>
        </div>
        {(() => {
          if (patients.length === 0) return <div className="text-center py-6"><p className="text-slate-300 text-xs">No data yet</p></div>;
          const severities = patients.map(p => p.consultations?.[0]?.severity).filter(s => s != null);
          const avgSeverity = severities.length ? (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(1) : '0';
          const highSev = severities.filter(s => s >= 7).length;
          const medSev = severities.filter(s => s >= 4 && s < 7).length;
          const lowSev = severities.filter(s => s < 4).length;
          const total = severities.length || 1;
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-600">{avgSeverity}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Avg Severity</p>
                <p className="text-[10px] text-slate-400 mt-0.5">out of 10</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                <p className="text-3xl font-bold text-red-600">{highSev}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Severe (7-10)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{Math.round((highSev / total) * 100)}% of cases</p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
                <p className="text-3xl font-bold text-amber-600">{medSev}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Moderate (4-6)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{Math.round((medSev / total) * 100)}% of cases</p>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <p className="text-3xl font-bold text-emerald-600">{lowSev}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Mild (1-3)</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{Math.round((lowSev / total) * 100)}% of cases</p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
