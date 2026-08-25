import {
  collection, doc, getDocs, getDoc, updateDoc, query, where, deleteDoc, setDoc, onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

const fmtDate = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (val.toDate) return val.toDate().toISOString().split('T')[0];
  return String(val);
};

const mapAppPatient = async (docId) => {
  const base = `patients/${docId}/data`;
  try {
    const [profileSnap, caseSnap, medSnap, allergySnap, famSnap, medHistSnap, eyeSnap, mentalSnap, reportSnap] = await Promise.all([
      getDoc(doc(db, base, 'profile')),
      getDoc(doc(db, base, 'caseTaking')),
      getDoc(doc(db, base, 'medications')),
      getDoc(doc(db, base, 'allergies')),
      getDoc(doc(db, base, 'familyHistory')),
      getDoc(doc(db, base, 'medicalHistory')),
      getDoc(doc(db, base, 'eyeScreening')),
      getDoc(doc(db, base, 'mentalHealth')),
      getDocs(collection(db, `${base}/reportData/reports`)).catch(() => ({ docs: [] })),
    ]);

    if (!profileSnap.exists()) return null;
    return assembleAppPatient(docId, profileSnap.data(), caseSnap, medSnap, allergySnap, famSnap, medHistSnap, eyeSnap, mentalSnap, reportSnap);
  } catch (err) {
    console.warn('Could not read app patient subcollections for', docId, err);
    return null;
  }
};

const assembleAppPatient = (docId, p, caseSnap, medSnap, allergySnap, famSnap, medHistSnap, eyeSnap, mentalSnap, reportSnap) => {
  const ct = caseSnap?.exists() ? caseSnap.data() : {};
  const meds = medSnap?.exists() ? medSnap.data() : {};
  const allergyData = allergySnap?.exists() ? allergySnap.data() : {};
  const fam = famSnap?.exists() ? famSnap.data() : {};
  const medHist = medHistSnap?.exists() ? medHistSnap.data() : {};
  const eye = eyeSnap?.exists() ? eyeSnap.data() : {};
  const mental = mentalSnap?.exists() ? mentalSnap.data() : {};

  const medicalHistory = [];
  if (medHist.diabetes) medicalHistory.push('Diabetes');
  if (medHist.hypertension) medicalHistory.push('Hypertension');
  if (medHist.asthma) medicalHistory.push('Asthma');
  if (medHist.heartDisease) medicalHistory.push('Heart Disease');
  if (medHist.previousSurgery) medicalHistory.push('Previous Surgery');
  if (medHist.hospitalization) medicalHistory.push('Hospitalization');
  if (medHist.otherConditions) medicalHistory.push(...(Array.isArray(medHist.otherConditions) ? medHist.otherConditions : []));

  const familyHistory = (fam.entries || []).map(e => `${e.relationship || ''}: ${e.condition || ''}`.trim());

  const medications = (meds.medications || []).map(m => ({
    name: m.drugName || m.name || '',
    dosage: m.dosage || '',
    frequency: m.frequency || 'Once daily',
  }));

  const allergies = (allergyData.allergies || []).map(a => ({
    name: a.allergen || a.name || '',
    severity: a.severity || 'Mild',
  }));

  const questions = (mental.questions || []).map(q => ({
    q: q.question || q.q || '',
    a: q.answer ?? q.a ?? 0,
  }));

  const duration = ct.durationValue && ct.durationUnit
    ? `${ct.durationValue} ${ct.durationUnit}`
    : ct.duration || '';

  const findings = [];
  if (eye.aiAssessment) findings.push(eye.aiAssessment);
  if (eye.findings) findings.push(...(Array.isArray(eye.findings) ? eye.findings : []));

  const reportDocs = reportSnap?.docs || [];
  let diagnosis = '';
  let prescription = '';
  if (reportDocs.length > 0) {
    const latest = reportDocs[reportDocs.length - 1].data();
    diagnosis = latest.diagnosis || '';
    prescription = latest.prescription || '';
  }

  return {
    id: docId,
    uid: docId,
    name: p.fullName || p.name || '',
    age: p.age || 0,
    gender: p.gender || '',
    phone: p.phoneNumber || p.phone || '',
    bloodGroup: p.bloodGroup || '',
    height: p.height || '',
    weight: p.weight || '',
    address: p.address || '',
    city: p.city || '',
    emergencyContactName: p.emergencyContactName || '',
    emergencyContactNumber: p.emergencyContactNumber || '',
    existingConditions: p.existingConditions || '',
    preferredLanguage: p.preferredLanguage || '',
    email: p.email || '',
    createdAt: fmtDate(p.updatedAt) || fmtDate(ct.createdAt) || '',
    source: 'app',
    consultations: [
      {
        id: `app-${docId}`,
        chiefComplaint: ct.chiefComplaint || '',
        symptoms: ct.symptoms || [],
        severity: ct.severity || 0,
        duration,
        voiceRecording: ct.voiceRecordingUrl || null,
        voiceRecordingTranscription: null,
        medicalHistory,
        familyHistory,
        medications,
        allergies,
        eyeScreening: eye.riskLevel ? {
          riskLevel: eye.riskLevel || 'Pending',
          findings,
          recommendation: eye.aiAssessment || '',
        } : null,
        mentalHealth: questions.length > 0 ? {
          stressLevel: mental.status || 'Unknown',
          mood: mental.score || 0,
          sleepHours: 0,
          questions,
        } : null,
        diagnosis,
        prescription,
        createdAt: fmtDate(ct.createdAt) || '',
      }
    ],
  };
};

export const getAllPatients = async (doctorId) => {
  const patientsRef = collection(db, 'patients');
  const snapshot = await getDocs(patientsRef);
  const patients = [];

  for (const d of snapshot.docs) {
    const data = d.data();

    if (data.consultations && Array.isArray(data.consultations)) {
      patients.push({ id: d.id, ...data });
      continue;
    }

    if (!data.consultations) {
      const appPatient = await mapAppPatient(d.id);
      if (appPatient) patients.push(appPatient);
    }
  }

  return patients.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const getPatient = async (patientId) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  const data = docSnap.data();

  if (data.consultations && Array.isArray(data.consultations)) {
    return { id: docSnap.id, ...data };
  }

  if (!data.consultations) {
    const appPatient = await mapAppPatient(patientId);
    if (appPatient) return appPatient;
  }

  return { id: docSnap.id, ...data };
};

export const subscribeAllPatients = (callback) => {
  const unsubRoot = onSnapshot(collection(db, 'patients'), async (snapshot) => {
    const patients = [];
    const appUnsubs = new Map();

    for (const d of snapshot.docs) {
      const data = d.data();

      if (data.consultations && Array.isArray(data.consultations)) {
        patients.push({ id: d.id, ...data });
        continue;
      }

      if (!data.consultations) {
        const appPatient = await mapAppPatient(d.id);
        if (appPatient) patients.push(appPatient);
      }
    }

    callback(patients.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
  });

  return () => unsubRoot();
};

export const subscribePatient = (patientId, callback) => {
  const docRef = doc(db, 'patients', patientId);

  const unsubRoot = onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) { callback(null); return; }
    const data = docSnap.data();

    if (data.consultations && Array.isArray(data.consultations)) {
      callback({ id: docSnap.id, ...data });
      return;
    }

    if (!data.consultations) {
      const appPatient = await mapAppPatient(patientId);
      if (appPatient) {
        callback(appPatient);
      } else {
        callback({ id: docSnap.id, ...data });
      }
    }
  });

  return () => unsubRoot();
};

export const updateDiagnosis = async (patientId, consultationId, diagnosis, prescription) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  if (consultationId && consultationId.startsWith('app-')) {
    const reportsRef = collection(db, `patients/${patientId}/data/reportData/reports`);
    await setDoc(doc(reportsRef), {
      id: `report-${Date.now()}`,
      patientId,
      diagnosis,
      prescription,
      createdAt: new Date().toISOString(),
    });
    return;
  }

  if (data.consultations) {
    const updatedConsultations = data.consultations.map(c => {
      if (c.id === consultationId) {
        return { ...c, diagnosis, prescription };
      }
      return c;
    });
    await updateDoc(docRef, { consultations: updatedConsultations });
  }
};

export const updatePatientProfile = async (patientId, profileData) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  if (data.consultations) {
    await updateDoc(docRef, profileData);
  } else {
    const profileRef = doc(db, `patients/${patientId}/data/profile`);
    await updateDoc(profileRef, profileData);
  }
};

export const updateConsultationField = async (patientId, consultationId, field, value) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  if (consultationId && consultationId.startsWith('app-')) {
    const subMap = {
      medicalHistory: 'medicalHistory',
      familyHistory: 'familyHistory',
    };
    const subKey = subMap[field];
    if (subKey) {
      const subRef = doc(db, `patients/${patientId}/data/${subKey}`);
      if (field === 'familyHistory') {
        const entries = value.map(v => {
          const parts = v.split(': ');
          return { relationship: parts[0] || '', condition: parts.slice(1).join(': ') || '' };
        });
        await updateDoc(subRef, { entries });
      } else if (field === 'medicalHistory') {
        const boolFields = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'Previous Surgery', 'Hospitalization'];
        const updates = {};
        boolFields.forEach(f => { updates[f.toLowerCase().replace(/ /g, '')] = value.includes(f); });
        const other = value.filter(v => !boolFields.includes(v));
        updates.otherConditions = other;
        await updateDoc(subRef, updates);
      }
    }
    return;
  }

  if (data.consultations) {
    const updatedConsultations = data.consultations.map(c => {
      if (c.id === consultationId) {
        return { ...c, [field]: value };
      }
      return c;
    });
    await updateDoc(docRef, { consultations: updatedConsultations });
  }
};

export const addMedication = async (patientId, consultationId, medication) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  if (consultationId && consultationId.startsWith('app-')) {
    const medsRef = doc(db, `patients/${patientId}/data/medications`);
    const medsSnap = await getDoc(medsRef);
    const existing = medsSnap.exists() ? (medsSnap.data().medications || []) : [];
    await updateDoc(medsRef, {
      medications: [...existing, { id: `med-${Date.now()}`, drugName: medication.name, dosage: medication.dosage, frequency: medication.frequency }],
    });
    return;
  }

  if (data.consultations) {
    const updatedConsultations = data.consultations.map(c => {
      if (c.id === consultationId) {
        return { ...c, medications: [...(c.medications || []), medication] };
      }
      return c;
    });
    await updateDoc(docRef, { consultations: updatedConsultations });
  }
};

export const removeMedication = async (patientId, consultationId, index) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  if (consultationId && consultationId.startsWith('app-')) {
    const medsRef = doc(db, `patients/${patientId}/data/medications`);
    const medsSnap = await getDoc(medsRef);
    if (medsSnap.exists()) {
      const meds = [...(medsSnap.data().medications || [])];
      meds.splice(index, 1);
      await updateDoc(medsRef, { medications: meds });
    }
    return;
  }

  if (data.consultations) {
    const updatedConsultations = data.consultations.map(c => {
      if (c.id === consultationId) {
        const meds = [...(c.medications || [])];
        meds.splice(index, 1);
        return { ...c, medications: meds };
      }
      return c;
    });
    await updateDoc(docRef, { consultations: updatedConsultations });
  }
};

export const addAllergy = async (patientId, consultationId, allergy) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  if (consultationId && consultationId.startsWith('app-')) {
    const allergyRef = doc(db, `patients/${patientId}/data/allergies`);
    const allergySnap = await getDoc(allergyRef);
    const existing = allergySnap.exists() ? (allergySnap.data().allergies || []) : [];
    await updateDoc(allergyRef, {
      allergies: [...existing, { id: `allergy-${Date.now()}`, allergen: allergy.name, allergyType: 'Other', severity: allergy.severity }],
    });
    return;
  }

  if (data.consultations) {
    const updatedConsultations = data.consultations.map(c => {
      if (c.id === consultationId) {
        return { ...c, allergies: [...(c.allergies || []), allergy] };
      }
      return c;
    });
    await updateDoc(docRef, { consultations: updatedConsultations });
  }
};

export const removeAllergy = async (patientId, consultationId, index) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;
  const data = docSnap.data();

  if (consultationId && consultationId.startsWith('app-')) {
    const allergyRef = doc(db, `patients/${patientId}/data/allergies`);
    const allergySnap = await getDoc(allergyRef);
    if (allergySnap.exists()) {
      const allergies = [...(allergySnap.data().allergies || [])];
      allergies.splice(index, 1);
      await updateDoc(allergyRef, { allergies });
    }
    return;
  }

  if (data.consultations) {
    const updatedConsultations = data.consultations.map(c => {
      if (c.id === consultationId) {
        const allergies = [...(c.allergies || [])];
        allergies.splice(index, 1);
        return { ...c, allergies };
      }
      return c;
    });
    await updateDoc(docRef, { consultations: updatedConsultations });
  }
};

export const deleteAllPatients = async (doctorId) => {
  const patientsRef = collection(db, 'patients');
  const q = query(patientsRef, where('doctorId', '==', doctorId));
  const snapshot = await getDocs(q);
  const deletes = snapshot.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
};
