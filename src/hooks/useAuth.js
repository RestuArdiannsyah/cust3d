import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/FirebaseConfig";
import { getUserData } from "../services/auth/AuthServices";

/**
 * Custom Hook untuk mengecek status autentikasi
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe ke perubahan auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User sudah login
        setUser(firebaseUser);

        // Ambil data user dari Firestore
        const result = await getUserData(firebaseUser.uid);
        if (result.success) {
          setUserData(result.data);
        }
      } else {
        // User belum login
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return {
    user, // Firebase Auth User
    userData, // Data user dari Firestore
    loading, // Loading state
  };
};