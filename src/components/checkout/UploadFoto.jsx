import React from "react";
import {
  Camera,
  ImageIcon,
  Trash2,
  Check,
  AlertCircle,
  Maximize2,
  Upload,
  X
} from "lucide-react";
import { formatFileSize } from "../../services/checkout/checkoutHelpers";

const UploadFoto = ({
  uploadedImages,
  uploading,
  imageLimitReached,
  uploadError,
  hoveredImageIndex,
  productDistribution,
  showUploadTips,
  fileInputRef,
  setShowUploadTips,
  setHoveredImageIndex,
  handleImageUpload,
  handleRemoveAllImages,
  handleImageClick,
  handleRemoveImage,
  quantity,
  formatFileSize
}) => {
  return (
    <div className="border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-2xl flex items-center gap-3">
            <Camera className="w-6 h-6 lg:block hidden" />
            Upload Foto Referensi
            <span className="text-red-400 text-sm font-normal -ml-2">*</span>
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Upload foto untuk dijadikan desain aksesoris
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadTips(!showUploadTips)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition cursor-pointer"
          >
            <span>Tips Upload</span>
          </button>

          {uploadedImages.length > 0 && (
            <button
              onClick={handleRemoveAllImages}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hapus Semua</span>
            </button>
          )}
        </div>
      </div>

      {uploadedImages.length > 0 && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold">
                  Distribusi Produk per Gambar
                </h4>
                <p className="text-sm text-white/60">
                  {quantity} produk akan didistribusikan ke{" "}
                  {uploadedImages.length} gambar
                </p>
              </div>
            </div>
            <div className="text-sm text-white/60">
              Total: {uploadedImages.length}/{quantity} gambar
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {uploadedImages.map((img, index) => {
              const dist = productDistribution.find(
                (d) => d.imageIndex === index
              );
              return (
                <div
                  key={img.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredImageIndex(index)}
                  onMouseLeave={() => setHoveredImageIndex(null)}
                >
                  <div className="relative rounded-lg overflow-hidden bg-white/5 aspect-square">
                    <img
                      src={img.base64 || img.preview}
                      alt={`Referensi ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <div
                      className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity ${
                        hoveredImageIndex === index
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <button
                        onClick={() => handleImageClick(index)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition cursor-pointer"
                        title="Lihat detail"
                      >
                        <Maximize2 className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(img.id);
                        }}
                        className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg backdrop-blur-sm transition cursor-pointer"
                        title="Hapus gambar"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-2">
                      <div className="text-center">
                        <div className="text-xs font-medium text-white">
                          {dist && dist.count > 0
                            ? `${dist.count} produk`
                            : "Tidak ada produk"}
                        </div>
                        {dist && dist.count > 0 && (
                          <div className="text-xs text-white/70">
                            Produk {dist.start}-{dist.end}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {imageLimitReached ? (
        <div className="mb-4 p-4 border border-green-500/20 bg-green-500/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-green-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-green-300">
                Upload Selesai!
              </h4>
              <p className="text-sm text-green-400/80">
                Jumlah gambar sudah mencapai batas maksimal ({quantity}{" "}
                gambar).
              </p>
            </div>
          </div>
        </div>
      ) : uploadError && uploadedImages.length === 0 ? (
        <div className="mb-4 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-yellow-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-300">
                Info Penting
              </h4>
              <p className="text-sm text-yellow-400/80">
                {uploadError}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!imageLimitReached && (
        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading || imageLimitReached}
          />

          <div
            onClick={() => {
              if (!uploading && !imageLimitReached) {
                fileInputRef.current.click();
              }
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${
                uploading || imageLimitReached
                  ? "border-white/10 bg-white/5 cursor-not-allowed"
                  : "border-white/20 hover:border-blue-500 hover:bg-blue-500/5"
              }
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-white/70">Mengupload gambar...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="font-bold text-lg mb-2">
                  Klik atau Drag & Drop Gambar
                </h3>
                <p className="text-white/60 mb-4">
                  Upload {uploadedImages.length}/{quantity} gambar (
                  {formatFileSize(5 * 1024 * 1024)} per gambar)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {showUploadTips && (
        <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <span>📸</span> Tips Foto Terbaik untuk Desain
            </h4>
            <button
              onClick={() => setShowUploadTips(false)}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span>
                <strong>WAJIB:</strong> Upload minimal 1 gambar
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span>
                <strong>MAKSIMAL:</strong> Upload maksimal {quantity}{" "}
                gambar (satu gambar per produk)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span>
                Produk akan didistribusikan otomatis ke semua gambar
                yang diupload
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span>
                Contoh: 5 produk dengan 2 gambar = 2-3 produk per gambar
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span>
                Gunakan pencahayaan yang baik untuk hasil desain optimal
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              <span>
                Format: JPG, PNG, GIF (maksimal 5MB per gambar)
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadFoto;