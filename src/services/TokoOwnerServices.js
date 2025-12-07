// services/firestore/TokoService.js
import { db } from "./FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export const getTokoData = async () => {
  try {
    // console.log("📡 Fetching toko data from Firestore...");
    
    // Ambil semua dokumen dari koleksi 'toko'
    const tokoRef = collection(db, "toko");
    const tokoSnap = await getDocs(tokoRef);
    
    if (!tokoSnap.empty) {
      // Ambil dokumen pertama (asumsi hanya ada 1 toko)
      const tokoDoc = tokoSnap.docs[0];
      const tokoData = tokoDoc.data();
      
      // console.log("✅ Toko data loaded successfully");
      
      return {
        success: true,
        data: tokoData
      };
    } else {
      // console.warn("⚠️ No toko documents found in Firestore");
      return {
        success: false,
        error: "Data toko tidak ditemukan"
      };
    }
  } catch (error) {
    // console.error("❌ Error fetching toko data from Firestore:", error);
    return {
      success: false,
      error: error.message
    };
  }
};