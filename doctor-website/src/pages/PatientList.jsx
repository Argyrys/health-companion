import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { mockPatients } from '../data/mockData';

export default function PatientList() {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  const patients = mockPatients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = filterRisk === 'all' ||
      p.consultations[0]?.eyeScreening?.riskLevel?.toLowerCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        <p className="text-slate-500 text-sm mt-1">{patients.length} patients found</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">All Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age/Gender</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chief Complaint</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Eye Risk</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {patients.map((patient) => {
                const consultation = patient.consultations[0];
                const riskLevel = consultation?.eyeScreening?.riskLevel;
                return (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-semibold text-sm">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-mono">{patient.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{patient.age}y / {patient.gender}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{consultation?.chiefComplaint}</td>
                    <td className="px-6 py-4">
                      {riskLevel ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          riskLevel === 'High' ? 'bg-red-50 text-red-600' :
                          riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {riskLevel}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{patient.createdAt}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {patients.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-400">No patients found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
