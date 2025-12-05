
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/FirebaseConfig";
import { updateEmail } from "firebase/auth";

// Komponen Dropdown Search dengan Infinite Scroll
const SearchableSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  disabled,
  displayKey = "name",
  valueKey = "id",
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(20);
  const dropdownRef = useRef(null);
  const scrollRef = useRef(null);
  const observerRef = useRef(null);

  const filteredOptions = searchTerm
    ? options.filter(option =>
        option[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const displayedOptions = searchTerm 
    ? filteredOptions
    : filteredOptions.slice(0, displayCount);

  const selectedOption = options.find(opt => opt[valueKey] === value);

  useEffect(() => {
    if (isOpen) {
      setDisplayCount(20);
    }
  }, [isOpen]);

  const lastOptionRef = useCallback((node) => {
    if (searchTerm) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayCount < filteredOptions.length) {
        setDisplayCount(prev => Math.min(prev + 20, filteredOptions.length));
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [searchTerm, displayCount, filteredOptions.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-left flex items-center justify-between transition-colors ${
          disabled 
            ? "opacity-50 cursor-not-allowed text-zinc-500" 
            : "hover:bg-white/15 text-white cursor-pointer"
        }`}
      >
        <span className={selectedOption ? "text-white" : "text-zinc-400"}>
          {selectedOption ? selectedOption[displayKey] : placeholder}
        </span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-zinc-800 border border-white/20 rounded-lg shadow-xl max-h-80 overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>
          
          <div ref={scrollRef} className="overflow-y-auto max-h-64">
            {displayedOptions.length > 0 ? (
              <>
                {displayedOptions.map((option, index) => (
                  <button
                    key={option[valueKey]}
                    ref={index === displayedOptions.length - 1 ? lastOptionRef : null}
                    type="button"
                    onClick={() => {
                      onChange(option[valueKey]);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-white/10 transition-colors ${
                      option[valueKey] === value 
                        ? "bg-purple-600/30 text-white" 
                        : "text-zinc-300"
                    }`}
                  >
                    {option[displayKey]}
                  </button>
                ))}
                {!searchTerm && displayCount < filteredOptions.length && (
                  <div className="px-4 py-2 text-center text-zinc-400 text-sm">
                    Scroll untuk muat lebih banyak... ({displayCount}/{filteredOptions.length})
                  </div>
                )}
              </>
            ) : (
              <div className="px-4 py-3 text-center text-zinc-400">
                {searchTerm ? "Tidak ditemukan" : "Tidak ada data"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Info = () => {
  const { user, userData } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    firstName: "",
    lastName: "",
    nomorHP: "",
    alamat: [],
    email: "",
  });

  // State untuk dropdown bertingkat
  const [provinsi, setProvinsi] = useState([]);
  const [kota, setKota] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [desa, setDesa] = useState([]);

  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKota, setSelectedKota] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("");
  const [selectedDesa, setSelectedDesa] = useState("");
  const [detailAlamat, setDetailAlamat] = useState("");

  // Kode pos otomatis
  const [kodePos, setKodePos] = useState("");

  // Loading states
  const [loadingProvinsi, setLoadingProvinsi] = useState(false);
  const [loadingKota, setLoadingKota] = useState(false);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  const [loadingDesa, setLoadingDesa] = useState(false);

  // LOAD USER DATA
  useEffect(() => {
    if (userData || user) {
      let alamat = userData?.alamat || [];

      if (alamat.length > 0 && typeof alamat[0] === "string") {
        alamat = alamat.map((a, idx) => ({
          id: `old-${idx}`,
          text: a,
          utama: idx === 0,
        }));
      }

      setFormData({
        nama: userData?.nama || "",
        firstName: userData?.firstName || "",
        lastName: userData?.lastName || "",
        nomorHP: userData?.nomorHP || "",
        alamat,
        email: userData?.email || user?.email || "",
      });
    }
  }, [userData, user]);

  // LOAD PROVINSI
  useEffect(() => {
    if (!isEditing) return;
    if (provinsi.length > 0) return;

    console.log("📄 Loading provinsi...");
    setLoadingProvinsi(true);
    
    fetch("/api/rajaongkir/api/v1/destination/province")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          const formattedProvinsi = data.data.map(p => ({
            id: String(p.province_id || p.id),
            name: p.province || p.name
          }));
          setProvinsi(formattedProvinsi);
        }
      })
      .catch((err) => {
        console.error("❌ Error loading provinsi:", err);
        alert("Gagal memuat data provinsi. Silakan coba lagi.");
      })
      .finally(() => {
        setLoadingProvinsi(false);
      });
  }, [isEditing, provinsi.length]);

  // LOAD KOTA
  const loadKota = (provID) => {
    if (!provID) return;
    
    console.log("📄 Loading kota for province:", provID);
    setKota([]);
    setKecamatan([]);
    setDesa([]);
    setSelectedKota("");
    setSelectedKecamatan("");
    setSelectedDesa("");
    setKodePos("");
    setLoadingKota(true);

    fetch(`/api/rajaongkir/api/v1/destination/city/${provID}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          const formattedKota = data.data.map(k => ({
            id: String(k.city_id || k.id),
            name: k.city_name ? `${k.type || ''} ${k.city_name}`.trim() : (k.name || 'Unknown'),
            city_name: k.city_name || k.name,
            type: k.type || ''
          }));
          setKota(formattedKota);
        }
      })
      .catch((err) => {
        console.error("❌ Error loading kota:", err);
        alert("Gagal memuat data kota. Silakan coba lagi.");
      })
      .finally(() => {
        setLoadingKota(false);
      });
  };

  // LOAD KECAMATAN (district) - Ambil unique districts dari API
  const loadKecamatan = (cityID) => {
    if (!cityID) return;

    const selectedCity = kota.find(k => k.id === cityID);
    const cityName = selectedCity?.city_name || selectedCity?.name;

    if (!cityName) {
      console.error("❌ City name not found for ID:", cityID);
      return;
    }

    console.log("📄 Loading kecamatan for:", cityName);
    setKecamatan([]);
    setDesa([]);
    setSelectedKecamatan("");
    setSelectedDesa("");
    setKodePos("");
    setLoadingKecamatan(true);

    fetch(`/api/rajaongkir/api/v1/destination/domestic-destination?search=${encodeURIComponent(cityName)}&limit=999`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("📦 Raw response:", data);

        if (data.data && Array.isArray(data.data)) {
          // Ekstrak unique districts (kecamatan)
          const uniqueDistricts = [...new Map(
            data.data.map(item => [item.district_name, {
              id: item.district_name, // Gunakan nama sebagai ID
              name: item.district_name
            }])
          ).values()];

          console.log("✅ Formatted kecamatan:", uniqueDistricts);
          setKecamatan(uniqueDistricts);

          // Simpan data lengkap untuk nanti load desa
          setKecamatan(prev => {
            prev.fullData = data.data; // Attach full data
            return uniqueDistricts;
          });
          
          // Store in a separate ref or state
          window.fullDesaData = data.data;
        }
      })
      .catch((err) => {
        console.error("❌ Error loading kecamatan:", err);
        alert("Gagal memuat data kecamatan. Silakan coba lagi.");
      })
      .finally(() => {
        setLoadingKecamatan(false);
      });
  };

  // LOAD DESA (subdistrict) berdasarkan kecamatan yang dipilih
  const loadDesa = (districtName) => {
    if (!districtName) return;

    console.log("📄 Loading desa for district:", districtName);
    setDesa([]);
    setSelectedDesa("");
    setKodePos("");
    setLoadingDesa(true);

    // Filter dari data yang sudah ada
    const fullData = window.fullDesaData || [];
    const filteredDesa = fullData.filter(item => item.district_name === districtName);

    const formattedDesa = filteredDesa.map(item => ({
      id: String(item.id),
      name: item.subdistrict_name,
      zip_code: item.zip_code,
      label: item.label,
      province_name: item.province_name,
      city_name: item.city_name,
      district_name: item.district_name,
      subdistrict_name: item.subdistrict_name
    }));

    console.log("✅ Formatted desa:", formattedDesa);
    setDesa(formattedDesa);
    setLoadingDesa(false);
  };

  // UPDATE FORM
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "firstName" || name === "lastName") {
        updated.nama = `${updated.firstName} ${updated.lastName}`.trim();
      }
      return updated;
    });
  };

  // TAMBAH ALAMAT BARU
  const tambahAlamat = () => {
    if (!selectedProvinsi || !selectedKota || !selectedKecamatan || !selectedDesa) {
      alert("Mohon lengkapi Provinsi, Kota/Kabupaten, Kecamatan, dan Desa");
      return;
    }

    const provObj = provinsi.find((p) => p.id === selectedProvinsi);
    const kotaObj = kota.find((k) => k.id === selectedKota);
    const kecObj = kecamatan.find((kc) => kc.id === selectedKecamatan);
    const desaObj = desa.find((d) => d.id === selectedDesa);

    if (!provObj || !kotaObj || !kecObj || !desaObj) {
      alert("Data alamat tidak valid");
      return;
    }

    const newAlamat = {
      id: Date.now().toString(),
      utama: formData.alamat.length === 0,

      provinsi: provObj.name,
      provinsi_id: provObj.id,

      kota: kotaObj.city_name || kotaObj.name,
      kota_id: kotaObj.id,

      kecamatan: kecObj.name,
      
      desa: desaObj.subdistrict_name || desaObj.name,
      desa_id: desaObj.id,

      kodePos: desaObj.zip_code || kodePos,

      detail: detailAlamat,
    };

    setFormData((prev) => ({
      ...prev,
      alamat: [...prev.alamat, newAlamat],
    }));

    // Reset form input
    setSelectedProvinsi("");
    setSelectedKota("");
    setSelectedKecamatan("");
    setSelectedDesa("");
    setDetailAlamat("");
    setKodePos("");
    setKota([]);
    setKecamatan([]);
    setDesa([]);
  };

  // SET UTAMA
  const setUtama = (id) => {
    setFormData((prev) => ({
      ...prev,
      alamat: prev.alamat.map((a) => ({
        ...a,
        utama: a.id === id,
      })),
    }));
  };

  // HAPUS ALAMAT
  const hapusAlamat = (id) => {
    setFormData((prev) => ({
      ...prev,
      alamat: prev.alamat.filter((a) => a.id !== id),
    }));
  };

  // SIMPAN KE FIREBASE
  const handleSave = async () => {
    setLoading(true);

    try {
      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
      }

      await updateDoc(doc(db, "users", user.uid), {
        nama: formData.nama,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nomorHP: formData.nomorHP,
        alamat: formData.alamat,
        email: formData.email,
        terakhirEdit: new Date(),
      });

      alert("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (err) {
      alert("Gagal memperbarui profil: " + err.message);
    }

    setLoading(false);
  };

  // CANCEL
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nama: userData?.nama || "",
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      nomorHP: userData?.nomorHP || "",
      alamat: userData?.alamat || [],
      email: userData?.email || user?.email || "",
    });
  };

  const labelClass = "block text-zinc-400 text-sm mb-2";

  return (
    <div className="space-y-6">
      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FIRST NAME */}
          <div>
            <label className={labelClass}>Nama Depan</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* LAST NAME */}
          <div>
            <label className={labelClass}>Nama Belakang</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className={labelClass}>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* NOMOR HP */}
          <div>
            <label className={labelClass}>Nomor HP</label>
            <input
              name="nomorHP"
              value={formData.nomorHP}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* ALAMAT LENGKAP */}
          <div className="md:col-span-2">
            <label className={labelClass}>Tambah Alamat Baru</label>

            <div className="space-y-3 border border-white/20 p-4 rounded-lg bg-white/5">
              {/* PROVINSI */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Provinsi {loadingProvinsi && <span className="text-purple-400">(Loading...)</span>}
                </label>
                <SearchableSelect
                  options={provinsi}
                  value={selectedProvinsi}
                  onChange={(val) => {
                    setSelectedProvinsi(val);
                    loadKota(val);
                  }}
                  placeholder={loadingProvinsi ? "Memuat provinsi..." : "Pilih Provinsi"}
                  displayKey="name"
                  valueKey="id"
                  disabled={loadingProvinsi}
                />
              </div>

              {/* KOTA */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Kota/Kabupaten {loadingKota && <span className="text-purple-400">(Loading...)</span>}
                </label>
                <SearchableSelect
                  options={kota}
                  value={selectedKota}
                  onChange={(val) => {
                    setSelectedKota(val);
                    loadKecamatan(val);
                  }}
                  placeholder={loadingKota ? "Memuat kota..." : "Pilih Kota/Kabupaten"}
                  disabled={!selectedProvinsi || loadingKota}
                  displayKey="name"
                  valueKey="id"
                />
              </div>

              {/* KECAMATAN */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Kecamatan {loadingKecamatan && <span className="text-purple-400">(Loading...)</span>}
                </label>
                <SearchableSelect
                  options={kecamatan}
                  value={selectedKecamatan}
                  onChange={(val) => {
                    setSelectedKecamatan(val);
                    loadDesa(val);
                  }}
                  placeholder={loadingKecamatan ? "Memuat kecamatan..." : "Pilih Kecamatan"}
                  disabled={!selectedKota || loadingKecamatan}
                  displayKey="name"
                  valueKey="id"
                />
              </div>

              {/* DESA / KELURAHAN */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">
                  Desa/Kelurahan {loadingDesa && <span className="text-purple-400">(Loading...)</span>}
                </label>
                <SearchableSelect
                  options={desa}
                  value={selectedDesa}
                  onChange={(val) => {
                    setSelectedDesa(val);
                    const desaObj = desa.find(d => d.id === val);
                    if (desaObj) {
                      setKodePos(desaObj.zip_code);
                    }
                  }}
                  placeholder={loadingDesa ? "Memuat desa..." : "Pilih Desa/Kelurahan"}
                  disabled={!selectedKecamatan || loadingDesa}
                  displayKey="name"
                  valueKey="id"
                />
              </div>

              {/* KODE POS (Auto-filled) */}
              {kodePos && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                  <div className="text-xs text-zinc-400 mb-1">Kode Pos</div>
                  <div className="text-lg font-semibold text-green-400">{kodePos}</div>
                </div>
              )}

              {/* DETAIL */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1">Detail Alamat</label>
                <textarea
                  value={detailAlamat}
                  onChange={(e) => setDetailAlamat(e.target.value)}
                  placeholder="Jalan, nomor rumah, RT/RW..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* TOMBOL TAMBAH */}
              <button
                type="button"
                onClick={tambahAlamat}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white w-full transition-colors font-medium"
              >
                + Tambah Alamat
              </button>
            </div>

            {/* LIST ALAMAT */}
            {formData.alamat.length > 0 && (
              <div className="space-y-3 mt-4">
                <label className={labelClass}>Daftar Alamat Tersimpan</label>
                {formData.alamat.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white/5 border border-white/10 p-4 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">
                          {a.detail && `${a.detail}`}
                        </div>
                        <div className="text-zinc-400 text-sm">
                          {a.desa && `${a.desa}, `}
                          {a.kecamatan}, {a.kota}, {a.provinsi}
                        </div>
                        {a.kodePos && (
                          <div className="text-green-400 text-xs mt-1">
                            Kode Pos: {a.kodePos}
                          </div>
                        )}
                        {a.utama && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                            Alamat Utama
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {!a.utama && (
                          <button
                            type="button"
                            onClick={() => setUtama(a.id)}
                            className="text-blue-400 text-sm hover:text-blue-300 whitespace-nowrap"
                          >
                            Jadikan Utama
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => hapusAlamat(a.id)}
                          className="text-red-400 text-sm hover:text-red-300"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BUTTON */}
          <div className="flex gap-4 mt-4 md:col-span-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Menyimpan..." : "Perbarui Profil"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        /* MODE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Nama Lengkap</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.nama || "-"}
            </div>
          </div>

          <div>
            <label className={labelClass}>Nama Depan</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.firstName || "-"}
            </div>
          </div>

          <div>
            <label className={labelClass}>Nama Belakang</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.lastName || "-"}
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.email || user?.email}
            </div>
          </div>

          <div>
            <label className={labelClass}>Nomor HP</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.nomorHP || "Belum diisi"}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Daftar Alamat</label>
            <div className="space-y-3">
              {userData?.alamat?.length > 0 ? (
                userData.alamat.map((a) => (
                  <div
                    key={a.id}
                    className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg"
                  >
                                        <div className="text-white font-medium mb-1">
                      {a.detail && `${a.detail}`}
                    </div>
                    <div className="text-zinc-400 text-sm">
                      {a.desa ? `${a.desa}, ` : ""}
                      {a.kecamatan}, {a.kota}, {a.provinsi}
                    </div>

                    {a.kodePos && (
                      <div className="text-green-400 text-xs mt-1">
                        Kode Pos: {a.kodePos}
                      </div>
                    )}

                    {a.utama && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                        Alamat Utama
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-zinc-400">
                  Belum ada alamat tersimpan
                </div>
              )}
            </div>
          </div>

          {/* BUTTON EDIT */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
            >
              Edit Profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Info;
