import React, { useState } from "react";
import { timeToMinutes, allTimeSlots } from "../utils/timeUtils"; // Assuming you have this utility file
import { FaTrash, FaEdit } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const colorPalette = [
  "bg-blue-100 border-blue-500 text-blue-800",
  "bg-green-100 border-green-500 text-green-800",
  "bg-yellow-100 border-yellow-500 text-yellow-800",
  "bg-purple-100 border-purple-500 text-purple-800",
  "bg-pink-100 border-pink-500 text-pink-800",
  "bg-indigo-100 border-indigo-500 text-indigo-800",
];

const TimeSlotGrid = ({
  schedules,
  selectedDay,
  selectedRoom,
  onEdit,
  onDelete,
}) => {
  const [confirmId, setConfirmId] = useState(null);

  const getScheduleAtSlot = (timeSlot) => {
    const slotStartMinutes = timeToMinutes(timeSlot);
    for (const schedule of schedules) {
      const scheduleStart = timeToMinutes(schedule.startTime);
      const scheduleEnd = scheduleStart + schedule.duration;

      if (slotStartMinutes >= scheduleStart && slotStartMinutes < scheduleEnd) {
        return schedule;
      }
    }
    return null;
  };

  const getColorClass = (id) => {
    const index = schedules.findIndex((s) => s.id === id);
    return colorPalette[index % colorPalette.length];
  };

  return (
    <>
      {/* Schedule Grid */}
      <div className="grid grid-cols-[auto_1fr] border border-gray-300 rounded-lg overflow-hidden">
        <div className="col-span-1 bg-gray-100 p-2 border-b border-r border-gray-300 font-semibold text-gray-700 text-center sticky left-0 z-10">
          Time
        </div>
        <div className="col-span-1 bg-gray-100 p-2 border-b border-gray-300 font-semibold text-gray-700 text-center">
          Schedule for {selectedRoom} on {selectedDay}
        </div>

        {allTimeSlots.map((timeSlot) => {
          const schedule = getScheduleAtSlot(timeSlot);
          const isOccupied = !!schedule;
          const scheduleStart = schedule
            ? timeToMinutes(schedule.startTime)
            : -1;
          const slotStart = timeToMinutes(timeSlot);
          const isStartOfSchedule = isOccupied && scheduleStart === slotStart;

          return (
            <React.Fragment key={`${selectedDay}-${selectedRoom}-${timeSlot}`}>
              <div className="p-2 border-r border-b border-gray-300 bg-gray-50 text-gray-600 font-mono text-xs sm:text-sm text-center sticky left-0 z-10">
                {timeSlot}
              </div>
              <div
                className={`p-2 border-b border-gray-300 text-xs sm:text-sm flex items-center justify-between min-h-[40px] ${isOccupied
                    ? `${getColorClass(schedule.id)} border-l-4`
                    : "bg-white text-gray-500"
                  }`}
              >
                {isStartOfSchedule ? (
                  <div className="w-full flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {schedule.subject} ({schedule.section})
                      </p>
                      <p className="text-xs">Faculty: {schedule.faculty}</p>
                      <p className="text-xs">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        data-tooltip-id={`edit-${schedule.id}`}
                        onClick={() => onEdit(schedule)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white p-1 rounded text-xs"
                      >
                        <FaEdit />
                      </button>
                      <Tooltip
                        id={`edit-${schedule.id}`}
                        content="Edit Schedule"
                      />

                      <button
                        data-tooltip-id={`delete-${schedule.id}`}
                        onClick={() => setConfirmId(schedule.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs"
                      >
                        <FaTrash />
                      </button>
                      <Tooltip
                        id={`delete-${schedule.id}`}
                        content="Delete Schedule"
                      />
                    </div>
                  </div>
                ) : isOccupied ? null : (
                  <span>Available</span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <AlertDialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(confirmId);
                setConfirmId(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TimeSlotGrid;