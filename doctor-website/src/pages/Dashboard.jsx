import { Users, FileText, AlertTriangle, Activity } from 'lucide-react';
import { mockPatients } from '../data/mockData';

export default function Dashboard() {
  const patients = mockPatients;
  const totalPatients = patients.length;
  const todayPatients = patients.filter(p => p.createdAt === '2026-08-22').length;
  const highRisk = patients.filter(p =>
    p.consultations[0]?.eyeScreening?.riskLevel === 'High'
  ).length;
  const pendingReports = patients.filter(p => !p.consultations[0]?.diagnosis).length;

  const stats = [
    { label: 'Total Patients', value: totalPatients, icon: Users, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: "Today's Visits", value: todayPatients, icon: FileText, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'High Risk Cases', value: highRisk, icon: AlertTriangle, color: 'bg-red-500', lightColor: 'bg-red-50', textColor: 'text-red-600' },
    { label: 'Pending Reports', value: pendingReports, icon: Activity, color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-600' },
  ];

  const recentPatients = patients.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back, Doctor. Here's your overview.</p>
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
          {recentPatients.map((patient) => {
            const consultation = patient.consultations[0];
            return (
              <div key={patient.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-700 font-semibold text-sm">
                        {patient.name.charAt(0)}
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
                    <span className="text-sm text-slate-400">{patient.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Common Symptoms</h3>
          <div className="space-y-3">
            {[
              { symptom: 'Headache', count: 2, pct: 40 },
              { symptom: 'Cough', count: 1, pct: 20 },
              { symptom: 'Joint Pain', count: 1, pct: 20 },
              { symptom: 'Blurred Vision', count: 1, pct: 20 },
            ].map(({ symptom, count, pct }) => (
              <div key={symptom}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{symptom}</span>
                  <span className="text-slate-400">{count} patients</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-sm text-slate-600 flex-1">High Risk</span>
              <span className="text-sm font-semibold text-slate-800">1</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span className="text-sm text-slate-600 flex-1">Medium Risk</span>
              <span className="text-sm font-semibold text-slate-800">0</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-sm text-slate-600 flex-1">Low Risk</span>
              <span className="text-sm font-semibold text-slate-800">2</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-slate-200 rounded" />
              <span className="text-sm text-slate-600 flex-1">Not Screened</span>
              <span className="text-sm font-semibold text-slate-800">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
