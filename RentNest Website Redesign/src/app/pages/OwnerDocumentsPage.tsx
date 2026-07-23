import React from "react";
import { FileText, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useOwnerDocumentsQuery } from "@/features/owner/hooks/useOwnerData";

export const OwnerDocumentsPage: React.FC = () => {
  const { data: docs } = useOwnerDocumentsQuery();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
            Property Legal Documents
          </h1>
          <p className="text-xs text-muted-foreground">
            Property deeds, municipal tax certificates, insurance policies, and master lease files.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Upload className="h-4 w-4" />}>
          Upload Legal Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs?.map((doc) => (
          <Card key={doc.id} variant="default" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-xs font-bold text-foreground">{doc.title}</h4>
                <span className="text-[10px] text-muted-foreground">{doc.fileSize} • Uploaded {doc.uploadedAt}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
              Download
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
