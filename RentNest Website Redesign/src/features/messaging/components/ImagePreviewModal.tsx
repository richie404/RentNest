import React from "react";
import { X, Download, ZoomIn } from "lucide-react";
import { showToast } from "@/components/ui/Toast";

interface ImagePreviewModalProps {
  isOpen: boolean;
  imageUrl: string;
  fileName?: string;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  imageUrl,
  fileName = "attachment.png",
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
        {/* Top bar controls */}
        <div className="absolute -top-12 right-0 flex items-center gap-3 text-white">
          <button
            onClick={() => {
              showToast.success("Image Downloaded", `Saved ${fileName} to downloads.`);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/60 hover:bg-card text-xs font-semibold backdrop-blur-md transition-colors"
          >
            <Download className="h-4 w-4" /> Download
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-card/60 hover:bg-card text-white backdrop-blur-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image preview */}
        <img
          src={imageUrl}
          alt={fileName}
          className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10"
        />
        <p className="mt-3 text-xs text-white/70 flex items-center gap-1">
          <ZoomIn className="h-3.5 w-3.5" /> {fileName}
        </p>
      </div>
    </div>
  );
};
