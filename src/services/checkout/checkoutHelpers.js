// checkoutHelpers.js

// Format harga ke Rupiah
export const formatHarga = (harga) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(harga || 0);
};

// Format ukuran file
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Fungsi untuk convert file ke base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Hitung distribusi produk per gambar
export const calculateProductDistribution = (quantity, uploadedImages) => {
  if (uploadedImages.length === 0) return [];
  
  const distribution = [];
  const totalProducts = quantity;
  const totalImages = uploadedImages.length;
  
  // Jika jumlah gambar lebih banyak dari produk
  if (totalImages > totalProducts) {
    // Setiap gambar dapat berisi 0-1 produk
    for (let i = 0; i < totalImages; i++) {
      if (i < totalProducts) {
        distribution.push({
          imageIndex: i,
          start: i + 1,
          end: i + 1,
          count: 1
        });
      } else {
        distribution.push({
          imageIndex: i,
          start: 0,
          end: 0,
          count: 0
        });
      }
    }
  } else {
    // Normal case: distribusi produk ke gambar
    const baseProductsPerImage = Math.floor(totalProducts / totalImages);
    const remainder = totalProducts % totalImages;
    
    let currentProduct = 1;
    
    for (let i = 0; i < totalImages; i++) {
      // Hitung berapa produk untuk gambar ini
      let productsForThisImage = baseProductsPerImage;
      if (i < remainder) {
        productsForThisImage += 1;
      }
      
      const endProduct = currentProduct + productsForThisImage - 1;
      
      distribution.push({
        imageIndex: i,
        start: currentProduct,
        end: endProduct,
        count: productsForThisImage
      });
      
      currentProduct = endProduct + 1;
    }
  }
  
  return distribution;
};

// Hitung subtotal berdasarkan harga satuan (ukuran yang dipilih) dan quantity
export const calculateSubtotal = (hargaSatuan, quantity) => {
  return hargaSatuan * quantity;
};

// Hitung biaya pengiriman
export const calculateShipping = (subtotal, shippingMethod) => {
  switch (shippingMethod) {
    case "reguler":
      return subtotal > 500000 ? 0 : 15000;
    case "express":
      return 25000;
    case "sameDay":
      return 50000;
    default:
      return 0;
  }
};

// Hitung total
export const calculateTotal = (subtotal, shippingCost) => {
  return subtotal + shippingCost;
};

// Cek apakah jumlah gambar sudah mencapai batas (sama dengan quantity)
export const isImageLimitReached = (quantity, uploadedImages) => {
  return uploadedImages.length >= quantity;
};

// Fungsi untuk mendapatkan pesan upload error dengan kondisi baru
export const getUploadError = (quantity, uploadedImages) => {
  if (uploadedImages.length === 0) {
    return `Anda perlu mengupload minimal 1 gambar`;
  }
  
  if (isImageLimitReached(quantity, uploadedImages)) {
    return `Jumlah gambar sudah mencapai batas maksimal (${quantity} gambar). Setiap produk akan memiliki gambar unik.`;
  }
  
  return "";
};

// Data shipping methods
export const shippingMethods = [
  {
    id: "reguler",
    name: "Reguler (1-3 hari)",
  },
  {
    id: "express",
    name: "Express (1 hari)",
  },
  {
    id: "sameDay",
    name: "Same Day Delivery",
  },
];

// Load data dari localStorage
export const loadLocalStorageData = (id) => {
  try {
    const savedData = localStorage.getItem(`checkout_${id}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  } catch (error) {
    console.error('Error loading localStorage data:', error);
    return null;
  }
};

// Save data ke localStorage
export const saveLocalStorageData = (id, data) => {
  try {
    localStorage.setItem(`checkout_${id}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Clear data dari localStorage
export const clearLocalStorageData = (id) => {
  try {
    localStorage.removeItem(`checkout_${id}`);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage data:', error);
    return false;
  }
};

// Validasi file upload dengan batas quantity
export const validateUploadedFiles = (files, uploadedImages, quantity) => {
  const errors = [];
  
  // Validasi batas jumlah gambar
  if (uploadedImages.length + files.length > quantity) {
    const remainingSlots = quantity - uploadedImages.length;
    errors.push(`Maksimal upload ${quantity} gambar. Sisa slot: ${remainingSlots}`);
  }
  
  // Validasi ukuran file (maks 5MB)
  const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    errors.push("Beberapa file melebihi ukuran maksimal 5MB");
  }
  
  // Validasi tipe file
  const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
  if (invalidFiles.length > 0) {
    errors.push("Beberapa file bukan gambar yang valid (format: JPG, PNG, GIF)");
  }
  
  // Validasi jumlah file
  if (files.length === 0) {
    errors.push("Tidak ada file yang dipilih");
  }
  
  return errors;
};

// Process uploaded images dengan error handling
export const processUploadedImages = async (files) => {
  const newImages = [];
  
  try {
    for (const file of files) {
      const base64 = await fileToBase64(file);
      const imageData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        base64: base64,
        preview: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
      };
      
      newImages.push(imageData);
    }
    
    return newImages;
  } catch (error) {
    console.error("Error processing uploaded images:", error);
    throw new Error("Gagal memproses gambar: " + error.message);
  }
};

// Fungsi helper untuk mendapatkan extension file
export const getFileExtension = (fileName) => {
  return fileName.slice((fileName.lastIndexOf(".") - 1 >>> 0) + 2);
};

// Fungsi untuk membersihkan URL object untuk mencegah memory leak
export const cleanupImageURLs = (images) => {
  images.forEach(img => {
    if (img.preview && img.preview.startsWith('blob:')) {
      URL.revokeObjectURL(img.preview);
    }
  });
};

// Fungsi untuk validasi quantity
export const validateQuantity = (quantity, minQuantity = 5) => {
  const errors = [];
  
  if (quantity < minQuantity) {
    errors.push(`Jumlah minimal adalah ${minQuantity} produk`);
  }
  
  if (!Number.isInteger(quantity)) {
    errors.push("Jumlah harus berupa angka bulat");
  }
  
  return errors;
};

// Fungsi untuk menghapus gambar berlebih berdasarkan quantity baru
export const removeExcessImages = (uploadedImages, newQuantity) => {
  if (uploadedImages.length <= newQuantity) {
    return uploadedImages; // Tidak ada gambar berlebih
  }
  
  // Hapus gambar yang terakhir ditambahkan (dari index tertinggi)
  const imagesToKeep = uploadedImages.slice(0, newQuantity);
  
  // Cleanup URL object untuk gambar yang dihapus
  const imagesToRemove = uploadedImages.slice(newQuantity);
  cleanupImageURLs(imagesToRemove);
  
  return imagesToKeep;
};



// Untuk backward compatibility, tetap pertahankan fungsi yang menerima produk
export const calculateSubtotalFromProduk = (produk, quantity) => {
  return (produk?.harga || 0) * quantity;
};