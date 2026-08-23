import {
  collection, doc, getDocs, getDoc, updateDoc, query, where, deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

export const getAllPatients = async (doctorId) => {
  const patientsRef = collection(db, 'patients');
  const q = query(patientsRef, where('doctorId', '==', doctorId));
  const snapshot = await getDocs(q);
  const patients = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
  return patients.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
};

export const getPatient = async (patientId) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateDiagnosis = async (patientId, consultationId, diagnosis, prescription) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const updatedConsultations = data.consultations.map(c => {
      if (c.id === consultationId) {
        return { ...c, diagnosis, prescription };
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
