import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown } from "lucide-react";

const ExportMenu = ({ schedules, onOpenModal }) => {
  // This function is now only for the "All Schedule" option
  const handleExportAllPDF = async () => {
    const doc = new jsPDF();
    const totalPagesExp = '{total_pages_count_string}';
    
    const pageContent = (data) => {
      // HEADER
      doc.setFontSize(16);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("DCS Faculty Room Scheduling", data.settings.margin.left, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Cavite State University - Department of Computer Studies", data.settings.margin.left, 28);

      // FOOTER
      let footerStr = `Page ${data.pageNumber}`;
      if (typeof doc.putTotalPages === 'function') {
        footerStr = `${footerStr} of ${totalPagesExp}`;
      }
      doc.setFontSize(8);
      doc.setTextColor(100);
      const pageSize = doc.internal.pageSize;
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
      doc.text(footerStr, data.settings.margin.left, pageHeight - 10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageSize.width - data.settings.margin.right, pageHeight - 10, { align: 'right' });
    };

    const title = "Complete Schedule Report";
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text(title, 14, 40);

    const bodyData = schedules.map(s => [
      s.subject || "-", s.section || "-", s.faculty || "-",
      `${s.startTime || "-"} - ${s.endTime || "-"}`,
      s.day || "-", s.room || "-",
    ]);

    const headers = [["Subject", "Section", "Faculty", "Time", "Day", "Room"]];
    
    autoTable(doc, {
      startY: 45,
      head: headers,
      body: bodyData,
      theme: 'grid',
      headStyles: { fillColor: [23, 79, 64] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: pageContent,
      margin: { top: 35 },
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }
    
    const filename = `schedule_all_${Date.now()}.pdf`;
    doc.save(filename);

    try {
      await addDoc(collection(db, "exports"), {
        filename,
        filter: "all",
        createdAt: serverTimestamp(),
        total: schedules.length,
      });
      toast.success("PDF Exported", {
        description: `${filename} has been generated and logged.`,
      });
    } catch (error) {
      console.error("Failed to log export:", error);
      toast.error("Logging Failed", {
        description: "The PDF was created but failed to log to the database.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="text-white">
          <FileDown className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem onClick={handleExportAllPDF}>
          All Schedules
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onOpenModal("room")}>
          By Room...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onOpenModal("faculty")}>
          By Faculty...
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onOpenModal("section")}>
          By Section...
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;