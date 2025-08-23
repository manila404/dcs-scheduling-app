import React, { useState, useMemo, useEffect } from "react";
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

const SpecificPreviewModal = ({ isOpen, onClose, type, options, schedules, onEdit, onDelete }) => {
  const [selectedValue, setSelectedValue] = useState("");

  const filteredSchedules = useMemo(() => {
    if (!selectedValue || !type) return [];
    return schedules.filter(s => s[type] === selectedValue);
  }, [selectedValue, type, schedules]);

  // Handler for editing: calls parent function and closes modal
  const handleEdit = (schedule) => {
    if (onEdit) {
      onEdit(schedule);
    }
    onClose();
  };

  // Handler for deleting: just calls the parent function
  const handleDelete = (scheduleId) => {
    if (onDelete) {
      onDelete(scheduleId);
    }
    // Note: We don't close the modal here, allowing the user to delete multiple items
  };

  const comboboxOptions = options.map(opt => ({ value: opt, label: opt }));

  useEffect(() => {
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
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

        <div className="flex-grow min-h-0">
          {selectedValue ? (
            // Pass both edit and delete handlers to the TimetablePreview
            <TimetablePreview 
              schedules={filteredSchedules} 
              onEdit={onEdit ? handleEdit : null} 
              onDelete={onDelete ? handleDelete : null}
            />
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