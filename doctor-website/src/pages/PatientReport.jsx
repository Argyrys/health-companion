import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Camera, Brain, Pill, AlertTriangle,
  Heart, FileText, Save, ChevronDown, ChevronUp, CheckCircle2,
  Mic, Printer, User, MapPin, Phone, Globe, Plus, X, Download, Play, Pause, Square
} from 'lucide-react';
import {
  getPatient, updateDiagnosis, updatePatientProfile, updateConsultationField,
  addMedication, removeMedication, addAllergy, removeAllergy
} from '../services/patients';
import { PatientReportSkeleton } from '../components/Skeleton';

const Section = ({ sectionId, title, icon: Icon, children, expandedSections, toggleSection, badge }) => {
  const isExpanded = expandedSections[sectionId];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => toggleSection(sectionId)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Icon className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
          {badge && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{badge}</span>}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4">{children}</div>
      )}
    </div>
  );
};

const TextInput = ({ label, value, onChange, placeholder, type = 'text', rows }) => {
  if (rows) {
    return (
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">{label}</label>
        <textarea
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors resize-none"
        />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
      />
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
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({});
  const [profileSaved, setProfileSaved] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: 'Once daily' });
  const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'Mild' });
  const [newFamilyEntry, setNewFamilyEntry] = useState({ condition: '', relationship: '' });
  const [newOtherCondition, setNewOtherCondition] = useState('');
  const [playingAudio, setPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
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
        setDiagnosis(data?.consultations?.[0]?.diagnosis || '');
        setPrescription(data?.consultations?.[0]?.prescription || '');
      } catch (err) {
        console.error('Error fetching patient:', err);
      }
      setLoading(false);
    };
    fetchPatient();
  }, [id]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const consultation = patient?.consultations?.[0];

  const handleSaveDiagnosis = async () => {
    setSaving(true);
    try {
      await updateDiagnosis(id, consultation.id, diagnosis, prescription);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving diagnosis:', err);
    }
    setSaving(false);
  };

  const handleSaveProfile = async () => {
    try {
      await updatePatientProfile(id, profileDraft);
      setPatient(prev => ({ ...prev, ...profileDraft }));
      setEditingProfile(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleAddMedication = async () => {
    if (!newMed.name.trim()) return;
    try {
      await addMedication(id, consultation.id, newMed);
      setPatient(prev => {
        const c = prev.consultations[0];
        return { ...prev, consultations: [{ ...c, medications: [...(c.medications || []), newMed] }] };
      });
      setNewMed({ name: '', dosage: '', frequency: 'Once daily' });
    } catch (err) {
      console.error('Error adding medication:', err);
    }
  };

  const handleRemoveMedication = async (index) => {
    try {
      await removeMedication(id, consultation.id, index);
      setPatient(prev => {
        const c = prev.consultations[0];
        const meds = [...(c.medications || [])];
        meds.splice(index, 1);
        return { ...prev, consultations: [{ ...c, medications: meds }] };
      });
    } catch (err) {
      console.error('Error removing medication:', err);
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.name.trim()) return;
    try {
      await addAllergy(id, consultation.id, newAllergy);
      setPatient(prev => {
        const c = prev.consultations[0];
        return { ...prev, consultations: [{ ...c, allergies: [...(c.allergies || []), newAllergy] }] };
      });
      setNewAllergy({ name: '', severity: 'Mild' });
    } catch (err) {
      console.error('Error adding allergy:', err);
    }
  };

  const handleRemoveAllergy = async (index) => {
    try {
      await removeAllergy(id, consultation.id, index);
      setPatient(prev => {
        const c = prev.consultations[0];
        const allergies = [...(c.allergies || [])];
        allergies.splice(index, 1);
        return { ...prev, consultations: [{ ...c, allergies }] };
      });
    } catch (err) {
      console.error('Error removing allergy:', err);
    }
  };

  const handleAddFamilyEntry = async () => {
    if (!newFamilyEntry.condition.trim()) return;
    const entry = `${newFamilyEntry.relationship}: ${newFamilyEntry.condition}`;
    const updated = [...(consultation.familyHistory || []), entry];
    try {
      await updateConsultationField(id, consultation.id, 'familyHistory', updated);
      setPatient(prev => {
        const c = prev.consultations[0];
        return { ...prev, consultations: [{ ...c, familyHistory: updated }] };
      });
      setNewFamilyEntry({ condition: '', relationship: '' });
    } catch (err) {
      console.error('Error adding family entry:', err);
    }
  };

  const handleRemoveFamilyEntry = async (index) => {
    const updated = [...(consultation.familyHistory || [])];
    updated.splice(index, 1);
    try {
      await updateConsultationField(id, consultation.id, 'familyHistory', updated);
      setPatient(prev => {
        const c = prev.consultations[0];
        return { ...prev, consultations: [{ ...c, familyHistory: updated }] };
      });
    } catch (err) {
      console.error('Error removing family entry:', err);
    }
  };

  const handleAddOtherCondition = async () => {
    if (!newOtherCondition.trim()) return;
    const updated = [...(consultation.medicalHistory || []), newOtherCondition];
    try {
      await updateConsultationField(id, consultation.id, 'medicalHistory', updated);
      setPatient(prev => {
        const c = prev.consultations[0];
        return { ...prev, consultations: [{ ...c, medicalHistory: updated }] };
      });
      setNewOtherCondition('');
    } catch (err) {
      console.error('Error adding condition:', err);
    }
  };

  const handleRemoveMedicalCondition = async (index) => {
    const updated = [...(consultation.medicalHistory || [])];
    updated.splice(index, 1);
    try {
      await updateConsultationField(id, consultation.id, 'medicalHistory', updated);
      setPatient(prev => {
        const c = prev.consultations[0];
        return { ...prev, consultations: [{ ...c, medicalHistory: updated }] };
      });
    } catch (err) {
      console.error('Error removing condition:', err);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlayingAudio(!playingAudio);
  };

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const p = patient;
    const c = consultation;

    let y = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Health Companion - Patient Report', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 105, y, { align: 'center' });
    y += 10;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${p.name || 'N/A'}    Age: ${p.age || 'N/A'}    Gender: ${p.gender || 'N/A'}    Blood: ${p.bloodGroup || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Phone: ${p.phone || 'N/A'}    Height: ${p.height || 'N/A'}    Weight: ${p.weight || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Address: ${p.address || 'N/A'}, ${p.city || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Emergency Contact: ${p.emergencyContactName || 'N/A'} (${p.emergencyContactNumber || 'N/A'})`, 20, y);
    y += 6;
    doc.text(`Existing Conditions: ${p.existingConditions || 'None'}`, 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Symptoms', 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Chief Complaint: ${c.chiefComplaint || 'N/A'}`, 20, y);
    y += 6;
    doc.text(`Symptoms: ${(c.symptoms || []).join(', ') || 'None'}`, 20, y);
    y += 6;
    doc.text(`Severity: ${c.severity || 0}/10    Duration: ${c.duration || 'N/A'}`, 20, y);
    y += 10;

    if ((c.medicalHistory || []).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Medical History', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      c.medicalHistory.forEach(h => {
        doc.text(`  - ${h}`, 20, y);
        y += 6;
      });
      y += 4;
    }

    if ((c.familyHistory || []).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Family History', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      c.familyHistory.forEach(h => {
        doc.text(`  - ${h}`, 20, y);
        y += 6;
      });
      y += 4;
    }

    if ((c.medications || []).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Current Medications', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      c.medications.forEach(m => {
        doc.text(`  - ${m.name} ${m.dosage} (${m.frequency})`, 20, y);
        y += 6;
      });
      y += 4;
    }

    if ((c.allergies || []).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Allergies', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      c.allergies.forEach(a => {
        doc.text(`  - ${a.name} (${a.severity})`, 20, y);
        y += 6;
      });
      y += 4;
    }

    if (c.eyeScreening) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Eye Screening', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Risk Level: ${c.eyeScreening.riskLevel || 'N/A'}`, 20, y);
      y += 6;
      (c.eyeScreening.findings || []).forEach(f => {
        doc.text(`  - ${f}`, 20, y);
        y += 6;
      });
      doc.text(`Recommendation: ${c.eyeScreening.recommendation || 'N/A'}`, 20, y);
      y += 10;
    }

    if (c.mentalHealth) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Mental Health', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mood: ${c.mentalHealth.mood}/10    Sleep: ${c.mentalHealth.sleepHours}h    Stress: ${c.mentalHealth.stressLevel}`, 20, y);
      y += 6;
      (c.mentalHealth.questions || []).forEach(q => {
        doc.text(`  - ${q.q} -> ${q.a}/10`, 20, y);
        y += 6;
      });
      y += 4;
    }

    if (y > 250) { doc.addPage(); y = 20; }

    if (diagnosis || prescription) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Diagnosis & Prescription', 20, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (diagnosis) {
        doc.text(`Diagnosis: ${diagnosis}`, 20, y, { maxWidth: 170 });
        y += Math.ceil(diagnosis.length / 85) * 5 + 4;
      }
      if (prescription) {
        doc.text(`Prescription: ${prescription}`, 20, y, { maxWidth: 170 });
        y += Math.ceil(prescription.length / 85) * 5 + 4;
      }
      y += 6;
    }

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.line(20, y, 190, y);
    y += 8;
    doc.text("Doctor's Signature", 20, y + 12);
    doc.line(20, y + 14, 80, y + 14);
    doc.text("Patient's Signature", 120, y + 12);
    doc.line(120, y + 14, 180, y + 14);
    y += 20;
    doc.text('AI Health Companion - Smart India Hackathon 2026', 105, y, { align: 'center' });

    doc.save(`Patient_Report_${p.name?.replace(/\s+/g, '_') || id}.pdf`);
  };

  const handlePrint = () => window.print();

  if (loading) return <PatientReportSkeleton />;

  if (!patient || !consultation) {
    return (
      <div className="text-center py-16 sm:py-20">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileText className="w-7 h-7 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium text-base">Patient not found</p>
        <Link to="/patients" className="text-blue-600 text-sm mt-2 inline-block hover:underline font-medium">Back to patients</Link>
      </div>
    );
  }

  const hasDiagnosis = consultation.diagnosis;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fadeIn print:hidden">
        <Link to="/patients" className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
          <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-800">Patient Report</h1>
          <p className="text-slate-400 text-xs mt-0.5">Consultation {consultation.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadPDF} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition-colors">
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-200 transition-colors">
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${hasDiagnosis ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
          {hasDiagnosis ? 'Diagnosed' : 'Pending'}
        </span>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn" style={{ animationDelay: '0.05s' }}>
        <div className="h-1.5 bg-blue-600" />
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">{patient.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-800">{patient.name}</h2>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-500">
                <span>{patient.age} years</span>
                <span>{patient.gender}</span>
                <span>Blood: {patient.bloodGroup}</span>
                <span>{patient.phone}</span>
                {patient.height && <span>H: {patient.height}</span>}
                {patient.weight && <span>W: {patient.weight}</span>}
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 hidden sm:block flex-shrink-0">
              <p>Registered: {patient.createdAt}</p>
              <p>Consultation: {consultation.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Profile */}
      <Section sectionId="profile" title="Patient Profile" icon={User} expandedSections={expandedSections} toggleSection={toggleSection}>
        {editingProfile ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <TextInput label="Height" value={profileDraft.height} onChange={e => setProfileDraft(p => ({ ...p, height: e.target.value }))} placeholder="e.g. 5'8&quot;" />
              <TextInput label="Weight" value={profileDraft.weight} onChange={e => setProfileDraft(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 70kg" />
              <TextInput label="City" value={profileDraft.city} onChange={e => setProfileDraft(p => ({ ...p, city: e.target.value }))} placeholder="City" />
            </div>
            <TextInput label="Address" value={profileDraft.address} onChange={e => setProfileDraft(p => ({ ...p, address: e.target.value }))} placeholder="Full address" />
            <div className="grid grid-cols-2 gap-3">
              <TextInput label="Emergency Contact Name" value={profileDraft.emergencyContactName} onChange={e => setProfileDraft(p => ({ ...p, emergencyContactName: e.target.value }))} placeholder="Contact name" />
              <TextInput label="Emergency Contact Number" value={profileDraft.emergencyContactNumber} onChange={e => setProfileDraft(p => ({ ...p, emergencyContactNumber: e.target.value }))} placeholder="Contact number" />
            </div>
            <TextInput label="Existing Conditions" value={profileDraft.existingConditions} onChange={e => setProfileDraft(p => ({ ...p, existingConditions: e.target.value }))} placeholder="Known conditions" />
            <TextInput label="Preferred Language" value={profileDraft.preferredLanguage} onChange={e => setProfileDraft(p => ({ ...p, preferredLanguage: e.target.value }))} placeholder="e.g. Hindi, English" />
            <div className="flex gap-2">
              <button onClick={handleSaveProfile} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save Profile
              </button>
              <button onClick={() => setEditingProfile(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {[
                { label: 'Height', value: patient.height },
                { label: 'Weight', value: patient.weight },
                { label: 'City', value: patient.city },
                { label: 'Address', value: patient.address },
                { label: 'Emergency Contact', value: patient.emergencyContactName && `${patient.emergencyContactName} (${patient.emergencyContactNumber})` },
                { label: 'Existing Conditions', value: patient.existingConditions },
                { label: 'Preferred Language', value: patient.preferredLanguage },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{f.label}</p>
                  <p className="text-sm text-slate-700 font-medium mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => { setEditingProfile(true); setProfileDraft({ height: patient.height || '', weight: patient.weight || '', city: patient.city || '', address: patient.address || '', emergencyContactName: patient.emergencyContactName || '', emergencyContactNumber: patient.emergencyContactNumber || '', existingConditions: patient.existingConditions || '', preferredLanguage: patient.preferredLanguage || '' }); }} className="text-xs text-blue-600 font-medium hover:underline">
              Edit Profile
            </button>
          </div>
        )}
        {profileSaved && <p className="text-xs text-blue-600 mt-2 font-medium animate-fadeIn">Profile updated!</p>}
      </Section>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Symptoms - full width */}
        <div className="lg:col-span-2">
          <Section sectionId="symptoms" title="Symptoms" icon={FileText} expandedSections={expandedSections} toggleSection={toggleSection}>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Chief Complaint</p>
                <p className="text-slate-800 font-medium text-sm">{consultation.chiefComplaint}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {(consultation.symptoms || []).map(s => (
                    <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Severity</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-500 ${consultation.severity >= 7 ? 'bg-red-500' : consultation.severity >= 4 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${(consultation.severity || 0) * 10}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{consultation.severity}/10</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Duration</p>
                  <p className="text-slate-800 font-medium text-sm">{consultation.duration}</p>
                </div>
              </div>
              {/* Voice Recording */}
              {consultation.voiceRecording && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <button onClick={toggleAudio} className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors flex-shrink-0">
                      {playingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-blue-800">Voice Recording</p>
                      <p className="text-xs text-blue-500 truncate">{consultation.voiceRecordingTranscription || 'Audio recording from patient'}</p>
                    </div>
                  </div>
                  <audio ref={audioRef} src={consultation.voiceRecording} onEnded={() => setPlayingAudio(false)} onTimeUpdate={(e) => setAudioProgress((e.target.currentTime / e.target.duration) * 100)} />
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* Medical History - editable */}
        <Section sectionId="history" title="Medical & Family History" icon={Heart} expandedSections={expandedSections} toggleSection={toggleSection}>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Medical History</p>
              {(consultation.medicalHistory || []).length > 0 ? (
                <ul className="space-y-1.5 mb-3">
                  {consultation.medicalHistory.map((h, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                      <button onClick={() => handleRemoveMedicalCondition(i)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-300 italic mb-3">No medical history recorded</p>
              )}
              <div className="flex gap-2">
                <input value={newOtherCondition} onChange={e => setNewOtherCondition(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddOtherCondition()} placeholder="Add condition..." className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                <button onClick={handleAddOtherCondition} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors flex-shrink-0"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Family History</p>
              {(consultation.familyHistory || []).length > 0 ? (
                <ul className="space-y-1.5 mb-3">
                  {consultation.familyHistory.map((h, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full flex-shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                      <button onClick={() => handleRemoveFamilyEntry(i)} className="text-slate-300 hover:text-red-500 transition-colors flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-300 italic mb-3">No family history recorded</p>
              )}
              <div className="flex gap-2 mb-2">
                <input value={newFamilyEntry.relationship} onChange={e => setNewFamilyEntry(p => ({ ...p, relationship: e.target.value }))} placeholder="Relation (e.g. Father)" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                <input value={newFamilyEntry.condition} onChange={e => setNewFamilyEntry(p => ({ ...p, condition: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddFamilyEntry()} placeholder="Condition" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                <button onClick={handleAddFamilyEntry} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors flex-shrink-0"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </Section>

        {/* Medications - editable */}
        <Section sectionId="medications" title="Current Medications" icon={Pill} expandedSections={expandedSections} toggleSection={toggleSection} badge={(consultation.medications || []).length}>
          <div className="space-y-3">
            {(consultation.medications || []).length > 0 ? (
              <div className="space-y-2">
                {consultation.medications.map((med, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 text-sm truncate">{med.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{med.dosage}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">{med.frequency}</span>
                      <button onClick={() => handleRemoveMedication(i)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">No current medications</p>
            )}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 font-semibold mb-2">Add Medication</p>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))} placeholder="Drug name" className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                <input value={newMed.dosage} onChange={e => setNewMed(p => ({ ...p, dosage: e.target.value }))} placeholder="Dosage" className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                <select value={newMed.frequency} onChange={e => setNewMed(p => ({ ...p, frequency: e.target.value }))} className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>Three times daily</option>
                  <option>Four times daily</option>
                  <option>As needed</option>
                </select>
              </div>
              <button onClick={handleAddMedication} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </Section>

        {/* Allergies - editable */}
        <Section sectionId="allergies" title="Allergies" icon={AlertTriangle} expandedSections={expandedSections} toggleSection={toggleSection} badge={(consultation.allergies || []).length}>
          <div className="space-y-3">
            {(consultation.allergies || []).length > 0 ? (
              <div className="space-y-2">
                {consultation.allergies.map((allergy, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="font-medium text-slate-800 text-sm truncate">{allergy.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${allergy.severity === 'Severe' ? 'bg-red-100 text-red-700' : allergy.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{allergy.severity}</span>
                      <button onClick={() => handleRemoveAllergy(i)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">No known allergies</p>
            )}
            <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400 font-semibold mb-2">Add Allergy</p>
              <div className="flex gap-2 mb-2">
                <input value={newAllergy.name} onChange={e => setNewAllergy(p => ({ ...p, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleAddAllergy()} placeholder="Allergy name" className="flex-1 px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                <select value={newAllergy.severity} onChange={e => setNewAllergy(p => ({ ...p, severity: e.target.value }))} className="px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option>Mild</option>
                  <option>Moderate</option>
                  <option>Severe</option>
                </select>
              </div>
              <button onClick={handleAddAllergy} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </Section>

        {/* Eye Screening */}
        <Section sectionId="eye" title="Eye Screening" icon={Camera} expandedSections={expandedSections} toggleSection={toggleSection}>
          <div>
            {consultation.eyeScreening ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <div className="w-24 h-24 bg-blue-50 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-200 flex-shrink-0">
                    <div className="text-center">
                      <Camera className="w-7 h-7 text-blue-400 mx-auto" />
                      <p className="text-[10px] text-blue-400 mt-1 font-medium">Eye Photo</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${consultation.eyeScreening.riskLevel === 'High' ? 'bg-red-100 text-red-700' : consultation.eyeScreening.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{consultation.eyeScreening.riskLevel} Risk</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Findings</p>
                      <ul className="space-y-1">
                        {(consultation.eyeScreening.findings || []).map((f, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Recommendation</p>
                  <p className="text-sm text-slate-600">{consultation.eyeScreening.recommendation}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">No eye screening performed</p>
            )}
          </div>
        </Section>

        {/* Mental Health */}
        <Section sectionId="mental" title="Mental Health" icon={Brain} expandedSections={expandedSections} toggleSection={toggleSection}>
          <div>
            {consultation.mentalHealth ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-blue-50 rounded-xl text-center border border-blue-100">
                    <p className="text-xl font-bold text-blue-600">{consultation.mentalHealth.mood}/10</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Mood</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-center border border-blue-100">
                    <p className="text-xl font-bold text-blue-600">{consultation.mentalHealth.sleepHours}h</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Sleep</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-center border border-blue-100">
                    <p className={`text-base font-bold ${consultation.mentalHealth.stressLevel === 'High' ? 'text-red-600' : consultation.mentalHealth.stressLevel === 'Moderate' ? 'text-amber-600' : 'text-green-600'}`}>{consultation.mentalHealth.stressLevel}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Stress</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Responses</p>
                  <div className="space-y-1.5">
                    {(consultation.mentalHealth.questions || []).map((q, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-500 truncate mr-2">{q.q}</span>
                        <span className="text-sm font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md shadow-sm flex-shrink-0">{q.a}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 italic">No mental health assessment performed</p>
            )}
          </div>
        </Section>
      </div>

      {/* Diagnosis - full width, prominent */}
      <Section sectionId="diagnosis" title="Diagnosis & Prescription" icon={FileText} expandedSections={expandedSections} toggleSection={toggleSection}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Diagnosis</label>
            <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Enter your diagnosis here..." rows={3} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors resize-none leading-relaxed" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Prescription</label>
            <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Enter prescription here..." rows={4} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors resize-none leading-relaxed" />
          </div>
          <div className="flex items-center gap-2.5 print:hidden">
            <button onClick={handleSaveDiagnosis} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-blue-600 font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Saved!
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* Print Signature Footer */}
      <div className="print-footer">
        <div className="border-t border-slate-200 pt-4 mt-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-6">Doctor's Signature</p>
              <div className="w-36 border-t border-slate-300" />
              <p className="text-xs text-slate-400 mt-1">Date: {consultation.createdAt}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-6">Patient's Signature</p>
              <div className="w-36 border-t border-slate-300 ml-auto" />
              <p className="text-xs text-slate-400 mt-1">{patient.name}</p>
            </div>
          </div>
          <div className="mt-6 pt-3 border-t border-slate-200 text-center">
            <p className="text-[10px] text-slate-300 font-medium">AI Health Companion &middot; Smart India Hackathon 2026 &middot; Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
