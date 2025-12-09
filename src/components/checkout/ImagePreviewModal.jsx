import React from "react";
import { X } from "lucide-react";

const ImagePreviewModal = ({
  previewIndex,
  uploadedImages,
  productDistribution,
  onClose,
  onPrev,
  onNext
}) => {
  const currentImage = uploadedImages[previewIndex];
  const distribution = productDistribution[previewIndex];

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {uploadedImages.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition cursor-pointer"
            >
              ←
            </button>

            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition cursor-pointer"
            >
              →
            </button>
          </>
        )}

        <img
          src={currentImage.base64 || currentImage.preview}
          alt={`Preview ${previewIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
        />

        <div className="absolute bottom-4 left-0 right-0 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full mx-auto">
            <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
              Gambar {previewIndex + 1} dari {uploadedImages.length}
            </span>
            {distribution && distribution.count > 0 && (
              <span className="text-sm">
                {distribution.count} produk
                <span className="mx-2">•</span>
                Produk {distribution.start}-{distribution.end}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;