import Stepper, { Step } from "../../components/alurPemesanan/Stepper";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AlurPemesananFrame = () => {
  const [ukuran, setUkuran] = useState("5cm");        // DEFAULT
  const [totalGantungan, setTotalGantungan] = useState(5);
  const [foto, setFoto] = useState(null);
  const [metode, setMetode] = useState("cod");        // DEFAULT
  const [isCompleted, setIsCompleted] = useState(false);
  const [showStepper, setShowStepper] = useState(true);

  const navigate = useNavigate();

  const pilihanUkuran = ["5cm", "6cm", "7cm", "8cm", "9cm", "10cm"];
  const pilihanMetode = [
    { value: "transfer", label: "Transfer Bank" },
    { value: "ewallet", label: "E-Wallet" },
    { value: "cod", label: "COD (Bayar di tempat)" },
  ];

  const hitungTotalHarga = () => totalGantungan * 15000;

  const formatRupiah = (angka) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);

  const handleFotoChange = (e) => {
    if (e.target.files?.[0]) setFoto(e.target.files[0]);
    else setFoto(null);
  };

  const ulangiPembelian = () => {
    setUkuran("5cm");           // RESET DEFAULT
    setMetode("cod");           // RESET DEFAULT
    setFoto(null);
    setTotalGantungan(5);
    setIsCompleted(false);
    setShowStepper(true);
  };

  return (
    <div className="xl:px-52 lg:px-20 md:px-12 px-6 py-12 min-h-screen lg:py-20">
      <h1 className="tracking-tighter text-5xl font-extrabold mb-10 text-center">
        Cara Pemesanan
      </h1>

      {/* ======================================= */}
      {/*  TOMBOL BELI + ULANGI SETELAH COMPLETE */}
      {/* ======================================= */}
      {isCompleted && (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/toko")}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/30 hover:bg-white/20 hover:border-white/40 transition duration-300 font-semibold"
            >
              Beli Sekarang
            </button>

            <button
              onClick={ulangiPembelian}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/30 hover:bg-white/20 hover:border-white/40 transition duration-300 font-semibold"
            >
              Ulangi Cara Pembelian
            </button>
          </div>
        </div>
      )}

      {/* ============================== */}
      {/*   Hanya tampil sebelum selesai  */}
      {/* ============================== */}
      {showStepper && !isCompleted && (
        <Stepper
          initialStep={1}
          onStepChange={(s) => console.log(s)}
          onFinalStepCompleted={() => {
            setIsCompleted(true);
            setShowStepper(false);
          }}
          backButtonText="Kembali"
          nextButtonText="Lanjut"
          completeButtonText="Selesai"
        >
          {/* STEP 1 */}
          <Step>
            <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-5">1. Pilih Ukuran</h2>
              <p className="mb-6 text-zinc-400">
                Tersedia ukuran 5cm hingga 10cm
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {pilihanUkuran.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition duration-150 ${
                      ukuran === opt
                        ? "bg-white/20 border-white/40"
                        : "bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ukuran-kunci"
                      value={opt}
                      checked={ukuran === opt}
                      onChange={() => setUkuran(opt)}
                      className="hidden"
                    />
                    <span className="font-medium text-lg">{opt}</span>
                  </label>
                ))}
              </div>

              {ukuran && (
                <p className="mt-4 text-sm text-zinc-300">
                  Pilihan Anda: {ukuran}
                </p>
              )}
            </div>
          </Step>

          {/* STEP 2 */}
          <Step>
            <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-5">
                2. Tentukan Jumlah Pesanan
              </h2>
              <p className="mb-6 text-zinc-400">
                Minimal pemesanan adalah 5 gantungan
              </p>

              <label className="block text-sm font-medium mb-2 text-zinc-300">
                Total Gantungan (Minimal 5)
              </label>

              <input
                type="number"
                min={5}
                value={totalGantungan}
                onChange={(e) =>
                  setTotalGantungan(
                    Math.max(5, parseInt(e.target.value) || 5)
                  )
                }
                className="p-3 rounded-lg bg-white/10 border border-white/30 w-full focus:ring-1 focus:ring-white focus:border-white transition duration-200"
              />

              {totalGantungan >= 5 && (
                <div className="mt-6 p-4 bg-white/10 rounded-lg text-sm border border-white/20">
                  <p className="font-semibold">Rincian Perkiraan Harga:</p>
                  <div className="flex justify-between mt-2">
                    <span>Jumlah Barang:</span>
                    <span className="font-medium">{totalGantungan} Pcs</span>
                  </div>
                  <hr className="my-2 border-white/10" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL ESTIMASI:</span>
                    <span className="font-bold text-xl">
                      {formatRupiah(hitungTotalHarga())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Step>

          {/* STEP 3 */}
          <Step>
            <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-5">3. Upload Foto</h2>
              <p className="mb-6 text-zinc-400">
                Unggah foto anda yang akan kami jadikan desain yang unik dan di terapkan pada produk.
              </p>

              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-white/10 hover:file:bg-white/20 transition duration-300 cursor-pointer"
              />

              {foto && (
                <div className="mt-6">
                  <p className="font-semibold mb-2 text-zinc-300">
                    Pratinjau Foto:
                  </p>
                  <img
                    src={URL.createObjectURL(foto)}
                    alt="Preview Desain"
                    className="mt-2 max-h-64 w-full h-auto object-contain rounded-lg"
                    key={foto.name}
                  />
                  <p className="mt-4 text-xs text-zinc-500">
                    Nama File: {foto.name}
                  </p>
                </div>
              )}
            </div>
          </Step>

          {/* STEP 4 */}
          <Step>
            <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-5">
                4. Pilih Metode Pembayaran
              </h2>
              <p className="mb-6 text-zinc-400">
                Pilih opsi pembayaran yang Anda inginkan.
              </p>

              <div className="space-y-4">
                {pilihanMetode.map((met) => (
                  <label
                    key={met.value}
                    className={`block p-4 rounded-lg border cursor-pointer transition duration-150 ${
                      metode === met.value
                        ? "bg-white/20 border-white/40"
                        : "bg-white/10 border-white/10 hover:bg-white/20 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metode-pembayaran"
                      value={met.value}
                      checked={metode === met.value}
                      onChange={() => setMetode(met.value)}
                      className="hidden"
                    />
                    <span className="block font-medium text-base">
                      {met.label}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {met.value === "transfer" &&
                        "Pembayaran via transfer bank."}
                      {met.value === "ewallet" &&
                        "Pembayaran via e-wallet / QRIS."}
                      {met.value === "cod" &&
                        "Bayar saat barang diterima."}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </Step>

          {/* STEP 5 */}
          <Step>
            <div className="bg-white/5 p-6 sm:p-8 rounded-xl border border-white/10">
              <h2 className="text-2xl font-bold mb-5">
                5. Konfirmasi & Checkout
              </h2>
              <p className="mb-6 text-zinc-400">
                Pastikan data sudah benar.
              </p>

              <div className="p-4 bg-white/10 rounded-lg mb-6 border border-white/20">
                <h3 className="text-xl font-semibold mb-3">
                  Ringkasan Pesanan
                </h3>

                <div className="space-y-3 text-base border-t border-white/10 pt-3">
                  <p className="flex justify-between">
                    <strong className="text-zinc-400">Ukuran Kunci:</strong>
                    <span className="font-semibold">
                      {ukuran}
                    </span>
                  </p>

                  <p className="flex justify-between">
                    <strong className="text-zinc-400">Total Gantungan:</strong>
                    <span className="font-semibold">
                      {totalGantungan} Pcs
                    </span>
                  </p>

                  <p className="flex justify-between">
                    <strong className="text-zinc-400">Status Foto:</strong>
                    <span className="font-semibold">
                      {foto ? "Sudah Diunggah" : "Belum Diunggah"}
                    </span>
                  </p>

                  <p className="flex justify-between">
                    <strong className="text-zinc-400">Metode Bayar:</strong>
                    <span className="font-semibold">
                      {pilihanMetode.find((m) => m.value === metode)?.label}
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white/10 rounded-lg font-bold text-lg flex justify-between border border-white/20">
                <span>TOTAL:</span>
                <span>{formatRupiah(hitungTotalHarga())}</span>
              </div>
            </div>
          </Step>
        </Stepper>
      )}
    </div>
  );
};

export default AlurPemesananFrame;
