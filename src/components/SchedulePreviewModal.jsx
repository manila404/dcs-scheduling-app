import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SchedulePreviewModal = ({ isOpen, onClose, schedules, filterBy, title }) => {
  // Check if there are any actual schedule entries, excluding group headers
  const hasSchedules = schedules.some(s => !s.isGroup);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[1400px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            This is a preview of the exported PDF's layout and content.
          </DialogDescription>
        </DialogHeader>

        {/* Main content area that mimics the PDF page */}
        <div className="flex-grow overflow-y-auto px-6 py-4 bg-muted/30">
          <div className="bg-background shadow-lg p-6 mx-auto w-full ring-1 ring-border/50">
            {/* PDF-style Header */}
            <header className="mb-4 border-b pb-3">
              <h1 className="text-lg font-bold text-foreground">DCS Faculty Room Scheduling</h1>
              <p className="text-xs text-muted-foreground">Cavite State University - Department of Computer Studies</p>
            </header>

            {/* PDF-style Title */}
            <h2 className="text-base font-semibold mb-3">{title}</h2>

            {/* A scrollable container for the table to prevent layout breaking */}
            <div className="w-full overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#174f40] text-primary-foreground">
                  <tr>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Subject</th>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Section</th>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Faculty</th>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Time</th>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Duration</th>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Day</th>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Room</th>
                    <th className="px-3 py-2 border border-input text-left text-[11px] font-semibold uppercase">Prog/Year</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((sched) => (
                    sched.isGroup ? (
                      <tr key={sched.id}>
                        <td
                          colSpan="8"
                          className="px-3 py-2 border border-input bg-gray-200 dark:bg-gray-700 font-bold text-foreground text-xs"
                        >
                          {filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}: {sched.groupLabel}
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={sched.id}
                        className="even:bg-gray-100/50 dark:even:bg-muted/50"
                      >
                        <td className="px-3 py-2 border border-input text-xs align-top break-words">{sched.subject}</td>
                        <td className="px-3 py-2 border border-input text-xs align-top whitespace-nowrap">{sched.section}</td>
                        <td className="px-3 py-2 border border-input text-xs align-top whitespace-nowrap">{sched.faculty || 'N/A'}</td>
                        <td className="px-3 py-2 border border-input text-xs align-top whitespace-nowrap">{sched.startTime} - {sched.endTime}</td>
                        <td className="px-3 py-2 border border-input text-xs align-top whitespace-nowrap">{sched.duration}m</td>
                        <td className="px-3 py-2 border border-input text-xs align-top whitespace-nowrap">{sched.day}</td>
                        <td className="px-3 py-2 border border-input text-xs align-top whitespace-nowrap">{sched.room || 'N/A'}</td>
                        <td className="px-3 py-2 border border-input text-xs align-top whitespace-nowrap">{sched.program}-{sched.yearLevel}</td>
                      </tr>
                    )
                  ))}
                  {!hasSchedules && (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-muted-foreground border border-input">No schedules to display.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PDF-style Footer */}
            <footer className="mt-6 pt-3 border-t text-[10px] text-muted-foreground flex justify-between">
              <span>Page 1 of 1 (Preview)</span>
              <span>Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
            </footer>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t bg-background">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulePreviewModal;