import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/FirebaseConfig";
import { getUserData, getUserFromCache } from "../services/auth/AuthServices";

/**
 * Custom Hook untuk mengecek status autentikasi
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Coba ambil dari cache dulu untuk menghindari flash
    const loadCachedData = async () => {
      const cachedData = await getUserFromCache();
      if (cachedData) {
        setUserData(cachedData);
      }
    };

    loadCachedData();

    // Subscribe ke perubahan auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User sudah login
        setUser(firebaseUser);

        // Ambil data user dari Firestore
        const result = await getUserData(firebaseUser.uid);
        if (result.success) {
          setUserData(result.data);
        } else {
          // Jika gagal dari Firestore, gunakan data dari Firebase Auth
          // TAPI hanya untuk fallback minimal
          setUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            // JANGAN gunakan displayName dari Firebase Auth
            // karena bisa berbeda dengan data di Firestore
          });
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
    userData, // Data user dari Firestore (prioritas utama)
    loading, // Loading state
  };
};