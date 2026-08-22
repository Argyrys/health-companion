import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Play, Pause, Camera, Brain, Pill, AlertTriangle,
  Heart, FileText, Save, ChevronDown, ChevronUp
} from 'lucide-react';
import { mockPatients } from '../data/mockData';

export default function PatientReport() {
  const { id } = useParams();
  const patient = mockPatients.find(p => p.id === id);
  const consultation = patient?.consultations[0];

  const [diagnosis, setDiagnosis] = useState(consultation?.diagnosis || '');
  const [prescription, setPrescription] = useState(consultation?.prescription || '');
  const [isPlaying, setIsPlaying] = useState(false);
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!patient || !consultation) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg">Patient not found</p>
        <Link to="/patients" className="text-emerald-600 text-sm mt-2 inline-block hover:underline">
          Back to patients
        </Link>
      </div>
    );
  }

  const Section = ({ id, title, icon: Icon, children, color = 'emerald' }) => (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 bg-${color}-50 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-4 h-4 text-${color}-600`} />
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        {expandedSections[id] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {expandedSections[id] && <div className="px-6 pb-5 border-t border-slate-50">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patients" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patient Report</h1>
          <p className="text-slate-500 text-sm">ID: {patient.id} &middot; Consultation: {consultation.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-700 font-bold text-xl">{patient.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{patient.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
              <span>{patient.age} years</span>
              <span>&middot;</span>
              <span>{patient.gender}</span>
              <span>&middot;</span>
              <span>Blood: {patient.bloodGroup}</span>
              <span>&middot;</span>
              <span>{patient.phone}</span>
            </div>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>Registered: {patient.createdAt}</p>
            <p>Consultation: {consultation.createdAt}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Section id="symptoms" title="Symptoms" icon={FileText}>
          <div className="pt-4 space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-1">Chief Complaint</p>
              <p className="text-slate-800 font-medium">{consultation.chiefComplaint}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {consultation.symptoms.map(s => (
                  <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{s}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Severity</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        consultation.severity >= 7 ? 'bg-red-500' :
                        consultation.severity >= 4 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${consultation.severity * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{consultation.severity}/10</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <p className="text-slate-800 font-medium">{consultation.duration}</p>
              </div>
            </div>
            {consultation.voiceRecording && (
              <div>
                <p className="text-sm text-slate-500 mb-2">Voice Recording</p>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlaying ? 'Pause' : 'Play'} Voice Recording
                </button>
              </div>
            )}
          </div>
        </Section>

        <Section id="history" title="Medical & Family History" icon={Heart} color="rose">
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-2">Medical History</p>
              {consultation.medicalHistory.length > 0 ? (
                <ul className="space-y-1">
                  {consultation.medicalHistory.map((h, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No medical history recorded</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Family History</p>
              {consultation.familyHistory.length > 0 ? (
                <ul className="space-y-1">
                  {consultation.familyHistory.map((h, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No family history recorded</p>
              )}
            </div>
          </div>
        </Section>

        <Section id="medications" title="Current Medications" icon={Pill} color="blue">
          <div className="pt-4">
            {consultation.medications.length > 0 ? (
              <div className="space-y-2">
                {consultation.medications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800">{med.name}</p>
                      <p className="text-sm text-slate-500">{med.dosage}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {med.frequency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No current medications</p>
            )}
          </div>
        </Section>

        <Section id="allergies" title="Allergies" icon={AlertTriangle} color="red">
          <div className="pt-4">
            {consultation.allergies.length > 0 ? (
              <div className="space-y-2">
                {consultation.allergies.map((allergy, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="font-medium text-slate-800">{allergy.name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              <p className="text-sm text-slate-400">No known allergies</p>
            )}
          </div>
        </Section>

        <Section id="eye" title="Eye Screening" icon={Camera} color="violet">
          <div className="pt-4">
            {consultation.eyeScreening ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-violet-100 rounded-xl flex items-center justify-center border-2 border-dashed border-violet-300">
                    <div className="text-center">
                      <Camera className="w-8 h-8 text-violet-400 mx-auto" />
                      <p className="text-xs text-violet-400 mt-1">Eye Photo</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        consultation.eyeScreening.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                        consultation.eyeScreening.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {consultation.eyeScreening.riskLevel} Risk
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Findings</p>
                      <ul className="space-y-1">
                        {consultation.eyeScreening.findings.map((f, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-violet-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-1">Recommendation</p>
                  <p className="text-sm text-slate-700">{consultation.eyeScreening.recommendation}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No eye screening performed</p>
            )}
          </div>
        </Section>

        <Section id="mental" title="Mental Health" icon={Brain} color="purple">
          <div className="pt-4">
            {consultation.mentalHealth ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{consultation.mentalHealth.mood}/10</p>
                    <p className="text-xs text-slate-500 mt-1">Mood</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{consultation.mentalHealth.sleepHours}h</p>
                    <p className="text-xs text-slate-500 mt-1">Sleep</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className={`text-lg font-bold ${
                      consultation.mentalHealth.stressLevel === 'High' ? 'text-red-600' :
                      consultation.mentalHealth.stressLevel === 'Moderate' ? 'text-amber-600' :
                      'text-green-600'
                    }`}>{consultation.mentalHealth.stressLevel}</p>
                    <p className="text-xs text-slate-500 mt-1">Stress</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Responses</p>
                  <div className="space-y-2">
                    {consultation.mentalHealth.questions.map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">{q.q}</span>
                        <span className="text-sm font-semibold text-slate-800">{q.a}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No mental health assessment performed</p>
            )}
          </div>
        </Section>

        <Section id="diagnosis" title="Diagnosis & Prescription" icon={FileText} color="emerald">
          <div className="pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Diagnosis</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter your diagnosis here..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Prescription</label>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Enter prescription here..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              {saved && (
                <span className="text-sm text-emerald-600 font-medium">Saved successfully!</span>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
