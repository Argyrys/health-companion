import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Users, X, Calendar, Stethoscope } from 'lucide-react';
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

  const activeFilters = (search ? 1 : 0) + (filterRisk !== 'all' ? 1 : 0);

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
    <div className="space-y-4 sm:space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        <p className="text-slate-400 text-sm mt-1">
          {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
          {activeFilters > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              {activeFilters} filter{activeFilters !== 1 ? 's' : ''} active
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 animate-fadeIn" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-auto">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Search className="w-4 h-4 text-slate-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full sm:w-64 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        {filtered.map((patient) => {
          const consultation = patient.consultations?.[0];
          const riskLevel = consultation?.eyeScreening?.riskLevel;
          const hasDiagnosis = consultation?.diagnosis;
          return (
            <div
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer group overflow-hidden"
            >
              <div className="flex">
                <div className={`w-1 flex-shrink-0 ${
                  riskLevel === 'High' ? 'bg-red-500' :
                  riskLevel === 'Medium' ? 'bg-amber-500' :
                  riskLevel === 'Low' ? 'bg-green-500' :
                  'bg-slate-200'
                }`} />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {patient.name?.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{patient.name}</h3>
                          {!hasDiagnosis && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-[10px] font-semibold uppercase tracking-wide flex-shrink-0">Pending</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs sm:text-sm text-slate-400">
                          <span>{patient.age}y, {patient.gender}</span>
                          <span className="hidden sm:inline">&middot;</span>
                          <span className="hidden sm:inline flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            {consultation?.chiefComplaint}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
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
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-300 sm:hidden">
                    <Stethoscope className="w-3 h-3" />
                    <span className="truncate">{consultation?.chiefComplaint}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium mb-1">No patients found</p>
            <p className="text-slate-400 text-sm">
              {search ? 'Try adjusting your search or filters' : 'Add patients to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
