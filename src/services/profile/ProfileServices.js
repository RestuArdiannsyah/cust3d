import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { saveUserToCache } from "../auth/AuthServices";

/**
 * Fungsi untuk mengkompress dan convert gambar ke Base64
 * @param {File} file - File gambar yang akan dikompress
 * @param {number} maxWidth - Lebar maksimal gambar (default: 800px)
 * @param {number} maxHeight - Tinggi maksimal gambar (default: 800px)
 * @param {number} quality - Kualitas kompresi 0-1 (default: 0.8)
 * @returns {Promise<string>} Base64 string dari gambar yang sudah dikompress
 */
const compressImageToBase64 = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Buat canvas untuk resize dan kompress
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Hitung dimensi baru dengan mempertahankan aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Set ukuran canvas
        canvas.width = width;
        canvas.height = height;
        
        // Draw image ke canvas dengan ukuran baru
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert ke base64 dengan kompresi
        const base64 = canvas.toDataURL('image/jpeg', quality);
        
        // Cek ukuran hasil kompresi
        const sizeInBytes = Math.round((base64.length * 3) / 4);
        const sizeInKB = Math.round(sizeInBytes / 1024);
        
        console.log(`Gambar berhasil dikompress: ${sizeInKB} KB`);
        
        resolve(base64);
      };
      
      img.onerror = () => {
        reject(new Error('Gagal memuat gambar'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Fungsi untuk upload foto profil
 * Gambar akan dikompress dan disimpan sebagai Base64 di Firestore
 * @param {string} uid - User ID
 * @param {File} file - File gambar yang akan diupload
 * @returns {Promise<object>} Result object
 */
export const uploadProfileImage = async (uid, file) => {
  try {
    // Validasi ukuran file (maksimal 10MB untuk file asli)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Ukuran file terlalu besar (maksimal 10MB)',
      };
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP',
      };
    }

    console.log(`Mengkompress gambar: ${file.name} (${Math.round(file.size / 1024)} KB)`);

    // Kompress dan convert ke Base64
    const base64Image = await compressImageToBase64(file);

    // Update Firestore dengan Base64 image
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      photoURL: base64Image,
      terakhirEdit: serverTimestamp(),
    });

    // Update cache
    const cacheData = {
      uid: uid,
      photoURL: base64Image,
    };
    await saveUserToCache(cacheData);

    console.log('Foto profil berhasil diupload dan disimpan');

    return {
      success: true,
      photoURL: base64Image,
      message: 'Foto profil berhasil diperbarui',
    };
  } catch (error) {
    console.error('Error saat upload foto profil:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat upload foto profil',
    };
  }
};

/**
 * Fungsi untuk update profil user
 * @param {string} uid - User ID
 * @param {object} updateData - Data yang akan diupdate
 * @returns {Promise<object>} Result object
 */
export const updateUserProfile = async (uid, updateData) => {
  try {
    if (!uid) {
      throw new Error('User ID tidak valid');
    }

    // Validasi data
    if (updateData.firstName && updateData.firstName.trim() === '') {
      return {
        success: false,
        error: 'Nama depan tidak boleh kosong',
      };
    }

    if (updateData.lastName && updateData.lastName.trim() === '') {
      return {
        success: false,
        error: 'Nama belakang tidak boleh kosong',
      };
    }

    // Validasi nomor HP (opsional, hanya jika diisi)
    if (updateData.nomorHP && updateData.nomorHP !== '') {
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(updateData.nomorHP.replace(/[\s-]/g, ''))) {
        return {
          success: false,
          error: 'Format nomor HP tidak valid',
        };
      }
    }

    // Tambahkan timestamp
    const dataToUpdate = {
      ...updateData,
      terakhirEdit: serverTimestamp(),
    };

    // Update Firestore
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, dataToUpdate);

    // Update cache (data yang relevan saja)
    const cacheData = {
      uid: uid,
      nama: updateData.nama,
    };
    await saveUserToCache(cacheData);

    console.log('Profil berhasil diupdate');

    return {
      success: true,
      message: 'Profil berhasil diperbarui',
    };
  } catch (error) {
    console.error('Error saat update profil:', error);

    let errorMessage = 'Terjadi kesalahan saat update profil';

    switch (error.code) {
      case 'permission-denied':
        errorMessage = 'Anda tidak memiliki izin untuk mengubah data ini';
        break;
      case 'not-found':
        errorMessage = 'Data user tidak ditemukan';
        break;
      case 'unavailable':
        errorMessage = 'Layanan tidak tersedia. Coba lagi nanti';
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
 * Fungsi untuk update password (jika diperlukan di masa depan)
 * @param {string} currentPassword - Password saat ini
 * @param {string} newPassword - Password baru
 * @returns {Promise<object>} Result object
 */
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const { 
      EmailAuthProvider, 
      reauthenticateWithCredential, 
      updatePassword: firebaseUpdatePassword 
    } = await import('firebase/auth');
    const { auth } = await import('../FirebaseConfig');

    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error('User tidak ditemukan');
    }

    // Validasi password baru
    if (newPassword.length < 6) {
      return {
        success: false,
        error: 'Password baru minimal 6 karakter',
      };
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await firebaseUpdatePassword(user, newPassword);

    return {
      success: true,
      message: 'Password berhasil diperbarui',
    };
  } catch (error) {
    console.error('Error saat update password:', error);

    let errorMessage = 'Terjadi kesalahan saat update password';

    switch (error.code) {
      case 'auth/wrong-password':
        errorMessage = 'Password saat ini salah';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password baru terlalu lemah';
        break;
      case 'auth/requires-recent-login':
        errorMessage = 'Silakan login ulang untuk mengubah password';
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
 * Fungsi untuk delete foto profil
 * @param {string} uid - User ID
 * @returns {Promise<object>} Result object
 */
export const deleteProfileImage = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      photoURL: null,
      terakhirEdit: serverTimestamp(),
    });

    // Update cache
    const cacheData = {
      uid: uid,
      photoURL: null,
    };
    await saveUserToCache(cacheData);

    return {
      success: true,
      message: 'Foto profil berhasil dihapus',
    };
  } catch (error) {
    console.error('Error saat hapus foto profil:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan saat hapus foto profil',
    };
  }
};