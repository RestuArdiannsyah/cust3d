// checkoutHelpers.js

export const formatHarga = (harga) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(harga || 0);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const calculateProductDistribution = (quantity, uploadedImages) => {
  if (uploadedImages.length === 0) return [];
  
  const distribution = [];
  const totalProducts = quantity;
  const totalImages = uploadedImages.length;
  
  if (totalImages > totalProducts) {
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
    const baseProductsPerImage = Math.floor(totalProducts / totalImages);
    const remainder = totalProducts % totalImages;
    
    let currentProduct = 1;
    
    for (let i = 0; i < totalImages; i++) {
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

export const calculateSubtotal = (hargaSatuan, quantity) => {
  return hargaSatuan * quantity;
};

const RAJAONGKIR_API_KEY = import.meta.env.VITE_API_KEY_RAJA_ONGKIR;
const RAJAONGKIR_API_URL = "/api/rajaongkir/api/v1/calculate/domestic-cost";

export const calculateShippingRajaOngkir = async (originId, destinationId, weight, courier) => {
  try {
    if (!RAJAONGKIR_API_KEY) {
      return {
        success: false,
        error: "API key tidak ditemukan"
      };
    }

    const form = new URLSearchParams();
    form.append("origin", originId);
    form.append("destination", destinationId);
    form.append("weight", weight.toString());
    form.append("courier", courier);
    form.append("price", "lowest");

    const response = await fetch(RAJAONGKIR_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const validServices = data.data.filter(item => 
        item.cost !== undefined && item.cost !== null
      );
      
      if (validServices.length === 0) {
        return {
          success: false,
          error: "Tidak ada data ongkir tersedia"
        };
      }
      
      const cheapest = validServices.reduce((a, b) => 
        a.cost < b.cost ? a : b
      );
      
      return {
        success: true,
        cost: cheapest.cost,
        etd: cheapest.etd || "1-3",
        service: cheapest.service || cheapest.description || courier,
        courier: courier
      };
    }
    
    return {
      success: false,
      error: "Format respons tidak dikenali"
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getAllShippingCosts = async (originId, destinationId, weight) => {
  const couriers = ["jne", "jnt", "sicepat", "ninja"];
  const results = [];
  
  try {
    const promises = couriers.map(courier => 
      calculateShippingRajaOngkir(originId, destinationId, weight, courier)
    );
    
    const shippingResults = await Promise.allSettled(promises);
    
    shippingResults.forEach((result, index) => {
      const courier = couriers[index];
      
      if (result.status === "fulfilled") {
        if (result.value.success) {
          results.push({
            courier: courier,
            name: getCourierName(courier),
            cost: result.value.cost,
            etd: result.value.etd,
            service: result.value.service
          });
        }
      }
    });
    
    results.sort((a, b) => a.cost - b.cost);
    
    return results;
    
  } catch (error) {
    return [];
  }
};

export const getCourierName = (code) => {
  const couriers = {
    jne: "JNE",
    jnt: "J&T Express",
    sicepat: "SiCepat",
    ninja: "Ninja Express"
  };
  return couriers[code] || code;
};

export const calculateTotal = (subtotal, shippingCost) => {
  return subtotal + shippingCost;
};

export const isImageLimitReached = (quantity, uploadedImages) => {
  return uploadedImages.length >= quantity;
};

export const getUploadError = (quantity, uploadedImages) => {
  if (uploadedImages.length === 0) {
    return `Anda perlu mengupload minimal 1 gambar`;
  }
  
  if (isImageLimitReached(quantity, uploadedImages)) {
    return `Jumlah gambar sudah mencapai batas maksimal (${quantity} gambar). Setiap produk akan memiliki gambar unik.`;
  }
  
  return "";
};

export const loadLocalStorageData = (id) => {
  try {
    const savedData = localStorage.getItem(`checkout_${id}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const saveLocalStorageData = (id, data) => {
  try {
    localStorage.setItem(`checkout_${id}`, JSON.stringify(data));
    return true;
  } catch (error) {
    return false;
  }
};

export const clearLocalStorageData = (id) => {
  try {
    localStorage.removeItem(`checkout_${id}`);
    return true;
  } catch (error) {
    return false;
  }
};

export const validateUploadedFiles = (files, uploadedImages, quantity) => {
  const errors = [];
  
  if (uploadedImages.length + files.length > quantity) {
    const remainingSlots = quantity - uploadedImages.length;
    errors.push(`Maksimal upload ${quantity} gambar. Sisa slot: ${remainingSlots}`);
  }
  
  const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
  if (oversizedFiles.length > 0) {
    errors.push("Beberapa file melebihi ukuran maksimal 5MB");
  }
  
  const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
  if (invalidFiles.length > 0) {
    errors.push("Beberapa file bukan gambar yang valid (format: JPG, PNG, GIF)");
  }
  
  if (files.length === 0) {
    errors.push("Tidak ada file yang dipilih");
  }
  
  return errors;
};

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
    throw new Error("Gagal memproses gambar: " + error.message);
  }
};

export const cleanupImageURLs = (images) => {
  images.forEach(img => {
    if (img.preview && img.preview.startsWith('blob:')) {
      URL.revokeObjectURL(img.preview);
    }
  });
};

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

export const removeExcessImages = (uploadedImages, newQuantity) => {
  if (uploadedImages.length <= newQuantity) {
    return uploadedImages;
  }
  
  const imagesToKeep = uploadedImages.slice(0, newQuantity);
  
  const imagesToRemove = uploadedImages.slice(newQuantity);
  cleanupImageURLs(imagesToRemove);
  
  return imagesToKeep;
};