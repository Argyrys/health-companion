import {
  collection, doc, getDoc, setDoc, increment, getDocs, query, where
} from 'firebase/firestore';
import { db } from './firebase';

export const getOrCreateDoctor = async (uid, email) => {
  const doctorRef = doc(db, 'doctors', uid);
  const doctorSnap = await getDoc(doctorRef);

  if (doctorSnap.exists()) {
    return { id: doctorSnap.id, ...doctorSnap.data() };
  }

  const counterRef = doc(db, 'counters', 'doctors');
  const counterSnap = await getDoc(counterRef);

  let nextId = 1;
  if (counterSnap.exists()) {
    nextId = (counterSnap.data().current || 0) + 1;
  }

  const doctorData = {
    uid,
    email,
    doctorId: nextId,
    createdAt: new Date().toISOString().split('T')[0],
  };

  await setDoc(doctorRef, doctorData);
  await setDoc(counterRef, { current: nextId }, { merge: true });

  return { id: uid, ...doctorData };
};

export const getDoctor = async (uid) => {
  const doctorRef = doc(db, 'doctors', uid);
  const doctorSnap = await getDoc(doctorRef);
  if (doctorSnap.exists()) {
    return { id: doctorSnap.id, ...doctorSnap.data() };
  }
  return null;
};
