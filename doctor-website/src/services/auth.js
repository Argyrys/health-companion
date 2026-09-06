import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export const loginDoctor = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
};

export const registerDoctor = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const getUserRole = async (uid) => {
  const docRef = doc(db, 'doctors', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().role || 'doctor';
  }
  return 'doctor';
};

export const createReceptionist = async (email, password, name, assignedDoctorIds) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, 'doctors', user.uid), {
    uid: user.uid,
    email,
    name,
    role: 'receptionist',
    assignedDoctors: assignedDoctorIds,
    createdAt: serverTimestamp(),
  });
  return user;
};

export const logoutDoctor = async () => {
  await signOut(auth);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};
