import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../FirebaseConfig"; // Sesuaikan dengan path config Firebase Anda

// Provider Google
const googleProvider = new GoogleAuthProvider();

/**
 * Register dengan Email & Password
 */
export const registerWithEmail = async (userData) => {
  try {
    const { firstName, lastName, email, password } = userData;

    // Validasi input
    if (!firstName || !lastName || !email || !password) {
      throw new Error("Semua field harus diisi");
    }

    // Buat user di Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Update display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`,
    });

    // Simpan data user ke Firestore
    await setDoc(doc(db, "users", user.uid), {
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
    });

    return {
      success: true,
      user: user,
      message: "Registrasi berhasil!",
    };
  } catch (error) {
    console.error("Error saat registrasi:", error);
    
    // Handle Firebase error messages
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
    // Sign in dengan Google
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Cek apakah user sudah ada di Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    // Jika user belum ada, buat dokumen baru
    if (!userDoc.exists()) {
      const namaParts = user.displayName?.split(" ") || ["", ""];
      const firstName = namaParts[0] || "";
      const lastName = namaParts.slice(1).join(" ") || "";

      await setDoc(doc(db, "users", user.uid), {
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
      });
    } else {
      // Update terakhir login jika user sudah ada
      await setDoc(
        doc(db, "users", user.uid),
        {
          terakhirLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }

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
    // Validasi input
    if (!email || !password) {
      throw new Error("Email dan password harus diisi");
    }

    // Import signInWithEmailAndPassword
    const { signInWithEmailAndPassword } = await import("firebase/auth");

    // Login ke Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Update terakhir login di Firestore
    await setDoc(
      doc(db, "users", user.uid),
      {
        terakhirLogin: serverTimestamp(),
      },
      { merge: true }
    );

    return {
      success: true,
      user: user,
      message: "Login berhasil!",
    };
  } catch (error) {
    console.error("Error saat login:", error);

    // Handle Firebase error messages
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
    // Sign in dengan Google
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Cek apakah user sudah ada di Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    // Jika user belum ada, buat dokumen baru (user baru yang login lewat Google di halaman login)
    if (!userDoc.exists()) {
      const namaParts = user.displayName?.split(" ") || ["", ""];
      const firstName = namaParts[0] || "";
      const lastName = namaParts.slice(1).join(" ") || "";

      await setDoc(doc(db, "users", user.uid), {
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
      });
    } else {
      // Update terakhir login jika user sudah ada
      await setDoc(
        doc(db, "users", user.uid),
        {
          terakhirLogin: serverTimestamp(),
        },
        { merge: true }
      );
    }

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

    // Cek apakah email terdaftar di Firestore
    const { collection, query, where, getDocs } = await import("firebase/firestore");
    
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    // Jika email tidak ditemukan di database
    if (querySnapshot.empty) {
      return {
        success: false,
        error: "Email tidak terdaftar dalam sistem kami",
      };
    }

    // Jika email ditemukan, kirim reset password email
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