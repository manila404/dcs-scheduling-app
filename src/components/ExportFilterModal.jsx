import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Combobox from "@/components/ComboBox";

// Define a constant for the special "All" value
const ALL_OPTION_VALUE = "__ALL__";

const ExportFilterModal = ({ isOpen, onClose, type, options, schedules, groupSchedulesBy }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const handleExport = () => {
    if (!selectedValue) {
      toast.error("Please select an option to export.");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "landscape" });
      const totalPagesExp = '{total_pages_count_string}';

      const pageContent = (data) => {
        doc.setFontSize(16);
        doc.setTextColor(40);
        doc.setFont("helvetica", "bold");
        doc.text("DCS Faculty Room Scheduling", data.settings.margin.left, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Cavite State University - Department of Computer Studies", data.settings.margin.left, 28);
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
      
      let title = "";
      let bodyData = [];
      let filename = "";
      const headers = [["Subject", "Section", "Faculty", "Time", "Duration", "Day", "Room", "Prog/Year"]];
      const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

      const baseConfig = {
        startY: 45,
        head: headers,
        theme: 'grid',
        headStyles: { fillColor: [23, 79, 64] },
        didDrawPage: pageContent,
        margin: { top: 35 },
        styles: { cellPadding: 2, fontSize: 8 },
        columnStyles: { 0: { cellWidth: 'auto' } },
      };

      if (selectedValue === ALL_OPTION_VALUE) {
        title = `Complete Schedule by ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        filename = `schedule_all_${type}s_grouped_${Date.now()}.pdf`;

        const groupedSchedules = groupSchedulesBy(schedules, type);

        bodyData = groupedSchedules.map(item => {
          if (item.isGroup) {
            // We pass the raw object with a flag for our hook to find
            return item;
          } else {
            return [
              item.subject || "-", item.section || "-", item.faculty || "-",
              `${item.startTime || "-"} - ${item.endTime || "-"}`, `${item.duration || 0}m`,
              item.day || "-", item.room || "-", `${item.program || ""}-${item.yearLevel || ""}`
            ];
          }
        });

        autoTable(doc, {
          ...baseConfig,
          body: bodyData,
          // 1. Apply striping to ALL rows first
          alternateRowStyles: { fillColor: [248, 249, 250] },
          // 2. Use the hook to find and override the group headers
          didParseCell: function(data) {
            // Check the raw data for our isGroup flag
            if (data.row.raw?.isGroup) {
              data.cell.styles.fillColor = '#e9ecef';
              data.cell.styles.textColor = '#212529';
              data.cell.styles.fontStyle = 'bold';
              data.cell.colSpan = 8;
              // Set the cell content manually from the groupLabel
              data.cell.text = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${data.row.raw.groupLabel}`;
            }
          }
        });

      } else {
        title = `Schedule for ${type.charAt(0).toUpperCase() + type.slice(1)}: ${selectedValue}`;
        filename = `schedule_${type}_${selectedValue.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        const filteredSchedules = schedules
          .filter(s => s[type] === selectedValue)
          .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.startTime.localeCompare(b.startTime));
        bodyData = filteredSchedules.map(s => [ s.subject, s.section, s.faculty, `${s.startTime} - ${s.endTime}`, `${s.duration}m`, s.day, s.room, `${s.program}-${s.yearLevel}` ]);
        autoTable(doc, {
          ...baseConfig,
          body: bodyData,
          alternateRowStyles: { fillColor: [248, 249, 250] },
        });
      }
      
      doc.text(title, 14, 40);
      
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }
      
      doc.save(filename);

      toast.success("PDF Exported", {
        description: `${filename} has been generated.`,
      });
      
    } catch (error) {
      console.error("--- PDF GENERATION FAILED ---", error);
      toast.error("PDF Generation Failed", {
        description: "An error occurred. Please check the developer console (F12) for more details.",
      });
    } finally {
      onClose();
    }
  };

  const comboboxOptions = [
    { value: ALL_OPTION_VALUE, label: `All ${type}s` },
    ...options.map(opt => ({ value: opt, label: opt }))
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export by {type}</DialogTitle>
          <DialogDescription>
            Select a specific {type} to export its weekly schedule, or choose "All" for a complete grouped report.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Combobox
            options={comboboxOptions}
            value={selectedValue}
            onSelect={setSelectedValue}
            placeholder={`Select a ${type}...`}
            searchPlaceholder={`Search ${type}s...`}
            emptyMessage={`No ${type} found.`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport} disabled={!selectedValue} className="text-white">
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFilterModal;