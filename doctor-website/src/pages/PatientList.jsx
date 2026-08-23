import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Users, X } from 'lucide-react';
import { getAllPatients } from '../services/patients';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const filtered = patients.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = filterRisk === 'all' ||
      p.consultations?.[0]?.eyeScreening?.riskLevel?.toLowerCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-400 text-sm">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        <p className="text-slate-400 text-sm mt-1">{filtered.length} patient{filtered.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 animate-fadeIn" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="appearance-none pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">ID</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Age/Gender</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Chief Complaint</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Eye Risk</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((patient, i) => {
                const consultation = patient.consultations?.[0];
                const riskLevel = consultation?.eyeScreening?.riskLevel;
                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/80 transition-all duration-200 cursor-pointer group"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                          <span className="text-white font-semibold text-sm">
                            {patient.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-800 group-hover:text-emerald-700 transition-colors">{patient.name}</span>
                          <p className="text-xs text-slate-400 sm:hidden">{patient.age}y, {patient.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-mono hidden sm:table-cell">{patient.id?.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{patient.age}y / {patient.gender}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden lg:table-cell">{consultation?.chiefComplaint}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {riskLevel ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          riskLevel === 'High' ? 'bg-red-50 text-red-600' :
                          riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' :
                          'bg-green-50 text-green-600'
                        }`}>
                          {riskLevel}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">{patient.createdAt}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors">
                        View <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium mb-1">No patients found</p>
            <p className="text-slate-400 text-sm">
              {search ? 'Try adjusting your search' : 'Add patients to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
