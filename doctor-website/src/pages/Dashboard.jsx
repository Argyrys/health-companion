import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, AlertTriangle, Activity, Database, ChevronRight } from 'lucide-react';
import { getAllPatients } from '../services/patients';
import { seedDatabase } from '../services/seed';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

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

  const totalPatients = patients.length;
  const todayPatients = patients.filter(p => p.createdAt === new Date().toISOString().split('T')[0]).length;
  const highRisk = patients.filter(p =>
    p.consultations?.[0]?.eyeScreening?.riskLevel === 'High'
  ).length;
  const pendingReports = patients.filter(p => !p.consultations?.[0]?.diagnosis).length;

  const stats = [
    { label: 'Total Patients', value: totalPatients, icon: Users, lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: "Today's Visits", value: todayPatients, icon: FileText, lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'High Risk Cases', value: highRisk, icon: AlertTriangle, lightColor: 'bg-red-50', textColor: 'text-red-600' },
    { label: 'Pending Reports', value: pendingReports, icon: Activity, lightColor: 'bg-amber-50', textColor: 'text-amber-600' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back, Doctor. Here's your overview.</p>
        </div>
        {patients.length === 0 && !seeded && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            <Database className="w-4 h-4" />
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, lightColor, textColor }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 ${lightColor} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Recent Patients</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {patients.slice(0, 5).map((patient) => {
            const consultation = patient.consultations?.[0];
            return (
              <Link to={`/patients/${patient.id}`} key={patient.id} className="block px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-700 font-semibold text-sm">
                        {patient.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">{patient.name}</h3>
                      <p className="text-sm text-slate-500">{patient.age}y, {patient.gender} &middot; {consultation?.chiefComplaint}</p>
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
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </Link>
            );
          })}
          {patients.length === 0 && (
            <div className="px-6 py-8 text-center">
              <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 mb-4">No patients yet. Seed the database with sample data.</p>
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : seeded ? 'Seeded! Refreshing...' : 'Seed Sample Data'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Common Symptoms</h3>
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
              const sorted = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
              if (sorted.length === 0) {
                return <p className="text-slate-400 text-sm">No symptom data yet</p>;
              }
              const maxCount = sorted[0]?.[1] || 1;
              return sorted.map(([symptom, count]) => (
                <div key={symptom}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{symptom}</span>
                    <span className="text-slate-400">{count} patients</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm text-slate-600 flex-1">High Risk</span>
              <span className="text-sm font-semibold text-slate-800">{highRisk}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span className="text-sm text-slate-600 flex-1">Medium Risk</span>
              <span className="text-sm font-semibold text-slate-800">
                {patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Medium').length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm text-slate-600 flex-1">Low Risk</span>
              <span className="text-sm font-semibold text-slate-800">
                {patients.filter(p => p.consultations?.[0]?.eyeScreening?.riskLevel === 'Low').length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-slate-200 rounded" />
              <span className="text-sm text-slate-600 flex-1">Not Screened</span>
              <span className="text-sm font-semibold text-slate-800">
                {patients.filter(p => !p.consultations?.[0]?.eyeScreening).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
