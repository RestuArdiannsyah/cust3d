import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../FirebaseConfig";

/**
 * Fungsi untuk mengambil data user dari Cache Storage
 */
const getUserFromCache = async () => {
  try {
    const cache = await caches.open('user-data-cache');
    const response = await cache.match('/user-data');
    
    if (response) {
      const userData = await response.json();
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error mengambil dari cache:', error);
    return null;
  }
};

/**
 * Fungsi untuk compress gambar dengan kompresi agresif untuk file besar
 * Target: setiap gambar < 400KB setelah kompresi
 */
const compressImage = (file, maxWidth = 1200, initialQuality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize gambar berdasarkan ukuran file asli
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (fileSizeMB > 10) {
          maxWidth = 800; // File sangat besar
        } else if (fileSizeMB > 5) {
          maxWidth = 1000; // File besar
        } else if (fileSizeMB > 2) {
          maxWidth = 1200; // File sedang
        }
        
        // Resize proporsional
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Fungsi rekursif untuk compress sampai ukuran di bawah 400KB
        const compressRecursive = (quality) => {
          canvas.toBlob(
            (blob) => {
              const sizeInKB = blob.size / 1024;
              
              console.log(`[${file.name}] Ukuran: ${sizeInKB.toFixed(0)}KB, Quality: ${quality.toFixed(2)}`);
              
              // Jika ukuran masih > 400KB dan quality masih bisa dikurangi
              if (sizeInKB > 400 && quality > 0.2) {
                compressRecursive(quality - 0.1);
              } else {
                // Sudah cukup kecil atau quality minimum tercapai
                const compressedReader = new FileReader();
                compressedReader.onloadend = () => {
                  const originalSizeKB = (file.size / 1024).toFixed(0);
                  console.log(`✓ [${file.name}] ${originalSizeKB}KB → ${sizeInKB.toFixed(0)}KB`);
                  resolve(compressedReader.result);
                };
                compressedReader.readAsDataURL(blob);
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        // Mulai kompresi dengan quality awal yang lebih rendah untuk file besar
        let startQuality = initialQuality;
        if (fileSizeMB > 5) {
          startQuality = 0.6;
        } else if (fileSizeMB > 2) {
          startQuality = 0.7;
        }
        
        compressRecursive(startQuality);
      };
      
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Fungsi untuk compress multiple gambar dengan callback progress
 */
const compressMultipleImages = async (files, onProgress) => {
  const compressedImages = [];
  
  console.log(`\n🔄 Memulai kompresi ${files.length} gambar...`);
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const originalSizeKB = (file.size / 1024).toFixed(0);
    
    console.log(`\n📸 Gambar ${i + 1}/${files.length}: ${file.name} (${originalSizeKB}KB)`);
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: files.length,
        fileName: file.name,
        originalSize: originalSizeKB
      });
    }
    
    const base64 = await compressImage(file);
    
    compressedImages.push({
      base64: base64,
      fileName: file.name,
      originalSize: file.size,
      order: i
    });
  }
  
  console.log(`\n✅ Kompresi selesai! ${files.length} gambar berhasil diproses.\n`);
  
  return compressedImages;
};

/**
 * Fungsi untuk menambah produk baru ke Firestore dengan multiple gambar
 * TIDAK ADA VALIDASI UKURAN FILE - Semua file akan dikompresi otomatis
 */
export const tambahProduk = async (productData, imageFiles, onProgress) => {
  try {
    // Validasi input
    if (!productData.namaProduk || !productData.harga || !productData.deskripsi) {
      throw new Error("Semua field harus diisi");
    }

    if (!imageFiles || imageFiles.length === 0) {
      throw new Error("Minimal 1 gambar produk harus diupload");
    }

    if (imageFiles.length > 5) {
      throw new Error("Maksimal 5 gambar produk");
    }

    // TIDAK ADA VALIDASI UKURAN FILE
    // Semua gambar akan dikompresi otomatis

    // Ambil data user dari cache
    const userData = await getUserFromCache();
    if (!userData) {
      throw new Error("User tidak ditemukan. Silakan login kembali");
    }

    // Compress dan convert semua gambar ke Base64
    console.log('🔧 Memproses dan mengompresi gambar...');
    const compressedImages = await compressMultipleImages(imageFiles, onProgress);
    
    // Siapkan data produk untuk disimpan
    const produkBaru = {
      namaProduk: productData.namaProduk,
      harga: Number(productData.harga),
      deskripsi: productData.deskripsi,
      gambar: compressedImages.map(img => img.base64), // Array Base64 strings
      gambarUtama: compressedImages[0].base64, // Gambar pertama sebagai utama
      namaFileGambar: compressedImages.map(img => img.fileName),
      jumlahGambar: compressedImages.length,
      tanggalDibuat: serverTimestamp(),
      dibuatOleh: {
        uid: userData.uid,
        nama: userData.nama,
        email: userData.email
      },
      status: "aktif"
    };

    // Simpan ke Firestore collection "produk"
    const docRef = await addDoc(collection(db, "produk"), produkBaru);

    console.log("✅ Produk berhasil ditambahkan dengan ID:", docRef.id);

    return {
      success: true,
      productId: docRef.id,
      message: "Produk berhasil ditambahkan!",
      data: {
        ...produkBaru,
        id: docRef.id
      }
    };

  } catch (error) {
    console.error("❌ Error menambah produk:", error);
    
    let errorMessage = "Terjadi kesalahan saat menambah produk";
    
    if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Fungsi untuk update produk dengan multiple gambar
 */
export const updateProduk = async (productId, productData, imageFiles = null, onProgress) => {
  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    
    const userData = await getUserFromCache();
    if (!userData) {
      throw new Error("User tidak ditemukan. Silakan login kembali");
    }

    const updateData = {
      ...productData,
      terakhirDiedit: serverTimestamp(),
      dieditOleh: {
        uid: userData.uid,
        nama: userData.nama,
        email: userData.email
      }
    };

    if (imageFiles && imageFiles.length > 0) {
      if (imageFiles.length > 5) {
        throw new Error("Maksimal 5 gambar produk");
      }

      // TIDAK ADA VALIDASI UKURAN FILE
      
      const compressedImages = await compressMultipleImages(imageFiles, onProgress);
      updateData.gambar = compressedImages.map(img => img.base64);
      updateData.gambarUtama = compressedImages[0].base64;
      updateData.namaFileGambar = compressedImages.map(img => img.fileName);
      updateData.jumlahGambar = compressedImages.length;
    }

    await updateDoc(doc(db, "produk", productId), updateData);

    return {
      success: true,
      message: "Produk berhasil diupdate!",
    };

  } catch (error) {
    console.error("Error update produk:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat update produk"
    };
  }
};

/**
 * Fungsi untuk hapus produk
 */
export const hapusProduk = async (productId) => {
  try {
    const { doc, deleteDoc } = await import("firebase/firestore");
    
    await deleteDoc(doc(db, "produk", productId));

    return {
      success: true,
      message: "Produk berhasil dihapus!",
    };

  } catch (error) {
    console.error("Error hapus produk:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat menghapus produk"
    };
  }
};

/**
 * Fungsi untuk mendapatkan semua produk
 */
export const getAllProduk = async () => {
  try {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    
    const q = query(collection(db, "produk"), orderBy("tanggalDibuat", "desc"));
    const querySnapshot = await getDocs(q);
    
    const produkList = [];
    querySnapshot.forEach((doc) => {
      produkList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      success: true,
      data: produkList
    };

  } catch (error) {
    console.error("Error mengambil produk:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Fungsi untuk mendapatkan produk berdasarkan ID
 */
export const getProdukById = async (productId) => {
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    
    const docRef = doc(db, "produk", productId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return {
        success: false,
        error: "Produk tidak ditemukan"
      };
    }

  } catch (error) {
    console.error("Error mengambil produk:", error);
    return {
      success: false,
      error: error.message
    };
  }
};