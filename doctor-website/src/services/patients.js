import {
  collection, doc, getDocs, getDoc, updateDoc, query, orderBy, deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

const patientsRef = collection(db, 'patients');

export const getAllPatients = async () => {
  const q = query(patientsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
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

export const deleteAllPatients = async () => {
  const snapshot = await getDocs(patientsRef);
  const deletes = snapshot.docs.map(d => deleteDoc(d.ref));
  await Promise.all(deletes);
};
