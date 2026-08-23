import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Camera, Brain, Pill, AlertTriangle,
  Heart, FileText, Save, ChevronDown, ChevronUp, CheckCircle2, Mic, Printer
} from 'lucide-react';
import { getPatient, updateDiagnosis } from '../services/patients';
import { PatientReportSkeleton } from '../components/Skeleton';

const sectionColorMap = {
  emerald: { light: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  rose: { light: 'bg-rose-50', icon: 'text-rose-600', border: 'border-rose-100' },
  blue: { light: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  red: { light: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100' },
  violet: { light: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-100' },
  purple: { light: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
};

const Section = ({ sectionId, title, icon: Icon, children, color = 'emerald', expandedSections, toggleSection }) => {
  const isExpanded = expandedSections[sectionId];
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200">
      <button
        onClick={() => toggleSection(sectionId)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 hover:bg-slate-50/80 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`w-8 h-8 sm:w-9 sm:h-9 ${sectionColorMap[color]?.light || 'bg-emerald-50'} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${sectionColorMap[color]?.icon || 'text-emerald-600'}`} />
          </div>
          <h3 className="font-semibold text-sm sm:text-base text-slate-800">{title}</h3>
        </div>
        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${isExpanded ? 'bg-slate-100' : 'bg-transparent group-hover:bg-slate-100'}`}>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />}
        </div>
      </button>
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-slate-50 pt-3 sm:pt-4">{children}</div>
      </div>
    </div>
  );
};

export default function PatientReport() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    symptoms: true,
    history: true,
    medications: true,
    allergies: true,
    eye: true,
    mental: true,
    diagnosis: true,
  });

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await getPatient(id);
        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient:', err);
      }
      setLoading(false);
    };
    fetchPatient();
  }, [id]);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (patient?.consultations?.[0] && !initializedRef.current) {
      setDiagnosis(patient.consultations[0].diagnosis || '');
      setPrescription(patient.consultations[0].prescription || '');
      initializedRef.current = true;
    }
  }, [patient]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    const consultation = patient?.consultations?.[0];
    if (!patient || !consultation) return;
    setSaving(true);
    try {
      await updateDiagnosis(patient.id, consultation.id, diagnosis, prescription);
      const updatedConsultations = patient.consultations.map(c =>
        c.id === consultation.id ? { ...c, diagnosis, prescription } : c
      );
      setPatient({ ...patient, consultations: updatedConsultations });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving diagnosis:', err);
    }
    setSaving(false);
  };

  if (loading) {
    return <PatientReportSkeleton />;
  }

  if (!patient || !patient.consultations?.[0]) {
    return (
      <div className="text-center py-16 sm:py-20">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileText className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium text-base">Patient not found</p>
        <Link to="/patients" className="text-emerald-600 text-sm mt-2 inline-block hover:underline font-medium">
          Back to patients
        </Link>
      </div>
    );
  }

  const consultation = patient.consultations[0];
  const hasDiagnosis = consultation.diagnosis;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-3 sm:space-y-5">
      <div className="flex items-center gap-2.5 sm:gap-3 animate-fadeIn print:hidden">
        <Link to="/patients" className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-hover:text-slate-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 truncate">Patient Report</h1>
          <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 truncate">Consultation {consultation.id}</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-all duration-200 flex-shrink-0"
        >
          <Printer className="w-3.5 h-3.5" />
          Print
        </button>
        <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${
          hasDiagnosis ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {hasDiagnosis ? 'Diagnosed' : 'Pending'}
        </span>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.05s' }}>
        <div className="h-1 sm:h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="p-4 sm:p-5">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold text-base sm:text-lg lg:text-xl">{patient.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 truncate">{patient.name}</h2>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[11px] sm:text-xs text-slate-400">
                <span>{patient.age}y</span>
                <span>{patient.gender}</span>
                <span className="hidden sm:inline">Blood: {patient.bloodGroup}</span>
                <span>{patient.phone}</span>
              </div>
            </div>
            <div className="text-right text-[11px] sm:text-xs text-slate-400 hidden sm:block flex-shrink-0">
              <p>Registered: {patient.createdAt}</p>
              <p>Consultation: {consultation.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        <Section sectionId="symptoms" title="Symptoms" icon={FileText} expandedSections={expandedSections} toggleSection={toggleSection}>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Chief Complaint</p>
              <p className="text-slate-800 font-medium text-sm">{consultation.chiefComplaint}</p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Symptoms</p>
              <div className="flex flex-wrap gap-1.5">
                {(consultation.symptoms || []).map(s => (
                  <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Severity</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        consultation.severity >= 7 ? 'bg-red-500' :
                        consultation.severity >= 4 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(consultation.severity || 0) * 10}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{consultation.severity}/10</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Duration</p>
                <p className="text-slate-800 font-medium text-sm">{consultation.duration}</p>
              </div>
            </div>
            {consultation.voiceRecording && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-medium text-xs w-fit">
                <Mic className="w-3.5 h-3.5" />
                Voice recording available
              </div>
            )}
          </div>
        </Section>

        <Section sectionId="history" title="Medical & Family History" icon={Heart} color="rose" expandedSections={expandedSections} toggleSection={toggleSection}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Medical History</p>
              {(consultation.medicalHistory || []).length > 0 ? (
                <ul className="space-y-1.5">
                  {consultation.medicalHistory.map((h, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 p-2 bg-rose-50/50 rounded-lg">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 italic">No medical history recorded</p>
              )}
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Family History</p>
              {(consultation.familyHistory || []).length > 0 ? (
                <ul className="space-y-1.5">
                  {consultation.familyHistory.map((h, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-center gap-2 p-2 bg-amber-50/50 rounded-lg">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 italic">No family history recorded</p>
              )}
            </div>
          </div>
        </Section>

        <Section sectionId="medications" title="Current Medications" icon={Pill} color="blue" expandedSections={expandedSections} toggleSection={toggleSection}>
          <div>
            {(consultation.medications || []).length > 0 ? (
              <div className="space-y-2">
                {consultation.medications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{med.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{med.dosage}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-[10px] sm:text-xs font-semibold flex-shrink-0 ml-2">
                      {med.frequency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 italic">No current medications</p>
            )}
          </div>
        </Section>

        <Section sectionId="allergies" title="Allergies" icon={AlertTriangle} color="red" expandedSections={expandedSections} toggleSection={toggleSection}>
          <div>
            {(consultation.allergies || []).length > 0 ? (
              <div className="space-y-2">
                {consultation.allergies.map((allergy, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="font-medium text-slate-800 text-sm truncate">{allergy.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-semibold flex-shrink-0 ml-2 ${
                      allergy.severity === 'Severe' ? 'bg-red-100 text-red-700' :
                      allergy.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {allergy.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 italic">No known allergies</p>
            )}
          </div>
        </Section>

        <Section sectionId="eye" title="Eye Screening" icon={Camera} color="violet" expandedSections={expandedSections} toggleSection={toggleSection}>
          <div>
            {consultation.eyeScreening ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-violet-100 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-dashed border-violet-300 flex-shrink-0">
                    <div className="text-center">
                      <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-violet-400 mx-auto" />
                      <p className="text-[10px] text-violet-400 mt-1 font-medium">Eye Photo</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        consultation.eyeScreening.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        consultation.eyeScreening.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {consultation.eyeScreening.riskLevel} Risk
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Findings</p>
                      <ul className="space-y-1">
                        {(consultation.eyeScreening.findings || []).map((f, i) => (
                          <li key={i} className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100/50">
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Recommendation</p>
                  <p className="text-xs sm:text-sm text-slate-600">{consultation.eyeScreening.recommendation}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 italic">No eye screening performed</p>
            )}
          </div>
        </Section>

        <Section sectionId="mental" title="Mental Health" icon={Brain} color="purple" expandedSections={expandedSections} toggleSection={toggleSection}>
          <div>
            {consultation.mentalHealth ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-purple-50/50 rounded-xl text-center border border-purple-100/50">
                    <p className="text-lg sm:text-xl font-bold text-purple-600">{consultation.mentalHealth.mood}/10</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">Mood</p>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-xl text-center border border-purple-100/50">
                    <p className="text-lg sm:text-xl font-bold text-purple-600">{consultation.mentalHealth.sleepHours}h</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">Sleep</p>
                  </div>
                  <div className="p-3 bg-purple-50/50 rounded-xl text-center border border-purple-100/50">
                    <p className={`text-sm sm:text-base font-bold ${
                      consultation.mentalHealth.stressLevel === 'High' ? 'text-red-600' :
                      consultation.mentalHealth.stressLevel === 'Moderate' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>{consultation.mentalHealth.stressLevel}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-medium">Stress</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Responses</p>
                  <div className="space-y-1.5">
                    {(consultation.mentalHealth.questions || []).map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                        <span className="text-xs sm:text-sm text-slate-500 truncate mr-2">{q.q}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md shadow-sm flex-shrink-0">{q.a}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-300 italic">No mental health assessment performed</p>
            )}
          </div>
        </Section>

        <Section sectionId="diagnosis" title="Diagnosis & Prescription" icon={FileText} color="emerald" expandedSections={expandedSections} toggleSection={toggleSection}>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Diagnosis</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter your diagnosis here..."
                rows={3}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200 resize-none leading-relaxed"
              />
            </div>
            <div>
              <label className="block text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Prescription</label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Enter prescription here..."
                rows={4}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all duration-200 resize-none leading-relaxed"
              />
            </div>
            <div className="flex items-center gap-2.5 print:hidden">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium text-sm hover:bg-emerald-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-xs sm:text-sm text-emerald-600 font-medium animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved!
                </span>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
