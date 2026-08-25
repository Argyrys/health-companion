import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';

export const loginDoctor = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const registerDoctor = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
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
