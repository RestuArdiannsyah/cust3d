import { useAuth } from "../../../hooks/useAuth";

const PerbaruiProfil = () => {
  const { user, userData } = useAuth();

  const textOrRed = (value) =>
    value && value !== "" ? "text-white" : "text-red-400";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* UID */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">UID</label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white break-all">
            {user?.uid || "-"}
          </div>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Nama Lengkap</label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
            {userData?.nama || "-"}
          </div>
        </div>

        {/* Nama Depan */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Nama Depan</label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
            {userData?.firstName || "-"}
          </div>
        </div>

        {/* Nama Belakang */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Nama Belakang</label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
            {userData?.lastName || "-"}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Email</label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white flex items-center gap-2">
            {userData?.email || user?.email}
            {user?.emailVerified ? (
              <span className="text-green-400 text-xs">✓ Verified</span>
            ) : (
              <span className="text-yellow-400 text-xs">⚠ Not Verified</span>
            )}
          </div>
        </div>

        {/* Nomor HP */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Nomor HP</label>
          <div
            className={`px-4 py-3 bg-white/5 border border-white/10 rounded-lg ${textOrRed(
              userData?.nomorHP
            )}`}
          >
            {userData?.nomorHP || "Belum diisi"}
          </div>
        </div>

        {/* Alamat */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Alamat</label>
          <div
            className={`px-4 py-3 bg-white/5 border border-white/10 rounded-lg ${textOrRed(
              userData?.alamat?.length > 0
            )}`}
          >
            {userData?.alamat?.length > 0
              ? userData.alamat.join(", ")
              : "Belum diisi"}
          </div>
        </div>

        {/* Tanggal Dibuat */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Bergabung Sejak</label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
            {userData?.tanggalDibuat?.toDate
              ? new Date(userData.tanggalDibuat.toDate()).toLocaleDateString(
                  "id-ID",
                  { day: "numeric", month: "long", year: "numeric" }
                )
              : "-"}
          </div>
        </div>

        {/* Terakhir Edit */}
        <div>
          <label className="block text-zinc-400 text-sm mb-2">Terakhir Diedit</label>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white">
            {userData?.terakhirEdit?.toDate
              ? new Date(userData.terakhirEdit.toDate()).toLocaleString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerbaruiProfil;
