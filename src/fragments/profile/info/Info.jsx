import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/FirebaseConfig";
import { updateEmail } from "firebase/auth";

const Info = () => {
  const { user, userData } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    firstName: "",
    lastName: "",
    nomorHP: "",
    alamat: [], // array of objects
    email: "",
  });

  const [alamatBaru, setAlamatBaru] = useState("");

  // isi otomatis data lama + perbaikan format alamat (string → object)
  useEffect(() => {
    if (userData || user) {
      let alamat = userData?.alamat || [];

      // jika alamat lama masih string → convert
      if (alamat.length > 0 && typeof alamat[0] === "string") {
        alamat = alamat.map((a, idx) => ({
          id: `old-${idx}`,
          text: a,
          utama: idx === 0, // alamat pertama dianggap utama
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

  // update otomatis nama lengkap
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

  // tambah alamat baru
  const tambahAlamat = () => {
    if (!alamatBaru.trim()) return;

    const newAlamat = {
      id: Date.now().toString(),
      text: alamatBaru.trim(),
      utama: formData.alamat.length === 0,
    };

    setFormData((prev) => ({
      ...prev,
      alamat: [...prev.alamat, newAlamat],
    }));

    setAlamatBaru("");
  };

  // set alamat utama
  const setUtama = (id) => {
    setFormData((prev) => ({
      ...prev,
      alamat: prev.alamat.map((a) => ({
        ...a,
        utama: a.id === id,
      })),
    }));
  };

  // hapus alamat
  const hapusAlamat = (id) => {
    setFormData((prev) => ({
      ...prev,
      alamat: prev.alamat.filter((a) => a.id !== id),
    }));
  };

  // simpan data
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
        alamat: formData.alamat, // format sudah konsisten
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
      {/* MODE EDIT */}
      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FIRST NAME */}
          <div>
            <label className={labelClass}>Nama Depan</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          {/* LAST NAME */}
          <div>
            <label className={labelClass}>Nama Belakang</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          {/* NOMOR HP */}
          <div>
            <label className={labelClass}>Nomor HP</label>
            <input
              name="nomorHP"
              value={formData.nomorHP}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          {/* ALAMAT MULTI */}
          <div className="md:col-span-2">
            <label className={labelClass}>Alamat</label>

            {/* Tambah alamat */}
            <div className="flex gap-2 mb-3">
              <input
                value={alamatBaru}
                onChange={(e) => setAlamatBaru(e.target.value)}
                placeholder="Tambah alamat baru..."
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
              <button
                onClick={tambahAlamat}
                className="px-4 py-3 bg-purple-600 rounded-lg text-white"
              >
                Tambah
              </button>
            </div>

            {/* List alamat */}
            <div className="space-y-3">
              {formData.alamat.map((a, idx) => {
                const teks = typeof a === "string" ? a : a.text;

                return (
                  <div
                    key={a.id || idx}
                    className="flex items-center justify-between bg-white/10 border border-white/20 p-3 rounded-lg"
                  >
                    <div className="text-white">
                      {teks}
                      {a.utama && (
                        <span className="ml-2 text-xs text-green-400">
                          (Utama)
                        </span>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {!a.utama && (
                        <button
                          onClick={() => setUtama(a.id)}
                          className="text-blue-400 text-sm"
                        >
                          Jadikan Utama
                        </button>
                      )}
                      <button
                        onClick={() => hapusAlamat(a.id)}
                        className="text-red-400 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-4 md:col-span-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold"
            >
              {loading ? "Menyimpan..." : "Perbarui"}
            </button>

            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        /* MODE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FULL NAME */}
          <div>
            <label className={labelClass}>Nama Lengkap</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.nama || "-"}
            </div>
          </div>

          {/* FIRST NAME */}
          <div>
            <label className={labelClass}>Nama Depan</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.firstName || "-"}
            </div>
          </div>

          {/* LAST NAME */}
          <div>
            <label className={labelClass}>Nama Belakang</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.lastName || "-"}
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className={labelClass}>Email</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.email || user?.email}
            </div>
          </div>

          {/* NOMOR HP */}
          <div>
            <label className={labelClass}>Nomor HP</label>
            <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
              {userData?.nomorHP || "Belum diisi"}
            </div>
          </div>

          {/* LIST ALAMAT */}
          <div className="md:col-span-2">
            <label className={labelClass}>Daftar Alamat</label>

            <div className="space-y-3">
              {userData?.alamat?.length > 0 ? (
                userData.alamat.map((a, idx) => {
                  const teks = typeof a === "string" ? a : a.text;

                  return (
                    <div
                      key={a.id || idx}
                      className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    >
                      {teks}
                      {a.utama && (
                        <span className="ml-2 text-xs text-green-400">
                          (Utama)
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
                  Belum diisi
                </div>
              )}
            </div>
          </div>

          {/* TOMBOL EDIT */}
          <div className="md:col-span-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold"
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
