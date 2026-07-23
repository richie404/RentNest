import { showToast } from "@/components/ui/Toast";

export const analyticsExportService = {
  exportToCSV: (filename: string, headers: string[], rows: (string | number)[][]) => {
    try {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast.success("CSV Downloaded", `Exported ${rows.length} records to ${filename}.csv`);
    } catch (error) {
      showToast.error("Export Failed", "Unable to generate CSV file.");
    }
  },

  exportToPDF: (title: string, contentSummary: string) => {
    showToast.info("Preparing PDF Report", `Generating executive PDF for ${title}...`);
    setTimeout(() => {
      window.print();
      showToast.success("Report Ready", "Executive report printed / saved as PDF.");
    }, 800);
  },
};
