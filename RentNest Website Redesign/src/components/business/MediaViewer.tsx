import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaViewerProps {
  images: string[];
  currentIndex?: number;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  images,
  currentIndex = 0,
  onClose,
}) => {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === "ArrowRight") setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
        aria-label="Close Lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      <button
        onClick={() => setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
        className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
        aria-label="Previous Image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <img
        src={images[index]}
        alt={`Fullscreen View ${index + 1}`}
        className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
      />

      <button
        onClick={() => setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
        className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
        aria-label="Next Image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white backdrop-blur-md">
        {index + 1} of {images.length}
      </span>
    </div>
  );
};
