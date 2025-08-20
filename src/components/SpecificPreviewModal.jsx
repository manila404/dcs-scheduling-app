import React, { useState, useMemo } from "react";
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
import TimetablePreview from "./TimetablePreview";

const SpecificPreviewModal = ({ isOpen, onClose, type, options, schedules }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const filteredSchedules = useMemo(() => {
    if (!selectedValue || !type) return [];
    return schedules.filter(s => s[type] === selectedValue);
  }, [selectedValue, type, schedules]);

  const comboboxOptions = options.map(opt => ({ value: opt, label: opt }));

  // Reset selected value when the modal is reopened with a different type
  React.useEffect(() => {
    if (isOpen) {
      setSelectedValue("");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[1400px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Timetable Preview by {type}</DialogTitle>
          <DialogDescription>
            Select a {type} to view its complete weekly schedule in a timetable format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4 py-4">
          <div className="col-span-1">
            <Combobox
              options={comboboxOptions}
              value={selectedValue}
              onSelect={setSelectedValue}
              placeholder={`Select a ${type}...`}
              searchPlaceholder={`Search ${type}s...`}
              emptyMessage={`No ${type} found.`}
            />
          </div>
        </div>

        <div className="flex-grow">
          {selectedValue ? (
            <TimetablePreview schedules={filteredSchedules} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground border rounded-lg bg-muted/30">
              Please select a {type} to see the preview.
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SpecificPreviewModal;