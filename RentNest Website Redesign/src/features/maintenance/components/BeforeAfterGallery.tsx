import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { BeforeAfterMedia } from "../types/maintenance";

interface BeforeAfterGalleryProps {
  media?: BeforeAfterMedia;
}

export const BeforeAfterGallery: React.FC<BeforeAfterGalleryProps> = ({ media }) => {
  if (!media || (!media.beforeUrl && !media.afterUrl)) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-heading text-xs font-bold text-foreground">Before & After Repair Documentation</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Before */}
        {media.beforeUrl && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Initial Damage Reported
              </span>
            </div>
            <img
              src={media.beforeUrl}
              alt="Before Repair"
              className="h-44 w-full rounded-xl object-cover border border-rose-500/20 shadow-sm"
            />
            {media.beforeNotes && <p className="text-[11px] text-muted-foreground">{media.beforeNotes}</p>}
          </div>
        )}

        {/* After */}
        {media.afterUrl && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Resolved Workmanship
              </span>
            </div>
            <img
              src={media.afterUrl}
              alt="After Repair"
              className="h-44 w-full rounded-xl object-cover border border-emerald-500/20 shadow-sm"
            />
            {media.afterNotes && <p className="text-[11px] text-muted-foreground">{media.afterNotes}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
