import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/FirebaseConfig';

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

const TokoOwner = () => {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    namaToko: "",
    deskripsi: "",
    nomorHP: "",
    email: "",
    alamat: null,
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

  // LOAD DATA TOKO
  useEffect(() => {
    const loadTokoData = async () => {
      if (!user?.uid) return;

      try {
        setLoadingData(true);
        const tokoDoc = await getDoc(doc(db, "toko", user.uid));
        
        if (tokoDoc.exists()) {
          const data = tokoDoc.data();
          setFormData({
            namaToko: data.namaToko || "",
            deskripsi: data.deskripsi || "",
            nomorHP: data.nomorHP || "",
            email: data.email || "",
            alamat: data.alamat || null,
          });
        }
      } catch (err) {
        console.error("Error loading toko data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadTokoData();
  }, [user]);

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

  // LOAD KECAMATAN
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
        if (data.data && Array.isArray(data.data)) {
          const uniqueDistricts = [...new Map(
            data.data.map(item => [item.district_name, {
              id: item.district_name,
              name: item.district_name
            }])
          ).values()];

          setKecamatan(uniqueDistricts);
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

  // LOAD DESA
  const loadDesa = (districtName) => {
    if (!districtName) return;

    console.log("📄 Loading desa for district:", districtName);
    setDesa([]);
    setSelectedDesa("");
    setKodePos("");
    setLoadingDesa(true);

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

    setDesa(formattedDesa);
    setLoadingDesa(false);
  };

  // UPDATE FORM
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // SET ALAMAT TOKO
  const setAlamatToko = () => {
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
      alamat: newAlamat,
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

  // HAPUS ALAMAT
  const hapusAlamat = () => {
    setFormData((prev) => ({
      ...prev,
      alamat: null,
    }));
  };

  // SIMPAN KE FIREBASE
  const handleSave = async () => {
    if (!formData.namaToko.trim()) {
      alert("Nama toko harus diisi!");
      return;
    }

    setLoading(true);

    try {
      await setDoc(doc(db, "toko", user.uid), {
        namaToko: formData.namaToko,
        deskripsi: formData.deskripsi,
        nomorHP: formData.nomorHP,
        email: formData.email,
        alamat: formData.alamat,
        ownerId: user.uid,
        terakhirEdit: new Date(),
        dibuatPada: new Date(),
      }, { merge: true });

      alert("Data toko berhasil disimpan!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving toko:", err);
      alert("Gagal menyimpan data toko: " + err.message);
    }

    setLoading(false);
  };

  // CANCEL
  const handleCancel = () => {
    setIsEditing(false);
    // Reload data
    window.location.reload();
  };

  const labelClass = "block text-zinc-400 text-sm mb-2";

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white text-lg">Memuat data toko...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Informasi Toko</h1>
        
        {isEditing ? (
          <div className="space-y-6">
            {/* NAMA TOKO */}
            <div>
              <label className={labelClass}>Nama Toko *</label>
              <input
                name="namaToko"
                value={formData.namaToko}
                onChange={handleChange}
                placeholder="Masukkan nama toko"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* DESKRIPSI */}
            <div>
              <label className={labelClass}>Deskripsi Toko</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Jelaskan tentang toko Anda..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* EMAIL */}
              <div>
                <label className={labelClass}>Email Toko</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="email@toko.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* NOMOR HP */}
              <div>
                <label className={labelClass}>Nomor HP Toko</label>
                <input
                  name="nomorHP"
                  value={formData.nomorHP}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* ALAMAT TOKO */}
            <div>
              <label className={labelClass}>Alamat Toko</label>

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

                {/* KODE POS */}
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
                    placeholder="Jalan, nomor bangunan, patokan..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* TOMBOL SET ALAMAT */}
                <button
                  type="button"
                  onClick={setAlamatToko}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white w-full transition-colors font-medium"
                >
                  {formData.alamat ? "Perbarui Alamat" : "Set Alamat"}
                </button>
              </div>

              {/* ALAMAT TERSIMPAN */}
              {formData.alamat && (
                <div className="mt-4">
                  <label className={labelClass}>Alamat Tersimpan</label>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">
                          {formData.alamat.detail}
                        </div>
                        <div className="text-zinc-400 text-sm">
                          {formData.alamat.desa}, {formData.alamat.kecamatan}, {formData.alamat.kota}, {formData.alamat.provinsi}
                        </div>
                        {formData.alamat.kodePos && (
                          <div className="text-green-400 text-xs mt-1">
                            Kode Pos: {formData.alamat.kodePos}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={hapusAlamat}
                        className="text-red-400 text-sm hover:text-red-300"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BUTTON */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Menyimpan..." : "Simpan Data Toko"}
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
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Nama Toko</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                {formData.namaToko || "-"}
              </div>
            </div>

            <div>
              <label className={labelClass}>Deskripsi</label>
              <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white min-h-[100px]">
                {formData.deskripsi || "-"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Email Toko</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                  {formData.email || "-"}
                </div>
              </div>

              <div>
                <label className={labelClass}>Nomor HP</label>
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                  {formData.nomorHP || "-"}
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Alamat Toko</label>
              {formData.alamat ? (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                  <div className="text-white font-medium mb-1">
                    {formData.alamat.detail}
                  </div>
                  <div className="text-zinc-400 text-sm">
                    {formData.alamat.desa}, {formData.alamat.kecamatan}, {formData.alamat.kota}, {formData.alamat.provinsi}
                  </div>
                  {formData.alamat.kodePos && (
                    <div className="text-green-400 text-xs mt-1">
                      Kode Pos: {formData.alamat.kodePos}
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-zinc-400">
                  Belum ada alamat tersimpan
                </div>
              )}
            </div>

            {/* BUTTON EDIT */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
            >
              Edit Informasi Toko
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokoOwner;