import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function teacherSignup({ name, email, password, subject, school }) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role: "teacher",
      subject,
      school,
      createdAt: serverTimestamp(),
      quizCount: 0,
      studentCount: 0,
    });
    return user;
  }

  async function studentSignup({ name, email, password, grade, rollNumber }) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role: "student",
      grade,
      rollNumber,
      createdAt: serverTimestamp(),
      quizzesAttempted: 0,
      averageScore: 0,
    });
    return user;
  }

  async function login(email, password) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  }

  async function logout() {
    await signOut(auth);
    setUserRole(null);
    setUserProfile(null);
  }

  async function fetchUserProfile(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setUserProfile(data);
      setUserRole(data.role);
      return data;
    }
    return null;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userProfile,
    loading,
    teacherSignup,
    studentSignup,
    login,
    logout,
    fetchUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}