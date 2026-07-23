import React, { useState } from "react";
import { Maximize2 } from "lucide-react";
import { MediaViewer } from "./MediaViewer";

interface PropertyGalleryProps {
  images: string[];
}

export const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden shadow-lg border border-border/50">
        {/* Main Hero Photo */}
        <div
          className="md:col-span-2 relative aspect-[4/3] group cursor-pointer overflow-hidden bg-muted"
          onClick={() => setLightboxIndex(0)}
        >
          <img
            src={images[0]}
            alt="Property Main View"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-xl text-white text-xs font-semibold backdrop-blur-md">
              <Maximize2 className="h-4 w-4" /> View Fullscreen
            </span>
          </div>
        </div>

        {/* Supporting Grid Photos */}
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {images.slice(1, 5).map((img, idx) => (
            <div
              key={idx}
              className="relative aspect-square group cursor-pointer overflow-hidden bg-muted rounded-2xl"
              onClick={() => setLightboxIndex(idx + 1)}
            >
              <img
                src={img}
                alt={`Property Photo ${idx + 2}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <MediaViewer
          images={images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
};
