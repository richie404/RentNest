import React from "react";
import { Paperclip, Image as ImageIcon, FileText, X } from "lucide-react";
import type { Attachment } from "../types";

interface AttachmentPickerProps {
  attachments: Attachment[];
  onAddAttachment: (att: Attachment) => void;
  onRemoveAttachment: (id: string) => void;
}

export const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const handleSimulatedUpload = (type: "IMAGE" | "PDF") => {
    if (type === "IMAGE") {
      onAddAttachment({
        id: `att-${Date.now()}`,
        fileName: "work_order_photo.png",
        fileUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80",
        fileSize: "1.8 MB",
        fileType: "IMAGE",
      });
    } else {
      onAddAttachment({
        id: `att-${Date.now()}`,
        fileName: "lease_inspection_report.pdf",
        fileUrl: "#",
        fileSize: "450 KB",
        fileType: "PDF",
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Upload Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleSimulatedUpload("IMAGE")}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          title="Attach Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleSimulatedUpload("PDF")}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
          title="Attach Document"
        >
          <Paperclip className="h-4 w-4" />
        </button>
      </div>

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-border/40">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50 text-xs font-medium text-foreground"
            >
              {att.fileType === "IMAGE" ? (
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-amber-500" />
              )}
              <span className="truncate max-w-[120px]">{att.fileName}</span>
              <span className="text-[10px] text-muted-foreground">({att.fileSize})</span>
              <button
                type="button"
                onClick={() => onRemoveAttachment(att.id)}
                className="text-muted-foreground hover:text-rose-500 transition-colors ml-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
