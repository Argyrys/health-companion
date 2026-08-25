import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, Users, X, Stethoscope, AlertTriangle } from 'lucide-react';
import { subscribeAllPatients } from '../services/patients';
import { PatientListSkeleton } from '../components/Skeleton';

export default function PatientList({ doctorId }) {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!doctorId) return;
    const unsub = subscribeAllPatients((data) => {
      setPatients(data);
      setLoading(false);
    });
    return () => unsub();
  }, [doctorId]);

  const filtered = patients.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.id?.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = filterRisk === 'all' ||
      p.consultations?.[0]?.eyeScreening?.riskLevel?.toLowerCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const activeFilters = (search ? 1 : 0) + (filterRisk !== 'all' ? 1 : 0);

  if (loading) return <PatientListSkeleton />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-slate-500 font-medium text-sm mb-1">Something went wrong</p>
          <p className="text-slate-400 text-xs mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Patients</h1>
        <p className="text-slate-400 text-sm mt-1">
          {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
          {activeFilters > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {activeFilters} filter{activeFilters !== 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 animate-fadeIn" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients by name or ID..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <Filter className="w-4 h-4 text-slate-400" />
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer"
          >
            <option value="all">All Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="col-span-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient</div>
          <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Details</div>
          <div className="col-span-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Complaint</div>
          <div className="col-span-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk</div>
          <div className="col-span-1 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.map((patient) => {
            const consultation = patient.consultations?.[0];
            const riskLevel = consultation?.eyeScreening?.riskLevel;
            const hasDiagnosis = consultation?.diagnosis;
            return (
              <div
                key={patient.id}
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="hover:bg-slate-50/80 transition-all cursor-pointer group"
              >
                <div className="sm:grid sm:grid-cols-12 sm:gap-4 sm:items-center px-5 py-4">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">{patient.name?.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-slate-800 group-hover:text-blue-700 transition-colors truncate">{patient.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{patient.age}y, {patient.gender}</p>
                    </div>
                  </div>
                  <div className="col-span-2 mt-2 sm:mt-0">
                    <p className="text-xs text-slate-500">Blood: {patient.bloodGroup || 'N/A'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{patient.phone || ''}</p>
                  </div>
                  <div className="col-span-3 mt-2 sm:mt-0 flex items-center gap-1.5">
                    <Stethoscope className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    <span className="text-sm text-slate-600 truncate">{consultation?.chiefComplaint || 'No complaint'}</span>
                  </div>
                  <div className="col-span-2 mt-2 sm:mt-0">
                    {riskLevel ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        riskLevel === 'High' ? 'bg-red-50 text-red-600' :
                        riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          riskLevel === 'High' ? 'bg-red-500' :
                          riskLevel === 'Medium' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`} />
                        {riskLevel}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">Not screened</span>
                    )}
                  </div>
                  <div className="col-span-1 mt-2 sm:mt-0 flex items-center justify-end gap-2">
                    {!hasDiagnosis && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded text-[10px] font-semibold uppercase">Pending</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm mb-0.5">No patients found</p>
            <p className="text-slate-400 text-xs">
              {search ? 'Try adjusting your search or filters' : 'Add patients to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
