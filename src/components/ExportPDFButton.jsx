import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const ExportPDFButton = ({ schedules, filterBy }) => {
  const handleExportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);

    const title = filterBy
      ? `Schedules by ${filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}`
      : "All Schedules";

    let filteredSchedules = schedules;

    if (filterBy) {
      const grouped = {};
      for (const sched of schedules) {
        const key = sched[filterBy];
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(sched);
      }

      filteredSchedules = Object.entries(grouped).flatMap(([group, items]) => [
        { isGroup: true, groupLabel: group },
        ...items,
      ]);
    }

    doc.text(title, 14, 20);

    const headers = [
      [
        "Program",
        "Year Level",
        "Subject",
        "Section",
        "Faculty",
        "Start",
        "End",
        "Duration",
        "Day",
        "Room",
      ],
    ];

    const data = filteredSchedules.map((s) => {
      if (s.isGroup) {
        return [
          `${filterBy.toUpperCase()}: ${s.groupLabel}`,
          "", "", "", "", "", "", "", "", ""
        ];
      }

      return [
        s.program || "-",
        s.yearLevel || "-",
        s.subject || "-",
        s.section || "-",
        s.faculty || "-",
        s.startTime || "-",
        s.endTime || "-",
        `${s.duration || 0} mins`,
        s.day || "-",
        s.room || "-",
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: data,
      didParseCell: function (data) {
        if (
          data.row.raw[1] === "" &&
          data.row.raw[2] === "" &&
          data.row.raw[0]?.startsWith(`${filterBy?.toUpperCase()}:`)
        ) {
          data.cell.styles.fontStyle = "bold";
          data.cell.colSpan = 10;
        }
      },
    });

    const filename = `schedule_${filterBy || "all"}_${Date.now()}.pdf`;
    doc.save(filename);

    try {
      await addDoc(collection(db, "exports"), {
        filename,
        filter: filterBy || "all",
        createdAt: serverTimestamp(),
        total: schedules.length,
      });
      alert("PDF exported and logged in Firestore!");
    } catch (error) {
      console.error("Failed to log export:", error);
    }
  };

  return (
    <button
      onClick={handleExportPDF}
      className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
    >
      Export as PDF {filterBy ? `(${filterBy})` : "(All)"}
    </button>
  );
};

export default ExportPDFButton;
