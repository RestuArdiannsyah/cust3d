import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";

// Provider Google
const googleProvider = new GoogleAuthProvider();

/**
 * Fungsi untuk menyimpan data user ke Cache Storage
 * EXPORTED agar bisa digunakan oleh ProfileServices
 */
export const saveUserToCache = async (userData) => {
  try {
    const cache = await caches.open('user-data-cache');
    
    // Ambil data cache yang ada
    const existingResponse = await cache.match('/user-data');
    let existingData = {};
    
    if (existingResponse) {
      existingData = await existingResponse.json();
    }
    
    // Merge data baru dengan data yang ada
    const mergedData = {
      ...existingData,
      ...userData
    };
    
    const userResponse = new Response(JSON.stringify(mergedData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/user-data', userResponse);
    console.log('Data user berhasil disimpan/diupdate ke cache');
  } catch (error) {
    console.error('Error menyimpan ke cache:', error);
  }
};

/**
 * Fungsi untuk mengambil data user dari Cache Storage
 */
export const getUserFromCache = async () => {
  try {
    const cache = await caches.open('user-data-cache');
    const response = await cache.match('/user-data');
    
    if (response) {
      const userData = await response.json();
      console.log('Data loaded from cache:', userData);
      return userData;
    }
    console.log('No cache found');
    return null;
  } catch (error) {
    console.error('Error mengambil dari cache:', error);
    return null;
  }
};

/**
 * Fungsi untuk menghapus data user dari Cache Storage
 */
export const clearUserCache = async () => {
  try {
    const cache = await caches.open('user-data-cache');
    await cache.delete('/user-data');
    console.log('Cache user berhasil dihapus');
  } catch (error) {
    console.error('Error menghapus cache:', error);
  }
};

/**
 * Register dengan Email & Password
 */
export const registerWithEmail = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    if (!firstName || !lastName || !email || !password) {
      throw new Error("Semua field harus diisi");
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    const userDocData = {
      uid: user.uid,
      nama: `${firstName} ${lastName}`,
      firstName: firstName,
      lastName: lastName,
      email: email,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL || null,
      nomorHP: "",
      alamat: [],
      role: "user",
      pesanan: [],
      tanggalDibuat: serverTimestamp(),
      terakhirEdit: serverTimestamp(),
      terakhirLogin: serverTimestamp(),
      provider: "email",
      status: "active",
    };

    await setDoc(doc(db, "users", user.uid), userDocData);

    // Simpan data user ke cache
    const cacheData = {
      uid: user.uid,
      nama: `${firstName} ${lastName}`,
      email: email,
      photoURL: user.photoURL || null,
      role: "user",
      provider: "email"
    };
    await saveUserToCache(cacheData);

    return {
      success: true,
      user: user,
      message: "Registrasi berhasil!",
    };
  } catch (error) {
    console.error("Error saat registrasi:", error);
    
    let errorMessage = "Terjadi kesalahan saat registrasi";
    
    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email sudah terdaftar";
        break;
      case "auth/invalid-email":
        errorMessage = "Format email tidak valid";
        break;
      case "auth/weak-password":
        errorMessage = "Password terlalu lemah (minimal 6 karakter)";
        break;
      case "auth/network-request-failed":
        errorMessage = "Gagal terhubung ke server";
        break;
      default:
        errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Register dengan Google
 */
export const registerWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      const namaParts = user.displayName?.split(" ") || ["", ""];
      const firstName = namaParts[0] || "";
      const lastName = namaParts.slice(1).join(" ") || "";

      const userDocData = {
        uid: user.uid,
        nama: user.displayName || "",
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || null,
        nomorHP: "",
        alamat: [],
        role: "user",
        pesanan: [],
        tanggalDibuat: serverTimestamp(),
        terakhirEdit: serverTimestamp(),
        terakhirLogin: serverTimestamp(),
        provider: "google",
        status: "active",
      };

      await setDoc(doc(db, "users", user.uid), userDocData);
    } else {
      await setDoc(
        doc(db, "users", user.uid),
        {
          terakhirLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }

    // Simpan data user ke cache
    const cacheData = {
      uid: user.uid,
      nama: user.displayName || "",
      email: user.email,
      photoURL: user.photoURL || null,
      role: userDoc.exists() ? userDoc.data().role : "user",
      provider: "google"
    };
    await saveUserToCache(cacheData);

    return {
      success: true,
      user: user,
      message: "Berhasil masuk dengan Google!",
    };
  } catch (error) {
    console.error("Error saat Google sign in:", error);

    let errorMessage = "Terjadi kesalahan saat masuk dengan Google";

    switch (error.code) {
      case "auth/popup-closed-by-user":
        errorMessage = "Popup ditutup sebelum selesai";
        break;
      case "auth/cancelled-popup-request":
        errorMessage = "Proses dibatalkan";
        break;
      case "auth/network-request-failed":
        errorMessage = "Gagal terhubung ke server";
        break;
      default:
        errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Login dengan Email & Password
 */
export const loginWithEmail = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error("Email dan password harus diisi");
    }

    const { signInWithEmailAndPassword } = await import("firebase/auth");

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await setDoc(
      doc(db, "users", user.uid),
      {
        terakhirLogin: serverTimestamp(),
      },
      { merge: true }
    );

    // Ambil data user dari Firestore
    const userDocSnap = await getDoc(doc(db, "users", user.uid));
    const userDocData = userDocSnap.exists() ? userDocSnap.data() : {};

    // Simpan data user ke cache
    const cacheData = {
      uid: user.uid,
      nama: userDocData.nama || user.displayName || "",
      email: user.email,
      photoURL: user.photoURL || userDocData.photoURL || null,
      role: userDocData.role || "user",
      provider: userDocData.provider || "email"
    };
    await saveUserToCache(cacheData);

    return {
      success: true,
      user: user,
      message: "Login berhasil!",
    };
  } catch (error) {
    console.error("Error saat login:", error);

    let errorMessage = "Terjadi kesalahan saat login";

    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Format email tidak valid";
        break;
      case "auth/user-disabled":
        errorMessage = "Akun telah dinonaktifkan";
        break;
      case "auth/user-not-found":
        errorMessage = "Email tidak terdaftar";
        break;
      case "auth/wrong-password":
        errorMessage = "Password salah";
        break;
      case "auth/invalid-credential":
        errorMessage = "Email atau password salah";
        break;
      case "auth/too-many-requests":
        errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti";
        break;
      case "auth/network-request-failed":
        errorMessage = "Gagal terhubung ke server";
        break;
      default:
        errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Login dengan Google (untuk halaman login)
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      const namaParts = user.displayName?.split(" ") || ["", ""];
      const firstName = namaParts[0] || "";
      const lastName = namaParts.slice(1).join(" ") || "";

      const userDocData = {
        uid: user.uid,
        nama: user.displayName || "",
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        photoURL: user.photoURL || null,
        nomorHP: "",
        alamat: [],
        role: "user",
        pesanan: [],
        tanggalDibuat: serverTimestamp(),
        terakhirEdit: serverTimestamp(),
        terakhirLogin: serverTimestamp(),
        provider: "google",
        status: "active",
      };

      await setDoc(doc(db, "users", user.uid), userDocData);
    } else {
      await setDoc(
        doc(db, "users", user.uid),
        {
          terakhirLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }

    // Ambil data user dari Firestore
    const userDocSnap = await getDoc(doc(db, "users", user.uid));
    const userDocData = userDocSnap.exists() ? userDocSnap.data() : {};

    // Simpan data user ke cache
    const cacheData = {
      uid: user.uid,
      nama: user.displayName || "",
      email: user.email,
      photoURL: user.photoURL || null,
      role: userDocData.role || "user",
      provider: "google"
    };
    await saveUserToCache(cacheData);

    return {
      success: true,
      user: user,
      message: "Login berhasil!",
    };
  } catch (error) {
    console.error("Error saat Google login:", error);

    let errorMessage = "Terjadi kesalahan saat masuk dengan Google";

    switch (error.code) {
      case "auth/popup-closed-by-user":
        errorMessage = "Popup ditutup sebelum selesai";
        break;
      case "auth/cancelled-popup-request":
        errorMessage = "Proses dibatalkan";
        break;
      case "auth/account-exists-with-different-credential":
        errorMessage = "Email sudah terdaftar dengan metode login lain";
        break;
      case "auth/network-request-failed":
        errorMessage = "Gagal terhubung ke server";
        break;
      default:
        errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    
    // Hapus cache saat logout
    await clearUserCache();
    
    return {
      success: true,
      message: "Logout berhasil",
    };
  } catch (error) {
    console.error("Error saat logout:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Reset Password dengan pengecekan email terlebih dahulu
 */
export const resetPassword = async (email) => {
  try {
    if (!email) {
      throw new Error("Email harus diisi");
    }

    const { collection, query, where, getDocs } = await import("firebase/firestore");
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return {
        success: false,
        error: "Email tidak terdaftar dalam sistem kami",
      };
    }

    const { sendPasswordResetEmail } = await import("firebase/auth");
    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: "Link reset password telah dikirim ke email Anda",
    };
  } catch (error) {
    console.error("Error saat reset password:", error);

    let errorMessage = "Terjadi kesalahan saat reset password";

    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Format email tidak valid";
        break;
      case "auth/user-not-found":
        errorMessage = "Email tidak terdaftar dalam sistem";
        break;
      case "auth/network-request-failed":
        errorMessage = "Gagal terhubung ke server";
        break;
      case "auth/too-many-requests":
        errorMessage = "Terlalu banyak percobaan. Silakan coba lagi nanti";
        break;
      default:
        errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Fungsi helper untuk mendapatkan data user dari Firestore
 */
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (userDoc.exists()) {
      return {
        success: true,
        data: userDoc.data(),
      };
    } else {
      return {
        success: false,
        error: "User tidak ditemukan",
      };
    }
  } catch (error) {
    console.error("Error mengambil data user:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};